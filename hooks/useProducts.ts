'use client'

import { useState, useEffect } from 'react'
import type { Product } from '@/types/database'

interface UseProductsOptions {
  category?: string
  featured?: boolean
  newArrival?: boolean
  search?: string
  limit?: number
}

interface UseProductsResult {
  products: Product[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = () => setTick((t) => t + 1)

  useEffect(() => {
    let cancelled = false

    async function fetchProducts() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (options.category) params.set('category', options.category)
        if (options.featured) params.set('featured', 'true')
        if (options.newArrival) params.set('new', 'true')
        if (options.search) params.set('q', options.search)

        const res = await fetch(`/api/products?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch products')
        const data = await res.json()

        if (!cancelled) {
          let result: Product[] = data.products || []
          if (options.limit) result = result.slice(0, options.limit)
          setProducts(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load products')
          setProducts([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProducts()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.category, options.featured, options.newArrival, options.search, options.limit, tick])

  return { products, loading, error, refetch }
}

export function useProduct(id: string): { product: Product | null; loading: boolean } {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    fetch(`/api/products/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setProduct(data?.product ?? null))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  return { product, loading }
}
