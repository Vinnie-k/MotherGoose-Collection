import { notFound } from 'next/navigation'
import { cache } from 'react'
import type { Metadata } from 'next'
import { loadProducts } from '@/lib/product-store'
import ProductDetailClient from '@/components/ProductDetailClient'
import type { Product } from '@/types/database'

// Revalidate every hour as a background safety net — admin edits push
// instantly via revalidatePath() in the admin routes, so this window only
// controls worst-case staleness, not actual update speed. This is the
// biggest lever on Vercel's ISR-write usage: every distinct product page
// gets its own write on each revalidation, so a short window here is what
// multiplies fastest across a real catalog.
export const revalidate = 3600

// Wrapped in React's cache() so that generateMetadata() and the page
// component — which both need this data — only trigger one actual
// loadProducts() call per request, not two.
const getProductAndRelated = cache(async (id: string): Promise<{ product: Product | null; related: Product[] }> => {
  const products = await loadProducts()
  const product = products.find((p) => p.id === id) ?? null
  if (!product) return { product: null, related: [] }
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
  return { product, related }
})

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const { product } = await getProductAndRelated(id)
  if (!product) return { title: 'Product Not Found — Mothergoose Collection' }
  return {
    title: `${product.name} — Mothergoose Collection`,
    description: product.description || undefined,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  }
}

export default async function ProductDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { product, related } = await getProductAndRelated(id)

  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} related={related} />
}
