'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Trash2, Edit, AlertTriangle, RefreshCw } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/types/database'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/products', { credentials: 'include' })
      if (res.status === 401) { window.location.href = '/admin/login'; return }
      const data = await res.json()
      setProducts(data.products || [])
    } catch {
      setError('Failed to load products. Is the server running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (product: Product) => {
    setDeleting(product.id)
    try {
      const res = await fetch(`/api/admin/products?id=${product.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.status === 401) { window.location.href = '/admin/login'; return }
      if (res.ok) {
        // Remove from local state immediately
        setProducts((prev) => prev.filter((p) => p.id !== product.id))
        setConfirmDelete(null)
      } else {
        const data = await res.json()
        setError(data.error || 'Delete failed')
      }
    } catch {
      setError('Network error during delete')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = products.filter((p) => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    const matchCat = !categoryFilter || p.category === categoryFilter
    return matchSearch && matchCat
  })

  const categories = Array.from(new Set(products.map((p) => p.category)))

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />

      <div style={{ flex: 1, padding: 32, overflowX: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Inventory</p>
            <h1 className="font-display" style={{ color: '#F5F2EC', fontSize: '2.5rem', marginBottom: 0 }}>Products</h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(245,242,236,0.5)', cursor: 'pointer', fontSize: '0.75rem' }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <Link href="/admin/products/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} /> Add Product
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '12px 16px', marginBottom: 16, color: '#f87171', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {error}
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,242,236,0.3)' }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…" className="input-dark" style={{ paddingLeft: 36, paddingTop: 10, paddingBottom: 10 }} />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-dark" style={{ minWidth: 160, paddingTop: 10, paddingBottom: 10 }}>
            <option value="" style={{ background: '#0A0A0F' }}>All Categories</option>
            {categories.map((c) => <option key={c} value={c} style={{ background: '#0A0A0F' }} className="capitalize">{c}</option>)}
          </select>
          <span style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.8rem' }}>{filtered.length} items</span>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3,4,5].map((i) => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 4 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p className="font-display" style={{ color: 'rgba(245,242,236,0.2)', fontSize: '1.5rem', fontStyle: 'italic', marginBottom: 16 }}>No products found</p>
            <Link href="/admin/products/new" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Plus size={14} /> Add Your First Product
            </Link>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'rgba(245,242,236,0.35)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.04)', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                          {p.images[0] && <Image src={p.images[0]} alt={p.name} fill sizes="60px" style={{ objectFit: 'cover' }} />}
                        </div>
                        <div>
                          <p style={{ color: 'rgba(245,242,236,0.85)', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                            {p.featured && <span style={{ color: '#C9A84C', fontSize: '0.65rem' }}>★ Featured</span>}
                            {p.new_arrival && <span style={{ color: '#60a5fa', fontSize: '0.65rem' }}>✦ New</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '3px 10px', color: 'rgba(245,242,236,0.45)', fontSize: '0.7rem', textTransform: 'capitalize' }}>{p.category}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ color: 'rgba(245,242,236,0.7)', fontWeight: 500 }}>{formatPrice(p.price)}</div>
                      {p.original_price && <div style={{ color: 'rgba(239,68,68,0.5)', fontSize: '0.7rem', textDecoration: 'line-through' }}>{formatPrice(p.original_price)}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: p.stock === 0 ? '#f87171' : p.stock <= 5 ? '#fbbf24' : '#4ade80' }}>{p.stock}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {p.stock === 0 && <span style={{ color: '#f87171', fontSize: '0.7rem' }}>Out of stock</span>}
                      {p.stock > 0 && p.stock <= 5 && <span style={{ color: '#fbbf24', fontSize: '0.7rem' }}>Low stock</span>}
                      {p.stock > 5 && <span style={{ color: '#4ade80', fontSize: '0.7rem' }}>In stock</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link href={`/admin/products/edit?id=${p.id}`}
                          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(245,242,236,0.4)', textDecoration: 'none', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.color = '#C9A84C' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(245,242,236,0.4)' }}>
                          <Edit size={14} />
                        </Link>
                        <button onClick={() => setConfirmDelete(p)} disabled={deleting === p.id}
                          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(245,242,236,0.4)', background: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.5)'; (e.currentTarget as HTMLElement).style.color = '#f87171' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(245,242,236,0.4)' }}>
                          {deleting === p.id
                            ? <span style={{ width: 12, height: 12, border: '2px solid rgba(248,113,113,0.3)', borderTopColor: '#f87171', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                            : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', padding: 32, maxWidth: 400, width: '90%', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <AlertTriangle size={22} style={{ color: '#f87171', flexShrink: 0 }} />
              <h3 className="font-display" style={{ color: '#F5F2EC', fontSize: '1.25rem' }}>Delete Product?</h3>
            </div>
            <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.875rem', marginBottom: 8 }}>
              You are about to permanently delete:
            </p>
            <p style={{ color: '#F5F2EC', fontWeight: 600, marginBottom: 20 }}>{confirmDelete.name}</p>
            <p style={{ color: 'rgba(245,242,236,0.35)', fontSize: '0.8rem', marginBottom: 24 }}>
              This will remove the product from the store immediately. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)}
                style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', padding: '12px 24px', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#b91c1c')}
                onMouseLeave={e => (e.currentTarget.style.background = '#dc2626')}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
