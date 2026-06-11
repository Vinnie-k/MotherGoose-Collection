import { NextRequest, NextResponse } from 'next/server'

interface StatusEmailPayload {
  to: string
  firstName: string
  lastName?: string
  orderNumber: string
  status: 'confirmed' | 'dispatched' | 'delivered'
  items: { name: string; quantity: number; price: number; color?: string; size?: string }[]
  total: number
  deliveryOption?: string
}

const DELIVERY_LABELS: Record<string, string> = {
  standard: 'Standard Delivery (3–5 business days)',
  express:  'Express Delivery (1–2 business days)',
  same_day: 'Same-Day Delivery',
}

function buildStatusEmailHtml(data: StatusEmailPayload): string {
  const statusConfig = {
    confirmed: {
      title:     'Order Confirmation',
      heading:   'Your Order Has Been Confirmed',
      message:   `Dear ${data.firstName},\n\nThank you for your order with Mothergoose Collection. We are pleased to confirm that your order has been received and is currently being prepared for dispatch.\n\nYou will receive a further notification once your order has been dispatched.`,
      accentColor: '#C9A84C',
      badgeLabel:  'ORDER CONFIRMED',
    },

    delivered: {
      title:     'Order Delivered',
      heading:   'Your Order Has Been Delivered',
      message:   `Dear ${data.firstName},\n\nWe trust that your order has been delivered to your satisfaction. Thank you for choosing Mothergoose Collection.\n\nShould you have any concerns regarding your order, please contact our customer service team and we will be happy to assist you.`,
      accentColor: '#C9A84C',
      badgeLabel:  'DELIVERED',
    },
    dispatched: {
      title:     'Your Order Has Been Dispatched',
      heading:   'Your Order Is On Its Way',
      message:   `Dear ${data.firstName},\n\nWe are pleased to inform you that your order has been dispatched and is currently en route to your delivery address. Our courier partner will contact you to arrange delivery.\n\nShould you have any questions regarding the delivery of your order, please do not hesitate to contact us.`,
      accentColor: '#C9A84C',
      badgeLabel:  'DISPATCHED',
    },
  }

  const cfg = statusConfig[data.status]

  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding:11px 0;border-bottom:1px solid #1e1e2e;color:#a09890;font-size:13px;line-height:1.5;">
        ${item.name}${item.color ? `, ${item.color}` : ''}${item.size ? `, Size ${item.size}` : ''}&nbsp;&nbsp;(Qty: ${item.quantity})
      </td>
      <td style="padding:11px 0;border-bottom:1px solid #1e1e2e;color:#e0d4b0;font-size:13px;text-align:right;white-space:nowrap;">
        Ksh ${(item.price * item.quantity).toLocaleString('en-KE')}
      </td>
    </tr>`).join('')

  const messageParagraphs = cfg.message
    .split('\n\n')
    .filter(Boolean)
    .map(p => `<p style="color:#a09890;font-size:14px;line-height:1.8;margin:0 0 14px;">${p}</p>`)
    .join('')

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mothergoosecollection254.co.ke').replace(/\/$/, '')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${cfg.title}</title>
</head>
<body style="margin:0;padding:0;background:#08080f;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08080f;padding:48px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0c0c18;border:1px solid #1e1e2e;border-bottom:2px solid ${cfg.accentColor};padding:44px 48px 36px;text-align:center;">
            <p style="color:#C9A84C;font-size:10px;letter-spacing:7px;text-transform:uppercase;margin:0 0 20px;font-family:Arial,sans-serif;">
              MOTHERGOOSE COLLECTION
            </p>
            <div style="width:32px;height:1px;background:#C9A84C;margin:0 auto 20px;"></div>
            <h1 style="color:#F5F2EC;font-size:24px;margin:0;font-weight:400;letter-spacing:1px;">
              ${cfg.heading}
            </h1>
          </td>
        </tr>

        <!-- Status badge -->
        <tr>
          <td style="background:#0c0c18;border-left:1px solid #1e1e2e;border-right:1px solid #1e1e2e;padding:24px 48px;text-align:center;">
            <span style="display:inline-block;border:1px solid ${cfg.accentColor};color:${cfg.accentColor};font-size:10px;font-weight:700;letter-spacing:5px;padding:8px 28px;font-family:Arial,sans-serif;">
              ${cfg.badgeLabel}
            </span>
            <p style="color:#555566;font-size:13px;margin:14px 0 0;font-family:Arial,sans-serif;">
              Order Reference:&nbsp;&nbsp;<strong style="color:#C9A84C;letter-spacing:1px;">${data.orderNumber}</strong>
            </p>
          </td>
        </tr>

        <!-- Message body -->
        <tr>
          <td style="background:#0c0c18;border-left:1px solid #1e1e2e;border-right:1px solid #1e1e2e;padding:8px 48px 32px;">
            <div style="border-top:1px solid #1e1e2e;padding-top:28px;">
              ${messageParagraphs}
            </div>
          </td>
        </tr>

        <!-- Order summary -->
        <tr>
          <td style="background:#0c0c18;border-left:1px solid #1e1e2e;border-right:1px solid #1e1e2e;border-bottom:1px solid #1e1e2e;padding:0 48px 48px;">
            <p style="color:#C9A84C;font-size:10px;letter-spacing:5px;text-transform:uppercase;margin:0 0 16px;font-family:Arial,sans-serif;border-top:1px solid #1e1e2e;padding-top:28px;">
              ORDER SUMMARY
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${itemRows}
              ${data.deliveryOption ? `
              <tr>
                <td style="padding:11px 0;border-bottom:1px solid #1e1e2e;color:#a09890;font-size:13px;">Delivery</td>
                <td style="padding:11px 0;border-bottom:1px solid #1e1e2e;color:#e0d4b0;font-size:13px;text-align:right;">${DELIVERY_LABELS[data.deliveryOption] || data.deliveryOption}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:20px 0 0;color:#F5F2EC;font-size:14px;font-weight:700;font-family:Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">Total</td>
                <td style="padding:20px 0 0;color:#C9A84C;font-size:20px;font-weight:700;text-align:right;font-family:Arial,sans-serif;">
                  Ksh ${Math.round(data.total).toLocaleString('en-KE')}
                </td>
              </tr>
            </table>

            <div style="border-top:1px solid #1e1e2e;margin-top:36px;padding-top:36px;text-align:center;">
              <a href="${siteUrl}/track-order"
                style="display:inline-block;background:#C9A84C;color:#08080f;text-decoration:none;padding:14px 40px;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;font-family:Arial,sans-serif;">
                TRACK YOUR ORDER
              </a>
              <p style="margin:24px 0 0;">
                <a href="https://wa.me/254759490008"
                  style="color:#888;font-size:12px;text-decoration:none;font-family:Arial,sans-serif;letter-spacing:1px;">
                  Contact Us via WhatsApp: +254 759 490 008
                </a>
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:32px 48px;text-align:center;border-top:0;">
            <p style="color:#2a2a3a;font-size:11px;margin:0;font-family:Arial,sans-serif;letter-spacing:1px;">
              MOTHERGOOSE COLLECTION &nbsp;&middot;&nbsp; NAIROBI, KENYA
            </p>
            <p style="color:#2a2a3a;font-size:11px;margin:8px 0 0;font-family:Arial,sans-serif;">
              <a href="mailto:mothergoosecollection254@gmail.com" style="color:#333346;text-decoration:none;">mothergoosecollection254@gmail.com</a>
              &nbsp;&middot;&nbsp;
              <a href="https://wa.me/254759490008" style="color:#333346;text-decoration:none;">+254 759 490 008</a>
            </p>
            <p style="color:#222230;font-size:10px;margin:12px 0 0;font-family:Arial,sans-serif;">
              &copy; ${new Date().getFullYear()} Mothergoose Collection. All rights reserved.
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

    if (!['confirmed', 'dispatched', 'delivered'].includes(body.status)) {
      return NextResponse.json({ success: true, skipped: true })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey || resendKey.includes('your_resend')) {
      console.warn('[Status Email] Dev mode — would send', body.status, 'to', body.to)
      return NextResponse.json({ success: true, mode: 'dev' })
    }

    const { Resend } = await import('resend')
    const resend = new Resend(resendKey)

    const subjects: Record<string, string> = {
      confirmed:  `Order Confirmation — ${body.orderNumber} | Mothergoose Collection`,
      delivered:  `Order Delivered — ${body.orderNumber} | Mothergoose Collection`,
      dispatched: `Your Order Has Been Dispatched — ${body.orderNumber} | Mothergoose Collection`,
    }

    const { data, error } = await resend.emails.send({
      from:    'Mothergoose Collection <orders@mothergoosecollection254.co.ke>',
      replyTo: 'mothergoosecollection254@gmail.com',
      to:      body.to,
      subject: subjects[body.status],
      html:    buildStatusEmailHtml(body),
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
