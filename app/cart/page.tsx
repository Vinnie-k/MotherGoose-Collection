'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Trash2, ArrowLeft, ArrowRight, Lock, CheckCircle, Minus, Plus, AlertCircle, Truck, Clock } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/format'

type PaymentMethod = 'whatsapp'
type CheckoutStep = 'cart' | 'info' | 'payment' | 'confirmation'
type DeliveryOption = 'same_day' | null

const DELIVERY_OPTIONS: { id: Exclude<DeliveryOption, null>; name: string; time: string; price: string; fee: () => number; desc: string }[] = [
  {
    id: 'same_day',
    name: 'Same-Day Delivery',
    time: 'Same Day — Nairobi only',
    price: 'Ksh 500 flat rate',
    fee: () => 500,
    desc: 'Order before 12 PM, delivered the same day. Available only in Nairobi. Mon–Sat.',
  },
]

interface FormData {
  email: string; firstName: string; lastName: string
  address: string; city: string; zip: string; phone: string
}

function validate(form: FormData) {
  const errors: Partial<Record<keyof FormData, string>> = {}
  if (!form.firstName.trim()) errors.firstName = 'Required'
  if (!form.lastName.trim()) errors.lastName = 'Required'
  if (!form.email.trim()) errors.email = 'Required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address'
  if (!form.phone.trim()) errors.phone = 'Required'
  else if (form.phone.replace(/\D/g,'').length < 9) errors.phone = 'Enter a valid phone number'
  if (!form.address.trim()) errors.address = 'Required'
  if (!form.city.trim()) errors.city = 'Required'
  return errors
}

export default function CartPage() {
  const { state, removeItem, updateQuantity, clearCart, refreshStock } = useCart()

  useEffect(() => { refreshStock() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [step, setStep] = useState<CheckoutStep>('cart')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('whatsapp')
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>(null)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [form, setForm] = useState<FormData>({
    email: '', firstName: '', lastName: '',
    address: '', city: '', zip: '', phone: '',
  })

  const selectedDelivery = DELIVERY_OPTIONS.find(o => o.id === deliveryOption) || null
  const shippingFee = selectedDelivery ? selectedDelivery.fee() : 0
  const total = state.total + shippingFee

  const f = (key: keyof FormData, val: string) => {
    setForm((p) => ({ ...p, [key]: val }))
    if (fieldErrors[key]) setFieldErrors((e) => { const n = {...e}; delete n[key]; return n })
  }

  const handleProceedToPayment = async () => {
    const errors = validate(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      window.scrollTo({ top: 200, behavior: 'smooth' })
      return
    }
    setFieldErrors({})
    await refreshStock()
    setStep('payment')
  }

  const canPay = () => true

  const placeOrder = async () => {
    if (paymentMethod === 'whatsapp') {
      setPlacingOrder(true)
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: state.items.map((i) => {
              // Get the color-specific image if color is selected, else use default
              const colorImage = i.color && i.product.colorImages?.[i.color]?.[0]
              return {
                productId: i.product.id,
                name: i.product.name,
                quantity: i.quantity,
                price: i.product.price,
                image: i.product.images[0] || '',
                size: i.size,
                color: i.color,
                colorImage,
              }
            }),
            customer: {
              firstName: form.firstName.trim(),
              lastName: form.lastName.trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
            },
            address: {
              street: form.address.trim(),
              city: form.city.trim(),
              zip: form.zip.trim(),
            },
            subtotal: state.total,
            shipping: shippingFee,
            total,
            paymentMethod: 'whatsapp',
            deliveryOption,
          }),
        })

        const data = await res.json()
        const orderNum = data.order?.orderNumber || ('WA-' + Date.now().toString().slice(-6))

        const storeNumber = '254759490008'
        const itemLines = state.items.map(i => {
          let details = `${i.product.name}${i.color ? ` (Color: ${i.color})` : ''}${i.size ? ` (Size: ${i.size})` : ''}`
          return `• ${details} x${i.quantity} — ${formatPrice(i.product.price * i.quantity)}`
        }).join('\n')
        const deliveryLabel = DELIVERY_OPTIONS.find(o => o.id === deliveryOption)?.name || 'Standard Delivery'
        const message = [
          `🛍️ *New Order — Mothergoose Collection*`,
          `*Order #:* ${orderNum}`,
          ``,
          `*Items:*`,
          itemLines,
          ``,
          `*Delivery Method:* ${deliveryLabel}`,
          `*Subtotal:* ${formatPrice(state.total)}`,
          `*Shipping:* ${shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}`,
          `*Total:* ${formatPrice(total)}`,
          ``,
          `*Customer Details:*`,
          `Name: ${form.firstName} ${form.lastName}`,
          `Phone: ${form.phone}`,
          `Email: ${form.email}`,
          ``,
          `*Delivery Address:*`,
          `${form.address}, ${form.city}${form.zip ? ` ${form.zip}` : ''}`,
        ].join('\n')

        window.open(`https://wa.me/${storeNumber}?text=${encodeURIComponent(message)}`, '_blank')

        setOrderNumber(orderNum)
        clearCart()
        setStep('confirmation')
      } catch {
        alert('Could not place order. Please check your connection and try again.')
      } finally {
        setPlacingOrder(false)
      }
      return
    }

    setPlacingOrder(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: state.items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
            image: i.product.images[0] || '',
          })),
          customer: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
          },
          address: {
            street: form.address.trim(),
            city: form.city.trim(),
            zip: form.zip.trim(),
          },
          subtotal: state.total,
          shipping: shippingFee,
          total,
          paymentMethod,
          deliveryOption,
        }),
      })

      const data = await res.json()
      if (res.ok && data.order) {
        setOrderNumber(data.order.orderNumber)
        clearCart()
        setStep('confirmation')
      } else {
        alert(data.error || 'Failed to place order. Please try again.')
      }
    } catch {
      alert('Network error. Please check your connection and try again.')
    } finally {
      setPlacingOrder(false)
    }
  }

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${hasError ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.1)'}`,
    color: '#F5F2EC', padding: '12px 16px', width: '100%', outline: 'none',
    fontSize: '0.875rem', transition: 'border-color 0.2s',
  })
  const labelStyle: React.CSSProperties = { display: 'block', color: 'rgba(245,242,236,0.5)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }

  const FieldError = ({ field }: { field: keyof FormData }) => fieldErrors[field]
    ? <p style={{ color: '#f87171', fontSize: '0.7rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{fieldErrors[field]}</p>
    : null

  // ── Empty ──────────────────────────────────────────────────
  if (state.items.length === 0 && step === 'cart') {
    return (
      <div style={{ paddingTop: 96, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, textAlign: 'center', padding: '96px 24px' }}>
        <ShoppingBag size={64} style={{ color: 'rgba(255,255,255,0.06)' }} />
        <h1 className="font-display" style={{ color: '#F5F2EC', fontSize: '2.5rem' }}>Your bag is empty</h1>
        <Link href="/products" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>Shop Now <ArrowRight size={16} /></Link>
      </div>
    )
  }

  // ── Confirmation ───────────────────────────────────────────
  if (step === 'confirmation') {
    return (
      <div style={{ paddingTop: 96, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, textAlign: 'center', padding: '96px 24px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={40} style={{ color: '#4ade80' }} />
        </div>
        <h1 className="font-display" style={{ color: '#F5F2EC', fontSize: '2.5rem' }}>Order Placed!</h1>
        <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', padding: '20px 32px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Your Order Number</p>
          <p style={{ color: '#C9A84C', fontFamily: 'monospace', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>{orderNumber}</p>
          <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.75rem', marginTop: 8 }}>Save this number to track your order</p>
        </div>
        <p style={{ color: 'rgba(245,242,236,0.5)', maxWidth: 420, lineHeight: 1.7, fontSize: '0.9rem' }}>
          Thank you, <span style={{ color: '#F5F2EC' }}>{form.firstName}</span>. A confirmation has been sent to{' '}
          <span style={{ color: '#C9A84C' }}>{form.email}</span>.
        </p>
        {paymentMethod === 'whatsapp' && (
          <div style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', padding: '16px 24px', maxWidth: 380, width: '100%' }}>
            <p style={{ color: '#25D366', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>Order Sent via WhatsApp</p>
            <p style={{ color: 'rgba(37,211,102,0.7)', fontSize: '0.8rem', lineHeight: 1.6 }}>
              Your order details have been sent to our store. We&apos;ll confirm your order and get back to you shortly.
            </p>
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href={`/api/orders/receipt?orderNumber=${orderNumber}`} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>View Receipt</a>
          <Link href="/track-order" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>Track Order</Link>
          <Link href="/products" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>Continue Shopping <ArrowRight size={16} /></Link>
        </div>
      </div>
    )
  }

  // ── Main ───────────────────────────────────────────────────
  return (
    <div style={{ paddingTop: 96, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(245,242,236,0.4)', textDecoration: 'none', fontSize: '0.8rem', marginBottom: 24, transition: 'color 0.2s' }}
          onMouseEnter={e=>(e.currentTarget.style.color='#C9A84C')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(245,242,236,0.4)')}>
          <ArrowLeft size={14} /> Continue Shopping
        </Link>

        <h1 className="font-display" style={{ color: '#F5F2EC', fontSize: '3rem', marginBottom: 8 }}>
          {step === 'cart' ? 'Your Bag' : step === 'info' ? 'Shipping Details' : 'Payment'}
        </h1>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          {(['cart','info','payment'] as const).map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, border: '1px solid',
                borderColor: step === s ? '#C9A84C' : ['cart','info','payment'].indexOf(step) > i ? '#4ade80' : 'rgba(255,255,255,0.15)',
                background: step === s ? '#C9A84C' : ['cart','info','payment'].indexOf(step) > i ? 'rgba(74,222,128,0.15)' : 'transparent',
                color: step === s ? '#0A0A0F' : ['cart','info','payment'].indexOf(step) > i ? '#4ade80' : 'rgba(245,242,236,0.3)',
              }}>{i+1}</div>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: step === s ? '#C9A84C' : 'rgba(245,242,236,0.3)' }}>
                {s === 'cart' ? 'Bag' : s === 'info' ? 'Shipping' : 'Payment'}
              </span>
              {i < 2 && <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.08)' }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 40 }} className="checkout-grid">
          <div>

            {/* ── STEP 1: BAG ── */}
            {step === 'cart' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {state.items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} style={{ display: 'flex', gap: 20, padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 88, height: 100, overflow: 'hidden', flexShrink: 0, position: 'relative', background: 'rgba(255,255,255,0.04)' }}>
                      <Image src={
    item.displayImage ||
    (item.color && item.product.colorImages?.[item.color]?.[0]) ||
    item.product.images[0]
  }
  alt={item.product.name}
  fill
  sizes="80px"
  style={{ objectFit: 'cover' }}
/>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{item.product.category}</p>
                          <p style={{ color: '#F5F2EC', fontWeight: 500 }}>{item.product.name}</p>
                          <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: '0.75rem', color: 'rgba(245,242,236,0.35)' }}>
                            {item.color && <span>Color: {item.color}</span>}
                            {item.size && <span>Size: {item.size}</span>}
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.product.id, item.size, item.color)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,236,0.2)', padding: 4, flexShrink: 0 }}
                          onMouseEnter={e=>(e.currentTarget.style.color='#f87171')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(245,242,236,0.2)')}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size, item.color)} style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,236,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={13}/></button>
                          <span style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5F2EC', fontSize: '0.875rem' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size, item.color)} disabled={item.quantity >= item.product.stock} style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: item.quantity >= item.product.stock ? 'not-allowed' : 'pointer', color: item.quantity >= item.product.stock ? 'rgba(245,242,236,0.15)' : 'rgba(245,242,236,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={13}/></button>
                        </div>
                        <span className="font-display" style={{ color: '#F5F2EC', fontSize: '1.1rem' }}>{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setStep('info')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 8 }}>
                  Proceed to Shipping <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* ── STEP 2: SHIPPING ── */}
            {step === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {Object.keys(fieldErrors).length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}>
                    <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0 }} />
                    <span style={{ color: '#f87171', fontSize: '0.875rem' }}>Please fix the errors below before continuing.</span>
                  </div>
                )}

                {/* Contact details */}
                <div>
                  <p style={{ color: '#C9A84C', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>Contact Information</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={labelStyle}>First Name *</label>
                        <input value={form.firstName} onChange={e=>f('firstName',e.target.value)} placeholder="John" style={inputStyle(!!fieldErrors.firstName)} />
                        <FieldError field="firstName" />
                      </div>
                      <div>
                        <label style={labelStyle}>Last Name *</label>
                        <input value={form.lastName} onChange={e=>f('lastName',e.target.value)} placeholder="Doe" style={inputStyle(!!fieldErrors.lastName)} />
                        <FieldError field="lastName" />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address *</label>
                      <input type="email" value={form.email} onChange={e=>f('email',e.target.value)} placeholder="john@example.com" style={inputStyle(!!fieldErrors.email)} />
                      <FieldError field="email" />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone Number *</label>
                      <input type="tel" value={form.phone} onChange={e=>f('phone',e.target.value)} placeholder="+254 700 000 000" style={inputStyle(!!fieldErrors.phone)} />
                      <FieldError field="phone" />
                    </div>
                  </div>
                </div>

                {/* Delivery address */}
                <div>
                  <p style={{ color: '#C9A84C', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>Delivery Address</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Street Address *</label>
                      <input value={form.address} onChange={e=>f('address',e.target.value)} placeholder="123 Westlands Road" style={inputStyle(!!fieldErrors.address)} />
                      <FieldError field="address" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={labelStyle}>City *</label>
                        <input value={form.city} onChange={e=>f('city',e.target.value)} placeholder="Nairobi" style={inputStyle(!!fieldErrors.city)} />
                        <FieldError field="city" />
                      </div>
                      <div>
                        <label style={labelStyle}>Postcode</label>
                        <input value={form.zip} onChange={e=>f('zip',e.target.value)} placeholder="00100" style={inputStyle()} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── DELIVERY OPTIONS ── */}
                <div>
                  <p style={{ color: '#C9A84C', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Truck size={13} /> Delivery Method
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {DELIVERY_OPTIONS.map((opt) => {
                      const isSelected = deliveryOption === opt.id
                      const fee = opt.fee()
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDeliveryOption(deliveryOption === opt.id ? null : opt.id)}
                          style={{
                            background: isSelected ? 'rgba(201,168,76,0.07)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${isSelected ? 'rgba(201,168,76,0.45)' : 'rgba(255,255,255,0.08)'}`,
                            padding: '14px 16px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                            outline: 'none',
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            {/* Left: radio + label */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {/* Radio circle */}
                              <div style={{
                                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                                border: `2px solid ${isSelected ? '#C9A84C' : 'rgba(255,255,255,0.2)'}`,
                                background: isSelected ? '#C9A84C' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                              }}>
                                {isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a1208' }} />}
                              </div>
                              <div>
                                <p style={{ color: isSelected ? '#F5F2EC' : 'rgba(245,242,236,0.75)', fontSize: '0.875rem', fontWeight: isSelected ? 600 : 400, marginBottom: 2 }}>
                                  {opt.name}
                                </p>
                                <p style={{ color: 'rgba(245,242,236,0.35)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <Clock size={11} style={{ flexShrink: 0 }} /> {opt.time}
                                </p>
                              </div>
                            </div>
                            {/* Right: price */}
                            <span style={{
                              color: isSelected ? '#C9A84C' : 'rgba(245,242,236,0.55)',
                              fontSize: '0.875rem', fontWeight: 600, flexShrink: 0,
                            }}>
                              {fee === 0 ? 'Free' : formatPrice(fee)}
                            </span>
                          </div>
                          {/* Description — only show when selected */}
                          {isSelected && (
                            <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.75rem', lineHeight: 1.5, marginTop: 10, paddingLeft: 30 }}>
                              {opt.desc}
                            </p>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <button onClick={() => setStep('cart')} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button onClick={handleProceedToPayment} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    Continue to Payment <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: PAYMENT ── */}
            {step === 'payment' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <Lock size={14} style={{ color: '#4ade80' }} />
                  <span style={{ color: '#4ade80', fontSize: '0.75rem' }}>Your payment information is encrypted and secure</span>
                </div>

                {/* Delivery summary on payment step */}
                {selectedDelivery && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
                    <Truck size={15} style={{ color: '#C9A84C', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.72rem' }}>Delivery: </span>
                      <span style={{ color: '#C9A84C', fontSize: '0.8rem', fontWeight: 600 }}>{selectedDelivery.name}</span>
                      <span style={{ color: 'rgba(245,242,236,0.35)', fontSize: '0.72rem' }}> · {selectedDelivery.time}</span>
                    </div>
                    <button onClick={() => setStep('info')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,236,0.35)', fontSize: '0.7rem', textDecoration: 'underline', padding: 0 }}>Change</button>
                  </div>
                )}

                {/* Payment Method */}
                <div style={{ background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.25)', padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    <span style={{ color: '#25D366', fontWeight: 600 }}>Order via WhatsApp</span>
                  </div>
                  <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 16 }}>
                    Clicking &quot;Send Order&quot; will open WhatsApp with your full order details — items, quantities, contact info, and delivery address — pre-filled and ready to send to our store.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '14px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.875rem' }}>Order total</span>
                    <span className="font-display" style={{ color: '#25D366', fontSize: '1.5rem', fontWeight: 700 }}>{formatPrice(total)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setStep('info')} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button onClick={placeOrder} disabled={!canPay() || placingOrder} className="btn-primary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (!canPay() || placingOrder) ? 0.5 : 1, cursor: (!canPay() || placingOrder) ? 'not-allowed' : 'pointer' }}>
                    {placingOrder ? (
                      <><span style={{ width: 16, height: 16, border: '2px solid rgba(10,10,15,0.3)', borderTopColor: '#0A0A0F', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Placing Order…</>
                    ) : (
                      <><Lock size={14} /> Send Order via WhatsApp</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── ORDER SUMMARY ── */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: 24, alignSelf: 'start', position: 'sticky', top: 100 }}>
            <h2 className="font-display" style={{ color: '#F5F2EC', fontSize: '1.25rem', marginBottom: 20 }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              {state.items.map((item) => (
                <div key={`${item.product.id}-${item.size}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, overflow: 'hidden', flexShrink: 0, position: 'relative', background: 'rgba(255,255,255,0.04)' }}>
                    <Image
  src={
    item.color &&
    item.product.colorImages?.[item.color]?.[0]
      ? item.product.colorImages[item.color][0]
      : item.product.images[0]
  }
  alt={item.product.name}
  fill
  sizes="80px"
  style={{ objectFit: 'cover' }}
/>
                    <span style={{ position: 'absolute', top: -6, right: -6, background: '#C9A84C', color: '#0A0A0F', fontSize: '0.6rem', fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: 'rgba(245,242,236,0.75)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</p>
                    {item.size && <p style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.7rem' }}>Size: {item.size}</p>}
                  </div>
                  <span style={{ color: 'rgba(245,242,236,0.55)', fontSize: '0.8rem', flexShrink: 0 }}>{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'rgba(245,242,236,0.5)' }}>Subtotal</span>
                <span style={{ color: '#F5F2EC' }}>{formatPrice(state.total)}</span>
              </div>
              {selectedDelivery && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'rgba(245,242,236,0.5)' }}>
                    {selectedDelivery.name}
                  </span>
                  <span style={{ color: '#F5F2EC' }}>
                    {formatPrice(shippingFee)}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12, marginTop: 4 }}>
                <span className="font-display" style={{ color: '#F5F2EC', fontSize: '1.25rem' }}>Total</span>
                <span className="font-display" style={{ color: '#F5F2EC', fontSize: '1.5rem' }}>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) { .checkout-grid { grid-template-columns: 1fr 380px !important; } }
      `}</style>
    </div>
  )
}
