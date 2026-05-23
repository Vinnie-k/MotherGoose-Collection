import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, createToken } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
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

    if (!validateCredentials(username, password)) {
      // Slow down brute force attempts
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
    return NextResponse.json({ error: 'Server error — check the terminal for details' }, { status: 500 })
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
