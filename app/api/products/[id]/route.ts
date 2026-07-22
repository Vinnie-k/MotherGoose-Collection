import { NextRequest, NextResponse } from 'next/server'
import { loadProducts } from '@/lib/product-store'

// Cache for an hour as a background safety net — admin edits push instantly
// via revalidatePath() in the admin routes, so this only bounds worst-case
// staleness, not actual update speed.
export const revalidate = 3600

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
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
