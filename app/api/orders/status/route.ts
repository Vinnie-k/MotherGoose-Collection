import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus } from '@/lib/order-store'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import type { Order } from '@/lib/order-store'

export async function PUT(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, status } = await request.json()
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 })
  const updated = await updateOrderStatus(id, status as Order['status'])
  if (!updated) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json({ order: updated })
}
