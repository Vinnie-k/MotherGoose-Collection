import type { Metadata } from 'next'
import { loadProducts } from '@/lib/product-store'
import ProductsFilterGrid from '@/components/ProductsFilterGrid'

// Revalidate every 30s — matches the API route's cache window, so newly
// added/edited products show up quickly without every visit hitting
// Supabase directly.
export const revalidate = 30

export const metadata: Metadata = {
  title: 'All Products — Mothergoose Collection',
  description: 'Browse our full catalogue of premium fashion — watches, suits, clothing, shoes, accessories, and bags.',
}

export default async function ProductsPage() {
  // Fetched once, here, on the server — the client component below just
  // receives the array and handles filtering/sorting interactively.
  const products = await loadProducts()

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8 }}>Catalogue</p>
          <h1 className="font-display" style={{ color: '#F5F2EC', fontSize: '3rem' }}>All Products</h1>
          <div style={{ width: 48, height: 1, background: '#C9A84C', marginTop: 12 }} />
        </div>

        <ProductsFilterGrid allProducts={products} />
      </div>
    </div>
  )
}
