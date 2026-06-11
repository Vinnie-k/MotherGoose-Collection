import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

// Magic byte signatures for allowed image types
function detectImageType(buffer: Buffer): string | null {
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg'
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'image/png'
  // WebP: RIFF....WEBP
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) return 'image/webp'
  // GIF: GIF87a or GIF89a
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'image/gif'
  return null
}

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate size first (cheap check before reading bytes)
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate real file type from magic bytes — not trusting browser-supplied MIME
    const realType = detectImageType(buffer)
    if (!realType) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WebP and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Use the magic-byte-detected extension, not the filename extension
    const ext = EXTENSION_MAP[realType]
    const filename = `product-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Try Supabase Storage first (production)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // never use NEXT_PUBLIC_ key for uploads

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder') && !supabaseKey.includes('your_')) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(supabaseUrl, supabaseKey)

        const { error } = await supabase.storage
          .from('product-images')
          .upload(filename, buffer, {
            contentType: realType, // use real detected type
            upsert: false,
          })

        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filename)

          return NextResponse.json({ url: publicUrl, filename })
        }
        console.warn('Supabase storage upload failed, falling back to local:', error.message)
      } catch (err) {
        console.warn('Supabase storage error:', err)
      }
    }

    // Fallback: save to public/uploads (local / Vercel dev)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename,
      note: 'Saved locally. Connect Supabase Storage for production.',
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
