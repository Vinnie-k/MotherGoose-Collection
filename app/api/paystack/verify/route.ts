import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY
  if (!paystackSecret) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')
  if (!reference) return NextResponse.json({ error: 'Reference required' }, { status: 400 })

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackSecret}` },
    })
    const data = await res.json()

    if (!data.status || data.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment not successful', status: data.data?.status }, { status: 400 })
    }

    return NextResponse.json({
      success:   true,
      reference: data.data.reference,
      amount:    data.data.amount / 100, // convert back from kobo
      email:     data.data.customer.email,
      metadata:  data.data.metadata,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
