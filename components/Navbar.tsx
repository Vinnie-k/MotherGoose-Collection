'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Search, Menu, X, ChevronDown, Heart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { CATEGORIES } from '@/lib/products'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const router = useRouter()
  const { state, removeItem, updateQuantity, refreshStock } = useCart()
  const { state: wishlistState } = useWishlist()
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50)
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      {/* ── Main Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.4s',
        backgroundColor: scrolled ? 'rgba(10,10,15,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
        padding: scrolled ? '12px 0' : '20px 0',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: 8, textDecoration: 'none' }}>
            <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.15em', color: '#F5F2EC' }}>MOTHERGOOSE</span>
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C' }}>Collection</span>
          </Link>

          {/* Desktop Links */}
          <div style={{ display: 'none', alignItems: 'center', gap: 32 }} className="md-flex">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/about" className="nav-link">About</Link>

            {/* Shop dropdown */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={() => setShopOpen(false)}
            >
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} className="nav-link">
                Shop <ChevronDown size={13} style={{ transform: shopOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {shopOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                  marginTop: 8, backgroundColor: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.5)', padding: '8px 0', minWidth: 180, zIndex: 100,
                }}>
                  <Link href="/products" style={{ display: 'block', padding: '8px 16px', color: '#C9A84C', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
                    All Products →
                  </Link>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
                  {CATEGORIES.map((cat) => (
                    <Link key={cat.slug} href={`/category/${cat.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', color: 'rgba(245,242,236,0.6)', fontSize: '0.8rem', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,242,236,0.6)')}>
                      <span>{cat.icon}</span> {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/new-arrivals" className="nav-link">New In</Link>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* Search */}
            <button onClick={() => setSearchOpen(!searchOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,236,0.7)', transition: 'color 0.2s', padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,242,236,0.7)')}>
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" style={{ position: 'relative', color: 'rgba(245,242,236,0.7)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,242,236,0.7)')}>
              <Heart size={20} />
              {wishlistState.items.length > 0 && (
                <span style={{ position: 'absolute', top: -8, right: -8, background: '#dc2626', color: 'white', fontSize: '0.6rem', fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {wishlistState.items.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button onClick={() => { setCartOpen(!cartOpen); if (!cartOpen) refreshStock() }} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,236,0.7)', transition: 'color 0.2s', padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,242,236,0.7)')}>
              <ShoppingBag size={20} />
              {state.itemCount > 0 && (
                <span style={{ position: 'absolute', top: -8, right: -8, background: '#C9A84C', color: '#0A0A0F', fontSize: '0.6rem', fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {state.itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation menu" aria-expanded={mobileOpen} aria-controls="mobile-nav" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,236,0.7)', padding: 0, display: 'block' }} className="md-hide">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(10,10,15,0.99)' }}>
            <form onSubmit={handleSearch} style={{ maxWidth: 600, margin: '0 auto', padding: '12px 24px', display: 'flex', gap: 12 }}>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search watches, suits, shoes…"
                className="input-dark"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '10px 24px' }}>Search</button>
              <button type="button" onClick={() => setSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,236,0.4)', padding: '0 4px' }}>
                <X size={18} />
              </button>
            </form>
          </div>
        )}
      </nav>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div id="mobile-nav" role="navigation" aria-label="Mobile navigation" style={{ position: 'fixed', inset: 0, zIndex: 40, backgroundColor: '#0A0A0F', paddingTop: 80, padding: '80px 24px 24px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button onClick={() => setMobileOpen(false)} aria-label="Close navigation menu" style={{ alignSelf: 'flex-end', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,236,0.4)', padding: '8px 0', marginBottom: 8 }}><X size={20} /></button>
            {[
              { href: '/', label: 'Home' },
              { href: '/about', label: 'About' },
              { href: '/products', label: 'All Products' },
              { href: '/new-arrivals', label: 'New Arrivals' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                style={{ padding: '14px 0', color: 'rgba(245,242,236,0.7)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {label}
              </Link>
            ))}
            <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 16, marginBottom: 8 }}>Categories</p>
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', color: 'rgba(245,242,236,0.6)', fontSize: '0.8rem', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Cart Drawer ── */}
      {cartOpen && (
        <>
          <div onClick={() => setCartOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: 0, right: 0, height: '100%', width: '100%', maxWidth: 420, zIndex: 50, backgroundColor: '#0A0A0F', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', boxShadow: '-20px 0 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="font-display" style={{ color: '#F5F2EC', fontSize: '1.25rem' }}>Your Bag ({state.itemCount})</h2>
              <button onClick={() => setCartOpen(false)} aria-label="Close cart" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,236,0.4)' }}><X size={22} /></button>
            </div>

            {state.items.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px', textAlign: 'center' }}>
                <ShoppingBag size={48} style={{ color: 'rgba(255,255,255,0.08)' }} />
                <p className="font-display" style={{ color: 'rgba(245,242,236,0.3)', fontSize: '1.2rem', fontStyle: 'italic' }}>Your bag is empty</p>
                <button onClick={() => { setCartOpen(false); router.push('/products') }} className="btn-outline">Browse Products</button>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                  {state.items.map((item) => (
                    <div key={`${item.product.id}-${item.size}-${item.color}`} style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ width: 72, height: 80, backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden', flexShrink: 0 }}>
                        <Image src={item.displayImage || item.product.images[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=60'} alt={item.product.name} width={72} height={80} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#F5F2EC', fontSize: '0.8rem', fontWeight: 500, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</p>
                        {item.size && <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.7rem' }}>Size: {item.size}</p>}
                        <p style={{ color: '#C9A84C', fontSize: '0.875rem', fontWeight: 600, margin: '4px 0' }}>
                          Ksh {(item.product.price * item.quantity).toLocaleString()}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size, item.color)} style={{ width: 24, height: 24, border: '1px solid rgba(255,255,255,0.15)', background: 'none', color: 'rgba(245,242,236,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>−</button>
                          <span style={{ color: 'rgba(245,242,236,0.7)', fontSize: '0.8rem', minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size, item.color)} style={{ width: 24, height: 24, border: '1px solid rgba(255,255,255,0.15)', background: 'none', color: 'rgba(245,242,236,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>+</button>
                          <button onClick={() => removeItem(item.product.id, item.size, item.color)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(245,242,236,0.25)', fontSize: '0.7rem', cursor: 'pointer' }}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total</span>
                    <span className="font-display" style={{ color: '#F5F2EC', fontSize: '1.5rem' }}>Ksh {state.total.toLocaleString()}</span>
                  </div>
                  <Link href="/cart" onClick={() => setCartOpen(false)} className="btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%' }}>
                    Checkout
                  </Link>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Responsive helper styles */}
      <style>{`
        @media (min-width: 768px) { .md-flex { display: flex !important; } .md-hide { display: none !important; } }
        @media (max-width: 767px) { .md-flex { display: none !important; } }
      `}</style>
    </>
  )
}
