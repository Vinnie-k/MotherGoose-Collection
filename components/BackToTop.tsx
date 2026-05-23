'use client'

import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 left-6 z-40 w-10 h-10 bg-gold/10 border border-gold/30 backdrop-blur-sm flex items-center justify-center text-gold hover:bg-gold hover:text-obsidian transition-all duration-300 animate-fade-in"
      aria-label="Back to top"
    >
      <ChevronUp size={18} />
    </button>
  )
}
