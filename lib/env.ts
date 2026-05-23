/**
 * env.ts — Validates required environment variables at startup.
 * Import this at the top of any server-side file that needs env vars.
 * 
 * Usage: import '@/lib/env'
 */

type EnvVar = {
  name: string
  required: boolean
  description: string
}

const ENV_VARS: EnvVar[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: false, // optional — falls back to mock data
    description: 'Supabase project URL (e.g. https://xxxx.supabase.co)',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: false, // optional — falls back to mock data
    description: 'Supabase anonymous public key',
  },
]

function validateEnv() {
  // Only validate on the server
  if (typeof window !== 'undefined') return

  const missing: string[] = []
  const warnings: string[] = []

  for (const { name, required, description } of ENV_VARS) {
    const value = process.env[name]
    if (!value || value === 'placeholder' || value.includes('your_')) {
      if (required) {
        missing.push(`  ❌ ${name} — ${description}`)
      } else {
        warnings.push(`  ⚠️  ${name} not set — ${description}`)
      }
    }
  }

  if (missing.length > 0) {
    console.error('\n🚨 Missing required environment variables:\n')
    missing.forEach((m) => console.error(m))
    console.error('\nCreate a .env.local file based on .env.local.example\n')
    // Don't throw in production — allow mock data fallback
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('\n📋 Optional env vars not configured (using mock data):\n')
    warnings.forEach((w) => console.warn(w))
    console.warn('\nThe app works with mock data — configure Supabase for a live database.\n')
  }
}

validateEnv()
