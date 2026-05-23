import { promises as fs } from 'fs'
import path from 'path'
import type { Product } from '@/types/database'

// Use a /data folder inside the project — works on Windows, Linux, and Mac
const DATA_DIR = path.join(process.cwd(), 'data')
const STORE_PATH = path.join(DATA_DIR, 'products.json')

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch {
    // already exists
  }
}

async function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url.includes('placeholder') || url.includes('your_') || url.includes('supabase.co') === false) return null
  try {
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(url, key)
  } catch {
    return null
  }
}

async function productsTableExists(supabase: Awaited<ReturnType<typeof getSupabase>>): Promise<boolean> {
  if (!supabase) return false
  try {
    const { error } = await supabase.from('products').select('id').limit(1)
    if (error?.code === '42P01' || error?.message?.includes('does not exist')) return false
    return true
  } catch {
    return false
  }
}

export async function loadProducts(): Promise<Product[]> {
  // 1. Try Supabase
  const supabase = await getSupabase()
  if (supabase && await productsTableExists(supabase)) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) return data as Product[]
    console.warn('[ProductStore] Supabase loadProducts error:', error?.message)
  }

  // 2. Try local JSON file store (dev fallback only — not for production)
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8')
    const products = JSON.parse(raw) as Product[]
    if (Array.isArray(products)) return products
  } catch {
    // File doesn't exist yet — return empty, admin will add products
  }

  return []
}

export async function saveProducts(products: Product[]): Promise<void> {
  // 1. Try Supabase (upsert all)
  const supabase = await getSupabase()
  if (supabase && await productsTableExists(supabase)) {
    const { error } = await supabase.from('products').upsert(products)
    if (!error) return
  }

  // 2. Write to local file
  try {
    await ensureDataDir()
    await fs.writeFile(STORE_PATH, JSON.stringify(products, null, 2), 'utf8')
  } catch (err) {
    console.warn('[ProductStore] Could not write to file store:', err)
  }
}

export async function addProduct(product: Product): Promise<Product> {
  const supabase = await getSupabase()
  if (supabase && await productsTableExists(supabase)) {
    const { data, error } = await supabase.from('products').insert(product).select().single()
    if (!error && data) return data as Product
  }
  const products = await loadProducts()
  const updated = [product, ...products]
  await saveProducts(updated)
  return product
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const supabase = await getSupabase()
  if (supabase && await productsTableExists(supabase)) {
    const { data, error } = await supabase
      .from('products').update(updates).eq('id', id).select().single()
    if (!error && data) return data as Product
  }
  const products = await loadProducts()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) return null
  products[index] = { ...products[index], ...updates, updated_at: new Date().toISOString() }
  await saveProducts(products)
  return products[index]
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = await getSupabase()
  if (supabase && await productsTableExists(supabase)) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) return true
  }
  const products = await loadProducts()
  const filtered = products.filter((p) => p.id !== id)
  if (filtered.length === products.length) return false
  await saveProducts(filtered)
  return true
}
