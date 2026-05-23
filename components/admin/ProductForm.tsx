'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import ImageUploader from '@/components/admin/ImageUploader'
import { CATEGORIES } from '@/lib/products'
import type { Product } from '@/types/database'

interface ProductFormProps {
  initialData?: Partial<Product>
  mode: 'create' | 'edit'
}

const SUBCATEGORIES: Record<string, string[]> = {
  watches: ['automatic', 'quartz', 'sport', 'dress', 'smart'],
  suits: ['slim-fit', 'classic-fit', 'linen', 'tuxedo', 'double-breasted'],
  clothing: ['shirts', 'knitwear', 'trousers', 'tshirts', 'jackets', 'shorts'],
  shoes: ['formal', 'boots', 'loafers', 'sneakers', 'sandals'],
  accessories: ['ties', 'pocket-squares', 'wallets', 'belts', 'sunglasses'],
  bags: ['briefcases', 'duffle', 'backpacks', 'tote', 'messenger'],
}

const s = {
  label: { display: 'block', color: 'rgba(245,242,236,0.45)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginBottom: 8 },
  input: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F2EC', padding: '10px 14px', width: '100%', outline: 'none', fontSize: '0.875rem', transition: 'border-color 0.2s' },
  section: { color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 600, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
}

export default function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price?.toString() ?? '',
    original_price: initialData?.original_price?.toString() ?? '',
    category: initialData?.category ?? 'watches',
    subcategory: initialData?.subcategory ?? '',
    images: initialData?.images ?? [],
    stock: initialData?.stock?.toString() ?? '1',
    tags: initialData?.tags?.join(', ') ?? '',
    featured: initialData?.featured ?? false,
    new_arrival: initialData?.new_arrival ?? false,
    gender: (initialData?.gender ?? '') as 'male' | 'female' | 'unisex' | '',
    rating: initialData?.rating?.toString() ?? '0',
    review_count: initialData?.review_count?.toString() ?? '0',
  })

  const set = (key: string, value: unknown) => setForm((p) => ({ ...p, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    if (!form.name.trim()) { setError('Product name is required.'); setSaving(false); return }
    if (!form.price) { setError('Price is required.'); setSaving(false); return }
    if (!form.description.trim()) { setError('Description is required.'); setSaving(false); return }
    if (form.images.length === 0) { setError('Please add at least one product image.'); setSaving(false); return }

    const payload = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price.replace(/,/g, '')),
      original_price: form.original_price ? parseFloat(form.original_price.replace(/,/g, '')) : null,
      category: form.category,
      subcategory: form.subcategory || null,
      images: form.images,
      stock: parseInt(form.stock) || 0,
      rating: parseFloat(form.rating) || 0,
      review_count: parseInt(form.review_count) || 0,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      featured: form.featured,
      new_arrival: form.new_arrival,
      gender: form.gender || null,
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* ignore */ }

      if (!res.ok) {
        if (res.status === 401) {
          setError('Session expired. Redirecting to login…')
          setTimeout(() => { window.location.href = '/admin/login' }, 1500)
        } else {
          setError((data.error as string) || `Save failed (status ${res.status})`)
        }
        setSaving(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/admin/products'), 1200)
    } catch {
      setError('Network error. Check that the dev server is running.')
      setSaving(false)
    }
  }

  const subcats = SUBCATEGORIES[form.category] ?? []
  const price = parseFloat(form.price.replace(/,/g, '')) || 0
  const originalPrice = parseFloat((form.original_price || '').replace(/,/g, '')) || 0
  const discount = originalPrice > price && price > 0
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>

      {/* Status messages */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertCircle size={18} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}
      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <CheckCircle size={18} style={{ color: '#4ade80' }} />
          <p style={{ color: '#4ade80', fontSize: '0.875rem' }}>Product saved successfully! Redirecting…</p>
        </div>
      )}

      {/* ── Basic Info ── */}
      <section>
        <p style={s.section}>Basic Information</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={s.label}>Product Name <span style={{ color: '#f87171' }}>*</span></label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Midnight Navy Slim Fit Suit" style={s.input} required />
          </div>
          <div>
            <label style={s.label}>Description <span style={{ color: '#f87171' }}>*</span></label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Describe the product — materials, fit, key features…"
              rows={4} style={{ ...s.input, resize: 'none' }} required />
          </div>
        </div>
      </section>

      {/* ── Category ── */}
      <section>
        <p style={s.section}>Category <span style={{ color: '#f87171' }}>*</span></p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          {CATEGORIES.map((cat) => (
            <button key={cat.slug} type="button" onClick={() => { set('category', cat.slug); set('subcategory', '') }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px',
                border: form.category === cat.slug ? '2px solid #C9A84C' : '1px solid rgba(255,255,255,0.1)',
                background: form.category === cat.slug ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer', color: form.category === cat.slug ? '#C9A84C' : 'rgba(245,242,236,0.4)',
                fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.15s',
              }}>
              <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {subcats.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={s.label}>Subcategory</label>
            <select value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)} style={{ ...s.input, cursor: 'pointer' }}>
              <option value="" style={{ background: '#0A0A0F' }}>— None —</option>
              {subcats.map((sub) => <option key={sub} value={sub} style={{ background: '#0A0A0F' }}>{sub}</option>)}
            </select>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={s.label}>Search Tags <span style={{ color: 'rgba(245,242,236,0.25)' }}>(comma separated)</span></label>
          <input type="text" value={form.tags} onChange={(e) => set('tags', e.target.value)}
            placeholder="e.g. wool, slim fit, navy, formal" style={s.input} />
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
          {[{ key: 'featured', label: 'Featured on Homepage' }, { key: 'new_arrival', label: 'New Arrival' }].map(({ key, label }) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div onClick={() => set(key, !form[key as keyof typeof form])}
                style={{ width: 40, height: 22, borderRadius: 11, position: 'relative', flexShrink: 0, cursor: 'pointer', background: form[key as keyof typeof form] ? '#C9A84C' : 'rgba(255,255,255,0.1)', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'transform 0.2s', transform: form[key as keyof typeof form] ? 'translateX(21px)' : 'translateX(3px)' }} />
              </div>
              <span style={{ color: 'rgba(245,242,236,0.6)', fontSize: '0.875rem' }}>{label}</span>
            </label>
          ))}
        </div>

        {/* Gender */}
        <div>
          <label style={s.label}>Gender <span style={{ color: '#f87171' }}>*</span></label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {([
              { value: 'male', label: '♂ Male' },
              { value: 'female', label: '♀ Female' },
              { value: 'unisex', label: '⚥ Unisex' },
            ] as const).map(({ value, label }) => (
              <button key={value} type="button" onClick={() => set('gender', value)}
                style={{
                  flex: 1, padding: '10px 8px', fontSize: '0.75rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.05em',
                  border: form.gender === value ? '2px solid #C9A84C' : '1px solid rgba(255,255,255,0.1)',
                  background: form.gender === value ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.02)',
                  color: form.gender === value ? '#C9A84C' : 'rgba(245,242,236,0.4)',
                }}>
                {label}
              </button>
            ))}
          </div>
          {!form.gender && <p style={{ color: 'rgba(245,242,236,0.25)', fontSize: '0.7rem', marginTop: 6 }}>Select who this product is for — used in storefront gender filter</p>}
        </div>
      </section>

      {/* ── Pricing & Stock ── */}
      <section>
        <p style={s.section}>Pricing & Stock</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 8 }}>
          <div>
            <label style={s.label}>Selling Price (Ksh) <span style={{ color: '#f87171' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,242,236,0.35)', fontSize: '0.8rem', fontWeight: 600, pointerEvents: 'none' }}>Ksh</span>
              <input type="number" min="0" step="1" value={form.price} onChange={(e) => set('price', e.target.value)}
                placeholder="0" style={{ ...s.input, paddingLeft: 44 }} required />
            </div>
          </div>
          <div>
            <label style={s.label}>Original Price (Ksh) <span style={{ color: 'rgba(245,242,236,0.25)' }}>(leave empty if not on sale)</span></label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,242,236,0.35)', fontSize: '0.8rem', fontWeight: 600, pointerEvents: 'none' }}>Ksh</span>
              <input type="number" min="0" step="1" value={form.original_price} onChange={(e) => set('original_price', e.target.value)}
                placeholder="0" style={{ ...s.input, paddingLeft: 44 }} />
            </div>
          </div>
          <div>
            <label style={s.label}>Stock Quantity <span style={{ color: '#f87171' }}>*</span></label>
            <input type="number" min="0" step="1" value={form.stock} onChange={(e) => set('stock', e.target.value)}
              placeholder="0" style={s.input} required />
          </div>
          <div>
            <label style={s.label}>Star Rating (0–5)</label>
            <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => set('rating', e.target.value)}
              placeholder="0.0" style={s.input} />
          </div>
        </div>

        {discount && (
          <p style={{ color: '#4ade80', fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            ✓ Will show <strong>{discount}% off</strong> badge (saving Ksh {(originalPrice - price).toLocaleString()})
          </p>
        )}
      </section>

      {/* ── Images ── */}
      <section>
        <p style={s.section}>Product Images <span style={{ color: '#f87171' }}>*</span></p>
        <p style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.75rem', marginBottom: 16 }}>
          Upload clear product photos. The first image will be the main display photo. Max 5 images, 5MB each.
        </p>
        <ImageUploader images={form.images} onChange={(imgs) => set('images', imgs)} maxImages={5} />
      </section>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button type="button" onClick={() => router.push('/admin/products')}
          className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowLeft size={14} /> Cancel
        </button>
        <button type="submit" disabled={saving || success} className="btn-primary"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving || success ? 0.5 : 1, cursor: saving || success ? 'not-allowed' : 'pointer' }}>
          {saving
            ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(10,10,15,0.3)', borderTopColor: '#0A0A0F', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Saving…</>
            : <><Save size={14} />{mode === 'create' ? 'Add Product to Store' : 'Save Changes'}</>
          }
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  )
}
