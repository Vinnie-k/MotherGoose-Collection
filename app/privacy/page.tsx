'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'


export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      body: `We collect information you provide directly, including name, email address, postal address, phone number, and payment information when you place an order. We also collect browsing data such as pages visited, time spent on pages, and items viewed, through cookies and similar technologies. Device information including IP address, browser type, and operating system may also be collected automatically.`,
    },
    {
      title: '2. How We Use Your Information',
      body: `Your information is used to process orders and arrange delivery, send order confirmations and shipping updates, respond to your enquiries, personalise your shopping experience, and send marketing communications (only with your consent). We do not sell, trade, or rent your personal information to third parties.`,
    },
    {
      title: '3. Payment Information',
      body: `All payment transactions are encrypted using SSL technology. We do not store complete credit card information on our servers. Payment processing is handled by PCI-DSS compliant third-party processors. We retain only the last four digits of your card number for reference purposes.`,
    },
    {
      title: '4. Cookies',
      body: `We use essential cookies to maintain your session and shopping cart. Analytics cookies help us understand how visitors interact with our website. Marketing cookies (only with consent) help us show you relevant advertising. You may disable cookies through your browser settings, though this may affect site functionality.`,
    },
    {
      title: '5. Data Retention',
      body: `We retain your personal data for as long as your account is active or as needed to provide services. Order data is retained for 7 years for accounting purposes. You may request deletion of your personal data at any time by contacting us, subject to legal retention requirements.`,
    },
    {
      title: '6. Your Rights',
      body: `You have the right to access the personal data we hold about you, correct inaccurate data, request deletion of your data, object to or restrict processing of your data, and data portability. To exercise any of these rights, please contact us at privacy@mothergoosecollection.com.`,
    },
    {
      title: '7. Third-Party Services',
      body: `We use carefully selected third-party services including Supabase for database hosting, Vercel for website hosting, and payment processors. These providers are contractually bound to protect your data and may only use it to provide services to us.`,
    },
    {
      title: '8. Changes to This Policy',
      body: `We may update this Privacy Policy periodically. We will notify you of significant changes via email or a prominent notice on our website. Continued use of our services after changes constitutes acceptance of the revised policy.`,
    },
    {
      title: '9. Contact',
      body: `For any privacy-related questions or to exercise your rights, contact our Data Protection Officer at privacy@mothergoosecollection.com or write to: Mothergoose Collection, Westlands, Nairobi, Kenya.`,
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
          <h1 className="font-display text-5xl text-ivory">Privacy Policy</h1>
          <div className="w-12 h-px bg-gold mt-3" />
          <p className="text-ivory/30 text-sm mt-4">Last updated: 1 January 2026</p>
        </div>

        <div className="prose-custom space-y-10">
          <p className="text-ivory/50 leading-relaxed">
            Mothergoose Collection (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you visit our website or make a purchase.
          </p>

          {sections.map(({ title, body }) => (
            <div key={title} className="border-t border-white/5 pt-8">
              <h2 className="font-display text-xl text-ivory mb-4">{title}</h2>
              <p className="text-ivory/50 leading-relaxed text-sm">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
