'use client'

import { useState, useMemo, useEffect } from 'react'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { CATEGORIES } from '@/lib/products'
import ProductCard from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/Skeletons'
import type { Product } from '@/types/database'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('featured')
  const [maxPrice, setMaxPrice] = useState(200000)
  const [showFilters, setShowFilters] = useState(false)
  const [onlyNew, setOnlyNew] = useState(false)
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | ''>('')

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setAllProducts(data.products || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let products = [...allProducts]
    if (selectedCategories.length > 0) products = products.filter(p => selectedCategories.includes(p.category))
    if (onlyNew) products = products.filter(p => p.new_arrival)
    if (selectedGender) products = products.filter(p => p.gender === selectedGender || p.gender === 'unisex')
    products = products.filter(p => p.price <= maxPrice)
    switch (sortBy) {
      case 'price-asc': products.sort((a, b) => a.price - b.price); break
      case 'price-desc': products.sort((a, b) => b.price - a.price); break
      case 'rating': products.sort((a, b) => b.rating - a.rating); break
      case 'newest': products.sort((a, b) => (b.new_arrival ? 1 : 0) - (a.new_arrival ? 1 : 0)); break
      default: products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break
    }
    return products
  }, [allProducts, selectedCategories, sortBy, maxPrice, onlyNew, selectedGender])

  const toggleCategory = (slug: string) =>
    setSelectedCategories(prev => prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug])

  const clearFilters = () => { setSelectedCategories([]); setMaxPrice(200000); setOnlyNew(false); setSelectedGender('') }
  const hasFilters = selectedCategories.length > 0 || maxPrice < 200000 || onlyNew || selectedGender !== ''

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8 }}>Catalogue</p>
          <h1 className="font-display" style={{ color: '#F5F2EC', fontSize: '3rem' }}>All Products</h1>
          <div style={{ width: 48, height: 1, background: '#C9A84C', marginTop: 12 }} />
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setShowFilters(!showFilters)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.12)', padding: '10px 16px', background: 'transparent', color: 'rgba(245,242,236,0.7)', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.5)'; (e.currentTarget as HTMLElement).style.color = '#C9A84C' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = 'rgba(245,242,236,0.7)' }}>
              <SlidersHorizontal size={15} /> Filters
              {hasFilters && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C9A84C', display: 'inline-block' }} />}
            </button>
            {hasFilters && (
              <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,236,0.35)', fontSize: '0.75rem' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,242,236,0.35)')}>
                <X size={12} /> Clear
              </button>
            )}
            <span style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.8rem' }}>{filtered.length} items</span>
          </div>
          <div style={{ position: 'relative' }}>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ appearance: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F2EC', fontSize: '0.8rem', padding: '10px 32px 10px 14px', cursor: 'pointer', outline: 'none' }}>
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value} style={{ background: '#0A0A0F' }}>{opt.label}</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,242,236,0.4)', pointerEvents: 'none' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 32 }}>
          {/* Sidebar */}
          {showFilters && (
            <aside style={{ width: 220, flexShrink: 0 }} className="animate-fade-in">
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>Category</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <label key={cat.slug} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedCategories.includes(cat.slug)} onChange={() => toggleCategory(cat.slug)}
                        style={{ accentColor: '#C9A84C', width: 14, height: 14 }} />
                      <span style={{ color: 'rgba(245,242,236,0.55)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {cat.icon} {cat.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>Gender</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([{ value: '', label: 'All' }, { value: 'male', label: '♂ Male' }, { value: 'female', label: '♀ Female' }] as const).map(({ value, label }) => (
                    <button key={value} onClick={() => setSelectedGender(value)}
                      style={{
                        flex: 1, padding: '8px 4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                        border: `1px solid ${selectedGender === value ? '#C9A84C' : 'rgba(255,255,255,0.1)'}`,
                        background: selectedGender === value ? 'rgba(201,168,76,0.12)' : 'transparent',
                        color: selectedGender === value ? '#C9A84C' : 'rgba(245,242,236,0.45)',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>Max Price</h3>
                <input type="range" min={1000} max={200000} step={1000} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#C9A84C' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.7rem' }}>Ksh 1K</span>
                  <span style={{ color: '#C9A84C', fontSize: '0.8rem', fontWeight: 600 }}>Ksh {maxPrice.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <h3 style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>Filter</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={onlyNew} onChange={e => setOnlyNew(e.target.checked)} style={{ accentColor: '#C9A84C', width: 14, height: 14 }} />
                  <span style={{ color: 'rgba(245,242,236,0.55)', fontSize: '0.85rem' }}>New Arrivals</span>
                </label>
              </div>
            </aside>
          )}

          {/* Grid */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p className="font-display" style={{ color: 'rgba(245,242,236,0.2)', fontSize: '1.5rem', fontStyle: 'italic', marginBottom: 16 }}>No products found</p>
                <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
                {filtered.map((product, i) => <ProductCard key={product.id} product={product} index={i % 6} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
