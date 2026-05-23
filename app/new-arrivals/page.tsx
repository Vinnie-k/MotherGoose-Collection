'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/Skeletons'
import type { Product } from '@/types/database'

export default function NewArrivalsPage() {
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const all: Product[] = data.products || []
        if (all.length > 0) {
          setNewProducts(all.filter(p => p.new_arrival))
          setRecentProducts(all.filter(p => !p.new_arrival).slice(0, 4))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      {/* Banner */}
      <div style={{ position: 'relative', height: '40vh', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,15,0.95), rgba(10,10,15,0.5), rgba(10,10,15,0.2))' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0A0A0F, transparent)' }} />
        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', maxWidth: 1280, margin: '0 auto', padding: '0 24px 40px' }}>
          <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: 10 }}>Just Arrived</p>
          <h1 className="font-display" style={{ color: '#F5F2EC', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700 }}>New Arrivals</h1>
          <p style={{ color: 'rgba(245,242,236,0.5)', marginTop: 8, maxWidth: 480, lineHeight: 1.7 }}>
            The freshest additions to our collection.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <>
            {newProducts.length > 0 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
                  <div>
                    <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 6 }}>This Season</p>
                    <h2 className="font-display" style={{ color: '#F5F2EC', fontSize: '2rem' }}>{newProducts.length} New Piece{newProducts.length !== 1 ? 's' : ''}</h2>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24, marginBottom: 80 }}>
                  {newProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', marginBottom: 60 }}>
                <p className="font-display" style={{ color: 'rgba(245,242,236,0.2)', fontSize: '1.5rem', fontStyle: 'italic' }}>No new arrivals yet</p>
              </div>
            )}

            {recentProducts.length > 0 && (
              <>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 60, marginBottom: 36 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
                    <div>
                      <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 6 }}>Also Available</p>
                      <h2 className="font-display" style={{ color: '#F5F2EC', fontSize: '2rem' }}>Recent Favourites</h2>
                    </div>
                    <Link href="/products" style={{ color: '#C9A84C', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                      See All <ArrowRight size={13} />
                    </Link>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
                    {recentProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                  </div>
                </div>
              </>
            )}
          </>
        )}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link href="/products" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Browse Full Collection <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
