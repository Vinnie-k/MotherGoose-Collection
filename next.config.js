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
    // NOTE: this was previously set to `true` because Supabase Storage was
    // believed to resolve to IPv6 NAT64 addresses that Next.js's built-in
    // image optimizer couldn't reach in some environments. That was tested
    // again on 2026-07-22 (local production build, hitting /_next/image
    // directly against a real Supabase Storage URL) and optimization now
    // works correctly — images load, resize, and convert to WebP as
    // expected. Re-enabling real optimization here for meaningfully smaller,
    // faster-loading images across the whole site.
    //
    // If Supabase images ever start failing to load in production after a
    // deploy, that's the first thing to check — revert this to `true` as an
    // immediate fix, then investigate.
    unoptimized: false,
    formats: ['image/webp'],
    qualities: [75],
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://*.supabase.in https://res.cloudinary.com https://i.ibb.co https://*.imgbb.com",
              // Analytics + Speed Insights beacons go to /_vercel/insights/*
              // and /_vercel/speed-insights/* on our own domain in
              // production ('self' covers that), but local dev fetches the
              // script/vitals endpoints directly from Vercel's CDN — these
              // two extra domains are only exercised in dev, harmless
              // elsewhere. Both tools share the same two domains.
              "connect-src 'self' https://*.supabase.co https://api.resend.com https://vitals.vercel-insights.com https://va.vercel-scripts.com",
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
