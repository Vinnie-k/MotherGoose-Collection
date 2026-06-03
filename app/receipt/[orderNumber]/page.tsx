'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { formatPrice } from '@/lib/format'

interface ReceiptOrder {
  orderNumber: string
  customer: { firstName: string; lastName: string; email: string; phone: string }
  address: { street: string; city: string; zip?: string }
  items: { name: string; quantity: number; price: number; image: string; size?: string; color?: string; colorImage?: string }[]
  subtotal: number
  shipping: number
  total: number
  deliveryOption: string
  status: string
  createdAt: string
}

export default function ReceiptPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const [order, setOrder] = useState<ReceiptOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/orders/${orderNumber}`)
      .then(r => r.json())
      .then(d => { setOrder(d.order ?? null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [orderNumber])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <p style={{ color: '#666', fontFamily: 'Arial, sans-serif' }}>Loading receipt…</p>
    </div>
  )

  if (!order) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <p style={{ color: '#666', fontFamily: 'Arial, sans-serif' }}>Receipt not found.</p>
    </div>
  )

  const deliveryLabel = order.deliveryOption === 'same_day' ? 'Same-Day Delivery' : 'No Delivery Selected'

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '40px 16px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

        {/* Header bar */}
        <div style={{ background: '#0A0A0F', padding: '28px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#C9A84C', fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', margin: 0 }}>Mothergoose</p>
            <p style={{ color: '#F5F2EC', fontSize: '20px', fontWeight: 700, margin: '4px 0 0', letterSpacing: '2px', textTransform: 'uppercase' }}>COLLECTION</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#C9A84C', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>Order Receipt</p>
            <p style={{ color: '#F5F2EC', fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', margin: '4px 0 0' }}>{order.orderNumber}</p>
          </div>
        </div>

        <div style={{ padding: '32px 36px' }}>

          {/* Customer Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #eee' }}>
            <div>
              <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', margin: '0 0 10px' }}>Customer</p>
              <p style={{ fontWeight: 700, fontSize: '15px', margin: '0 0 4px', color: '#111' }}>{order.customer.firstName} {order.customer.lastName}</p>
              <p style={{ color: '#555', fontSize: '13px', margin: '0 0 2px' }}>{order.customer.phone}</p>
              <p style={{ color: '#555', fontSize: '13px', margin: 0 }}>{order.customer.email}</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', margin: '0 0 10px' }}>Delivery To</p>
              <p style={{ fontWeight: 600, fontSize: '14px', margin: '0 0 4px', color: '#111' }}>{order.address.street}</p>
              <p style={{ color: '#555', fontSize: '13px', margin: '0 0 2px' }}>{order.address.city}{order.address.zip ? `, ${order.address.zip}` : ''}</p>
              <p style={{ color: '#555', fontSize: '13px', margin: 0 }}>{deliveryLabel}</p>
            </div>
          </div>

          {/* Date & Order No */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', margin: '0 0 4px' }}>Date</p>
              <p style={{ fontSize: '13px', color: '#333', margin: 0 }}>{new Date(order.createdAt).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', margin: '0 0 4px' }}>Status</p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: order.status === 'delivered' ? '#16a34a' : order.status === 'cancelled' ? '#dc2626' : '#C9A84C', margin: 0, textTransform: 'capitalize' }}>{order.status}</p>
            </div>
          </div>

          {/* Items */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', margin: '0 0 14px' }}>Items Ordered</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px', background: '#fafafa', border: '1px solid #f0f0f0' }}>
                  <div style={{ width: 64, height: 64, flexShrink: 0, position: 'relative', background: '#f5f5f5', overflow: 'hidden' }}>
                    {item.colorImage || item.image ? (
                      <Image src={item.colorImage || item.image} alt={item.name} fill style={{ objectFit: 'contain', padding: 4 }} sizes="64px" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👕</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '14px', margin: '0 0 4px', color: '#111' }}>{item.name}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      {item.color && <span style={{ background: '#0A0A0F', color: '#C9A84C', padding: '1px 6px', fontSize: '10px', fontWeight: 700 }}>COLOR: {item.color}</span>}
                      {item.size && <span style={{ background: '#0A0A0F', color: '#C9A84C', padding: '1px 6px', fontSize: '10px', fontWeight: 700 }}>SIZE: {item.size}</span>}
                    </div>
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#111', margin: 0, whiteSpace: 'nowrap' }}>{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div style={{ borderTop: '2px solid #111', paddingTop: 16, marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '13px', color: '#666' }}>Subtotal</span>
              <span style={{ fontSize: '13px', color: '#333' }}>{formatPrice(order.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: '13px', color: '#666' }}>Delivery ({deliveryLabel})</span>
              <span style={{ fontSize: '13px', color: order.shipping === 0 ? '#16a34a' : '#333' }}>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #eee' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#111' }}>Total</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#0A0A0F' }}>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Thank you */}
          <div style={{ textAlign: 'center', padding: '20px', background: '#0A0A0F', marginBottom: 0 }}>
            <p style={{ color: '#C9A84C', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 6px' }}>Thank You</p>
            <p style={{ color: '#F5F2EC', fontSize: '14px', margin: '0 0 4px' }}>for shopping with Mothergoose Collection</p>
            <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '11px', margin: 0 }}>We look forward to serving you again</p>
          </div>
        </div>

        {/* Shop footer */}
        <div style={{ background: '#f5f5f5', padding: '20px 36px', borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#111', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '1px' }}>Mothergoose Collection</p>
            <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Nairobi, Kenya</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>mothergoosecollection1@gmail.com</p>
            <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>+254 759 490 008</p>
          </div>
        </div>

        {/* Print button */}
        <div style={{ padding: '16px 36px', textAlign: 'center', borderTop: '1px solid #eee' }} className="no-print">
          <button onClick={() => window.print()}
            style={{ background: '#0A0A0F', color: '#C9A84C', border: 'none', padding: '12px 32px', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>
            Print Receipt
          </button>
        </div>
      </div>
      <style>{`@media print { .no-print { display: none !important; } body { background: white; padding: 0; } }`}</style>
    </div>
  )
}
