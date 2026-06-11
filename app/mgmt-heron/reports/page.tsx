'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { formatPrice } from '@/lib/format'
import type { Order } from '@/lib/order-store'

interface ReportData {
  orderNo: string
  name: string
  phone: string
  city: string
  total: number
  status: string
  date: string
  items: number
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/mgmt-heron/reports', { credentials: 'include' })
      if (!res.ok) {
        setError('Failed to load reports. Please try again.')
        return
      }
      const data = await res.json()
      setReports(data.reports || [])
    } catch {
      setError('Failed to load reports.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const exportReport = async (format: 'excel' | 'pdf') => {
    setExporting(true)
    setExportSuccess(false)
    try {
      const res = await fetch(`/api/mgmt-heron/reports?format=${format}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders-report-${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'csv' : 'pdf'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch {
      setError('Failed to export report.')
    } finally {
      setExporting(false)
    }
  }

  const totalRevenue = reports.reduce((sum, r) => sum + r.total, 0)
  const totalOrders = reports.length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0F' }}>
      <AdminSidebar />

      <div style={{ flex: 1, padding: '32px', maxWidth: '1200px' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ color: '#F5F2EC', fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>
            Sales & Orders Report
          </h1>
          <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.875rem' }}>
            View and export all order information
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', marginBottom: 24 }}>
            <AlertCircle size={18} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
            <p style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}
        {exportSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', marginBottom: 24 }}>
            <CheckCircle size={18} style={{ color: '#4ade80' }} />
            <p style={{ color: '#4ade80', fontSize: '0.875rem' }}>Report exported successfully!</p>
          </div>
        )}

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: 20, borderRadius: 8 }}>
            <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Total Orders</p>
            <p style={{ color: '#C9A84C', fontSize: '2rem', fontWeight: 700 }}>{totalOrders}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: 20, borderRadius: 8 }}>
            <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Total Revenue</p>
            <p style={{ color: '#4ade80', fontSize: '2rem', fontWeight: 700 }}>{formatPrice(totalRevenue)}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: 20, borderRadius: 8 }}>
            <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Average Order Value</p>
            <p style={{ color: '#60a5fa', fontSize: '2rem', fontWeight: 700 }}>
              {totalOrders > 0 ? formatPrice(totalRevenue / totalOrders) : formatPrice(0)}
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <button
            onClick={() => exportReport('excel')}
            disabled={exporting || loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              background: '#C9A84C',
              color: '#0A0A0F',
              border: 'none',
              borderRadius: 4,
              cursor: exporting || loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              opacity: exporting || loading ? 0.5 : 1,
            }}
          >
            <Download size={16} /> Export as Excel (CSV)
          </button>
          <button
            onClick={() => exportReport('pdf')}
            disabled={exporting || loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              background: 'rgba(255,255,255,0.08)',
              color: '#F5F2EC',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 4,
              cursor: exporting || loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              opacity: exporting || loading ? 0.5 : 1,
            }}
          >
            <Download size={16} /> Export as PDF
          </button>
          <button
            onClick={loadReports}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              background: 'rgba(255,255,255,0.02)',
              color: 'rgba(245,242,236,0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(245,242,236,0.3)' }}>
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(245,242,236,0.3)' }}>
            No orders yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(245,242,236,0.5)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Order No</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(245,242,236,0.5)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(245,242,236,0.5)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Phone</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(245,242,236,0.5)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>City</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(245,242,236,0.5)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Items</th>
                  <th style={{ padding: '16px', textAlign: 'right', color: 'rgba(245,242,236,0.5)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(245,242,236,0.5)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(245,242,236,0.5)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '16px', color: '#C9A84C', fontSize: '0.875rem', fontWeight: 600 }}>{report.orderNo}</td>
                    <td style={{ padding: '16px', color: '#F5F2EC', fontSize: '0.875rem' }}>{report.name}</td>
                    <td style={{ padding: '16px', color: 'rgba(245,242,236,0.7)', fontSize: '0.875rem' }}>{report.phone}</td>
                    <td style={{ padding: '16px', color: 'rgba(245,242,236,0.7)', fontSize: '0.875rem' }}>{report.city}</td>
                    <td style={{ padding: '16px', color: 'rgba(245,242,236,0.7)', fontSize: '0.875rem' }}>{report.items}</td>
                    <td style={{ padding: '16px', textAlign: 'right', color: '#4ade80', fontSize: '0.875rem', fontWeight: 600 }}>{formatPrice(report.total)}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: getStatusBackground(report.status),
                        color: getStatusColor(report.status),
                      }}>
                        {report.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'rgba(245,242,236,0.5)', fontSize: '0.875rem' }}>{report.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function getStatusBackground(status: string): string {
  const colors: Record<string, string> = {
    confirmed: 'rgba(96,165,250,0.15)',
    pending: 'rgba(251,191,36,0.15)',
    processing: 'rgba(167,139,250,0.15)',
    dispatched: 'rgba(52,211,153,0.15)',
    delivered: 'rgba(74,222,128,0.15)',
    cancelled: 'rgba(248,113,113,0.15)',
  }
  return colors[status] || 'rgba(255,255,255,0.08)'
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    confirmed: '#60a5fa',
    pending: '#fbbf24',
    processing: '#a78bfa',
    dispatched: '#34d399',
    delivered: '#4ade80',
    cancelled: '#f87171',
  }
  return colors[status] || 'rgba(245,242,236,0.6)'
}
