'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ProductForm from '@/components/admin/ProductForm'
import type { Product } from '@/types/database'

function EditContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return }

    fetch('/api/mgmt-heron/products', { credentials: 'include' })
      .then((r) => {
        if (r.status === 401) { window.location.href = '/mgmt-heron/login'; return null }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        const found = (data.products as Product[])?.find((p) => p.id === id)
        if (found) setProduct(found)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ flex: 1, padding: 32 }}>
        <div className="skeleton" style={{ height: 40, width: 280, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 16, width: 180, marginBottom: 32 }} />
        {[1,2,3,4].map((i) => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 16 }} />)}
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div style={{ flex: 1, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p className="font-display" style={{ color: 'rgba(245,242,236,0.2)', fontSize: '1.5rem', fontStyle: 'italic', marginBottom: 16 }}>
            Product not found
          </p>
          <a href="/mgmt-heron/products" className="btn-outline">← Back to Products</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, padding: 32, overflowY: 'auto', maxWidth: 800 }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Inventory</p>
        <h1 className="font-display" style={{ color: '#F5F2EC', fontSize: '2.5rem' }}>Edit Product</h1>
        <p style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.875rem', marginTop: 6 }}>{product.name}</p>
        <div style={{ width: 48, height: 1, background: '#C9A84C', marginTop: 12 }} />
      </div>
      <ProductForm mode="edit" initialData={product} />
    </div>
  )
}

export default function EditProductPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <Suspense fallback={
        <div style={{ flex: 1, padding: 32 }}>
          <div className="skeleton" style={{ height: 40, width: 280, marginBottom: 32 }} />
        </div>
      }>
        <EditContent />
      </Suspense>
    </div>
  )
}
