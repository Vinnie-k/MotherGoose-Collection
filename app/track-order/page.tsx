'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, Package, Truck, CheckCircle, Clock, MapPin, AlertCircle } from 'lucide-react'
import { formatPrice } from '@/lib/format'
import type { Order } from '@/lib/order-store'

const STEP_CONFIG = [
  { status: 'confirmed',   label: 'Order Confirmed',    desc: 'Your order has been confirmed and payment received.', icon: Package },
  { status: 'processing',  label: 'Processing',         desc: 'Your items are being carefully packaged by our team.', icon: Package },
  { status: 'dispatched',  label: 'Dispatched',         desc: 'Your order has left our warehouse and is with the courier.', icon: Truck },
  { status: 'delivered',   label: 'Delivered',          desc: 'Package delivered and signed for.', icon: CheckCircle },
]

const STATUS_ORDER = ['confirmed', 'processing', 'dispatched', 'delivered']

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim()) return
    setLoading(true)
    setNotFound(false)
    setError('')
    setOrder(null)

    try {
      if (!email.trim()) { setError('Please enter your email address.'); setLoading(false); return }
      const params = new URLSearchParams({ orderNumber: orderNumber.trim().toUpperCase(), email: email.trim() })
      const res = await fetch(`/api/orders?${params.toString()}`)
      const data = await res.json()
      if (res.ok && data.order) {
        setOrder(data.order)
      } else {
        setNotFound(true)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const currentStepIndex = order
    ? STATUS_ORDER.indexOf(order.status)
    : -1

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#F5F2EC', padding: '12px 16px', width: '100%', outline: 'none',
    fontSize: '0.875rem', transition: 'border-color 0.2s',
  }

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8 }}>Shipping</p>
          <h1 className="font-display" style={{ color: '#F5F2EC', fontSize: '3rem' }}>Track Your Order</h1>
          <div style={{ width: 48, height: 1, background: '#C9A84C', marginTop: 12 }} />
        </div>

        {/* Search form */}
        <form onSubmit={handleTrack} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: 28, marginBottom: 28 }}>
          <h2 className="font-display" style={{ color: '#F5F2EC', fontSize: '1.25rem', marginBottom: 20 }}>Enter Order Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', color: 'rgba(245,242,236,0.5)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
                Order Number *
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. MG-260510-AB12CD"
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'rgba(245,242,236,0.5)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email used at checkout"
                style={inputStyle}
              />
            </div>
          </div>
          <p style={{ color: 'rgba(245,242,236,0.25)', fontSize: '0.75rem', marginBottom: 16 }}>
            Your order number starts with MG- and was displayed on the confirmation screen and sent to your email. If you ordered via WhatsApp, your order number was shared in the chat — use the email address you provided at checkout.
          </p>
          <button type="submit" disabled={loading} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.6 : 1 }}>
            {loading
              ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(10,10,15,0.3)', borderTopColor: '#0A0A0F', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Searching…</>
              : <><Search size={15} /> Track Order</>
            }
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', padding: '14px 16px', marginBottom: 20 }}>
            <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0 }} />
            <p style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}

        {/* Not found */}
        {notFound && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', padding: '14px 16px', marginBottom: 20 }}>
            <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0 }} />
            <div>
              <p style={{ color: '#f87171', fontSize: '0.875rem', fontWeight: 600 }}>Order not found</p>
              <p style={{ color: 'rgba(248,113,113,0.7)', fontSize: '0.8rem', marginTop: 2 }}>
                Please check your order number (format: MG-YYMMDD-XXXXXX) and the email you used at checkout.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {order && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
            {/* Order summary bar */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Order Number</p>
                <p style={{ color: '#C9A84C', fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem' }}>{order.orderNumber}</p>
              </div>
              <div>
                <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Status</p>
                <span style={{
                  background: order.status === 'delivered' ? 'rgba(74,222,128,0.15)' : 'rgba(96,165,250,0.15)',
                  border: `1px solid ${order.status === 'delivered' ? 'rgba(74,222,128,0.3)' : 'rgba(96,165,250,0.3)'}`,
                  color: order.status === 'delivered' ? '#4ade80' : '#60a5fa',
                  fontSize: '0.7rem', fontWeight: 600, padding: '4px 12px', textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  {order.status}
                </span>
              </div>
              <div>
                <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Placed</p>
                <p style={{ color: '#F5F2EC', fontSize: '0.875rem' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Total</p>
                <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '1rem' }}>{formatPrice(order.total)}</p>
              </div>
              <div>
                <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Payment</p>
                <p style={{ color: order.paymentMethod === 'cod' ? '#fbbf24' : '#4ade80', fontSize: '0.8rem', fontWeight: 600 }}>
                  {order.paymentMethod === 'whatsapp'
                    ? `WhatsApp — ${order.status === 'delivered' ? 'Paid' : 'Pay on Delivery'}`
                    : 'Cash on Delivery'}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: 28 }}>
              <h3 className="font-display" style={{ color: '#F5F2EC', fontSize: '1.2rem', marginBottom: 28 }}>Order Timeline</h3>
              <div style={{ position: 'relative' }}>
                {/* Vertical line */}
                <div style={{ position: 'absolute', left: 20, top: 20, bottom: 20, width: 1, background: 'rgba(255,255,255,0.08)' }} />
                {/* Progress line */}
                <div style={{
                  position: 'absolute', left: 20, top: 20, width: 1, background: 'linear-gradient(to bottom, #C9A84C, rgba(201,168,76,0.3))',
                  height: `${Math.max(0, currentStepIndex / (STEP_CONFIG.length - 1)) * 100}%`,
                  transition: 'height 1s ease',
                }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {STEP_CONFIG.map((step, i) => {
                    const done = i <= currentStepIndex
                    const active = i === currentStepIndex
                    const Icon = step.icon
                    return (
                      <div key={step.status} style={{ display: 'flex', gap: 24, paddingBottom: 28, position: 'relative' }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', border: `2px solid ${done ? '#C9A84C' : 'rgba(255,255,255,0.1)'}`,
                          background: done ? (active ? 'rgba(201,168,76,0.2)' : '#C9A84C') : 'rgba(10,10,15,0.8)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          zIndex: 1, position: 'relative',
                        }}>
                          <Icon size={16} style={{ color: done ? (active ? '#C9A84C' : '#0A0A0F') : 'rgba(255,255,255,0.2)' }} />
                          {active && (
                            <span style={{
                              position: 'absolute', inset: -4, borderRadius: '50%',
                              border: '2px solid rgba(201,168,76,0.4)',
                              animation: 'ping 2s ease infinite',
                            }} />
                          )}
                        </div>
                        <div style={{ paddingTop: 8 }}>
                          <p style={{ color: done ? '#F5F2EC' : 'rgba(245,242,236,0.3)', fontWeight: done ? 500 : 400, fontSize: '0.9rem', marginBottom: 4 }}>
                            {step.label}
                            {active && <span style={{ marginLeft: 10, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Current</span>}
                          </p>
                          <p style={{ color: done ? 'rgba(245,242,236,0.45)' : 'rgba(245,242,236,0.2)', fontSize: '0.8rem', lineHeight: 1.5 }}>{step.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={18} style={{ color: '#C9A84C' }} />
              </div>
              <div>
                <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Delivering To</p>
                <p style={{ color: '#F5F2EC', fontSize: '0.875rem' }}>{order.customer.firstName} {order.customer.lastName}</p>
                <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.8rem' }}>{order.address.street}, {order.address.city}</p>
                <p style={{ color: 'rgba(245,242,236,0.35)', fontSize: '0.75rem', marginTop: 2 }}>{order.customer.phone}</p>
              </div>
            </div>

            {/* Items */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Clock size={16} style={{ color: '#C9A84C' }} />
                <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Items in This Order</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {item.image && <Image src={item.image} alt={item.name} width={40} height={40} style={{ objectFit: 'cover', background: 'rgba(255,255,255,0.04)' }} />}
                      <div>
                        <p style={{ color: '#F5F2EC', fontSize: '0.875rem' }}>{item.name}</p>
                        <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.75rem' }}>Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span style={{ color: 'rgba(245,242,236,0.6)', fontSize: '0.875rem' }}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.8rem', textAlign: 'center' }}>
              Questions about your order?{' '}
              <a href="/contact" style={{ color: '#C9A84C', textDecoration: 'underline' }}>Contact us</a>
            </p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ping { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.3); opacity: 0; } }
      `}</style>
    </div>
  )
}
