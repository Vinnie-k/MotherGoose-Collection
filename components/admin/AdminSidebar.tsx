'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Plus, LogOut, ExternalLink, ShoppingCart, BarChart3, Menu, X } from 'lucide-react'

const NAV = [
  { href: '/mgmt-heron',               label: 'Dashboard',   icon: LayoutDashboard, exact: true  },
  { href: '/mgmt-heron/products',       label: 'All Products',icon: Package,         exact: false },
  { href: '/mgmt-heron/products/new',   label: 'Add Product', icon: Plus,            exact: true  },
  { href: '/mgmt-heron/orders',         label: 'Orders',      icon: ShoppingCart,    exact: false },
  { href: '/mgmt-heron/reports',        label: 'Reports',     icon: BarChart3,       exact: false },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/mgmt-heron/login', { method: 'DELETE', credentials: 'include' })
    window.location.href = '/mgmt-heron/login'
  }

  const linkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', fontSize: '0.78rem', letterSpacing: '0.05em',
    textDecoration: 'none', transition: 'all 0.15s', marginBottom: 2,
    borderLeft: active ? '2px solid #C9A84C' : '2px solid transparent',
    background: active ? 'rgba(201,168,76,0.08)' : 'transparent',
    color: active ? '#C9A84C' : 'rgba(245,242,236,0.45)',
    borderRadius: '0 4px 4px 0',
  })

  const sidebarContent = (
    <>
      {/* Brand */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.2em', color: '#F5F2EC' }}>MOTHERGOOSE</span>
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C' }}>Admin</span>
        </div>
        {/* Close button — mobile only */}
        <button onClick={() => setOpen(false)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,242,236,0.5)', padding: 4 }}
          className="sidebar-close-btn">
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href} style={linkStyle(active)} onClick={() => setOpen(false)}>
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <a href="/" target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: 'rgba(245,242,236,0.35)', fontSize: '0.78rem', textDecoration: 'none', marginBottom: 2 }}>
          <ExternalLink size={14} /> View Store
        </a>
        <button onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.5)', fontSize: '0.78rem', textAlign: 'left' }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      <button
        onClick={() => setOpen(true)}
        className="sidebar-hamburger"
        style={{
          display: 'none',
          position: 'fixed', top: 14, left: 14, zIndex: 200,
          background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#F5F2EC', cursor: 'pointer', padding: '8px 10px', borderRadius: 4,
        }}>
        <Menu size={20} />
      </button>

      {/* ── Overlay (mobile) ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            display: 'none',
            position: 'fixed', inset: 0, zIndex: 149,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
          }}
          className="sidebar-overlay"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`admin-sidebar ${open ? 'sidebar-open' : ''}`}
        style={{
          width: 220, minHeight: '100vh',
          background: 'rgba(0,0,0,0.4)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
        }}>
        {sidebarContent}
      </aside>

      <style>{`
        @media (max-width: 767px) {
          .sidebar-hamburger { display: flex !important; }
          .sidebar-overlay   { display: block !important; }
          .sidebar-close-btn { display: flex !important; }
          .admin-sidebar {
            position: fixed !important;
            top: 0; left: 0; bottom: 0;
            z-index: 150;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            width: 240px !important;
            overflow-y: auto;
          }
          .admin-sidebar.sidebar-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )
}
