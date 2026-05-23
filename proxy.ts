import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Check for admin token in cookie
  const token = request.cookies.get('admin-token')?.value

  if (!token) {
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Verify token
  try {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('bad token')

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf8')
    )

    if (!payload || payload.role !== 'admin') throw new Error('not admin')
    if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('expired')

    return NextResponse.next()
  } catch {
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
