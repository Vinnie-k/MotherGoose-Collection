'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Trophy, Timer, Handshake } from 'lucide-react'

const CATEGORY_IMAGES = [
  { slug: 'watches',     label: 'Watches',     image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&q=80' },
  { slug: 'suits',       label: 'Suits',       image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80' },
  { slug: 'clothing',    label: 'Clothing',    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80' },
  { slug: 'shoes',       label: 'Shoes',       image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
  { slug: 'accessories', label: 'Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
  { slug: 'bags',        label: 'Bags',        image: 'https://images.unsplash.com/photo-1591561954555-607968c989ab?w=600&q=80' },
]

export default function AboutPage() {
  return (
    <div className="pt-20 min-h-screen">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/70 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <p className="text-gold text-xs tracking-[0.5em] uppercase mb-4 stagger-1">Our Story</p>
          <h1 className="font-display text-6xl md:text-7xl text-ivory font-bold leading-tight stagger-2">
            Crafted for the<br />
            <span className="italic text-gold-light">Discerning Few</span>
          </h1>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <p className="text-gold text-xs tracking-[0.4em] uppercase mb-4">Who We Are</p>
        <h2 className="font-display text-4xl text-ivory mb-8 leading-snug">
          Where Luxury Meets Accessibility
        </h2>
        <div className="space-y-5 text-ivory/55 leading-relaxed text-lg">
          <p>
            Mothergoose Collection was founded on a simple conviction: that exceptional quality should not be reserved for the few. We source the world&apos;s finest watches, suits, shoes and accessories — and price them for the real world.
          </p>
          <p>
            Every product in our catalogue is personally vetted. We look for provenance, craftsmanship, and the kind of durability that turns a purchase into an heirloom. No fast fashion. No compromises.
          </p>
        </div>
        <Link href="/products" className="btn-primary inline-flex items-center gap-2 mt-10">
          Explore the Collection <ArrowRight size={15} />
        </Link>
      </section>

      {/* Values */}
      <section className="bg-white/[0.02] border-y border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">What Drives Us</p>
            <h2 className="font-display text-4xl text-ivory">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Uncompromising Quality', text: 'We source only from makers who share our obsession with materials, construction, and longevity. Every stitch, every movement, every sole is scrutinised.', Icon: Trophy },
              { title: 'Timeless Design', text: 'We resist trends. Our curation is guided by one question: will this still be beautiful in twenty years? Classic is not boring — it is confident.', Icon: Timer },
              { title: 'Honest Pricing', text: 'We work directly with artisans and cut out layers of middlemen so you pay for the craft, not the marketing.', Icon: Handshake },
            ].map(({ title, text, Icon }) => (
              <div key={title} className="bg-white/[0.03] border border-white/5 p-8 hover:border-gold/30 transition-colors duration-300">
                <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(201,168,76,0.2)', marginBottom: 20 }}>
                  <Icon size={22} style={{ color: '#C9A84C' }} />
                </div>
                <h3 className="font-display text-xl text-ivory mb-3">{title}</h3>
                <p className="text-ivory/40 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories CTA - image tiles matching the home page style */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 500 }}>Explore</p>
          <h2 className="font-display" style={{ color: '#F5F2EC', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Shop by Category</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {CATEGORY_IMAGES.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={`stagger-${i + 1}`}
              style={{ display: 'block', textDecoration: 'none', position: 'relative', overflow: 'hidden', aspectRatio: '3/4', transition: 'all 0.3s' }}
              onMouseEnter={e => { const img = e.currentTarget.querySelector('.cat-img') as HTMLElement; if (img) img.style.transform = 'scale(1.08)' }}
              onMouseLeave={e => { const img = e.currentTarget.querySelector('.cat-img') as HTMLElement; if (img) img.style.transform = 'scale(1)' }}
            >
              <Image
                className="cat-img"
                src={cat.image}
                alt={cat.label}
                fill
                sizes="(max-width: 768px) 50vw, 180px"
                style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,15,0.85) 0%, rgba(10,10,15,0.2) 50%, transparent 100%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 16px' }}>
                <span style={{ color: '#F5F2EC', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>{cat.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
