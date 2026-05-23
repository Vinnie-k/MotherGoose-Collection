'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ShoppingBag, Heart, ChevronRight, Minus, Plus } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useToast } from '@/lib/toast-context'
import { formatPrice } from '@/lib/format'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types/database'

const SIZES: Record<string, string[]> = {
  watches: [],
  suits: ['36R','38R','40R','42R','44R','38L','40L','42L'],
  clothing: ['XS','S','M','L','XL','XXL'],
  shoes: ['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11','UK 12'],
  accessories: [],
  bags: [],
}

export default function ProductDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        const all: Product[] = data.products || []
        const found = all.find(p => p.id === id)
        setProduct(found || null)
        setRelated(all.filter(p => p.category === found?.category && p.id !== id).slice(0, 4))
      })
      .finally(() => setLoading(false))
  }, [id])

  const { addItem } = useCart()
  const { toggle, isWished } = useWishlist()
  const { toast } = useToast()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [activeTab, setActiveTab] = useState<'details'|'shipping'>('details')

  if (loading) {
    return (
      <div style={{ paddingTop: 80, minHeight: '100vh' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
            <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 4 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="skeleton" style={{ height: 12, width: 120 }} />
              <div className="skeleton" style={{ height: 48, width: '80%' }} />
              <div className="skeleton" style={{ height: 40, width: 160 }} />
              <div className="skeleton" style={{ height: 48, width: '100%', marginTop: 16 }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ paddingTop: 80, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, textAlign: 'center', padding: '80px 24px' }}>
        <p className="font-display" style={{ color: 'rgba(245,242,236,0.2)', fontSize: '2rem', fontStyle: 'italic' }}>Product not found</p>
        <Link href="/products" className="btn-outline">Browse Products</Link>
      </div>
    )
  }

  const sizes = SIZES[product.category] ?? []
  const wished = isWished(product.id)
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) { toast('Please select a size', 'error'); return }
    addItem(product, quantity, selectedSize || undefined)
    setAdded(true)
    toast(`${product.name} added to your bag`, 'success')
    setTimeout(() => setAdded(false), 2000)
  }

  const tabStyle = (tab: string): React.CSSProperties => ({
    padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const,
    borderBottom: activeTab === tab ? '2px solid #C9A84C' : '2px solid transparent',
    color: activeTab === tab ? '#C9A84C' : 'rgba(245,242,236,0.35)',
    transition: 'color 0.2s', marginBottom: -1,
  })

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, fontSize: '0.75rem', color: 'rgba(245,242,236,0.3)' }}>
          <Link href="/" style={{ color: 'rgba(245,242,236,0.3)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e=>(e.currentTarget.style.color='#C9A84C')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(245,242,236,0.3)')}>Home</Link>
          <ChevronRight size={12} />
          <Link href="/products" style={{ color: 'rgba(245,242,236,0.3)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e=>(e.currentTarget.style.color='#C9A84C')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(245,242,236,0.3)')}>Products</Link>
          <ChevronRight size={12} />
          <Link href={`/category/${product.category}`} style={{ color: 'rgba(245,242,236,0.3)', textDecoration: 'none', textTransform: 'capitalize', transition: 'color 0.2s' }} onMouseEnter={e=>(e.currentTarget.style.color='#C9A84C')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(245,242,236,0.3)')}>{product.category}</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'rgba(245,242,236,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{product.name}</span>
        </nav>

        {/* Main grid — image left, info right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40, marginBottom: 80 }} className="product-grid">
          {/* Images */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480, width: '100%' }}>

            {/* Main image with slider */}
            <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', userSelect: 'none' }}
              onTouchStart={e => {
                const touch = e.touches[0]
                ;(e.currentTarget as HTMLElement).dataset.touchX = String(touch.clientX)
              }}
              onTouchEnd={e => {
                const startX = Number((e.currentTarget as HTMLElement).dataset.touchX || 0)
                const endX = e.changedTouches[0].clientX
                const diff = startX - endX
                if (Math.abs(diff) > 40) {
                  if (diff > 0) setSelectedImage(i => Math.min(i + 1, product.images.length - 1))
                  else setSelectedImage(i => Math.max(i - 1, 0))
                }
              }}>

              {/* Sliding strip */}
              <div style={{
                display: 'flex',
                width: `${product.images.length * 100}%`,
                height: '100%',
                transform: `translateX(-${selectedImage * (100 / product.images.length)}%)`,
                transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
                {product.images.map((img, i) => (
                  <div key={i} style={{ width: `${100 / product.images.length}%`, height: '100%', position: 'relative', flexShrink: 0 }}>
                    <Image src={img} alt={`${product.name} — photo ${i + 1}`}
                      fill sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>

              {/* Badges */}
              {product.new_arrival && <span style={{ position: 'absolute', top: 16, left: 16, background: '#C9A84C', color: '#0A0A0F', fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', letterSpacing: '0.1em', textTransform: 'uppercase', zIndex: 2 }}>New Arrival</span>}
              {discount && <span style={{ position: 'absolute', top: 16, right: 16, background: '#dc2626', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', letterSpacing: '0.1em', textTransform: 'uppercase', zIndex: 2 }}>-{discount}%</span>}

              {/* Arrow buttons — only shown when multiple images */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(i => Math.max(i - 1, 0))}
                    disabled={selectedImage === 0}
                    aria-label="Previous image"
                    style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      width: 40, height: 40, borderRadius: '50%', zIndex: 2,
                      background: selectedImage === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.6)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: selectedImage === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
                      cursor: selectedImage === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backdropFilter: 'blur(4px)', transition: 'all 0.2s',
                    }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button
                    onClick={() => setSelectedImage(i => Math.min(i + 1, product.images.length - 1))}
                    disabled={selectedImage === product.images.length - 1}
                    aria-label="Next image"
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      width: 40, height: 40, borderRadius: '50%', zIndex: 2,
                      background: selectedImage === product.images.length - 1 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.6)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: selectedImage === product.images.length - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
                      cursor: selectedImage === product.images.length - 1 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backdropFilter: 'blur(4px)', transition: 'all 0.2s',
                    }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>

                  {/* Dot indicators */}
                  <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 2 }}>
                    {product.images.map((_, i) => (
                      <button key={i} onClick={() => setSelectedImage(i)} aria-label={`Go to image ${i + 1}`}
                        style={{
                          width: selectedImage === i ? 20 : 6,
                          height: 6, borderRadius: 3, border: 'none', cursor: 'pointer',
                          background: selectedImage === i ? '#C9A84C' : 'rgba(255,255,255,0.4)',
                          padding: 0, transition: 'all 0.3s ease',
                        }} />
                    ))}
                  </div>

                  {/* Image counter */}
                  <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: 20, zIndex: 2 }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em' }}>{selectedImage + 1} / {product.images.length}</span>
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    style={{
                      flexShrink: 0, width: 68, height: 68, overflow: 'hidden', padding: 0,
                      position: 'relative',
                      border: `2px solid ${selectedImage === i ? '#C9A84C' : 'rgba(255,255,255,0.08)'}`,
                      background: 'rgba(255,255,255,0.04)', cursor: 'pointer',
                      transition: 'border-color 0.2s', outline: 'none',
                      opacity: selectedImage === i ? 1 : 0.55,
                    }}>
                    <Image src={img} alt={`View ${i + 1}`} fill sizes="80px" style={{ objectFit: 'cover', pointerEvents: 'none' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 10 }}>
                {product.category}{product.subcategory ? ` · ${product.subcategory}` : ''}
              </p>
              <h1 className="font-display" style={{ color: '#F5F2EC', fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.1, marginBottom: 12 }}>{product.name}</h1>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="font-display" style={{ color: '#F5F2EC', fontSize: '2.5rem', fontWeight: 700 }}>{formatPrice(product.price)}</span>
              {product.original_price && (
                <>
                  <span style={{ color: 'rgba(245,242,236,0.3)', fontSize: '1.25rem', textDecoration: 'line-through', paddingBottom: 4 }}>{formatPrice(product.original_price)}</span>
                  <span style={{ color: '#4ade80', fontSize: '0.875rem', paddingBottom: 4 }}>Save {formatPrice(product.original_price - product.price)}</span>
                </>
              )}
            </div>

            {/* Description — shown here beside the image */}
            {product.description && (
              <p style={{ color: 'rgba(245,242,236,0.55)', fontSize: '0.9rem', lineHeight: 1.8, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16 }}>
                {product.description}
              </p>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p style={{ color: 'rgba(245,242,236,0.6)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Size</p>
                  <Link href="/size-guide" style={{ color: '#C9A84C', fontSize: '0.7rem', textDecoration: 'underline' }}>Size Guide</Link>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '8px 16px', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase',
                        border: `1px solid ${selectedSize === size ? '#C9A84C' : 'rgba(255,255,255,0.1)'}`,
                        background: selectedSize === size ? 'rgba(201,168,76,0.1)' : 'transparent',
                        color: selectedSize === size ? '#C9A84C' : 'rgba(245,242,236,0.5)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p style={{ color: 'rgba(245,242,236,0.6)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Quantity</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)', opacity: product.stock === 0 ? 0.3 : 1 }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity-1))} disabled={product.stock === 0} style={{ width: 40, height: 40, background: 'none', border: 'none', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', color: 'rgba(245,242,236,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                  <span style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5F2EC', fontSize: '0.875rem' }}>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity+1))} disabled={product.stock === 0} style={{ width: 40, height: 40, background: 'none', border: 'none', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', color: 'rgba(245,242,236,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                </div>
                {product.stock === 0
                  ? <span style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 600 }}>Out of stock</span>
                  : product.stock <= 5
                  ? <span style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600 }}>Only {product.stock} left!</span>
                  : <span style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.75rem' }}>{product.stock} in stock</span>
                }
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleAddToCart} disabled={product.stock === 0}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '16px 24px', border: 'none', fontWeight: 600, fontSize: '0.75rem',
                  letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'all 0.3s',
                  cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                  background: product.stock === 0 ? 'rgba(255,255,255,0.08)' : added ? '#16a34a' : '#C9A84C',
                  color: product.stock === 0 ? 'rgba(245,242,236,0.2)' : added ? 'white' : '#0A0A0F',
                }}>
                <ShoppingBag size={16} />
                {product.stock === 0 ? 'Out of Stock' : added ? 'Added to Bag ✓' : 'Add to Bag'}
              </button>
              <button onClick={() => { toggle(product); toast(wished ? 'Removed from wishlist' : 'Saved to wishlist', 'info') }}
                style={{
                  width: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${wished ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.12)'}`,
                  background: wished ? 'rgba(239,68,68,0.08)' : 'transparent',
                  color: wished ? '#f87171' : 'rgba(245,242,236,0.4)', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
              </button>
            </div>


          </div>
        </div>

        {/* Tabs — Details & Shipping only (description is shown beside image) */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 24 }}>
            {(['details','shipping'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={tabStyle(tab)}>{tab}</button>
            ))}
          </div>
          <div style={{ maxWidth: 640, color: 'rgba(245,242,236,0.55)', lineHeight: 1.8, fontSize: '0.9rem' }}>
            {activeTab === 'details' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  ['Category', product.category],
                  ['Subcategory', product.subcategory ?? '—'],
                  ['In Stock', `${product.stock} units`],
                  product.original_price ? ['Original Price', formatPrice(product.original_price)] : null,
                  product.original_price ? ['Savings', `${formatPrice(product.original_price - product.price)} (${discount}% off)`] : null,
                ].filter((x): x is string[] => x !== null).map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', gap: 24, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'rgba(245,242,236,0.35)', width: 140, flexShrink: 0 }}>{k}</span>
                    <span style={{ textTransform: 'capitalize' }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'shipping' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p><strong style={{ color: '#F5F2EC' }}>Standard (3–5 days):</strong> Free on orders over Ksh 5,000. Ksh 500 otherwise.</p>
                <p><strong style={{ color: '#F5F2EC' }}>Express (2–3 days):</strong> Ksh 1,500 flat rate.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 80 }}>
            <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8 }}>More Like This</p>
            <h2 className="font-display" style={{ color: '#F5F2EC', fontSize: '2rem', marginBottom: 32 }}>You May Also Like</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }} className="related-grid">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @media (min-width: 768px) {
          .product-grid { grid-template-columns: 480px 1fr !important; align-items: start !important; }
          .related-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (max-width: 767px) {
          .product-grid > div:first-child { max-width: 100% !important; }
        }
      `}</style>
    </div>
  )
}
