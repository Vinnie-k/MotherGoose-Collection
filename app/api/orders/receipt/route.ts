import { NextRequest, NextResponse } from 'next/server'
import { getOrderByNumber } from '@/lib/order-store'
import { formatPrice } from '@/lib/format'

export async function GET(req: NextRequest) {
  try {
    const orderNumber = req.nextUrl.searchParams.get('orderNumber')
    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 })
    }

    const order = await getOrderByNumber(orderNumber)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Generate HTML receipt
    const receiptHTML = generateReceipt(order)

    // Return as PDF or HTML
    const format = req.nextUrl.searchParams.get('format') || 'html'
    if (format === 'pdf') {
      return generatePDFReceipt(order)
    }

    return new NextResponse(receiptHTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (error) {
    console.error('[Receipt API]', error)
    return NextResponse.json({ error: 'Failed to generate receipt' }, { status: 500 })
  }
}

function generateReceipt(order: any) {
  const itemsHTML = order.items
    .map(
      (item: any) =>
        `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${item.colorImage || item.image ? `<img src="${item.colorImage || item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 2px;">` : ''}
          <div>
            <div>${item.name}</div>
            ${item.color ? `<div style="font-size: 12px; color: #666;">Color: ${item.color}</div>` : ''}
            ${item.size ? `<div style="font-size: 12px; color: #666;">Size: ${item.size}</div>` : ''}
          </div>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">×${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">Ksh ${item.price.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">Ksh ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Receipt - ${order.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .receipt { max-width: 600px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #c9a84c; padding-bottom: 20px; }
    .header h1 { font-size: 28px; font-weight: 700; color: #0a0a0f; letter-spacing: 2px; margin-bottom: 10px; }
    .header p { color: #666; font-size: 14px; }
    .order-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .info-box h3 { color: #c9a84c; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
    .info-box p { color: #333; font-size: 14px; line-height: 1.6; margin-bottom: 5px; }
    table { width: 100%; margin-bottom: 30px; }
    th { background: #f5f5f5; padding: 12px; text-align: left; color: #666; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
    td { padding: 12px; color: #333; font-size: 14px; }
    .totals { display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px; border-top: 2px solid #e5e5e5; border-bottom: 2px solid #e5e5e5; padding: 20px 0; }
    .total-row { display: flex; justify-content: space-between; font-size: 14px; }
    .total-row.subtotal { color: #666; }
    .total-row.shipping { color: #666; }
    .total-row.grand { color: #c9a84c; font-weight: 700; font-size: 18px; }
    .footer { text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e5e5e5; padding-top: 20px; }
    .delivery-info { background: #f9f9f9; padding: 15px; border-left: 4px solid #c9a84c; margin-bottom: 20px; }
    .delivery-info p { color: #666; font-size: 13px; margin-bottom: 5px; }
  </style>
</head>
<body>
  <div class="receipt">
    <!-- Header -->
    <div class="header">
      <h1>MOTHERGOOSE</h1>
      <p>Order Receipt</p>
    </div>

    <!-- Order Info -->
    <div class="order-info">
      <div class="info-box">
        <h3>Order Details</h3>
        <p><strong>Order No:</strong> ${order.orderNumber}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-KE')}</p>
        <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
      </div>
      <div class="info-box">
        <h3>Customer Information</h3>
        <p><strong>Name:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
        <p><strong>Phone:</strong> ${order.customer.phone}</p>
        <p><strong>Email:</strong> ${order.customer.email}</p>
      </div>
    </div>

    <!-- Shipping Address -->
    <div class="info-box" style="margin-bottom: 20px;">
      <h3>Delivery Address</h3>
      <p>${order.address.street}</p>
      <p>${order.address.city}${order.address.zip ? ', ' + order.address.zip : ''}</p>
    </div>

    <!-- Delivery Info -->
    <div class="delivery-info">
      <p><strong>Delivery Method:</strong> Same-Day Delivery</p>
      <p><strong>Delivery Charge:</strong> Ksh ${order.shipping.toLocaleString()}</p>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="total-row subtotal">
        <span>Subtotal</span>
        <span>Ksh ${order.subtotal.toLocaleString()}</span>
      </div>
      <div class="total-row shipping">
        <span>Delivery Fee</span>
        <span>Ksh ${order.shipping.toLocaleString()}</span>
      </div>
      <div class="total-row grand">
        <span>Grand Total</span>
        <span>Ksh ${order.total.toLocaleString()}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for your order!</p>
      <p style="margin-top: 10px;">Mother Goose Collection</p>
      <p>Nairobi, Kenya | Tel: +254 759 490 008</p>
      <p style="margin-top: 20px; color: #ccc;">This is your order receipt. Please keep it safe.</p>
    </div>
  </div>
</body>
</html>
  `
}

function generatePDFReceipt(order: any) {
  // Simple PDF generation - can be enhanced with a library like jsPDF
  const content = `
MOTHERGOOSE - ORDER RECEIPT
========================================

ORDER NUMBER: ${order.orderNumber}
DATE: ${new Date(order.createdAt).toLocaleDateString('en-KE')}
STATUS: ${order.status.toUpperCase()}

CUSTOMER INFORMATION:
${order.customer.firstName} ${order.customer.lastName}
Phone: ${order.customer.phone}
Email: ${order.customer.email}

DELIVERY ADDRESS:
${order.address.street}
${order.address.city} ${order.address.zip}

ITEMS ORDERED:
${order.items.map((item: any) => `${item.name} x${item.quantity} - Ksh ${(item.price * item.quantity).toLocaleString()}`).join('\n')}

SUBTOTAL: Ksh ${order.subtotal.toLocaleString()}
DELIVERY FEE: Ksh ${order.shipping.toLocaleString()}
========================================
GRAND TOTAL: Ksh ${order.total.toLocaleString()}
========================================

Thank you for your order!
Mother Goose Collection
Nairobi, Kenya
  `

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="receipt-${order.orderNumber}.txt"`,
    },
  })
}
