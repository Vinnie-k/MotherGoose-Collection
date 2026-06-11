'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Plus, LogOut, ExternalLink, ShoppingCart, BarChart3 } from 'lucide-react'

const NAV = [
  { href: '/mgmt-heron', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/mgmt-heron/products', label: 'All Products', icon: Package, exact: false },
  { href: '/mgmt-heron/products/new', label: 'Add Product', icon: Plus, exact: true },
  { href: '/mgmt-heron/orders', label: 'Orders', icon: ShoppingCart, exact: false },
  { href: '/mgmt-heron/reports', label: 'Reports', icon: BarChart3, exact: false },
]

const s = {
  sidebar: { width: 220, minHeight: '100vh', background: 'rgba(0,0,0,0.4)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' as const, flexShrink: 0 },
  brand: { padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  nav: { flex: 1, padding: '12px 8px' },
  link: (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', fontSize: '0.78rem', letterSpacing: '0.05em',
    textDecoration: 'none', transition: 'all 0.15s', marginBottom: 2,
    borderLeft: active ? '2px solid #C9A84C' : '2px solid transparent',
    background: active ? 'rgba(201,168,76,0.08)' : 'transparent',
    color: active ? '#C9A84C' : 'rgba(245,242,236,0.45)',
    borderRadius: '0 4px 4px 0',
  }),
  bottom: { padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.05)' },
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/mgmt-heron/login', { method: 'DELETE', credentials: 'include' })
    window.location.href = '/mgmt-heron/login'
  }

  return (
    <aside style={s.sidebar}>
      {/* Brand */}
      <div style={s.brand}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.2em', color: '#F5F2EC' }}>MOTHERGOOSE</span>
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C' }}>Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={s.nav}>
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href) && !(exact && pathname !== href)
          return (
            <Link key={href} href={href} style={s.link(active)}>
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={s.bottom}>
        <a href="/" target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: 'rgba(245,242,236,0.35)', fontSize: '0.78rem', textDecoration: 'none', transition: 'color 0.15s', marginBottom: 2 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,242,236,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,242,236,0.35)')}>
          <ExternalLink size={14} /> View Store
        </a>
        <button onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.5)', fontSize: '0.78rem', transition: 'color 0.15s', textAlign: 'left' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.5)')}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
