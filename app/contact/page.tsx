'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1200)
  }

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero bar */}
      <div className="bg-white/[0.02] border-b border-white/5 py-16 mb-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">Get in Touch</p>
          <h1 className="font-display text-5xl md:text-6xl text-ivory">Contact Us</h1>
          <p className="text-ivory/40 mt-4 max-w-lg leading-relaxed">
            Our client advisors are available to assist with sizing, styling advice, order queries and anything else.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Info */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="font-display text-2xl text-ivory mb-6">Our Details</h2>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: 'Email', value: 'mothergoosecollection1@gmail.com', href: 'mailto:mothergoosecollection1@gmail.com' },
                  { icon: Phone, label: 'Phone', value: '+254 759 490 008', href: 'tel:+254759490008' },
                  { icon: MapPin, label: 'Address', value: 'Westlands, Nairobi, Kenya', href: '#' },
                  { icon: Clock, label: 'Hours', value: 'Mon–Sat: 9am – 6pm EAT', href: null },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={16} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-ivory/30 text-xs tracking-widest uppercase mb-1">{label}</p>
                      {href ? (
                        <a href={href} className="text-ivory/70 hover:text-gold transition-colors text-sm">
                          {value}
                        </a>
                      ) : (
                        <p className="text-ivory/70 text-sm">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display text-xl text-ivory mb-4">FAQs</h3>
              <div className="space-y-4">
                {[
                  { q: 'How long does delivery take?', a: 'Standard 5–7 working days. Express 2–3 days. Next day available on request.' },
                  { q: 'Can I return or exchange?', a: 'Yes — unworn items in original packaging within 30 days for a full refund or exchange.' },
                  { q: 'Do you offer bespoke tailoring?', a: 'We work with select partner tailors. Contact us to discuss your requirements.' },
                ].map(({ q, a }) => (
                  <details key={q} className="group border-b border-white/5 pb-4">
                    <summary className="text-ivory/70 text-sm cursor-pointer hover:text-gold transition-colors list-none flex justify-between items-center">
                      {q}
                      <span className="text-gold text-lg group-open:rotate-45 transition-transform duration-200 ml-4 flex-shrink-0">+</span>
                    </summary>
                    <p className="text-ivory/40 text-sm mt-3 leading-relaxed">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-20">
                <CheckCircle size={48} className="text-green-400" />
                <h2 className="font-display text-3xl text-ivory">Message Sent!</h2>
                <p className="text-ivory/50 max-w-sm">
                  Thank you for reaching out. We&apos;ll get back to you within one business day.
                </p>
                <button onClick={() => setSent(false)} className="btn-outline mt-2">
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-ivory/50 tracking-widest uppercase block mb-2">Your Name</label>
                    <input
                      required type="text" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      className="input-dark"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ivory/50 tracking-widest uppercase block mb-2">Email</label>
                    <input
                      required type="email" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="john@example.com"
                      className="input-dark"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-ivory/50 tracking-widest uppercase block mb-2">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input-dark"
                    required
                  >
                    <option value="" className="bg-obsidian">Select a subject…</option>
                    {['Order Enquiry', 'Returns & Exchanges', 'Sizing & Styling', 'Product Availability', 'Bespoke Tailoring', 'Other'].map((s) => (
                      <option key={s} value={s} className="bg-obsidian">{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-ivory/50 tracking-widest uppercase block mb-2">Message</label>
                  <textarea
                    required value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help you?"
                    rows={6}
                    className="input-dark resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-obsidian/40 border-t-obsidian rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
