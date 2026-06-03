import { promises as fs } from 'fs'
import path from 'path'
import { loadProducts, saveProducts } from '@/lib/product-store'

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  image: string
  size?: string
  color?: string
  colorImage?: string
}

export interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'processing' | 'dispatched' | 'delivered' | 'cancelled'
  paymentMethod: 'whatsapp' | 'cod'
  paymentStatus: 'pending' | 'whatsapp'
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  address: {
    street: string
    city: string
    zip: string
  }
  deliveryOption: 'same_day' | null
  createdAt: string
  updatedAt: string
}

// ─── JSON file (local dev fallback) ──────────────────────────────────────────

const DATA_DIR   = path.join(process.cwd(), 'data')
const STORE_PATH = path.join(DATA_DIR, 'orders.json')

async function ensureDataDir() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }) } catch { /* exists */ }
}

async function readFile(): Promise<Order[]> {
  try {
    const raw    = await fs.readFile(STORE_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

async function writeFile(orders: Order[]): Promise<void> {
  try {
    await ensureDataDir()
    await fs.writeFile(STORE_PATH, JSON.stringify(orders, null, 2), 'utf8')
  } catch (e) { console.warn('[OrderStore] file write error:', e) }
}

// ─── Supabase ─────────────────────────────────────────────────────────────────

async function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || !url.includes('supabase.co') || url.includes('your_')) return null
  try {
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(url, key, { auth: { persistSession: false } })
  } catch { return null }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateOrderNumber(): string {
  const now  = new Date()
  const y    = now.getFullYear().toString().slice(2)
  const m    = String(now.getMonth() + 1).padStart(2, '0')
  const d    = String(now.getDate()).padStart(2, '0')
  const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
  return `MG-${y}${m}${d}-${rand}`
}

function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id:            row.id             as string,
    orderNumber:   row.order_number   as string,
    status:        row.status         as Order['status'],
    paymentMethod: row.payment_method as Order['paymentMethod'],
    paymentStatus: row.payment_status as Order['paymentStatus'],
    items:         row.items          as OrderItem[],
    subtotal:      Number(row.subtotal),
    shipping:      Number(row.shipping),
    total:         Number(row.total),
    customer: {
      firstName: row.customer_first_name as string,
      lastName:  row.customer_last_name  as string,
      email:     row.customer_email      as string,
      phone:     row.customer_phone      as string,
    },
    address: {
      street: row.address_street as string,
      city:   row.address_city   as string,
      zip:    row.address_zip    as string,
    },
    deliveryOption: (row.delivery_option as Order['deliveryOption']) ?? 'same_day',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function orderToRow(order: Order) {
  return {
    id:                  order.id,
    order_number:        order.orderNumber,
    status:              order.status,
    payment_method:      order.paymentMethod,
    payment_status:      order.paymentStatus,
    items:               order.items,
    subtotal:            order.subtotal,
    shipping:            order.shipping,
    total:               order.total,
    customer_first_name: order.customer.firstName,
    customer_last_name:  order.customer.lastName,
    customer_email:      order.customer.email,
    customer_phone:      order.customer.phone,
    address_street:      order.address.street,
    address_city:        order.address.city,
    address_zip:         order.address.zip,
    delivery_option:     order.deliveryOption,
    created_at:          order.createdAt,
    updated_at:          order.updatedAt,
  }
}

// Decrement stock directly via UPDATE (no RPC dependency)
async function decrementStockInSupabase(
  sb: NonNullable<Awaited<ReturnType<typeof getSupabase>>>,
  productId: string,
  quantity: number
) {
  // First try the RPC
  const { error: rpcErr } = await sb.rpc('decrement_stock', {
    p_product_id: productId,
    p_quantity:   quantity,
  })
  if (!rpcErr) return

  // RPC missing — fall back to read-then-write
  console.warn('[OrderStore] decrement_stock RPC unavailable, using direct update')
  const { data: prod } = await sb
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single()
  if (prod) {
    await sb.from('products').update({
      stock:      Math.max(0, (prod.stock as number) - quantity),
      updated_at: new Date().toISOString(),
    }).eq('id', productId)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function loadOrders(): Promise<Order[]> {
  const sb = await getSupabase()
  if (sb) {
    const { data, error } = await sb
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      // Merge any orders in the local file (dev orders placed without Supabase)
      const fileOrders = await readFile()
      const sbIds      = new Set(data.map((r: Record<string, unknown>) => r.id as string))
      const fileOnly   = fileOrders.filter(o => !sbIds.has(o.id))
      return [...data.map(r => rowToOrder(r as Record<string, unknown>)), ...fileOnly]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    console.error('[OrderStore] loadOrders error:', error?.message, error?.code)
  }
  return (await readFile()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function createOrder(
  data: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'status' | 'paymentStatus'>
): Promise<Order> {
  const order: Order = {
    id:            crypto.randomUUID(),
    orderNumber:   generateOrderNumber(),
    status:        'pending',
    paymentStatus: data.paymentMethod === 'whatsapp' ? 'whatsapp' : 'pending',
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const sb = await getSupabase()
  if (sb) {
    const { error } = await sb.from('orders').insert(orderToRow(order))
    if (!error) {
      // Decrement stock for each item (RPC with direct-update fallback)
      for (const item of order.items) {
        await decrementStockInSupabase(sb, item.productId, item.quantity)
      }
      // Also back up to local file
      const existing = await readFile()
      await writeFile([order, ...existing])
      return order
    }
    console.error('[OrderStore] createOrder Supabase error:', error.message, error.code)
    // Fall through to file store below
  }

  // ── File store fallback (no Supabase or insert failed) ──────────────────
  const existing = await readFile()
  await writeFile([order, ...existing])

  // Decrement stock in local product store
  try {
    const products = await loadProducts()
    let changed = false
    for (const item of order.items) {
      const idx = products.findIndex(p => p.id === item.productId)
      if (idx !== -1) {
        products[idx] = {
          ...products[idx],
          stock: Math.max(0, products[idx].stock - item.quantity),
          updated_at: new Date().toISOString(),
        }
        changed = true
      }
    }
    if (changed) await saveProducts(products)
  } catch (e) { console.warn('[OrderStore] stock update error:', e) }

  return order
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
  const updatedAt = new Date().toISOString()

  const sb = await getSupabase()
  if (sb) {
    // Use .select() without .single() — .single() throws if 0 rows match
    const { data, error } = await sb
      .from('orders')
      .update({ status, updated_at: updatedAt })
      .eq('id', id)
      .select()
    if (!error && data && data.length > 0) {
      const updated = rowToOrder(data[0] as Record<string, unknown>)
      // Restore stock if order cancelled
      if (status === 'cancelled') {
        for (const item of updated.items) {
          await sb.rpc('increment_stock', { p_product_id: item.productId, p_quantity: item.quantity })
            .then(({ error: rpcErr }) => {
              if (rpcErr) {
                // RPC fallback
                sb.from('products').select('stock').eq('id', item.productId).single()
                  .then(({ data: prod }) => {
                    if (prod) {
                      sb.from('products').update({
                        stock:      (prod.stock as number) + item.quantity,
                        updated_at: new Date().toISOString(),
                      }).eq('id', item.productId)
                    }
                  })
              }
            })
        }
      }
      // Sync to file
      const fileOrders = await readFile()
      const fi = fileOrders.findIndex(o => o.id === id)
      if (fi !== -1) { fileOrders[fi] = updated; await writeFile(fileOrders) }
      return updated
    }
    if (error) console.error('[OrderStore] updateStatus Supabase error:', error.message)
  }

  // File fallback
  const orders = await readFile()
  const idx = orders.findIndex(o => o.id === id)
  if (idx === -1) return null
  const prev = orders[idx].status
  orders[idx] = { ...orders[idx], status, updatedAt }
  await writeFile(orders)

  if (status === 'cancelled' && prev !== 'cancelled') {
    try {
      const products = await loadProducts()
      let changed = false
      for (const item of orders[idx].items) {
        const pi = products.findIndex(p => p.id === item.productId)
        if (pi !== -1) {
          products[pi] = { ...products[pi], stock: products[pi].stock + item.quantity, updated_at: new Date().toISOString() }
          changed = true
        }
      }
      if (changed) await saveProducts(products)
    } catch (e) { console.warn('[OrderStore] stock restore error:', e) }
  }
  return orders[idx]
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const sb = await getSupabase()
  if (sb) {
    const { data, error } = await sb
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single()
    if (!error && data) return rowToOrder(data as Record<string, unknown>)
    if (error?.code === 'PGRST116') {
      const fileOrders = await readFile()
      return fileOrders.find(o => o.orderNumber === orderNumber) ?? null
    }
    if (error) console.error('[OrderStore] getOrderByNumber error:', error.message, error.code)
    return null
  }
  const orders = await readFile()
  return orders.find(o => o.orderNumber === orderNumber) ?? null
}
