import Link from 'next/link'
import { ArrowLeft, Truck, Clock } from 'lucide-react'

const DELIVERY_OPTIONS = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    time: '2–3 Business Days',
    price: 'Free on orders over Ksh 5,000. Ksh 500 otherwise.',
    desc: 'Tracked delivery via our courier partners. You will receive an email update once your order is dispatched.',
  },
  {
    id: 'same_day',
    name: 'Same-Day Delivery',
    time: 'Same Day (Nairobi only)',
    price: 'Ksh 500 flat rate',
    desc: 'Order before 12 PM for same-day delivery within Nairobi. Available Monday to Saturday.',
  },
]

export default function ShippingPage() {
  return (
    <div style={{ paddingTop: 96, minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <Link href="/products" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(245,242,236,0.4)', textDecoration: 'none', fontSize: '0.8rem', marginBottom: 32 }}>
          <ArrowLeft size={14} /> Back
        </Link>

        <div style={{ marginBottom: 40 }}>
          <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8 }}>Delivery</p>
          <h1 className="font-display" style={{ color: '#F5F2EC', fontSize: '3rem' }}>Shipping Information</h1>
          <div style={{ width: 48, height: 1, background: '#C9A84C', marginTop: 12 }} />
          <p style={{ color: 'rgba(245,242,236,0.45)', marginTop: 16, lineHeight: 1.8 }}>
            We want your order to arrive quickly and in perfect condition. Here&apos;s everything you need to know about our delivery service.
          </p>
        </div>

        {/* Delivery Options — informational only */}
        <div style={{ marginBottom: 40 }}>
          <h2 className="font-display" style={{ color: '#F5F2EC', fontSize: '1.5rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Truck size={20} style={{ color: '#C9A84C' }} /> Delivery Options
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {DELIVERY_OPTIONS.map((opt) => (
              <div key={opt.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 16 }}>
                  <h3 style={{ color: '#F5F2EC', fontSize: '0.9rem', fontWeight: 600 }}>{opt.name}</h3>
                  <span style={{ color: '#C9A84C', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0 }}>{opt.price}</span>
                </div>
                <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.75rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={12} /> {opt.time}
                </p>
                <p style={{ color: 'rgba(245,242,236,0.45)', fontSize: '0.8rem', lineHeight: 1.6 }}>{opt.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Important notes */}
        <div style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)', padding: 20, marginBottom: 40 }}>
          <h3 style={{ color: '#C9A84C', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Important Notes</h3>
          <ul style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.85rem', lineHeight: 2, listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              'Delivery times start from dispatch, not from when you place your order.',
              'Orders placed on weekends or public holidays are processed the next business day.',
              'We currently deliver within Kenya only.',
              'You will receive an SMS and email update when your order is dispatched.',
              'For Cash on Delivery orders, please have the exact amount ready for the rider.',
            ].map((note) => (
              <li key={note} style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: '#C9A84C', flexShrink: 0 }}>—</span> {note}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact CTA */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: 28, textAlign: 'center' }}>
          <p className="font-display" style={{ color: '#F5F2EC', fontSize: '1.25rem', marginBottom: 8 }}>Delivery question?</p>
          <p style={{ color: 'rgba(245,242,236,0.4)', fontSize: '0.875rem', marginBottom: 20 }}>
            Our team is ready to help Monday to Saturday, 9am – 6pm.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" className="btn-primary">Contact Us</Link>
            <Link href="/track-order" className="btn-outline">Track My Order</Link>
          </div>
        </div>

        <style>{`
          .back-link:hover { color: #C9A84C !important; }
        `}</style>
      </div>
    </div>
  )
}
