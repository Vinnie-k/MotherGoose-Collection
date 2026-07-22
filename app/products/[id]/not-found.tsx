import Link from 'next/link'

export default function ProductNotFound() {
  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, textAlign: 'center', padding: '80px 24px' }}>
      <p className="font-display" style={{ color: 'rgba(245,242,236,0.2)', fontSize: '2rem', fontStyle: 'italic' }}>Product not found</p>
      <Link href="/products" className="btn-outline">Browse Products</Link>
    </div>
  )
}
