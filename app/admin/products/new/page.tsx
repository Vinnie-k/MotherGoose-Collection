'use client'

import AdminSidebar from '@/components/admin/AdminSidebar'
import ProductForm from '@/components/admin/ProductForm'

export default function AddProductPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <div className="admin-main-content" style={{ flex: 1, padding: 32, overflowY: 'auto', maxWidth: 800 }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Inventory</p>
          <h1 className="font-display" style={{ color: '#F5F2EC', fontSize: '2.5rem' }}>Add New Product</h1>
          <div style={{ width: 48, height: 1, background: '#C9A84C', marginTop: 12 }} />
        </div>
        <ProductForm mode="create" />
      </div>
    </div>
  )
}
