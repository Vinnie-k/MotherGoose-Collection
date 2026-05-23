'use client'

import { useMemo, useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/Skeletons'
import type { Product } from '@/types/database'

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') ?? ''
  const [inputValue, setInputValue] = useState(query)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => { setAllProducts(data.products || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      (p.subcategory?.toLowerCase().includes(q) ?? false)
    )
  }, [query, allProducts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`)
    }
  }

  return (
    <div style={{ paddingTop: 96, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8 }}>Search</p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, maxWidth: 600, marginBottom: 20 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,242,236,0.3)' }} />
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Search products…"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F2EC', padding: '12px 14px 12px 40px', width: '100%', outline: 'none', fontSize: '0.875rem' }}
              />
              {inputValue && (
                <button type="button" onClick={() => setInputValue('')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,236,0.3)', padding: 4 }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>Search</button>
          </form>

          {query && !loading && (
            <div>
              <h1 className="font-display" style={{ color: '#F5F2EC', fontSize: '2rem' }}>
                {results.length > 0
                  ? <>Results for <span style={{ color: '#C9A84C', fontStyle: 'italic' }}>&ldquo;{query}&rdquo;</span></>
                  : <>No results for <span style={{ color: '#C9A84C', fontStyle: 'italic' }}>&ldquo;{query}&rdquo;</span></>
                }
              </h1>
              <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.875rem', marginTop: 6 }}>
                {results.length} product{results.length !== 1 ? 's' : ''} found
              </p>
            </div>
          )}
        </div>

        {!query && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Search size={48} style={{ color: 'rgba(255,255,255,0.06)', margin: '0 auto 16px' }} />
            <p className="font-display" style={{ color: 'rgba(245,242,236,0.25)', fontSize: '1.5rem', fontStyle: 'italic' }}>What are you looking for?</p>
            <p style={{ color: 'rgba(245,242,236,0.2)', fontSize: '0.875rem', marginTop: 8 }}>Search for watches, suits, shoes, accessories and more</p>
          </div>
        )}

        {loading && query && <ProductGridSkeleton count={4} />}

        {!loading && query && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Search size={40} style={{ color: 'rgba(255,255,255,0.06)', margin: '0 auto 16px' }} />
            <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.875rem', marginBottom: 24 }}>Try a different search term or browse our categories</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {['watches', 'suits', 'shoes', 'bags', 'accessories'].map(term => (
                <button key={term} onClick={() => router.push(`/search?q=${term}`)}
                  style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(245,242,236,0.5)', padding: '8px 16px', fontSize: '0.8rem', textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.4)'; (e.currentTarget as HTMLElement).style.color = '#C9A84C' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(245,242,236,0.5)' }}>
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
            {results.map((product, i) => <ProductCard key={product.id} product={product} index={i % 6} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: 96, minHeight: '100vh' }}><div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}><ProductGridSkeleton count={4} /></div></div>}>
      <SearchResults />
    </Suspense>
  )
}
