import { NextRequest, NextResponse } from 'next/server'
import { loadProducts } from '@/lib/product-store'

export async function POST(request: NextRequest) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY
  if (!paystackSecret || paystackSecret.includes('your_paystack')) {
    return NextResponse.json({ error: 'Paystack not configured. Add PAYSTACK_SECRET_KEY to .env.local' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { items, email } = body

    if (!items?.length) return NextResponse.json({ error: 'No items' }, { status: 400 })
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    // Server-side price verification — never trust client prices
    const products = await loadProducts()
    let subtotal = 0
    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      if (!product) return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 })
      if (product.stock < item.quantity) return NextResponse.json({ error: `Insufficient stock: ${product.name}` }, { status: 400 })
      subtotal += product.price * item.quantity
    }
    const shipping = subtotal >= 5000 ? 0 : 500
    const total    = subtotal + shipping

    // Paystack expects amount in kobo (KES x 100)
    const amountKobo = Math.round(total * 100)

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount:   amountKobo,
        currency: 'KES',
        metadata: {
          items: items.map((i: {productId: string; quantity: number}) => ({
            id: i.productId, qty: i.quantity,
          })),
          subtotal,
          shipping,
          total,
        },
      }),
    })

    const data = await res.json()
    if (!data.status) {
      console.error('[Paystack] initialize error:', data.message)
      return NextResponse.json({ error: data.message || 'Paystack error' }, { status: 400 })
    }

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      reference:        data.data.reference,
      total,
      subtotal,
      shipping,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Paystack] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
