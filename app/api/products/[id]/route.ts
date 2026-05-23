import { NextRequest, NextResponse } from 'next/server'
import { loadProducts } from '@/lib/product-store'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const products = await loadProducts()
  const product = products.find((p) => p.id === id) ?? null

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({ product }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  })
}
