import { NextRequest, NextResponse } from 'next/server'
import { loadProducts } from '@/lib/product-store'

// Disable Next.js caching so product additions/deletions are reflected immediately
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('q')
  const featured = searchParams.get('featured')
  const newArrival = searchParams.get('new')

  let products = await loadProducts()

  if (category) products = products.filter((p) => p.category === category)
  if (featured === 'true') products = products.filter((p) => p.featured)
  if (newArrival === 'true') products = products.filter((p) => p.new_arrival)
  if (search) {
    const q = search.toLowerCase()
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  return NextResponse.json({ products }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
