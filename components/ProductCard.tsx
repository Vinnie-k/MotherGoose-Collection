'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ShoppingBag, Heart, Star } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useToast } from '@/lib/toast-context'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/types/database'

// Fallback image if product image fails to load
const FALLBACK = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=60'

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart()
  const { toggle, isWished } = useWishlist()
  const { toast } = useToast()
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const wished = isWished(product.id)
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null

  // Pick the best available image
  const imgSrc = imgError || !product.images?.[0]
    ? FALLBACK
    : product.images[0]

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (product.stock === 0) return
    addItem(product, 1)
    setAdded(true)
    toast(`${product.name} added to bag`, 'success')
    setTimeout(() => setAdded(false), 1800)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    const was = isWished(product.id)
    toggle(product)
    toast(was ? 'Removed from wishlist' : `${product.name} saved to wishlist`, 'info')
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className={`stagger-${Math.min(index + 1, 6)}`}
      style={{ display: 'block', textDecoration: 'none', transition: 'transform 0.4s, box-shadow 0.4s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(201,168,76,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>

      {/* Image */}
      <div className="product-card-img" style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
          onError={() => setImgError(true)}
          style={{ objectFit: 'cover', transition: 'transform 0.7s ease' }}
          className="product-img"
        />

        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {product.new_arrival && (
            <span style={{ background: '#C9A84C', color: '#0A0A0F', fontSize: '0.55rem', fontWeight: 700, padding: '3px 8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>New</span>
          )}
          {discount && (
            <span style={{ background: '#dc2626', color: 'white', fontSize: '0.55rem', fontWeight: 700, padding: '3px 8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>-{discount}%</span>
          )}
          {product.stock === 0 && (
            <span style={{ background: 'rgba(0,0,0,0.75)', color: 'rgba(245,242,236,0.6)', fontSize: '0.55rem', fontWeight: 700, padding: '3px 8px', letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.15)' }}>Sold Out</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className="wishlist-btn"
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            border: wished ? '1px solid rgba(248,113,113,0.6)' : '1px solid rgba(255,255,255,0.15)',
            background: wished ? 'rgba(239,68,68,0.2)' : 'rgba(10,10,15,0.65)',
            color: wished ? '#f87171' : 'rgba(245,242,236,0.5)',
            cursor: 'pointer', opacity: wished ? 1 : 0, transition: 'opacity 0.2s',
          }}>
          <Heart size={12} fill={wished ? 'currentColor' : 'none'} />
        </button>

        {/* Quick Add */}
        <div className="quick-add"
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, transform: 'translateY(100%)', transition: 'transform 0.3s' }}>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            style={{
              width: '100%', padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
              border: 'none', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
              background: product.stock === 0 ? 'rgba(100,100,100,0.85)' : added ? 'rgba(22,163,74,0.92)' : 'rgba(201,168,76,0.92)',
              color: product.stock === 0 ? 'rgba(245,242,236,0.4)' : added ? 'white' : '#0A0A0F',
            }}>
            <ShoppingBag size={12} /> {product.stock === 0 ? 'Out of Stock' : added ? 'Added ✓' : 'Quick Add'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ paddingTop: 14 }}>
        <p style={{ color: 'rgba(245,242,236,0.35)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 5, textDecoration: 'none' }}>
          {product.category}
        </p>
        <h3 style={{
          color: '#F5F2EC', fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.35,
          marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {product.name}
        </h3>
        {product.rating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
            <Star size={11} style={{ color: '#C9A84C', fill: '#C9A84C' }} />
            <span style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.7rem' }}>{product.rating} ({product.review_count})</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#F5F2EC', fontWeight: 600, fontSize: '0.95rem' }}>{formatPrice(product.price)}</span>
          {product.original_price && (
            <span style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.8rem', textDecoration: 'line-through' }}>
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>
      </div>

      <style>{`
        .product-card-img:hover .product-img { transform: scale(1.06); }
        .product-card-img:hover .quick-add { transform: translateY(0) !important; }
        .product-card-img:hover .wishlist-btn { opacity: 1 !important; }
      `}</style>
    </Link>
  )
}
