// This file mirrors the shape of the `products` table in Supabase.
// Note: a `cart_items` table type used to live here too, but the app's cart
// state is managed entirely client-side via lib/cart-context.tsx (which has
// its own local CartItem type) — no `cart_items` table is actually used, so
// that schema entry was removed along with the unused `Database`/`Json`
// wrapper types that only existed to support it.

export interface Product {
  id: string
  name: string
  description: string
  price: number
  original_price: number | null
  category: string
  subcategory: string | null
  images: string[]
  stock: number
  rating: number
  review_count: number
  tags: string[]
  featured: boolean
  new_arrival: boolean
  gender: 'male' | 'female' | 'unisex' | null
  sizes: { size: string; stock: number }[] | null
  colors: string[]
  colorImages: { [color: string]: string[] } | null
  admin_source_tag: string | null
  created_at: string
  updated_at: string
}

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>
export type ProductUpdate = Partial<ProductInsert>
