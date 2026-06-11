import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'mothergoose-secret-change-this-in-production'

function base64urlDecode(str: string): Uint8Array {
  // Pad base64url to standard base64 then decode
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

async function verifyJwt(token: string): Promise<boolean> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const [header, payload, signature] = parts

    // Import HMAC key using Web Crypto API (Edge-compatible)
    const keyData = new TextEncoder().encode(JWT_SECRET)
    const key = await crypto.subtle.importKey(
      'raw', keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const data = new TextEncoder().encode(`${header}.${payload}`)
    const sigRaw = base64urlDecode(signature)
    const sig  = sigRaw.buffer.slice(sigRaw.byteOffset, sigRaw.byteOffset + sigRaw.byteLength) as ArrayBuffer

    const valid = await crypto.subtle.verify('HMAC', key, sig, data)
    if (!valid) return false

    // Check expiry
    const decoded = JSON.parse(new TextDecoder().decode(base64urlDecode(payload)))
    if (decoded.exp < Math.floor(Date.now() / 1000)) return false
    if (decoded.role !== 'admin') return false

    return true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page, static files, and non-admin routes through
  if (
    pathname === '/mgmt-heron/login' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  if (!pathname.startsWith('/mgmt-heron')) {
    return NextResponse.next()
  }

  // Verify JWT using Web Crypto API (Edge-compatible, no Node.js crypto needed)
  const token = request.cookies.get('admin-token')?.value
  const authenticated = token ? await verifyJwt(token) : false

  if (!authenticated) {
    const url = new URL('/mgmt-heron/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/mgmt-heron/:path*'],
}
