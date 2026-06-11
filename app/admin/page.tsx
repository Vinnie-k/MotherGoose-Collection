'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Plus, TrendingUp, Star, ArrowRight, RefreshCw } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/types/database'

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/products', { credentials: 'include' })
      if (res.status === 401) { window.location.href = '/admin/login'; return }
      const data = await res.json()
      setProducts(data.products || [])
    } catch {
      setError('Failed to load. Check server is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0)
  const featured = products.filter((p) => p.featured).length
  const outOfStock = products.filter((p) => p.stock === 0).length
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length

  const stats = [
    { label: 'Total Products', value: loading ? '…' : products.length, icon: Package, color: '#60a5fa' },
    { label: 'Inventory Value', value: loading ? '…' : formatPrice(totalValue), icon: TrendingUp, color: '#4ade80' },
    { label: 'Featured', value: loading ? '…' : featured, icon: Star, color: '#C9A84C' },
    { label: 'Out of Stock', value: loading ? '…' : outOfStock, icon: Package, color: '#f87171' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <div className="admin-main-content" style={{ flex: 1, padding: 32, overflowX: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Overview</p>
            <h1 className="font-display" style={{ color: '#F5F2EC', fontSize: '2.5rem' }}>Dashboard</h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(245,242,236,0.5)', cursor: 'pointer', fontSize: '0.75rem' }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <Link href="/admin/products/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={15} /> Add Product
            </Link>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '12px 16px', marginBottom: 20, color: '#f87171', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ border: `1px solid ${color}22`, background: `${color}0a`, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
                <Icon size={16} style={{ color }} />
              </div>
              <p className="font-display" style={{ color, fontSize: '1.75rem', fontWeight: 700 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Warnings */}
        {(outOfStock > 0 || lowStock > 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {outOfStock > 0 && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#f87171', fontSize: '0.875rem' }}>⚠ {outOfStock} product{outOfStock > 1 ? 's' : ''} out of stock</span>
                <Link href="/admin/products" style={{ color: '#f87171', fontSize: '0.75rem', textDecoration: 'underline' }}>View →</Link>
              </div>
            )}
            {lowStock > 0 && (
              <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fbbf24', fontSize: '0.875rem' }}>⚠ {lowStock} product{lowStock > 1 ? 's' : ''} low on stock (5 or fewer)</span>
                <Link href="/admin/products" style={{ color: '#fbbf24', fontSize: '0.75rem', textDecoration: 'underline' }}>View →</Link>
              </div>
            )}
          </div>
        )}

        {/* Recent products */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="font-display" style={{ color: '#F5F2EC', fontSize: '1.5rem' }}>Recent Products</h2>
            <Link href="/admin/products" style={{ color: '#C9A84C', fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Manage all <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 60 }} />)}
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              {products.slice(0, 6).map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.04)', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                    {p.images[0] && <Image src={p.images[0]} alt={p.name} fill sizes="60px" style={{ objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: 'rgba(245,242,236,0.8)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <p style={{ color: 'rgba(245,242,236,0.35)', fontSize: '0.7rem', textTransform: 'capitalize' }}>{p.category}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ color: '#C9A84C', fontSize: '0.875rem', fontWeight: 600 }}>{formatPrice(p.price)}</p>
                    <p style={{ color: p.stock === 0 ? '#f87171' : 'rgba(245,242,236,0.35)', fontSize: '0.7rem' }}>Stock: {p.stock}</p>
                  </div>
                  <Link href={`/admin/products/edit?id=${p.id}`} style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.75rem', textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.15s', flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,242,236,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
