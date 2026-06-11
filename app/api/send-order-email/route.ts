import { NextRequest, NextResponse } from 'next/server'

interface OrderItem {
  name: string
  quantity: number
  price: number
  color?: string
  size?: string
}

interface OrderEmailPayload {
  to: string
  firstName: string
  lastName?: string
  orderNumber?: string
  orderItems: OrderItem[]
  total: number
  paymentMethod: string
  address: string
  city: string
}

function buildEmailHtml(data: OrderEmailPayload): string {
  const itemRows = data.orderItems.map(item => `
    <tr>
      <td style="padding:11px 0;border-bottom:1px solid #1e1e2e;color:#a09890;font-size:13px;line-height:1.5;">
        ${item.name}${item.color ? `, ${item.color}` : ''}${item.size ? `, Size ${item.size}` : ''}&nbsp;&nbsp;(Qty: ${item.quantity})
      </td>
      <td style="padding:11px 0;border-bottom:1px solid #1e1e2e;color:#e0d4b0;font-size:13px;text-align:right;white-space:nowrap;">
        Ksh ${(item.price * item.quantity).toLocaleString('en-KE')}
      </td>
    </tr>`).join('')

  const methodLabel: Record<string, string> = {
    cod:       'Cash on Delivery',
    whatsapp:  'WhatsApp Order',
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mothergoosecollection254.co.ke').replace(/\/$/, '')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Order Confirmation — Mothergoose Collection</title>
</head>
<body style="margin:0;padding:0;background:#08080f;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08080f;padding:48px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0c0c18;border:1px solid #1e1e2e;border-bottom:2px solid #C9A84C;padding:44px 48px 36px;text-align:center;">
            <p style="color:#C9A84C;font-size:10px;letter-spacing:7px;text-transform:uppercase;margin:0 0 20px;font-family:Arial,sans-serif;">
              MOTHERGOOSE COLLECTION
            </p>
            <div style="width:32px;height:1px;background:#C9A84C;margin:0 auto 20px;"></div>
            <h1 style="color:#F5F2EC;font-size:24px;margin:0;font-weight:400;letter-spacing:1px;">
              Order Confirmation
            </h1>
          </td>
        </tr>

        <!-- Status badge -->
        <tr>
          <td style="background:#0c0c18;border-left:1px solid #1e1e2e;border-right:1px solid #1e1e2e;padding:24px 48px;text-align:center;">
            <span style="display:inline-block;border:1px solid #C9A84C;color:#C9A84C;font-size:10px;font-weight:700;letter-spacing:5px;padding:8px 28px;font-family:Arial,sans-serif;">
              ORDER RECEIVED
            </span>
            ${data.orderNumber ? `
            <p style="color:#555566;font-size:13px;margin:14px 0 0;font-family:Arial,sans-serif;">
              Order Reference:&nbsp;&nbsp;<strong style="color:#C9A84C;letter-spacing:1px;">${data.orderNumber}</strong>
            </p>` : ''}
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="background:#0c0c18;border-left:1px solid #1e1e2e;border-right:1px solid #1e1e2e;padding:8px 48px 32px;">
            <div style="border-top:1px solid #1e1e2e;padding-top:28px;">
              <p style="color:#a09890;font-size:14px;line-height:1.8;margin:0 0 14px;">
                Dear ${data.firstName},
              </p>
              <p style="color:#a09890;font-size:14px;line-height:1.8;margin:0 0 14px;">
                Thank you for your order with Mothergoose Collection. We are pleased to confirm that your order has been received and is being processed.
              </p>
              <p style="color:#a09890;font-size:14px;line-height:1.8;margin:0;">
                You will receive a further notification once your order has been confirmed and dispatched. Should you have any questions in the meantime, please do not hesitate to contact us.
              </p>
            </div>
          </td>
        </tr>

        <!-- Order summary -->
        <tr>
          <td style="background:#0c0c18;border:1px solid #1e1e2e;border-top:0;padding:0 48px 48px;">
            <p style="color:#C9A84C;font-size:10px;letter-spacing:5px;text-transform:uppercase;margin:0 0 16px;font-family:Arial,sans-serif;border-top:1px solid #1e1e2e;padding-top:28px;">
              ORDER SUMMARY
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${itemRows}
              <tr>
                <td style="padding:20px 0 0;color:#F5F2EC;font-size:14px;font-weight:700;font-family:Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">Total</td>
                <td style="padding:20px 0 0;color:#C9A84C;font-size:20px;font-weight:700;text-align:right;font-family:Arial,sans-serif;">
                  Ksh ${Math.round(data.total).toLocaleString('en-KE')}
                </td>
              </tr>
            </table>

            <div style="border-top:1px solid #1e1e2e;margin-top:28px;padding-top:28px;">
              <p style="color:#C9A84C;font-size:10px;letter-spacing:5px;text-transform:uppercase;margin:0 0 16px;font-family:Arial,sans-serif;">
                DELIVERY DETAILS
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#555566;font-size:13px;padding:5px 0;width:140px;font-family:Arial,sans-serif;">Deliver to</td>
                  <td style="color:#a09890;font-size:13px;padding:5px 0;font-family:Arial,sans-serif;">${data.address}, ${data.city}</td>
                </tr>
                <tr>
                  <td style="color:#555566;font-size:13px;padding:5px 0;font-family:Arial,sans-serif;">Payment method</td>
                  <td style="color:#a09890;font-size:13px;padding:5px 0;font-family:Arial,sans-serif;">${methodLabel[data.paymentMethod] ?? data.paymentMethod}</td>
                </tr>
              </table>
              ${data.paymentMethod === 'cod' ? `
              <div style="margin-top:16px;padding:16px 20px;border-left:2px solid #C9A84C;background:#0f0e00;">
                <p style="color:#C9A84C;font-size:12px;margin:0 0 4px;font-family:Arial,sans-serif;font-weight:700;letter-spacing:1px;">CASH ON DELIVERY</p>
                <p style="color:#8a7a5a;font-size:12px;margin:0;font-family:Arial,sans-serif;line-height:1.6;">
                  Please ensure that <strong style="color:#C9A84C;">Ksh ${Math.round(data.total).toLocaleString('en-KE')}</strong> is available upon delivery.
                </p>
              </div>` : ''}
            </div>

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
          <td style="padding:32px 48px;text-align:center;">
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
    const body: OrderEmailPayload = await request.json()

    if (!body.to || !body.firstName || !body.orderItems?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey || resendKey.includes('your_resend')) {
      console.warn('[Email] Dev mode — order confirmation not sent to:', body.to)
      return NextResponse.json({ success: true, mode: 'dev' })
    }

    const { Resend } = await import('resend')
    const resend = new Resend(resendKey)

    const { data, error } = await resend.emails.send({
      from:    'Mothergoose Collection <orders@mothergoosecollection254.co.ke>',
      replyTo: 'mothergoosecollection254@gmail.com',
      to:      body.to,
      subject: body.orderNumber
        ? `Order Confirmation — ${body.orderNumber} | Mothergoose Collection`
        : `Order Confirmation | Mothergoose Collection`,
      html: buildEmailHtml(body),
    })

    if (error) {
      console.error('[Resend]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('[Email API]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
