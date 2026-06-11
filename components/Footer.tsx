'use client'

import Link from 'next/link'
import { CATEGORIES } from '@/lib/products'

export default function Footer() {
  return (
    <footer style={{ background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 96 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px 0' }}>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 48, marginBottom: 56 }}>

          {/* Brand column */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.2em', color: '#F5F2EC' }}>MOTHERGOOSE</span>
                <span style={{ fontSize: '0.55rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C' }}>Collection</span>
              </div>
            </div>
            <p style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.8rem', lineHeight: 1.7, marginBottom: 20 }}>
              Premium fashion for every wardrobe. Curated styles for those who dress with intention.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <a href="https://wa.me/254759490008" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#25D366', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp Us
              </a>
              <a href="mailto:mothergoosecollection254@gmail.com"
                style={{ color: 'rgba(245,242,236,0.35)', fontSize: '0.75rem', textDecoration: 'none' }}>
                mothergoosecollection254@gmail.com
              </a>
              <a href="https://www.instagram.com/mothergoosecollection254?igsh=MTZocmJ3eGY1dmMxZA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(245,242,236,0.35)', fontSize: '0.8rem', textDecoration: 'none', marginTop: 2 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                Instagram
              </a>
            </div>
          </div>

          {/* Shop column */}
          <div>
            <h4 style={{ color: '#C9A84C', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 20 }}>Shop</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <li>
                <Link href="/products" style={{ color: 'rgba(245,242,236,0.45)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,242,236,0.45)')}>
                  All Products
                </Link>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} style={{ color: 'rgba(245,242,236,0.45)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,242,236,0.45)')}>
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help column */}
          <div>
            <h4 style={{ color: '#C9A84C', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 20 }}>Help</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Shipping Info', href: '/shipping-returns' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'About Us', href: '/about' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} style={{ color: 'rgba(245,242,236,0.45)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,242,236,0.45)')}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h4 style={{ color: '#C9A84C', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 20 }}>Visit Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ color: 'rgba(245,242,236,0.45)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Nairobi, Kenya
              </p>
              <p style={{ color: 'rgba(245,242,236,0.45)', fontSize: '0.85rem' }}>+254 759 490 008</p>
              <p style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.75rem', marginTop: 4 }}>Mon – Sat: 9am – 6pm EAT</p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px 0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ color: 'rgba(245,242,236,0.2)', fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} Mothergoose Collection. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/privacy" style={{ color: 'rgba(245,242,236,0.2)', fontSize: '0.75rem', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,242,236,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,242,236,0.2)')}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ color: 'rgba(245,242,236,0.2)', fontSize: '0.75rem', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,242,236,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,242,236,0.2)')}>
              Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
