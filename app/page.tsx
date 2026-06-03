'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types/database'

const CATEGORY_IMAGES = [
  { slug: 'watches', label: 'Watches', image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&q=80' },
  { slug: 'suits', label: 'Suits', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80' },
  { slug: 'clothing', label: 'Clothing', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80' },
  { slug: 'shoes', label: 'Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
  { slug: 'accessories', label: 'Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
  { slug: 'bags', label: 'Bags', image: 'https://images.unsplash.com/photo-1591561954555-607968c989ab?w=600&q=80' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])

  // Load live products from the API (includes admin-added products)
  useEffect(() => {
    fetch('/api/products', { next: { revalidate: 60 } })
      .then(r => r.json())
      .then(data => {
        const all: Product[] = data.products || []
        if (all.length > 0) {
          setFeatured(all.filter(p => p.featured).slice(0, 4))
          setNewArrivals(all.filter(p => p.new_arrival).slice(0, 4))
        }
      })
      .catch(() => {}) // silently use defaults on error
  }, [])

  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0A0A0F, rgba(10,10,15,0.75), rgba(10,10,15,0.15))' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0A0A0F, transparent, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '128px 24px' }}>
          <div style={{ maxWidth: 600 }}>
            <h1 className="font-display stagger-2" style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', fontWeight: 700, color: '#F5F2EC', lineHeight: 0.9, marginBottom: 32 }}>
              Dress<br />
              <span style={{ fontStyle: 'italic', color: '#C9A84C' }}>Without</span><br />
              Limits
            </h1>
            <p style={{ color: 'rgba(245,242,236,0.6)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: 40, maxWidth: 420 }} className="stagger-3">
              Curated luxury fashion for men who understand that true style is timeless. From precision timepieces to hand-tailored suits.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }} className="stagger-4">
              <Link href="/products" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Shop Collection <ArrowRight size={16} />
              </Link>
              <Link href="/category/watches" className="btn-outline">
                Explore Watches
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY GRID ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 500 }}>Explore</p>
          <h2 className="font-display" style={{ color: '#F5F2EC', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Shop by Category</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }} className="category-grid">
          {CATEGORY_IMAGES.map((cat, i) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`}
              className={`stagger-${i + 1}`}
              style={{ display: 'block', textDecoration: 'none', position: 'relative', overflow: 'hidden', aspectRatio: '2/3', transition: 'all 0.3s' }}
              onMouseEnter={e => { const img = e.currentTarget.querySelector('.cat-img') as HTMLElement; if (img) img.style.transform = 'scale(1.08)' }}
              onMouseLeave={e => { const img = e.currentTarget.querySelector('.cat-img') as HTMLElement; if (img) img.style.transform = 'scale(1)' }}>
              <Image className="cat-img" src={cat.image} alt={cat.label}
                fill sizes="(max-width: 768px) 50vw, 180px"
                style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }} />
              {/* Gradient overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,15,0.85) 0%, rgba(10,10,15,0.2) 50%, transparent 100%)' }} />
              {/* Label */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 16px' }}>
                <span style={{ color: '#F5F2EC', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>{cat.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      {featured.length > 0 && (
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
            <div>
              <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 500 }}>Handpicked</p>
              <h2 className="font-display" style={{ color: '#F5F2EC', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Featured Pieces</h2>
            </div>
            <Link href="/products" style={{ color: '#C9A84C', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              All Products <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── NEW ARRIVALS ── */}
      {newArrivals.length > 0 && (
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 96px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
            <div>
              <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 500 }}>Just In</p>
              <h2 className="font-display" style={{ color: '#F5F2EC', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>New Arrivals</h2>
            </div>
            <Link href="/new-arrivals" style={{ color: '#C9A84C', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              See All <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
            {newArrivals.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
