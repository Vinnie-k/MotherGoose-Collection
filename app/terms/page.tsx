'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'


export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      body: 'By accessing or using the Mothergoose Collection website and services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.',
    },
    {
      title: '2. Products and Pricing',
      body: 'All prices are listed in US Dollars (USD) and are subject to change without notice. We reserve the right to limit quantities, refuse orders, and discontinue products at any time. Prices displayed do not include taxes or shipping, which will be calculated at checkout. In the event of a pricing error, we reserve the right to cancel orders placed at the incorrect price.',
    },
    {
      title: '3. Order Acceptance',
      body: 'Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order for any reason. An order is confirmed only upon receipt of our order confirmation email. We may cancel confirmed orders in exceptional circumstances such as stock errors or suspected fraud, in which case you will receive a full refund.',
    },
    {
      title: '4. Payment',
      body: 'We accept major credit and debit cards. All transactions are processed securely. By submitting payment details, you authorise us to charge the order total to your chosen payment method. We use industry-standard encryption to protect payment information.',
    },
    {
      title: '5. Intellectual Property',
      body: 'All content on this website — including text, images, graphics, logos, and product descriptions — is the property of Mothergoose Collection or its content suppliers and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without explicit written permission.',
    },
    {
      title: '6. Product Descriptions',
      body: 'We make every effort to display product colours, textures, and details as accurately as possible. However, we cannot guarantee that your screen accurately reflects actual product colours. Product descriptions are provided for guidance only and we do not warrant that they are complete or error-free.',
    },
    {
      title: '7. Limitation of Liability',
      body: 'To the maximum extent permitted by law, Mothergoose Collection shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services or purchase of our products. Our liability is limited to the value of the order in question.',
    },
    {
      title: '8. Governing Law',
      body: 'These terms are governed by the laws of Kenya. Any disputes arising from these terms or your use of our services shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya.',
    },
    {
      title: '9. Changes to Terms',
      body: 'We reserve the right to modify these Terms of Service at any time. Changes will be effective upon posting to the website. Your continued use of our services after changes are posted constitutes acceptance of the revised terms.',
    },
  ]

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="flex items-center gap-2 text-ivory/40 hover:text-gold transition-colors text-sm mb-8">
          <ArrowLeft size={14} /> Home
        </Link>
        <div className="mb-12">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-2">Legal</p>
          <h1 className="font-display text-5xl text-ivory">Terms of Service</h1>
          <div className="w-12 h-px bg-gold mt-3" />
          <p className="text-ivory/30 text-sm mt-4">Last updated: 1 January 2026</p>
        </div>

        <div className="space-y-10">
          <p className="text-ivory/50 leading-relaxed">
            These Terms of Service govern your use of the Mothergoose Collection website and the purchase of products from us. Please read them carefully before placing an order.
          </p>

          {sections.map(({ title, body }) => (
            <div key={title} className="border-t border-white/5 pt-8">
              <h2 className="font-display text-xl text-ivory mb-4">{title}</h2>
              <p className="text-ivory/50 leading-relaxed text-sm">{body}</p>
            </div>
          ))}

          <div className="border-t border-white/5 pt-8">
            <p className="text-ivory/30 text-sm">
              Questions about our Terms of Service? Contact us at{' '}
              <a href="mailto:legal@mothergoosecollection.com" className="text-gold hover:text-gold-light transition-colors">
                legal@mothergoosecollection.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
