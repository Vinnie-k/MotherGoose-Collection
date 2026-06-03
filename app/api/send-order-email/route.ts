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
  orderItems: OrderItem[]
  total: number
  paymentMethod: string
  address: string
  city: string
}

// Builds a clean HTML email — no external dependencies needed for the template
function buildEmailHtml(data: OrderEmailPayload): string {
  const itemRows = data.orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #1a1a2e;color:#b0a99a;font-size:14px;">
          ${item.name}${item.color ? ` (Color: ${item.color})` : ''}${item.size ? ` (Size: ${item.size})` : ''} × ${item.quantity}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #1a1a2e;color:#e8d5a3;font-size:14px;text-align:right;">Ksh ${(item.price * item.quantity).toLocaleString('en-KE')}</td>
      </tr>`
    )
    .join('')

  const methodLabel: Record<string, string> = {
    mpesa: 'M-Pesa',

    cod: 'Cash on Delivery',
    whatsapp: 'WhatsApp Order',
  }

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0d0d1a;border:1px solid #1a1a2e;padding:40px;text-align:center;border-bottom:2px solid #c9a84c;">
            <p style="color:#c9a84c;font-size:11px;letter-spacing:6px;text-transform:uppercase;margin:0 0 8px;">Mothergoose Collection</p>
            <h1 style="color:#f5f2ec;font-size:28px;margin:0;font-weight:700;">Order Confirmed</h1>
            <p style="color:#6b6460;font-size:13px;margin:12px 0 0;">Thank you for your purchase, ${data.firstName}.</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#0d0d1a;border:1px solid #1a1a2e;border-top:0;padding:40px;">

            <!-- Items -->
            <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 16px;">Your Order</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${itemRows}
              <tr>
                <td style="padding:16px 0 0;color:#f5f2ec;font-size:16px;font-weight:700;">Total</td>
                <td style="padding:16px 0 0;color:#c9a84c;font-size:20px;font-weight:700;text-align:right;">Ksh ${Math.round(data.total).toLocaleString('en-KE')}</td>
              </tr>
            </table>

            <!-- Divider -->
            <hr style="border:0;border-top:1px solid #1a1a2e;margin:30px 0;">

            <!-- Delivery details -->
            <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 16px;">Delivery Details</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#6b6460;font-size:13px;padding:4px 0;width:140px;">Deliver to</td>
                <td style="color:#b0a99a;font-size:13px;padding:4px 0;">${data.address}, ${data.city}</td>
              </tr>
              <tr>
                <td style="color:#6b6460;font-size:13px;padding:4px 0;">Payment method</td>
                <td style="color:#b0a99a;font-size:13px;padding:4px 0;">${methodLabel[data.paymentMethod] ?? data.paymentMethod}</td>
              </tr>
              ${data.paymentMethod === 'cod' ? `
              <tr>
                <td colspan="2" style="padding:16px;background:#1a120a;border:1px solid #c9a84c33;margin-top:12px;display:block;">
                  <p style="color:#c9a84c;font-size:13px;margin:0;font-weight:600;">Cash on Delivery reminder</p>
                  <p style="color:#8a7a5a;font-size:12px;margin:6px 0 0;">Please have <strong style="color:#c9a84c;">Ksh ${Math.round(data.total).toLocaleString('en-KE')}</strong> ready when your rider arrives.</p>
                </td>
              </tr>` : ''}
            </table>

            <!-- Divider -->
            <hr style="border:0;border-top:1px solid #1a1a2e;margin:30px 0;">

            <!-- CTA -->
            <div style="text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://mothergoosecollection.com'}/track-order" style="display:inline-block;background:#c9a84c;color:#0a0a0f;text-decoration:none;padding:14px 36px;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">
                Track My Order
              </a>
            </div>

          </td>
        </tr>

        <!-- Footer -->
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
    const body: OrderEmailPayload = await request.json()

    if (!body.to || !body.firstName || !body.orderItems?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const resendKey = process.env.RESEND_API_KEY

    // If no Resend key configured, log and return success (dev mode)
    if (!resendKey || resendKey === 'your_resend_api_key') {
      console.warn('[Email] No RESEND_API_KEY configured — email not sent (dev mode)')
      console.warn('[Email] Would have sent order confirmation to:', body.to)
      return NextResponse.json({ success: true, mode: 'dev' })
    }

    // Send via Resend
    const { Resend } = await import('resend')
    const resend = new Resend(resendKey)

    const { data, error } = await resend.emails.send({
      from: 'Mothergoose Collection <orders@mothergoosecollection254.co.ke>',
      replyTo: 'mothergoosecollection1@gmail.com', // must be a verified domain in Resend
      to: body.to,
      subject: `Order Confirmed — Mothergoose Collection`,
      html: buildEmailHtml(body),
    })

    if (error) {
      console.error('[Resend] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('[Email API] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}