import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  linkHref?: string
  linkLabel?: string
  className?: string
}

export default function SectionHeader({
  eyebrow,
  title,
  linkHref,
  linkLabel = 'View All',
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex items-end justify-between mb-12 ${className}`}>
      <div>
        {eyebrow && (
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-2 font-medium">{eyebrow}</p>
        )}
        <h2 className="font-display text-4xl md:text-5xl text-ivory">{title}</h2>
        <div className="w-12 h-px bg-gold mt-3" />
      </div>
      {linkHref && (
        <Link
          href={linkHref}
          className="hidden md:flex items-center gap-2 text-gold text-sm tracking-widest uppercase hover:gap-4 transition-all duration-300"
        >
          {linkLabel} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}
