import { NextRequest, NextResponse } from 'next/server'
import { createOrder, loadOrders, getOrderByNumber } from '@/lib/order-store'
import { loadProducts } from '@/lib/product-store'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// 20 order attempts per IP per hour
const ORDER_LIMIT = { limit: 20, windowMs: 60 * 60 * 1000 }
// 60 tracking lookups per IP per hour
const TRACK_LIMIT = { limit: 60, windowMs: 60 * 60 * 1000 }

// POST — customer places an order
export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = checkRateLimit(`orders-post:${ip}`, ORDER_LIMIT)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before placing another order.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    )
  }

  try {
    const body = await request.json()
    const required = ['items', 'customer', 'address', 'total', 'paymentMethod']
    const deliveryOption = body.deliveryOption === 'same_day' ? 'same_day' : null
    for (const field of required) {
      if (!body[field]) return NextResponse.json({ error: `Missing: ${field}` }, { status: 400 })
    }
    if (!body.customer.email || !body.customer.email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    // Server-side price validation — never trust prices from the client
    const products = await loadProducts()
    let serverSubtotal = 0
    for (const item of body.items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 })
      if (product.stock < item.quantity) return NextResponse.json({ error: `Insufficient stock for: ${product.name}` }, { status: 400 })
      serverSubtotal += product.price * item.quantity
    }
    const shippingFee = deliveryOption === 'same_day' ? 500 : 0
    const serverTotal = serverSubtotal + shippingFee

    const order = await createOrder({
      items: body.items.map((item: { productId: string; name: string; quantity: number; image: string }) => {
        const product = products.find((p) => p.id === item.productId)!
        return {
          ...item,
          price: product.price, // always use server price
          admin_source_tag: product.admin_source_tag ?? null,
        }
      }),
      customer: body.customer,
      address: body.address,
      subtotal: serverSubtotal,
      shipping: shippingFee,
      total: serverTotal,
      paymentMethod: body.paymentMethod,
      deliveryOption,
    })
    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    console.error('[Orders POST]', err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

// GET — admin fetches all orders, or customer tracks by order number
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderNumber = searchParams.get('orderNumber')
  const email = searchParams.get('email')

  // Public track-order lookup — both order number AND email are required
  if (orderNumber) {
    const ip = getClientIp(request)
    const rl = checkRateLimit(`orders-track:${ip}`, TRACK_LIMIT)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many tracking requests. Please wait before trying again.' },
        { status: 429 }
      )
    }

    if (!email) return NextResponse.json({ error: 'Email is required to track an order' }, { status: 400 })
    const order = await getOrderByNumber(orderNumber.toUpperCase())
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.customer.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json({ order })
  }

  // Admin only — get all orders
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orders = await loadOrders()
  return NextResponse.json({ orders })
}
