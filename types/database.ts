export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
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
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      cart_items: {
        Row: {
          id: string
          session_id: string
          product_id: string
          quantity: number
          size: string | null
          color: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['cart_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['cart_items']['Insert']>
      }
    }
  }
}

export type Product = Database['public']['Tables']['products']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']
