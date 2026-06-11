import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — Mothergoose Collection',
  robots: 'noindex, nofollow',
}

// Admin has its own isolated layout — no public Navbar, Footer, or providers
// The root layout still runs but its <Navbar> / <Footer> are NOT included here
// because Next.js App Router uses the nearest layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080810' }}>
      {children}
    </div>
  )
}
