'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ReceiptPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page — receipts are now only available in admin panel
    router.push('/')
  }, [router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <p style={{ color: '#666', fontFamily: 'Arial, sans-serif' }}>Redirecting…</p>
    </div>
  )
}
