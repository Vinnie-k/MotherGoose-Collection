import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import { ToastProvider } from '@/lib/toast-context'
import ConditionalChrome from '@/components/ConditionalChrome'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: "Mothergoose Collection — Premium Fashion",
    template: '%s | Mothergoose Collection',
  },
  description: 'Premium luxury fashion — watches, suits, shoes and accessories.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
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
