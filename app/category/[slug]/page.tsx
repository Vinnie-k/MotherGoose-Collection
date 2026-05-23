'use client'

import { useState, useMemo, useEffect } from 'react'
import { notFound, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { CATEGORIES } from '@/lib/products'
import ProductCard from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/Skeletons'
import type { Product } from '@/types/database'

const CATEGORY_BANNERS: Record<string, { image: string; headline: string; sub: string }> = {
  watches: { image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=1600&q=80', headline: 'Precision Timepieces', sub: 'From Swiss automatics to modern minimalists — watches that mark life\'s finest moments.' },
  suits: { image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&q=80', headline: 'Tailored Perfection', sub: 'Suits crafted from the world\'s finest wools. Command every room you enter.' },
  clothing: { image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80', headline: 'Refined Casual', sub: 'Effortless style from morning to midnight. Elevated basics, premium fabrics.' },
  shoes: { image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80', headline: 'Footwear Excellence', sub: 'Walk with confidence in hand-crafted leather shoes and contemporary styles.' },
  accessories: { image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1600&q=80', headline: 'The Finishing Touch', sub: 'The details that distinguish the well-dressed man.' },
  bags: { image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1600&q=80', headline: 'Carry in Style', sub: 'Premium leather briefcases, weekend bags, and everyday carry essentials.' },
}

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string

  const category = CATEGORIES.find(c => c.slug === slug)
  const banner = CATEGORY_BANNERS[slug]

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('featured')
  const [maxPrice, setMaxPrice] = useState(200000)
  const [onlyNew, setOnlyNew] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | ''>('')

  useEffect(() => {
    if (!slug) return
    fetch(`/api/products?category=${slug}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => { setAllProducts(data.products || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  const products = useMemo(() => {
    let items = [...allProducts]
    if (onlyNew) items = items.filter(p => p.new_arrival)
    if (selectedGender) items = items.filter(p => p.gender === selectedGender || p.gender === 'unisex')
    items = items.filter(p => p.price <= maxPrice)
    switch (sortBy) {
      case 'price-asc': items.sort((a, b) => a.price - b.price); break
      case 'price-desc': items.sort((a, b) => b.price - a.price); break
      case 'rating': items.sort((a, b) => b.rating - a.rating); break
      case 'newest': items.sort((a, b) => (b.new_arrival ? 1 : 0) - (a.new_arrival ? 1 : 0)); break
      default: items.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break
    }
    return items
  }, [allProducts, sortBy, maxPrice, onlyNew, selectedGender])

  if (!category || !banner) return notFound()

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Banner */}
      <div style={{ position: 'relative', height: '60vh', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('${banner.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,15,0.92), rgba(10,10,15,0.6), rgba(10,10,15,0.2))' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0A0A0F, transparent)' }} />
        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', maxWidth: 1280, margin: '0 auto', padding: '0 24px 48px' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: '0.75rem', color: 'rgba(245,242,236,0.3)' }}>
            <Link href="/" style={{ color: 'rgba(245,242,236,0.3)', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <span style={{ color: 'rgba(245,242,236,0.6)', textTransform: 'capitalize' }}>{category.label}</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <h1 className="font-display" style={{ color: '#F5F2EC', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 700 }}>{banner.headline}</h1>
          </div>
          <p style={{ color: 'rgba(245,242,236,0.5)', maxWidth: 520, fontSize: '0.95rem', lineHeight: 1.7 }}>{banner.sub}</p>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setShowFilters(!showFilters)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.12)', padding: '10px 16px', background: 'transparent', color: 'rgba(245,242,236,0.7)', cursor: 'pointer', fontSize: '0.8rem' }}>
              <SlidersHorizontal size={14} /> Filters
            </button>
            {(onlyNew || maxPrice < 200000 || selectedGender) && (
              <button onClick={() => { setOnlyNew(false); setMaxPrice(200000); setSelectedGender('') }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,236,0.35)', fontSize: '0.75rem' }}>
                <X size={12} /> Clear
              </button>
            )}
            <span style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.8rem' }}>{products.length} items</span>
          </div>
          <div style={{ position: 'relative' }}>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ appearance: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F2EC', fontSize: '0.8rem', padding: '10px 32px 10px 14px', cursor: 'pointer', outline: 'none' }}>
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value} style={{ background: '#0A0A0F' }}>{opt.label}</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,242,236,0.4)', pointerEvents: 'none' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 28 }}>
          {showFilters && (
            <aside style={{ width: 200, flexShrink: 0 }} className="animate-fade-in">
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Gender</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  {([{ value: '', label: 'All' }, { value: 'male', label: '♂ Male' }, { value: 'female', label: '♀ Female' }] as const).map(({ value, label }) => (
                    <button key={value || 'all'} onClick={() => setSelectedGender(value)}
                      style={{ flex: 1, padding: '7px 4px', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer', border: `1px solid ${selectedGender === value ? '#C9A84C' : 'rgba(255,255,255,0.1)'}`, background: selectedGender === value ? 'rgba(201,168,76,0.12)' : 'transparent', color: selectedGender === value ? '#C9A84C' : 'rgba(245,242,236,0.4)' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Max Price</h3>
                <input type="range" min={1000} max={200000} step={1000} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width: '100%', accentColor: '#C9A84C' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.7rem' }}>Ksh 1K</span>
                  <span style={{ color: '#C9A84C', fontSize: '0.75rem', fontWeight: 600 }}>Ksh {maxPrice.toLocaleString()}</span>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={onlyNew} onChange={e => setOnlyNew(e.target.checked)} style={{ accentColor: '#C9A84C', width: 14, height: 14 }} />
                <span style={{ color: 'rgba(245,242,236,0.55)', fontSize: '0.85rem' }}>New Arrivals</span>
              </label>
            </aside>
          )}

          <div style={{ flex: 1 }}>
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p className="font-display" style={{ color: 'rgba(245,242,236,0.2)', fontSize: '1.5rem', fontStyle: 'italic', marginBottom: 12 }}>Nothing found</p>
                <button onClick={() => { setMaxPrice(200000); setOnlyNew(false) }} className="btn-outline">Reset Filters</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
                {products.map((product, i) => <ProductCard key={product.id} product={product} index={i % 6} />)}
              </div>
            )}
          </div>
        </div>

        {/* Other categories */}
        {(() => {
          const CATEGORY_IMAGES: Record<string, string> = {
            watches: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&q=80',
            suits: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
            clothing: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80',
            shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
            accessories: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
            bags: 'https://images.unsplash.com/photo-1591561954555-607968c989ab?w=400&q=80',
          }
          return (
            <div style={{ marginTop: 80, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 20 }}>Explore More</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {CATEGORIES.filter(c => c.slug !== slug).map(cat => (
                  <Link key={cat.slug} href={`/category/${cat.slug}`}
                    style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4', display: 'block', textDecoration: 'none' }}
                    onMouseEnter={e => { const img = e.currentTarget.querySelector('.xcat-img') as HTMLElement; if (img) img.style.transform = 'scale(1.08)' }}
                    onMouseLeave={e => { const img = e.currentTarget.querySelector('.xcat-img') as HTMLElement; if (img) img.style.transform = 'scale(1)' }}>
                    <Image className="xcat-img" src={CATEGORY_IMAGES[cat.slug] || ''} alt={cat.label}
                      fill sizes="(max-width: 768px) 50vw, 180px"
                      style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,15,0.85) 0%, transparent 60%)' }} />
                    <span style={{ position: 'absolute', bottom: 10, left: 12, color: '#F5F2EC', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
