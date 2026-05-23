'use client'

import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      {/* Decorative */}
      <div className="relative mb-10">
        <span className="font-display text-[12rem] font-bold text-white/[0.03] leading-none select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
      </div>

      <p className="text-gold text-xs tracking-[0.5em] uppercase mb-4 font-medium">Page Not Found</p>
      <h1 className="font-display text-4xl md:text-5xl text-ivory font-bold mb-4">
        Lost in the Collection
      </h1>
      <p className="text-ivory/40 max-w-md text-base leading-relaxed mb-10">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back to the good stuff.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/"
          className="btn-primary flex items-center gap-2"
        >
          <ArrowLeft size={15} />
          Back to Home
        </Link>
        <Link
          href="/products"
          className="btn-outline flex items-center gap-2"
        >
          <Search size={15} />
          Browse Products
        </Link>
      </div>
    </div>
  )
}
