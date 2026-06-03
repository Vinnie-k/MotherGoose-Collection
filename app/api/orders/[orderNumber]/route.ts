import { NextRequest, NextResponse } from 'next/server'
import { loadOrders } from '@/lib/order-store'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await context.params
    const orders = await loadOrders()
    const order = orders.find(o => o.orderNumber === orderNumber)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json({ order })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
