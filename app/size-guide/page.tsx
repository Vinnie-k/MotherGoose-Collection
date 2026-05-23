'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const SUIT_SIZES = [
  { size: '36R', chest: '36"', waist: '30"', seat: '38"', height: '5\'9"–5\'11"' },
  { size: '38R', chest: '38"', waist: '32"', seat: '40"', height: '5\'9"–5\'11"' },
  { size: '40R', chest: '40"', waist: '34"', seat: '42"', height: '5\'9"–6\'0"' },
  { size: '42R', chest: '42"', waist: '36"', seat: '44"', height: '5\'10"–6\'1"' },
  { size: '44R', chest: '44"', waist: '38"', seat: '46"', height: '5\'11"–6\'2"' },
  { size: '46R', chest: '46"', waist: '40"', seat: '48"', height: '6\'0"–6\'3"' },
]

const SHIRT_SIZES = [
  { size: 'XS', chest: '34–36"', neck: '14–14.5"', sleeve: '31–32"' },
  { size: 'S', chest: '36–38"', neck: '14.5–15"', sleeve: '32–33"' },
  { size: 'M', chest: '38–40"', neck: '15–15.5"', sleeve: '33–34"' },
  { size: 'L', chest: '40–42"', neck: '15.5–16"', sleeve: '34–35"' },
  { size: 'XL', chest: '42–44"', neck: '16–16.5"', sleeve: '35–36"' },
  { size: 'XXL', chest: '44–46"', neck: '16.5–17"', sleeve: '36–37"' },
]

const SHOE_SIZES = [
  { uk: '6', eu: '40', us: '7', cm: '25.0' },
  { uk: '7', eu: '41', us: '8', cm: '26.0' },
  { uk: '8', eu: '42', us: '9', cm: '26.7' },
  { uk: '9', eu: '43', us: '10', cm: '27.5' },
  { uk: '10', eu: '44', us: '11', cm: '28.3' },
  { uk: '11', eu: '45', us: '12', cm: '29.0' },
  { uk: '12', eu: '46', us: '13', cm: '29.8' },
]

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {headers.map((h) => (
              <th key={h} className="text-left py-3 px-4 text-gold text-xs tracking-widest uppercase font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`py-3 px-4 ${j === 0 ? 'text-ivory font-semibold' : 'text-ivory/60'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function SizeGuidePage() {
  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/products" className="flex items-center gap-2 text-ivory/40 hover:text-gold transition-colors text-sm mb-8">
          <ArrowLeft size={14} /> Back to Products
        </Link>

        <div className="mb-12">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-2">Reference</p>
          <h1 className="font-display text-5xl text-ivory">Size Guide</h1>
          <div className="w-12 h-px bg-gold mt-3" />
          <p className="text-ivory/40 mt-4 max-w-2xl leading-relaxed">
            All measurements are given in inches unless otherwise stated. If you&apos;re between sizes, we recommend sizing up. For tailored items, please refer to your actual body measurements rather than your usual clothing size.
          </p>
        </div>

        {/* How to measure */}
        <div className="bg-white/[0.03] border border-white/5 p-6 mb-12">
          <h2 className="font-display text-2xl text-ivory mb-5">How to Measure</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Chest',
                desc: 'Measure around the fullest part of your chest, keeping the tape horizontal. Breathe normally — don\'t pull the tape tight.',
              },
              {
                title: 'Waist',
                desc: 'Measure around your natural waist — the narrowest part of your torso, typically about an inch above your belly button.',
              },
              {
                title: 'Inside Leg / Inseam',
                desc: 'Measure from the top of the inner thigh to the bottom of the ankle. Stand with feet slightly apart.',
              },
            ].map(({ title, desc }) => (
              <div key={title}>
                <h3 className="text-ivory font-medium text-sm mb-2">{title}</h3>
                <p className="text-ivory/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-14">
          {/* Suits */}
          <section>
            <h2 className="font-display text-3xl text-ivory mb-2">Suits & Blazers</h2>
            <p className="text-ivory/40 text-sm mb-6">
              Our suits are available in Regular (R) and Long (L) fits. R is recommended for heights 5&apos;8&quot;&ndash;6&apos;0&quot;, L for 6&apos;1&quot; and above.
            </p>
            <Table
              headers={['Size', 'Chest', 'Waist', 'Seat', 'Ideal Height']}
              rows={SUIT_SIZES.map((s) => [s.size, s.chest, s.waist, s.seat, s.height])}
            />
          </section>

          {/* Shirts */}
          <section>
            <h2 className="font-display text-3xl text-ivory mb-2">Shirts & Knitwear</h2>
            <p className="text-ivory/40 text-sm mb-6">
              Our shirts are slim-fit by default. If you prefer a more relaxed fit, size up. Knitwear follows the same size chart.
            </p>
            <Table
              headers={['Size', 'Chest', 'Neck', 'Sleeve']}
              rows={SHIRT_SIZES.map((s) => [s.size, s.chest, s.neck, s.sleeve])}
            />
          </section>

          {/* Shoes */}
          <section>
            <h2 className="font-display text-3xl text-ivory mb-2">Shoes & Boots</h2>
            <p className="text-ivory/40 text-sm mb-6">
              Leather shoes will mould to your feet over time. If you&apos;re between sizes, opt for the larger size for comfort. Loafers typically fit true to size.
            </p>
            <Table
              headers={['UK', 'EU', 'US', 'Length (cm)']}
              rows={SHOE_SIZES.map((s) => [s.uk, s.eu, s.us, s.cm])}
            />
          </section>

          {/* Tips */}
          <section className="bg-white/[0.02] border border-white/5 p-8">
            <h2 className="font-display text-2xl text-ivory mb-5">Fit Tips</h2>
            <ul className="space-y-3 text-ivory/50 text-sm leading-relaxed">
              {[
                'Suit shoulders should sit flat — no overhang or pulling. This is the hardest seam to alter.',
                'Jacket sleeves should show about ½ inch of shirt cuff.',
                'Trouser break should just touch the top of your shoe — a slight break is classic.',
                'Dress shirt collars should allow two fingers to fit comfortably around the neck.',
                'Leather shoes may feel snug initially — they will stretch to the shape of your foot after a few wears.',
              ].map((tip) => (
                <li key={tip} className="flex gap-3">
                  <span className="text-gold mt-0.5 flex-shrink-0">—</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-12 text-center">
          <p className="text-ivory/40 text-sm mb-4">Still unsure? Our styling team is here to help.</p>
          <Link href="/contact" className="btn-outline inline-flex items-center gap-2">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
