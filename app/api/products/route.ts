import { NextRequest, NextResponse } from 'next/server'
import { loadProducts } from '@/lib/product-store'

// Cache for a short window so repeat clicks don't refetch/rebuild the full
// catalog every time. Admin writes call revalidatePath('/api/products') so
// changes still show up quickly without disabling caching site-wide.
export const revalidate = 30

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
      // Cache for 30s, serve stale for up to 5 min while revalidating in the
      // background — repeat clicks/navigations reuse this instead of
      // re-querying the full catalog every time.
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300',
    },
  })
}
