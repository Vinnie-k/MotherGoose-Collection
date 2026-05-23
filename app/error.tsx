'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-6">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertTriangle size={28} className="text-red-400" />
      </div>
      <div>
        <h2 className="font-display text-3xl text-ivory mb-2">Something went wrong</h2>
        <p className="text-ivory/40 max-w-sm text-sm leading-relaxed">
          An unexpected error occurred. Please try again or return to the homepage.
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary">Try Again</button>
        <Link href="/" className="btn-outline">Go Home</Link>
      </div>
    </div>
  )
}
