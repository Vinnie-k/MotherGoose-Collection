import { NextRequest } from 'next/server'
import crypto from 'crypto'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mothergoose-admin-2025'
const JWT_SECRET = process.env.JWT_SECRET || 'mothergoose-secret-change-this-in-production'

// Warn loudly in development if using default credentials
if (process.env.NODE_ENV === 'production') {
  if (!process.env.ADMIN_PASSWORD) {
    console.error('⚠️  SECURITY: ADMIN_PASSWORD env var not set — using insecure default. Set it in your .env.local or Vercel environment variables immediately.')
  }
  if (!process.env.JWT_SECRET) {
    console.error('⚠️  SECURITY: JWT_SECRET env var not set — using insecure default. Set it in your .env.local or Vercel environment variables immediately.')
  }
}

function base64urlEncode(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64url')
}

function base64urlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8')
}

export function createToken(username: string): string {
  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64urlEncode(JSON.stringify({
    sub: username,
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  }))
  const data = `${header}.${payload}`
  const sig = base64urlEncode(
    crypto.createHmac('sha256', JWT_SECRET).update(data).digest()
  )
  return `${data}.${sig}`
}

export function verifyToken(token: string): { sub: string; role: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, payload, signature] = parts
    const data = `${header}.${payload}`
    const expectedSig = base64urlEncode(
      crypto.createHmac('sha256', JWT_SECRET).update(data).digest()
    )
    if (signature !== expectedSig) return null
    const decoded = JSON.parse(base64urlDecode(payload))
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null
    return decoded
  } catch {
    return null
  }
}

export function validateCredentials(username: string, password: string): boolean {
  return (
    username.trim() === ADMIN_USERNAME.trim() &&
    password === ADMIN_PASSWORD
  )
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const cookieToken = request.cookies.get('admin-token')?.value
  if (cookieToken) return cookieToken
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)
  return null
}

export function isAdminAuthenticated(request: NextRequest): boolean {
  const token = getTokenFromRequest(request)
  if (!token) return false
  const payload = verifyToken(token)
  return payload?.role === 'admin'
}
