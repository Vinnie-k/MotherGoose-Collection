'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import { useWishlist } from '@/lib/wishlist-context'
import { useCart } from '@/lib/cart-context'
import { useToast } from '@/lib/toast-context'

export default function WishlistPage() {
  const { state, remove, clear } = useWishlist()
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleMoveToCart = (productId: string) => {
    const product = state.items.find((p) => p.id === productId)
    if (!product) return
    addItem(product, 1)
    remove(productId)
    toast(`${product.name} moved to your bag`, 'success')
  }

  const handleMoveAllToCart = () => {
    state.items.forEach((product) => addItem(product, 1))
    clear()
    toast('All items moved to your bag', 'success')
  }

  if (state.items.length === 0) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6">
        <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center">
          <Heart size={36} className="text-white/10" />
        </div>
        <h1 className="font-display text-4xl text-ivory">Your Wishlist is Empty</h1>
        <p className="text-ivory/40 max-w-sm">
          Save pieces you love by clicking the heart icon on any product. They&apos;ll appear here for easy access.
        </p>
        <Link href="/products" className="btn-primary flex items-center gap-2">
          Start Browsing <ArrowRight size={15} />
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-gold text-xs tracking-[0.4em] uppercase mb-2">Saved Items</p>
            <h1 className="font-display text-5xl text-ivory">
              Wishlist <span className="text-ivory/30 text-3xl">({state.items.length})</span>
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleMoveAllToCart}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <ShoppingBag size={14} />
              Move All to Bag
            </button>
            <button
              onClick={clear}
              className="btn-outline flex items-center gap-2 text-sm"
            >
              <Trash2 size={14} />
              Clear All
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {state.items.map((product) => {
            const discount = product.original_price
              ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
              : null

            return (
              <div key={product.id} className="group relative">
                {/* Remove button */}
                <button
                  onClick={() => { remove(product.id); toast('Removed from wishlist', 'info') }}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-obsidian/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-ivory/40 hover:text-red-400 hover:border-red-400/40 transition-all duration-200"
                >
                  <Trash2 size={13} />
                </button>

                {/* Image */}
                <Link href={`/products/${product.id}`} className="block">
                  <div className="relative aspect-[3/4] bg-white/5 overflow-hidden img-zoom">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                    {discount && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 tracking-widest uppercase">
                        -{discount}%
                      </span>
                    )}
                    {product.new_arrival && (
                      <span className="absolute top-3 left-3 bg-gold text-obsidian text-xs font-bold px-2 py-0.5 tracking-widest uppercase">
                        New
                      </span>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="pt-4 space-y-1.5">
                  <p className="text-ivory/40 text-xs tracking-widest uppercase">{product.category}</p>
                  <Link href={`/products/${product.id}`}>
                    <h3 className="text-ivory text-sm font-medium hover:text-gold transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-ivory font-semibold">${product.price.toLocaleString()}</span>
                    {product.original_price && (
                      <span className="text-ivory/30 text-sm line-through">
                        ${product.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Move to Cart */}
                <button
                  onClick={() => handleMoveToCart(product.id)}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-white/10 text-ivory/60 hover:border-gold/50 hover:text-gold transition-all duration-200 text-xs tracking-widest uppercase"
                >
                  <ShoppingBag size={13} />
                  Move to Bag
                </button>
              </div>
            )
          })}
        </div>

        {/* Continue shopping */}
        <div className="mt-16 text-center">
          <Link href="/products" className="btn-outline inline-flex items-center gap-2">
            Continue Shopping <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  )
}
