'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import type { Product } from '@/types/database'

export interface CartItem {
  product: Product
  quantity: number
  size?: string
  color?: string
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity?: number; size?: string; color?: string } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'REFRESH_STOCK'; payload: Product[] } // new — updates live stock in cart

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  refreshStock: () => Promise<void>  // new — call before checkout or when cart opens
} | null>(null)

function computeTotals(items: CartItem[]) {
  return {
    total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1, size, color } = action.payload
      if (product.stock <= 0) return state
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === product.id && item.size === size && item.color === color
      )
      let newItems: CartItem[]
      if (existingIndex >= 0) {
        const currentQty = state.items[existingIndex].quantity
        const newQty = Math.min(currentQty + quantity, product.stock)
        newItems = state.items.map((item, i) =>
          i === existingIndex ? { ...item, quantity: newQty } : item
        )
      } else {
        const cappedQty = Math.min(quantity, product.stock)
        newItems = [...state.items, { product, quantity: cappedQty, size, color }]
      }
      return { ...state, items: newItems, ...computeTotals(newItems) }
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((item) => item.product.id !== action.payload.productId)
      return { ...state, items: newItems, ...computeTotals(newItems) }
    }
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map((item) => {
        if (item.product.id !== action.payload.productId) return item
        const capped = Math.min(action.payload.quantity, item.product.stock)
        return { ...item, quantity: capped }
      }).filter((item) => item.quantity > 0)
      return { ...state, items: newItems, ...computeTotals(newItems) }
    }
    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0 }
    case 'LOAD_CART':
      return { items: action.payload, ...computeTotals(action.payload) }
    case 'REFRESH_STOCK': {
      // Update each cart item's product with fresh stock from the API.
      // If live stock is less than cart quantity, cap it. Remove if now 0 stock.
      const freshProducts = action.payload
      const newItems = state.items
        .map((item) => {
          const fresh = freshProducts.find((p) => p.id === item.product.id)
          if (!fresh) return item // product removed — keep as-is, server will catch it
          const cappedQty = Math.min(item.quantity, fresh.stock)
          return { ...item, product: { ...item.product, stock: fresh.stock }, quantity: cappedQty }
        })
        .filter((item) => item.quantity > 0)
      return { ...state, items: newItems, ...computeTotals(newItems) }
    }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0, itemCount: 0 })

  // Load persisted cart on mount
  useEffect(() => {
    const saved = localStorage.getItem('mothergoose-cart')
    if (saved) {
      try {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(saved) })
      } catch {}
    }
  }, [])

  // Persist cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem('mothergoose-cart', JSON.stringify(state.items))
  }, [state.items])

  // Fetch live stock for all products currently in the cart
  // and update quantities if stock has changed since they were added
  const refreshStock = useCallback(async () => {
    if (state.items.length === 0) return
    try {
      const res = await fetch('/api/products')
      if (!res.ok) return
      const data = await res.json()
      const products: Product[] = data.products || []
      if (products.length > 0) {
        dispatch({ type: 'REFRESH_STOCK', payload: products })
      }
    } catch {
      // Silently fail — stale stock is better than a broken cart
    }
  }, [state.items.length])

  const addItem = (product: Product, quantity = 1, size?: string, color?: string) =>
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity, size, color } })
  const removeItem = (productId: string) =>
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } })
  const updateQuantity = (productId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } })
  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  return (
    <CartContext.Provider value={{ state, dispatch, addItem, removeItem, updateQuantity, clearCart, refreshStock }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
