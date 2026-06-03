import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import { ToastProvider } from '@/lib/toast-context'
import ConditionalChrome from '@/components/ConditionalChrome'

export const metadata: Metadata = {
  title: 'Mothergoose Collection',
  description: 'Premium luxury fashion — watches, suits, shoes and accessories.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ToastProvider>
          <WishlistProvider>
            <CartProvider>
              <ConditionalChrome>
                {children}
              </ConditionalChrome>
            </CartProvider>
          </WishlistProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
