import { NextRequest, NextResponse } from 'next/server'
import { loadProducts } from '@/lib/product-store'

// Cache for an hour as a background safety net — admin writes call
// revalidatePath('/api/products') so changes show up quickly regardless.
// A short window here just adds unnecessary Supabase queries and ISR writes
// for no real benefit to freshness.
export const revalidate = 3600

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
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
