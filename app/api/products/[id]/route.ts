import { NextRequest, NextResponse } from 'next/server'
import { loadProducts } from '@/lib/product-store'

// Cache briefly so navigating to the same product repeatedly (or the
// related-products lookups on other pages) doesn't re-query every click.
export const revalidate = 30

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
    headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300' },
  })
}
