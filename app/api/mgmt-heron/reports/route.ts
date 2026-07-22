import { NextRequest, NextResponse } from 'next/server'
import { loadOrders } from '@/lib/order-store'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const format = req.nextUrl.searchParams.get('format') || 'json'
    const orders = await loadOrders()

    // Format data for reports
    const reportData = orders.map(order => ({
      orderNo: order.orderNumber,
      name: `${order.customer.firstName} ${order.customer.lastName}`,
      phone: order.customer.phone,
      city: order.address.city,
      total: order.total,
      status: order.status,
      date: new Date(order.createdAt).toLocaleDateString('en-KE'),
      items: order.items.length,
    }))

    if (format === 'excel') {
      return exportToExcel(reportData)
    } else if (format === 'pdf') {
      return exportToPDF(reportData)
    }

    return NextResponse.json({ reports: reportData })
  } catch (error) {
    console.error('[Reports API]', error)
    return NextResponse.json(
      { error: 'Failed to generate reports' },
      { status: 500 }
    )
  }
}

function exportToExcel(data: any[]) {
  // Create CSV content
  const headers = ['Order No', 'Name', 'Phone', 'City', 'Items', 'Total (KSh)', 'Status', 'Date']
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      [
        row.orderNo,
        row.name,
        row.phone,
        row.city,
        row.items,
        row.total,
        row.status,
        row.date,
      ]
        .map(val => `"${val}"`)
        .join(',')
    ),
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="orders-report-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}

function exportToPDF(data: any[]) {
  // Create simple text-based PDF content
  let pdfContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>
endobj
4 0 obj
<< /Length 2000 >>
stream
BT
/F1 12 Tf
50 750 Td
(MOTHER GOOSE - ORDERS REPORT) Tj
0 -30 Td
(Generated: ${new Date().toLocaleDateString('en-KE')}) Tj
0 -40 Td
(Order No | Name | Phone | Total) Tj
0 -20 Td
`

  data.forEach((row, idx) => {
    if (idx > 30) return // Limit to first 30 for PDF
    pdfContent += `(${row.orderNo} | ${row.name.substring(0, 20)} | ${row.phone} | KSh ${row.total}) Tj\n0 -15 Td\n`
  })

  pdfContent += `
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000290 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
2350
%%EOF
`

  return new NextResponse(pdfContent, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="orders-report-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  })
}
