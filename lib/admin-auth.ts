import { NextRequest } from 'next/server'
import crypto from 'crypto'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
// Support both bcrypt hash (preferred) and plain password (legacy fallback)
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || null
const ADMIN_PASSWORD_PLAIN = process.env.ADMIN_PASSWORD || null
const JWT_SECRET = process.env.JWT_SECRET || 'mothergoose-secret-change-this-in-production'

if (process.env.NODE_ENV === 'production') {
  if (!ADMIN_PASSWORD_HASH && !ADMIN_PASSWORD_PLAIN) {
    console.error('⚠️  SECURITY: No admin password set. Set ADMIN_PASSWORD_HASH in your environment variables.')
  }
  if (!ADMIN_PASSWORD_HASH) {
    console.error('⚠️  SECURITY: ADMIN_PASSWORD_HASH not set — using plain text password. Migrate to bcrypt: see .env.example')
  }
  if (!process.env.JWT_SECRET) {
    console.error('⚠️  SECURITY: JWT_SECRET env var not set — using insecure default. Generate: openssl rand -hex 32')
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
    // Timing-safe comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature)
    const expectedBuf = Buffer.from(expectedSig)
    if (sigBuf.length !== expectedBuf.length) return null
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null

    const decoded = JSON.parse(base64urlDecode(payload))
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null
    return decoded
  } catch {
    return null
  }
}

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  // Username must match (trimmed, case-sensitive)
  if (username.trim() !== ADMIN_USERNAME.trim()) return false

  // Prefer bcrypt hash comparison
  if (ADMIN_PASSWORD_HASH) {
    try {
      const bcrypt = await import('bcryptjs')
      return await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    } catch {
      console.error('bcryptjs not installed. Run: npm install bcryptjs')
      return false
    }
  }

  // Legacy fallback: plain text password (not recommended)
  if (ADMIN_PASSWORD_PLAIN) {
    return password === ADMIN_PASSWORD_PLAIN
  }

  return false
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
