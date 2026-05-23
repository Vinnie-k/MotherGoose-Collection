/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 120,

  images: {
    // Allow images from any domain - covers Unsplash, Supabase, and local uploads
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: '*.imgbb.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    // Supabase Storage resolves to IPv6 NAT64 addresses in some environments.
    // Using unoptimized bypasses Next.js image proxy entirely for those URLs,
    // so the browser fetches them directly — no private-IP block.
    unoptimized: true,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://*.supabase.in https://res.cloudinary.com https://i.ibb.co https://*.imgbb.com",
              "connect-src 'self' https://*.supabase.co https://api.resend.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },

  async redirects() {
    return [
      { source: '/shop', destination: '/products', permanent: true },
      { source: '/store', destination: '/products', permanent: true },
    ]
  },
}

module.exports = nextConfig
