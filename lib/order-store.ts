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
  admin_source_tag?: string | null
}

export interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'processing' | 'dispatched' | 'delivered' | 'cancelled'
  paymentMethod: 'whatsapp' | 'cod'
  paymentStatus: 'pending' | 'whatsapp'| 'paid'
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    // Captured server-side at checkout from the customer's own browser.
    // Used for Meta Conversions API matching. Stored inside the existing
    // `customer` JSON column, so no database migration is needed.
    tracking?: {
      fbp?: string
      fbc?: string
      clientIp?: string
      userAgent?: string
    }
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

// ─── JSON file (local dev fallback only) ─────────────────────────────────────
// On Vercel (and most serverless hosts) the filesystem is read-only outside
// /tmp, and even /tmp is wiped between invocations — so this file can never
// actually serve as a durable backup in production. We only use it for local
// dev, and skip it entirely elsewhere to avoid noisy, meaningless ENOENT logs.

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)

const DATA_DIR   = path.join(process.cwd(), 'data')
const STORE_PATH = path.join(DATA_DIR, 'orders.json')

async function ensureDataDir() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }) } catch { /* exists */ }
}

async function readFile(): Promise<Order[]> {
  if (IS_SERVERLESS) return []
  try {
    const raw    = await fs.readFile(STORE_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

async function writeFile(orders: Order[]): Promise<void> {
  if (IS_SERVERLESS) return
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
  const customer = row.customer as Order['customer']
  const address  = row.address  as Order['address']
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
    customer,
    address,
    // 'none' is the placeholder we write for orders with no delivery method
    // (required because the column is NOT NULL) — treat it as null for display.
    deliveryOption: row.delivery_option === 'same_day' ? 'same_day' : null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function orderToRow(order: Order) {
  return {
    id:             order.id,
    order_number:   order.orderNumber,
    status:         order.status,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    items:          order.items,
    subtotal:       order.subtotal,
    shipping:       order.shipping,
    total:          order.total,
    customer:       order.customer,
    address:        order.address,
    // The `delivery_option` column previously had a NOT NULL constraint AND
    // a CHECK constraint limiting it to specific values (e.g. 'same_day').
    // Since delivery is now always free (no method to select), the column
    // should be relaxed in Supabase to allow NULL and drop the check:
    //   ALTER TABLE orders DROP CONSTRAINT orders_delivery_option_check;
    //   ALTER TABLE orders ALTER COLUMN delivery_option DROP NOT NULL;
    // Once that's run, sending null here works cleanly.
    delivery_option: order.deliveryOption,
    created_at:     order.createdAt,
    updated_at:     order.updatedAt,
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
    console.error(
      `[OrderStore] loadOrders error — code=${error?.code} details=${error?.details} hint=${error?.hint} message=${error?.message}`
    )
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
      // Also back up to local file (local dev only — no-op on serverless)
      const existing = await readFile()
      await writeFile([order, ...existing])
      return order
    }
    console.error(
      `[OrderStore] createOrder Supabase error — code=${error.code} details=${error.details} hint=${error.hint} message=${error.message}`
    )
    // Fall through to file store below — but on serverless (Vercel etc.)
    // that file store is a no-op, so a Supabase failure there means the
    // order truly didn't save. Don't pretend otherwise.
    if (IS_SERVERLESS) {
      throw new Error(`Order could not be saved (${error.code}: ${error.message})`)
    }
  } else if (IS_SERVERLESS) {
    // No Supabase connection at all in a serverless environment — there is
    // no durable place to store this order.
    throw new Error('Order could not be saved: no database connection configured')
  }

  // ── File store fallback (local dev only, when Supabase is unavailable) ──
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
    if (error) console.error(
      `[OrderStore] updateStatus Supabase error — code=${error.code} details=${error.details} hint=${error.hint} message=${error.message}`
    )
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
    // Fall back to file store for any error (not found, network, schema issues, etc.)
    if (error) {
      if (error.code !== 'PGRST116') {
        console.error(
          `[OrderStore] getOrderByNumber error — code=${error.code} details=${error.details} hint=${error.hint} message=${error.message}`
        )
      }
      const fileOrders = await readFile()
      return fileOrders.find(o => o.orderNumber === orderNumber) ?? null
    }
  }
  const orders = await readFile()
  return orders.find(o => o.orderNumber === orderNumber) ?? null
}

export async function prepareOrderForMetaPurchase(
  orderNumber: string,
  eventId: string
): Promise<{
  order: Order
  shouldSend: boolean
  alreadySent: boolean
  claimToken: string | null
} | null> {
  const sb = await getSupabase()

  if (!sb) {
    throw new Error('Supabase is unavailable. Cannot safely confirm payment.')
  }

  if (!orderNumber.trim() || !/^[a-zA-Z0-9._:-]{1,200}$/.test(eventId)) {
    throw new Error('Invalid order number or Meta event ID.')
  }

  const now = new Date()
  const updatedAt = now.toISOString()

  // Claims expire after 10 minutes.
  const claimExpiredBefore = new Date(
    now.getTime() - 10 * 60 * 1000
  ).toISOString()

  // Atomically claim the event.
  // An existing claim can only be replaced after it expires.
  const { data, error } = await sb
    .from('orders')
    .update({
      payment_status: 'paid',
      meta_purchase_event_id: eventId,
      meta_purchase_claimed_at: updatedAt,
      updated_at: updatedAt,
    })
    .eq('order_number', orderNumber)
    .neq('status', 'cancelled')
    .is('meta_purchase_sent_at', null)
    .or(`meta_purchase_event_id.is.null,meta_purchase_event_id.eq.${eventId}`)
    .or(
      `meta_purchase_claimed_at.is.null,meta_purchase_claimed_at.lt.${claimExpiredBefore}`
    )
    .select('*')

  if (error) {
    console.error('[OrderStore] prepare Meta purchase error:', error)
    throw new Error('Could not prepare the order for Meta tracking.')
  }

  if (data && data.length > 0) {
    const row = data[0] as Record<string, unknown>
    const order = rowToOrder(row)

    const claimToken = row.meta_purchase_claimed_at
      ? String(row.meta_purchase_claimed_at)
      : null

    if (!claimToken) {
      throw new Error('Meta event was claimed without a valid claim token.')
    }

    return {
      order,
      shouldSend: true,
      alreadySent: false,
      claimToken,
    }
  }

  // No claim was acquired. Check the existing order.
  const { data: existing, error: fetchError } = await sb
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .maybeSingle()

  if (fetchError) {
    console.error('[OrderStore] Meta purchase lookup error:', fetchError)
    throw new Error('Could not verify the Meta purchase status.')
  }

  if (!existing) {
    return null
  }

  const row = existing as Record<string, unknown>
  const order = rowToOrder(row)

  if (row.meta_purchase_sent_at) {
    return {
      order,
      shouldSend: false,
      alreadySent: true,
      claimToken: null,
    }
  }

  // Another request owns the active claim, or the event ID conflicts.
  return {
    order,
    shouldSend: false,
    alreadySent: false,
    claimToken: null,
  }
}

export async function markMetaPurchaseSent(
  orderNumber: string,
  eventId: string,
  claimToken: string
): Promise<void> {
  const sb = await getSupabase()

  if (!sb) {
    throw new Error('Supabase is unavailable.')
  }

  if (!claimToken) {
    throw new Error('A valid Meta purchase claim token is required.')
  }

  // Only the request holding the current claim can mark the event as sent.
  const { data, error } = await sb
    .from('orders')
    .update({
      meta_purchase_sent_at: new Date().toISOString(),
      meta_purchase_claimed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('order_number', orderNumber)
    .eq('meta_purchase_event_id', eventId)
    .eq('meta_purchase_claimed_at', claimToken)
    .is('meta_purchase_sent_at', null)
    .select('id')

  if (error || !data || data.length === 0) {
    console.error(
      '[OrderStore] Could not mark Meta purchase as sent:',
      error
    )

    throw new Error(
      'Meta event was accepted, but its claim was lost or its sent status could not be saved.'
    )
  }
}
