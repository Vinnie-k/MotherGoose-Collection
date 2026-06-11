'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react'
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

// Size options per category
const CATEGORY_SIZES: Record<string, string[]> = {
  watches:     ['One Size'],
  suits:       ['46', '48', '50', '52', '54', '56', '58'],
  clothing:    ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  shoes:       ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
  accessories: ['One Size', 'S/M', 'M/L', 'L/XL'],
  bags:        ['One Size', 'Small', 'Medium', 'Large'],
}

// Trouser subcategory overrides the default clothing sizes
const TROUSER_SIZES = ['32', '34', '36', '38', '40', '42', '44', '46', '48']

// Whether a category uses sizes at all
const CATEGORY_USES_SIZES: Record<string, boolean> = {
  watches: false,
  suits: true,
  clothing: true,
  shoes: true,
  accessories: false,
  bags: false,
}

const s = {
  label: { display: 'block', color: 'rgba(245,242,236,0.45)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginBottom: 8 },
  input: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F2EC', padding: '10px 14px', width: '100%', outline: 'none', fontSize: '0.875rem', transition: 'border-color 0.2s' },
  section: { color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 600, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
}

type SizeEntry = { size: string; stock: number }

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
    colors: initialData?.colors?.join(', ') ?? '',
    admin_source_tag: initialData?.admin_source_tag ?? '',
    featured: initialData?.featured ?? false,
    new_arrival: initialData?.new_arrival ?? false,
    gender: (initialData?.gender ?? '') as 'male' | 'female' | 'unisex' | '',
    rating: initialData?.rating?.toString() ?? '0',
    review_count: initialData?.review_count?.toString() ?? '0',
  })

  const [sizes, setSizes] = useState<SizeEntry[]>(
    initialData?.sizes ?? []
  )

  const [colorImages, setColorImages] = useState<Record<string, string[]>>(
    initialData?.colorImages ?? {}
  )

  const set = (key: string, value: unknown) => setForm((p) => ({ ...p, [key]: value }))

  const usesSizes = CATEGORY_USES_SIZES[form.category] ?? false
  const isTrousers = form.category === 'clothing' && form.subcategory === 'trousers'
  const isSuits    = form.category === 'suits'
  const availableSizes = isTrousers
    ? TROUSER_SIZES
    : (CATEGORY_SIZES[form.category] ?? [])
  const sizeHint = isTrousers
    ? 'Trouser sizes are waist measurements in inches (32–48)'
    : isSuits
    ? 'Suit sizes are chest measurements (46–58)'
    : null

  const toggleSize = (size: string) => {
    setSizes(prev => {
      const exists = prev.find(s => s.size === size)
      if (exists) {
        return prev.filter(s => s.size !== size)
      }
      return [...prev, { size, stock: 1 }]
    })
  }

  const updateSizeStock = (size: string, stock: number) => {
    setSizes(prev => prev.map(s => s.size === size ? { ...s, stock: Math.max(0, stock) } : s))
  }

  const isSizeSelected = (size: string) => sizes.some(s => s.size === size)

  // Total stock = sum of all size stocks (if uses sizes), else manual stock field
  const totalStock = usesSizes && sizes.length > 0
    ? sizes.reduce((sum, s) => sum + s.stock, 0)
    : parseInt(form.stock) || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    if (!form.name.trim()) { setError('Product name is required.'); setSaving(false); return }
    if (!form.price) { setError('Price is required.'); setSaving(false); return }
    if (!form.description.trim()) { setError('Description is required.'); setSaving(false); return }
    if (form.images.length === 0) { setError('Please add at least one product image.'); setSaving(false); return }
    if (usesSizes && sizes.length === 0) { setError('Please select at least one size for this product.'); setSaving(false); return }

    const payload = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price.replace(/,/g, '')),
      original_price: form.original_price ? parseFloat(form.original_price.replace(/,/g, '')) : null,
      category: form.category,
      subcategory: form.subcategory || null,
      images: form.images,
      stock: totalStock,
      rating: parseFloat(form.rating) || 0,
      review_count: parseInt(form.review_count) || 0,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
      colorImages: Object.keys(colorImages).length > 0 ? colorImages : null,
      admin_source_tag: form.admin_source_tag.trim() || null,
      featured: form.featured,
      new_arrival: form.new_arrival,
      gender: form.gender || null,
      sizes: usesSizes && sizes.length > 0 ? sizes : null,
    }

    try {
      const res = await fetch('/api/mgmt-heron/products', {
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
          setTimeout(() => { window.location.href = '/mgmt-heron/login' }, 1500)
        } else {
          setError((data.error as string) || `Save failed (status ${res.status})`)
        }
        setSaving(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/mgmt-heron/products'), 1200)
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
            <button key={cat.slug} type="button" onClick={() => { set('category', cat.slug); set('subcategory', ''); setSizes([]) }}
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
            <select value={form.subcategory} onChange={(e) => { set('subcategory', e.target.value); setSizes([]) }} style={{ ...s.input, cursor: 'pointer' }}>
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

      {/* ── Sizes ── */}
      {usesSizes && (
        <section>
          <p style={s.section}>
            Sizes & Stock per Size <span style={{ color: '#f87171' }}>*</span>
          </p>
          <p style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.75rem', marginBottom: sizeHint ? 8 : 16 }}>
            Click a size to add it. Set the stock quantity for each size. Sizes with 0 stock will show as out of stock on the store.
          </p>
          {sizeHint && (
            <p style={{ color: '#C9A84C', fontSize: '0.75rem', marginBottom: 16, background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.2)', padding: '8px 12px' }}>
              ℹ {sizeHint}
            </p>
          )}

          {/* Size selector buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {availableSizes.map((size) => {
              const selected = isSizeSelected(size)
              const sizeEntry = sizes.find(s => s.size === size)
              const outOfStock = selected && sizeEntry?.stock === 0
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    border: selected ? '2px solid #C9A84C' : '1px solid rgba(255,255,255,0.1)',
                    background: outOfStock ? 'rgba(248,113,113,0.08)' : selected ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.02)',
                    color: outOfStock ? '#f87171' : selected ? '#C9A84C' : 'rgba(245,242,236,0.4)',
                    position: 'relative',
                  }}
                >
                  {size}
                  {outOfStock && (
                    <span style={{ display: 'block', fontSize: '0.55rem', color: '#f87171', letterSpacing: '0.05em' }}>OUT</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Stock inputs for selected sizes */}
          {sizes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                Set stock per size
              </p>
              {sizes.sort((a, b) => availableSizes.indexOf(a.size) - availableSizes.indexOf(b.size)).map(({ size, stock }) => (
                <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px' }}>
                  <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.875rem', minWidth: 48 }}>{size}</span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button type="button" onClick={() => updateSizeStock(size, stock - 1)}
                      style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F2EC', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      −
                    </button>
                    <input
                      type="number" min="0" value={stock}
                      onChange={(e) => updateSizeStock(size, parseInt(e.target.value) || 0)}
                      style={{ ...s.input, width: 80, textAlign: 'center', padding: '6px 10px' }}
                    />
                    <button type="button" onClick={() => updateSizeStock(size, stock + 1)}
                      style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F2EC', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      +
                    </button>
                    <span style={{ color: stock === 0 ? '#f87171' : stock <= 3 ? '#f59e0b' : '#4ade80', fontSize: '0.75rem', fontWeight: 600 }}>
                      {stock === 0 ? 'Out of stock' : stock <= 3 ? `Only ${stock} left` : `${stock} in stock`}
                    </span>
                  </div>
                  <button type="button" onClick={() => toggleSize(size)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,236,0.2)', padding: 4 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,242,236,0.2)')}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {/* Total stock summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', marginTop: 4 }}>
                <span style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.8rem' }}>Total stock across all sizes</span>
                <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.875rem' }}>{totalStock} units</span>
              </div>
            </div>
          )}

          {sizes.length === 0 && (
            <div style={{ padding: 16, border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <p style={{ color: 'rgba(245,242,236,0.25)', fontSize: '0.8rem' }}>No sizes selected yet — click the size buttons above to add them</p>
            </div>
          )}
        </section>
      )}

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

          {/* Only show manual stock if category does not use sizes */}
          {!usesSizes && (
            <div>
              <label style={s.label}>Stock Quantity <span style={{ color: '#f87171' }}>*</span></label>
              <input type="number" min="0" step="1" value={form.stock} onChange={(e) => set('stock', e.target.value)}
                placeholder="0" style={s.input} required />
            </div>
          )}

          {usesSizes && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label style={{ ...s.label, marginBottom: 4 }}>Total Stock</label>
              <span style={{ color: '#C9A84C', fontSize: '1.1rem', fontWeight: 700 }}>{totalStock} units</span>
              <span style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.7rem' }}>Auto-calculated from sizes</span>
            </div>
          )}

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
        <p style={s.section}>Product Colors</p>
        <p style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.75rem', marginBottom: 16 }}>
          Enter available colors (comma separated). E.g. Red, Blue, Black, White
        </p>
        <input type="text" value={form.colors} onChange={(e) => set('colors', e.target.value)}
          placeholder="e.g. Red, Black, Navy, White" style={s.input} />
      </section>

      {/* ── Admin Source Tag ── */}
      <section>
        <p style={s.section}>Admin Source Tag <span style={{ color: 'rgba(245,242,236,0.25)' }}>(for admin only)</span></p>
        <p style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.75rem', marginBottom: 16 }}>
          Identify where this product comes from (e.g. Supplier A, Local Vendor, Direct Import). This field is only visible to admin.
        </p>
        <input type="text" value={form.admin_source_tag} onChange={(e) => set('admin_source_tag', e.target.value)}
          placeholder="e.g. Supplier A, Local Vendor" style={s.input} />
      </section>

      {/* ── Product Images ── */}
      <section>
        <p style={s.section}>Product Images <span style={{ color: '#f87171' }}>*</span></p>
        <p style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.75rem', marginBottom: 16 }}>
          Upload clear product photos. The first image will be the main display photo. Max 5 images, 5MB each.
        </p>
        <ImageUploader images={form.images} onChange={(imgs) => set('images', imgs)} maxImages={5} />
      </section>

      {/* ── Color-Specific Images ── */}
      {form.colors && form.colors.length > 0 && (
        <section>
          <p style={s.section}>Images Per Color <span style={{ color: 'rgba(245,242,236,0.5)' }}>(optional)</span></p>
          <p style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.75rem', marginBottom: 24 }}>
            Upload specific images for each color. If you upload images for a color, those images will be shown when that color is selected.
          </p>
          {form.colors.split(',').map((color) => {
            const trimmedColor = color.trim()
            if (!trimmedColor) return null
            return (
              <div key={trimmedColor} style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ ...s.label, marginBottom: 12 }}>{trimmedColor} Images</p>
                <ImageUploader 
                  images={colorImages[trimmedColor] || []} 
                  onChange={(imgs) => setColorImages(prev => ({ ...prev, [trimmedColor]: imgs }))} 
                  maxImages={5} 
                />
              </div>
            )
          })}
        </section>
      )}

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button type="button" onClick={() => router.push('/mgmt-heron/products')}
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
