/**
 * supabase-server.ts
 * Use in Server Components and API routes (not in Client Components).
 * Falls back to product-store (JSON file) when Supabase is not configured.
 */

import type { Product } from '@/types/database'
import { loadProducts } from '@/lib/product-store'

/** Safely creates a Supabase client if env vars are configured, otherwise returns null */
async function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url.includes('placeholder') || url.includes('your_')) {
    return null
  }

  const { createClient } = await import('@supabase/supabase-js')
  return createClient(url, key)
}

/** Fetches all products, with optional category and search filters */
export async function getProducts(options?: {
  category?: string
  featured?: boolean
  newArrival?: boolean
  search?: string
  limit?: number
}): Promise<Product[]> {
  const supabase = await getServerClient()

  if (supabase) {
    try {
      let query = supabase.from('products').select('*')

      if (options?.category) query = query.eq('category', options.category)
      if (options?.featured) query = query.eq('featured', true)
      if (options?.newArrival) query = query.eq('new_arrival', true)
      if (options?.search) {
        query = query.or(
          `name.ilike.%${options.search}%,description.ilike.%${options.search}%,category.ilike.%${options.search}%`
        )
      }
      if (options?.limit) query = query.limit(options.limit)
      query = query.order('created_at', { ascending: false })

      const { data, error } = await query
      if (!error && data) return data as Product[]
    } catch (err) {
      console.warn('[Supabase] getProducts failed, falling back to product-store:', err)
    }
  }

  // Fallback to product-store (JSON file in dev)
  let products = await loadProducts()
  if (options?.category) products = products.filter((p) => p.category === options.category)
  if (options?.featured) products = products.filter((p) => p.featured)
  if (options?.newArrival) products = products.filter((p) => p.new_arrival)
  if (options?.search) {
    const q = options.search.toLowerCase()
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    )
  }
  if (options?.limit) products = products.slice(0, options.limit)
  return products
}

/** Fetches a single product by ID */
export async function getProduct(id: string): Promise<Product | null> {
  const supabase = await getServerClient()

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) return data as Product
    } catch (err) {
      console.warn('[Supabase] getProduct failed, falling back to product-store:', err)
    }
  }

  const products = await loadProducts()
  return products.find((p) => p.id === id) ?? null
}

/** Fetches related products in the same category, excluding current product */
export async function getRelatedProducts(
  productId: string,
  category: string,
  limit = 4
): Promise<Product[]> {
  const supabase = await getServerClient()

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .neq('id', productId)
        .limit(limit)

      if (!error && data) return data as Product[]
    } catch (err) {
      console.warn('[Supabase] getRelatedProducts failed, falling back to product-store:', err)
    }
  }

  const products = await loadProducts()
  return products
    .filter((p) => p.category === category && p.id !== productId)
    .slice(0, limit)
}
