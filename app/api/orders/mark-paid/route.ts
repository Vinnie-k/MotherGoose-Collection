
import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import {
  prepareOrderForMetaPurchase,
  markMetaPurchaseSent,
} from '@/lib/order-store'
import { sendMetaPurchase } from '@/lib/meta-capi'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const orderNumber = String(body.orderNumber || '').trim()

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      )
    }

    // Reuse the same event ID for every retry.
    const eventId = `mothergoose-purchase-${orderNumber}`

    const prepared = await prepareOrderForMetaPurchase(
      orderNumber,
      eventId
    )

    if (!prepared) {
      return NextResponse.json(
        { error: 'Order not found or could not be prepared' },
        { status: 404 }
      )
    }

    if (prepared.alreadySent) {
      return NextResponse.json({
        success: true,
        alreadySent: true,
        message: 'Purchase event was already sent to Meta.',
        order: prepared.order,
      })
    }

    if (!prepared.shouldSend || !prepared.claimToken) {
      return NextResponse.json(
        {
          error: 'Purchase event is already being processed. Please retry later.',
        },
        { status: 409 }
      )
    }

    const order = prepared.order

    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIp = forwardedFor?.split(',')[0]?.trim()

    const cookieHeader = request.headers.get('cookie') || ''

    const getCookie = (name: string) => {
      const match = cookieHeader.match(
        new RegExp(`(?:^|;\\s*)${name}=([^;]*)`)
      )

      if (!match) return undefined

      try {
        return decodeURIComponent(match[1])
      } catch {
        return undefined
      }
    }

    const sourceUrl =
      request.headers.get('origin') ||
      request.headers.get('referer') ||
      ''

    const result = await sendMetaPurchase({
      eventId,
      orderNumber: order.orderNumber,
      total: Number(order.total),

      customer: {
        email: order.customer.email,
        phone: order.customer.phone,
        firstName: order.customer.firstName,
        lastName: order.customer.lastName,
      },

      items: order.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
      })),

      sourceUrl,
      clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc'),
    })

    if (!result.success) {
      // The claim expires after 10 minutes.
      // A retry can then attempt to send the same event again.
      return NextResponse.json(
        {
          error: result.error || 'Meta did not accept the Purchase event.',
          purchaseSent: false,
          paymentStatus: 'paid',
        },
        { status: 502 }
      )
    }

    // Save success only for the request holding this claim.
    await markMetaPurchaseSent(
      orderNumber,
      eventId,
      prepared.claimToken
    )

    return NextResponse.json({
      success: true,
      purchaseSent: true,
      eventId,
      order: {
        orderNumber: order.orderNumber,
        paymentStatus: 'paid',
      },
      message: 'Payment confirmed and Purchase event accepted by Meta.',
    })

  } catch (error) {
    console.error('[MarkPaid] Error:', error)

    return NextResponse.json(
      {
        error: 'An unexpected error occurred while processing payment.',
      },
      { status: 500 }
    )
  }
}
