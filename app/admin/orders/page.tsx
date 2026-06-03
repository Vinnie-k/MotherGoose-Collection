'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { RefreshCw, ChevronDown, ChevronUp, Package, MessageCircle, Search, X } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { formatPrice } from '@/lib/format'
import type { Order } from '@/lib/order-store'

const STATUS_COLORS: Record<string, string> = {
  confirmed:  'rgba(96,165,250,0.15)',
  pending:    'rgba(251,191,36,0.15)',
  processing: 'rgba(167,139,250,0.15)',
  dispatched: 'rgba(52,211,153,0.15)',
  delivered:  'rgba(74,222,128,0.15)',
  cancelled:  'rgba(248,113,113,0.15)',
}
const STATUS_TEXT: Record<string, string> = {
  confirmed: '#60a5fa', pending: '#fbbf24', processing: '#a78bfa',
  dispatched: '#34d399', delivered: '#4ade80', cancelled: '#f87171',
}
const ALL_STATUSES = ['confirmed', 'processing', 'dispatched', 'delivered', 'cancelled']

const DELIVERY_LABELS: Record<string, string> = {
  same_day: 'Same-Day',
}
const DELIVERY_COLORS: Record<string, string> = {
  same_day: '#f87171',
}

function PaymentBadge({ method, status }: { method: string; status: string }) {
  if (method === 'whatsapp') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        <span style={{ color: '#25D366', fontSize: '0.65rem', fontWeight: 600 }}>WhatsApp Order</span>
      </div>
    )
  }
  return <span style={{ color: '#fbbf24', fontSize: '0.65rem', fontWeight: 600 }}>Cash on Delivery</span>
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterMethod, setFilterMethod] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/orders', { credentials: 'include' })
      if (res.status === 401) { window.location.href = '/admin/login'; return }
      const data = await res.json()
      setOrders(data.orders || [])
    } catch {
      setError('Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/orders/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        const data = await res.json()
        const updatedOrder: Order = data.order
        setOrders((prev) => prev.map((o) => o.id === id ? updatedOrder : o))

        // Send status email for dispatched, delivered, cancelled
        if (['dispatched', 'delivered', 'cancelled'].includes(status) && updatedOrder.customer?.email) {
          fetch('/api/send-status-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: updatedOrder.customer.email,
              firstName: updatedOrder.customer.firstName,
              orderNumber: updatedOrder.orderNumber,
              status,
              items: updatedOrder.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
              total: updatedOrder.total,
              deliveryOption: updatedOrder.deliveryOption,
            }),
          }).catch(err => console.error('[Status Email]', err))
        }
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const formatWhatsAppNumber = (phone: string) => {
    // Remove all non-digits
    let num = phone.replace(/\D/g, '')
    // Convert local Kenyan 07xx / 01xx to 2547xx / 2541xx
    if (num.startsWith('0') && num.length === 10) num = '254' + num.slice(1)
    // If no country code at all, assume Kenya
    if (num.length === 9) num = '254' + num
    return num
  }

  const openWhatsApp = (order: Order) => {
    const itemLines = order.items.map(i => {
      let details = `${i.name}${i.color ? ` (Color: ${i.color})` : ''}${i.size ? ` (Size: ${i.size})` : ''}`
      return `• ${details} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`
    }).join('\n')
    const msg = [
      `📦 *Order Update — ${order.orderNumber}*`,
      ``,
      `Hi ${order.customer.firstName}, your Mothergoose Collection order:`,
      itemLines,
      ``,
      `Total: ${formatPrice(order.total)}`,
      `Status: ${order.status.toUpperCase()}`,
    ].join('\n')
    const customerNumber = formatWhatsAppNumber(order.customer.phone)
    window.open(`https://wa.me/${customerNumber}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const filtered = orders
    .filter(o => !filterStatus || o.status === filterStatus)
    .filter(o => !filterMethod || o.paymentMethod === filterMethod)
    .filter(o => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.firstName.toLowerCase().includes(q) ||
        o.customer.lastName.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
      )
    })

  const whatsappOrders = orders.filter(o => o.paymentMethod === 'whatsapp')
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
  const revenue = orders
    .filter(o =>
      (o.paymentMethod === 'whatsapp' && o.status === 'delivered') ||  // whatsapp delivered
      (o.paymentMethod === 'cod'      && o.status === 'delivered')         // COD delivered
    )
    .reduce((s, o) => s + o.total, 0)

  const stat = (label: string, value: string | number, color: string, sub?: string) => (
    <div key={label} style={{ border: `1px solid ${color}22`, background: `${color}0a`, padding: 18 }}>
      <p style={{ color: 'rgba(245,242,236,0.35)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
      <p className="font-display" style={{ color, fontSize: '1.5rem', fontWeight: 700 }}>{loading ? '…' : value}</p>
      {sub && <p style={{ color: 'rgba(245,242,236,0.25)', fontSize: '0.65rem', marginTop: 4 }}>{sub}</p>}
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: 32, overflowX: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Sales</p>
            <h1 className="font-display" style={{ color: '#F5F2EC', fontSize: '2.5rem' }}>Orders</h1>
          </div>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(245,242,236,0.5)', cursor: 'pointer', fontSize: '0.75rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 16, marginBottom: 28 }}>
          {stat('Total Orders', orders.length, '#60a5fa')}
          {stat("Today's Orders", todayOrders.length, '#C9A84C')}
          {stat('WhatsApp Orders', whatsappOrders.length, '#25D366', 'via WhatsApp')}
          {stat('Revenue Collected', formatPrice(revenue), '#4ade80', 'card + delivered orders')}
        </div>

        {/* WhatsApp orders alert */}
        {whatsappOrders.filter(o => o.status === 'confirmed').length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(37,211,102,0.07)', border: '1px solid rgba(37,211,102,0.25)', marginBottom: 20 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <p style={{ color: '#25D366', fontSize: '0.8rem', fontWeight: 500 }}>
              <strong>{whatsappOrders.filter(o => o.status === 'confirmed').length}</strong> new WhatsApp order{whatsappOrders.filter(o => o.status === 'confirmed').length !== 1 ? 's' : ''} awaiting your response
            </p>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', padding: '12px 16px', marginBottom: 20, color: '#f87171', fontSize: '0.875rem' }}>{error}</div>
        )}

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,242,236,0.3)', pointerEvents: 'none' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, order #…"
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F2EC', padding: '9px 12px 9px 34px', fontSize: '0.8rem', outline: 'none' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,236,0.3)', padding: 0 }}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Method filter */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { val: '', label: 'All Methods' },
              { val: 'whatsapp', label: '📱 WhatsApp' },
              { val: 'cod', label: '💵 COD' },
            ].map(({ val, label }) => (
              <button key={val || 'all-m'} onClick={() => setFilterMethod(val)}
                style={{
                  padding: '6px 12px', fontSize: '0.7rem', letterSpacing: '0.08em',
                  border: `1px solid ${filterMethod === val ? '#25D366' : 'rgba(255,255,255,0.1)'}`,
                  background: filterMethod === val ? 'rgba(37,211,102,0.08)' : 'transparent',
                  color: filterMethod === val ? '#25D366' : 'rgba(245,242,236,0.4)', cursor: 'pointer',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {['', ...ALL_STATUSES].map((s) => (
            <button key={s || 'all'} onClick={() => setFilterStatus(s)}
              style={{
                padding: '5px 12px', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase',
                border: `1px solid ${filterStatus === s ? '#C9A84C' : 'rgba(255,255,255,0.08)'}`,
                background: filterStatus === s ? 'rgba(201,168,76,0.1)' : 'transparent',
                color: filterStatus === s ? '#C9A84C' : 'rgba(245,242,236,0.35)', cursor: 'pointer',
              }}>
              {s || 'All'} ({s ? orders.filter(o => o.status === s).length : orders.length})
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 70 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Package size={48} style={{ color: 'rgba(255,255,255,0.06)', margin: '0 auto 16px' }} />
            <p className="font-display" style={{ color: 'rgba(245,242,236,0.2)', fontSize: '1.5rem', fontStyle: 'italic' }}>
              {search ? 'No orders match your search' : filterStatus ? `No ${filterStatus} orders` : 'No orders yet'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((order) => {
              const isWhatsApp = order.paymentMethod === 'whatsapp'
              const borderColor = isWhatsApp ? 'rgba(37,211,102,0.2)' : 'rgba(255,255,255,0.06)'

              return (
                <div key={order.id} style={{ background: isWhatsApp ? 'rgba(37,211,102,0.03)' : 'rgba(255,255,255,0.02)', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                  {/* Order row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', flexWrap: 'wrap' }}>

                    {/* WhatsApp indicator strip */}
                    {isWhatsApp && (
                      <div style={{ width: 3, height: 40, background: '#25D366', borderRadius: 2, flexShrink: 0 }} />
                    )}

                    {/* Order number */}
                    <div style={{ minWidth: 140 }}>
                      <p style={{ color: '#C9A84C', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}>{order.orderNumber}</p>
                      <p style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.7rem', marginTop: 2 }}>
                        {new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Customer */}
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <p style={{ color: '#F5F2EC', fontSize: '0.875rem', fontWeight: 500 }}>{order.customer.firstName} {order.customer.lastName}</p>
                      <p style={{ color: 'rgba(245,242,236,0.35)', fontSize: '0.75rem' }}>{order.customer.email}</p>
                      <p style={{ color: 'rgba(245,242,236,0.25)', fontSize: '0.7rem' }}>{order.customer.phone}</p>
                    </div>

                    {/* Items count */}
                    <div style={{ minWidth: 60, textAlign: 'center' }}>
                      <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.75rem' }}>
                        {order.items.reduce((s, i) => s + i.quantity, 0)} item{order.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Payment */}
                    <div style={{ minWidth: 130 }}>
                      <p style={{ color: '#F5F2EC', fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{formatPrice(order.total)}</p>
                      <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
                    </div>

                    {/* Delivery Option */}
                    <div style={{ minWidth: 130 }}>
                      <p style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Delivery</p>
                      <span style={{ color: order.deliveryOption === 'same_day' ? DELIVERY_COLORS.same_day : 'rgba(245,242,236,0.3)', fontSize: '0.75rem', fontWeight: 600 }}>
                        {order.deliveryOption ? DELIVERY_LABELS[order.deliveryOption] : 'Not Selected'}
                      </span>
                    </div>

                    {/* Status selector */}
                    <div style={{ minWidth: 160 }}>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        style={{
                          background: STATUS_COLORS[order.status] || 'transparent',
                          border: `1px solid ${STATUS_TEXT[order.status]}44`,
                          color: STATUS_TEXT[order.status] || '#F5F2EC',
                          padding: '6px 10px', fontSize: '0.7rem', letterSpacing: '0.08em',
                          textTransform: 'uppercase', cursor: 'pointer', width: '100%', outline: 'none',
                        }}>
                        {ALL_STATUSES.map(s => (
                          <option key={s} value={s} style={{ background: '#0d0d1a', color: '#F5F2EC' }}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* WhatsApp reply button */}
                    {isWhatsApp && (
                      <button onClick={() => openWhatsApp(order)}
                        title="Send WhatsApp update to customer"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <MessageCircle size={13} /> Reply
                      </button>
                    )}

                    {/* Expand */}
                    <button onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,236,0.3)', padding: 4 }}>
                      {expanded === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {/* Expanded details */}
                  {expanded === order.id && (
                    <div style={{ borderTop: `1px solid ${borderColor}`, padding: 20, background: 'rgba(0,0,0,0.2)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                      {/* Items */}
                      <div>
                        <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Items Ordered</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {order.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {(item.colorImage || item.image) && (
                                <Image src={item.colorImage || item.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&q=60'} alt={item.name} width={40} height={40} style={{ objectFit: 'cover', background: 'rgba(255,255,255,0.04)' }} />
                              )}
                              <div style={{ flex: 1 }}>
                                <p style={{ color: '#F5F2EC', fontSize: '0.8rem' }}>{item.name}</p>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                                  {item.color && <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px' }}>Color: {item.color}</p>}
                                  {item.size && <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px' }}>Size: {item.size}</p>}
                                </div>
                                <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.7rem', marginTop: 2 }}>Qty: {item.quantity} × {formatPrice(item.price)}</p>
                              </div>
                              <span style={{ color: 'rgba(245,242,236,0.6)', fontSize: '0.8rem' }}>{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                            <span style={{ color: 'rgba(245,242,236,0.4)' }}>Subtotal</span>
                            <span style={{ color: 'rgba(245,242,236,0.6)' }}>{formatPrice(order.subtotal)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 8 }}>
                            <span style={{ color: 'rgba(245,242,236,0.4)' }}>
                              Shipping {order.deliveryOption ? `(${DELIVERY_LABELS[order.deliveryOption]})` : ''}
                            </span>
                            <span style={{ color: 'rgba(245,242,236,0.6)' }}>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#F5F2EC', fontWeight: 600 }}>Total</span>
                            <span style={{ color: '#C9A84C', fontWeight: 700 }}>{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right column: delivery + actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', padding: '12px 16px' }}>
                          <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>Delivery Method</p>
                          <p style={{ color: order.deliveryOption === 'same_day' ? DELIVERY_COLORS.same_day : 'rgba(245,242,236,0.5)', fontSize: '0.875rem', fontWeight: 700 }}>
                            {order.deliveryOption ? DELIVERY_LABELS[order.deliveryOption] : 'No delivery method selected'}
                          </p>
                          <p style={{ color: 'rgba(245,242,236,0.35)', fontSize: '0.72rem', marginTop: 2 }}>
                            {order.deliveryOption === 'same_day' ? 'Nairobi only — order before 12 PM' : 'Delivery details unavailable'}
                          </p>
                        </div>

                        <div>
                          <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Delivery Address</p>
                          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: 16 }}>
                            <p style={{ color: '#F5F2EC', fontSize: '0.875rem', fontWeight: 500 }}>{order.customer.firstName} {order.customer.lastName}</p>
                            <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.8rem', marginTop: 4 }}>{order.address.street}</p>
                            <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.8rem' }}>{order.address.city}{order.address.zip ? `, ${order.address.zip}` : ''}</p>
                            <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.8rem', marginTop: 6 }}>{order.customer.phone}</p>
                            <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.8rem' }}>{order.customer.email}</p>
                          </div>
                        </div>

                        {/* WhatsApp quick actions */}
                        {isWhatsApp && (
                          <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)', padding: 16 }}>
                            <p style={{ color: '#25D366', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>WhatsApp Actions</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <button onClick={() => openWhatsApp(order)}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#25D366', border: 'none', color: '#0a0a0f', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                                <MessageCircle size={14} /> Send Order Update to Customer
                              </button>
                              <p style={{ color: 'rgba(37,211,102,0.5)', fontSize: '0.7rem', lineHeight: 1.5 }}>
                                Opens WhatsApp with a pre-filled update message to {order.customer.firstName} at {order.customer.phone}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
