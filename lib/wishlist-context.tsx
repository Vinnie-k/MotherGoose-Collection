'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { Product } from '@/types/database'

interface WishlistState {
  items: Product[]
}

type WishlistAction =
  | { type: 'TOGGLE'; payload: Product }
  | { type: 'REMOVE'; payload: string }
  | { type: 'LOAD'; payload: Product[] }
  | { type: 'CLEAR' }

const WishlistContext = createContext<{
  state: WishlistState
  toggle: (product: Product) => void
  isWished: (id: string) => boolean
  remove: (id: string) => void
  clear: () => void
} | null>(null)

function reducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'TOGGLE': {
      const exists = state.items.some((p) => p.id === action.payload.id)
      return {
        items: exists
          ? state.items.filter((p) => p.id !== action.payload.id)
          : [...state.items, action.payload],
      }
    }
    case 'REMOVE':
      return { items: state.items.filter((p) => p.id !== action.payload) }
    case 'LOAD':
      return { items: action.payload }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mothergoose-wishlist')
      if (saved) dispatch({ type: 'LOAD', payload: JSON.parse(saved) })
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('mothergoose-wishlist', JSON.stringify(state.items))
  }, [state.items])

  const toggle = (product: Product) => dispatch({ type: 'TOGGLE', payload: product })
  const remove = (id: string) => dispatch({ type: 'REMOVE', payload: id })
  const clear = () => dispatch({ type: 'CLEAR' })
  const isWished = (id: string) => state.items.some((p) => p.id === id)

  return (
    <WishlistContext.Provider value={{ state, toggle, isWished, remove, clear }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
