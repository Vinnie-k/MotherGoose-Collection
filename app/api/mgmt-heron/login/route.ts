import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, createToken } from '@/lib/admin-auth'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

// 5 failed attempts per IP per 15 minutes
const LOGIN_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 }

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP before even reading the body
    const ip = getClientIp(request)
    const rl = checkRateLimit(`login:${ip}`, LOGIN_LIMIT)

    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait 15 minutes before trying again.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(LOGIN_LIMIT.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }

    let body: { username?: string; password?: string } = {}
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const valid = await validateCredentials(username, password)
    if (!valid) {
      // Always delay failed logins to slow brute force (bcrypt already adds delay, but keep for plain-text fallback)
      await new Promise((r) => setTimeout(r, 800))
      return NextResponse.json({ error: 'Incorrect username or password' }, { status: 401 })
    }

    const token = createToken(username)
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[Admin login error]', err)
    return NextResponse.json({ error: 'Server error — please try again.' }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('admin-token', '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
  })
  return response
}
