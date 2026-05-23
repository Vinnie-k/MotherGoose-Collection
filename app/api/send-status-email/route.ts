import { NextRequest, NextResponse } from 'next/server'

interface StatusEmailPayload {
  to: string
  firstName: string
  orderNumber: string
  status: 'dispatched' | 'delivered' | 'cancelled'
  items: { name: string; quantity: number; price: number }[]
  total: number
  deliveryOption?: string
}

const DELIVERY_LABELS: Record<string, string> = {
  standard: 'Standard Delivery (3–5 business days)',
  express: 'Express Delivery (1–2 business days)',
  same_day: 'Same-Day Delivery',
}

function buildStatusEmailHtml(data: StatusEmailPayload): string {
  const statusConfig = {
    dispatched: {
      emoji: '🚚',
      title: 'Your Order is On Its Way!',
      subtitle: `Great news, ${data.firstName} — your order has been dispatched.`,
      color: '#34d399',
      badge: 'DISPATCHED',
      message: 'Your package is with our courier partner. You will receive an SMS update with tracking information shortly.',
    },
    delivered: {
      emoji: '✅',
      title: 'Order Delivered!',
      subtitle: `We hope you love it, ${data.firstName}! Your order has been delivered.`,
      color: '#4ade80',
      badge: 'DELIVERED',
      message: "Thank you for shopping with Mothergoose Collection. If you have any questions about your order, don't hesitate to reach out.",
    },
    cancelled: {
      emoji: '❌',
      title: 'Order Cancelled',
      subtitle: `Hi ${data.firstName}, your order has been cancelled.`,
      color: '#f87171',
      badge: 'CANCELLED',
      message: 'If you did not request this cancellation or have any questions, please contact us immediately via WhatsApp or email.',
    },
  }

  const cfg = statusConfig[data.status]
  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1a1a2e;color:#b0a99a;font-size:14px;">${item.name} x ${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #1a1a2e;color:#e8d5a3;font-size:14px;text-align:right;">Ksh ${(item.price * item.quantity).toLocaleString('en-KE')}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <tr>
          <td style="background:#0d0d1a;border:1px solid #1a1a2e;padding:40px;text-align:center;border-bottom:2px solid ${cfg.color};">
            <p style="color:#c9a84c;font-size:11px;letter-spacing:6px;text-transform:uppercase;margin:0 0 8px;">Mothergoose Collection</p>
            <div style="font-size:40px;margin:8px 0;">${cfg.emoji}</div>
            <h1 style="color:#f5f2ec;font-size:26px;margin:0;font-weight:700;">${cfg.title}</h1>
            <p style="color:#6b6460;font-size:13px;margin:12px 0 0;">${cfg.subtitle}</p>
          </td>
        </tr>

        <tr>
          <td style="background:#0d0d1a;border-left:1px solid #1a1a2e;border-right:1px solid #1a1a2e;padding:20px 40px;text-align:center;">
            <span style="display:inline-block;background:${cfg.color}22;border:1px solid ${cfg.color}55;color:${cfg.color};font-size:11px;font-weight:700;letter-spacing:4px;padding:8px 24px;text-transform:uppercase;">${cfg.badge}</span>
            <p style="color:#6b6460;font-size:13px;margin:16px 0 0;">Order <strong style="color:#c9a84c;">#${data.orderNumber}</strong></p>
          </td>
        </tr>

        <tr>
          <td style="background:#0d0d1a;border-left:1px solid #1a1a2e;border-right:1px solid #1a1a2e;padding:0 40px 24px;">
            <div style="background:#111120;border-left:3px solid ${cfg.color};padding:16px 20px;">
              <p style="color:#b0a99a;font-size:13px;margin:0;line-height:1.7;">${cfg.message}</p>
            </div>
          </td>
        </tr>

        <tr>
          <td style="background:#0d0d1a;border:1px solid #1a1a2e;border-top:0;padding:0 40px 40px;">
            <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:24px 0 16px;">Order Summary</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${itemRows}
              ${data.deliveryOption ? `<tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a2e;color:#b0a99a;font-size:14px;">Delivery</td>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a2e;color:#e8d5a3;font-size:14px;text-align:right;">${DELIVERY_LABELS[data.deliveryOption] || data.deliveryOption}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:16px 0 0;color:#f5f2ec;font-size:16px;font-weight:700;">Total</td>
                <td style="padding:16px 0 0;color:#c9a84c;font-size:20px;font-weight:700;text-align:right;">Ksh ${Math.round(data.total).toLocaleString('en-KE')}</td>
              </tr>
            </table>
            <hr style="border:0;border-top:1px solid #1a1a2e;margin:30px 0;">
            <div style="text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://mothergoosecollection.com'}/track-order" style="display:inline-block;background:#c9a84c;color:#0a0a0f;text-decoration:none;padding:14px 36px;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;">Track My Order</a>
              <br>
              <a href="https://wa.me/254759490008" style="display:inline-block;background:#25D36622;border:1px solid #25D36644;color:#25D366;text-decoration:none;padding:12px 28px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">WhatsApp Us</a>
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:24px;text-align:center;">
            <p style="color:#2a2a3a;font-size:12px;margin:0;">© ${new Date().getFullYear()} Mothergoose Collection · Nairobi, Kenya</p>
            <p style="color:#2a2a3a;font-size:11px;margin:6px 0 0;">
              <a href="mailto:mothergoosecollection1@gmail.com" style="color:#3a3a4a;text-decoration:none;">mothergoosecollection1@gmail.com</a> &nbsp;·&nbsp;
              <a href="https://wa.me/254759490008" style="color:#3a3a4a;text-decoration:none;">+254 759 490 008</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    const body: StatusEmailPayload = await request.json()

    if (!body.to || !body.firstName || !body.orderNumber || !body.status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['dispatched', 'delivered', 'cancelled'].includes(body.status)) {
      return NextResponse.json({ success: true, skipped: true })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey || resendKey === 'your_resend_api_key') {
      console.warn('[Status Email] Dev mode — would send', body.status, 'to', body.to)
      return NextResponse.json({ success: true, mode: 'dev' })
    }

    const { Resend } = await import('resend')
    const resend = new Resend(resendKey)

    const subjects: Record<string, string> = {
      dispatched: `Your order #${body.orderNumber} is on its way! 🚚`,
      delivered: `Your order #${body.orderNumber} has been delivered ✅`,
      cancelled: `Order #${body.orderNumber} — Cancellation Notice`,
    }

    const { data, error } = await resend.emails.send({
      from: 'Mothergoose Collection <orders@mothergoosecollection.com>',
      to: body.to,
      subject: subjects[body.status],
      html: buildStatusEmailHtml(body),
    })

    if (error) {
      console.error('[Resend Status Email]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('[Status Email API]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
