
import { createHash } from 'crypto'

interface MetaPurchaseCustomer {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
}

interface MetaPurchaseItem {
  productId: string
  name: string
  quantity: number
  price: number
}

export interface MetaPurchaseInput {
  eventId: string
  orderNumber: string
  total: number
  customer?: MetaPurchaseCustomer
  items?: MetaPurchaseItem[]
  sourceUrl?: string
  clientIp?: string
  userAgent?: string
  fbp?: string
  fbc?: string
}

interface MetaPurchaseResult {
  success: boolean
  error?: string
}

function normalize(value?: string): string | undefined {
  const normalized = value?.trim().toLowerCase()
  return normalized || undefined
}

function hashValue(value?: string): string | undefined {
  if (!value) return undefined

  return createHash('sha256')
    .update(value)
    .digest('hex')
}

export async function sendMetaPurchase(
  input: MetaPurchaseInput
): Promise<MetaPurchaseResult> {
  try {
    const pixelId = process.env.META_PIXEL_ID
    const accessToken = process.env.META_ACCESS_TOKEN

    if (!pixelId || !accessToken) {
      return {
        success: false,
        error: 'Meta Pixel ID or access token is missing.',
      }
    }

    if (!Number.isFinite(input.total) || input.total <= 0) {
      return {
        success: false,
        error: 'Invalid purchase total.',
      }
    }

    const apiVersion = process.env.META_API_VERSION || 'v26.0'

    const endpoint =
      `https://graph.facebook.com/${apiVersion}/${pixelId}/events` +
      `?access_token=${encodeURIComponent(accessToken)}`

    const email = normalize(input.customer?.email)

    // Digits only, with country code. Numbers starting with 0 are treated as Kenyan (254).
    let phone = input.customer?.phone?.replace(/\D/g, '')
    if (phone?.startsWith('0')) phone = '254' + phone.slice(1)

    const firstName = normalize(input.customer?.firstName)
    const lastName = normalize(input.customer?.lastName)

    const userData: Record<string, unknown> = {}

    if (email) userData.em = [hashValue(email)]
    if (phone) userData.ph = [hashValue(phone)]
    if (firstName) userData.fn = [hashValue(firstName)]
    if (lastName) userData.ln = [hashValue(lastName)]

    if (input.clientIp) {
      userData.client_ip_address = input.clientIp
    }

    if (input.userAgent) {
      userData.client_user_agent = input.userAgent
    }

    if (input.fbp) userData.fbp = input.fbp
    if (input.fbc) userData.fbc = input.fbc

    const contents = (input.items || []).map((item) => ({
      id: item.productId,
      quantity: item.quantity,
      item_price: item.price,
      title: item.name,
    }))

    const event: Record<string, unknown> = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: input.eventId,
      action_source: 'website',
      user_data: userData,
      custom_data: {
        currency: process.env.META_CURRENCY || 'KES',
        value: input.total,
        order_id: input.orderNumber,
        content_type: 'product',
        content_ids: (input.items || []).map(
          (item) => item.productId
        ),
        contents,
        num_items: (input.items || []).reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
      },
    }

    if (input.sourceUrl) {
      event.event_source_url = input.sourceUrl
    }

    const payload: Record<string, unknown> = {
      data: [event],
    }

    if (process.env.META_TEST_EVENT_CODE) {
      payload.test_event_code = process.env.META_TEST_EVENT_CODE
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const responseData = await response.json()

    if (!response.ok || responseData.error) {
      console.error(
        '[Meta CAPI] Request failed:',
        responseData.error?.message || response.statusText
      )

      return {
        success: false,
        error:
          responseData.error?.message ||
          'Meta rejected the Purchase event.',
      }
    }

    if (responseData.events_received < 1) {
      return {
        success: false,
        error: 'Meta did not confirm receipt of the Purchase event.',
      }
    }

    console.log('[Meta CAPI] Purchase event accepted:', {
      orderNumber: input.orderNumber,
      eventId: input.eventId,
      eventsReceived: responseData.events_received,
    })

    return { success: true }

  } catch (error) {
    console.error('[Meta CAPI] Error:', error)

    return {
      success: false,
      error: 'Failed to communicate with Meta Conversions API.',
    }
  }
}
