export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { loadProducts, addProduct, updateProduct, deleteProduct } from '@/lib/product-store'
import type { Product } from '@/types/database'

function safeNum(val: unknown): number {
  if (typeof val === 'number') return val
  if (typeof val === 'string') return parseFloat(val.replace(/,/g, '')) || 0
  return 0
}

function authError() {
  return NextResponse.json({ error: 'Unauthorized — please log in again' }, { status: 401 })
}

// GET — list all products
export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) return authError()
  try {
    const products = await loadProducts()
    return NextResponse.json({ products })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 })
  }
}

// POST — create new product
export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) return authError()
  try {
    const body = await request.json()
    const required = ['name', 'description', 'price', 'category']
    for (const field of required) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }
    const product: Product = {
      id: crypto.randomUUID(),
      name: String(body.name).trim(),
      description: String(body.description).trim(),
      price: safeNum(body.price),
      original_price: body.original_price ? safeNum(body.original_price) : null,
      category: String(body.category),
      subcategory: body.subcategory ? String(body.subcategory) : null,
      images: Array.isArray(body.images) ? body.images : [],
      stock: safeNum(body.stock),
      rating: Number(body.rating) || 0,
      review_count: Number(body.review_count) || 0,
      tags: Array.isArray(body.tags) ? body.tags : [],
      featured: Boolean(body.featured),
      new_arrival: Boolean(body.new_arrival),
      gender: body.gender ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const saved = await addProduct(product)
    return NextResponse.json({ product: saved }, { status: 201 })
  } catch (err) {
    console.error('[Admin POST /products]', err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

// PUT — update product
export async function PUT(request: NextRequest) {
  if (!isAdminAuthenticated(request)) return authError()
  try {
    const body = await request.json()
    if (!body.id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    const updates: Partial<Product> = {
      ...(body.name && { name: String(body.name).trim() }),
      ...(body.description && { description: String(body.description).trim() }),
      ...(body.price !== undefined && { price: safeNum(body.price) }),
      original_price: body.original_price ? safeNum(body.original_price) : null,
      ...(body.category && { category: String(body.category) }),
      subcategory: body.subcategory ? String(body.subcategory) : null,
      ...(body.images && { images: body.images }),
      ...(body.stock !== undefined && { stock: safeNum(body.stock) }),
      ...(body.tags && { tags: Array.isArray(body.tags) ? body.tags : body.tags.split(',').map((t: string) => t.trim()) }),
      featured: Boolean(body.featured),
      new_arrival: Boolean(body.new_arrival),
      gender: body.gender ?? null,
      updated_at: new Date().toISOString(),
    }
    const updated = await updateProduct(body.id, updates)
    if (!updated) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    return NextResponse.json({ product: updated })
  } catch (err) {
    console.error('[Admin PUT /products]', err)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE — remove product
export async function DELETE(request: NextRequest) {
  if (!isAdminAuthenticated(request)) return authError()
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    const ok = await deleteProduct(id)
    if (!ok) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin DELETE /products]', err)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
