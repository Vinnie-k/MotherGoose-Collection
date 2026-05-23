'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Image as ImageIcon, Loader, Link as LinkIcon, GripVertical, CheckCircle } from 'lucide-react'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUploader({ images, onChange, maxImages = 5 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [dragOver, setDragOver] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      setError(`"${file.name}" is not supported. Use JPG, PNG, or WebP.`)
      return null
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(`"${file.name}" exceeds 5MB.`)
      return null
    }

    // Try the upload API first (saves file to disk/Supabase — no bloat)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        return data.url as string
      }
    } catch {
      // Upload API failed, fall through to base64
    }

    // Fallback: base64 (works offline, slightly larger but functional)
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })
  }, [])

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const remaining = maxImages - images.length
    if (remaining <= 0) { setError(`Maximum ${maxImages} images allowed.`); return }

    setUploading(true)
    setError('')
    const toProcess = Array.from(files).slice(0, remaining)
    const results: string[] = []

    for (let i = 0; i < toProcess.length; i++) {
      setUploadProgress(`Uploading ${i + 1} of ${toProcess.length}…`)
      const url = await uploadFile(toProcess[i])
      if (url) results.push(url)
    }

    if (results.length > 0) onChange([...images, ...results])
    setUploading(false)
    setUploadProgress('')
  }, [images, maxImages, onChange, uploadFile])

  const addUrl = () => {
    const url = urlInput.trim()
    if (!url) return
    if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:')) {
      setError('Please enter a valid URL starting with http:// or https://')
      return
    }
    if (images.length >= maxImages) { setError(`Maximum ${maxImages} images allowed.`); return }
    onChange([...images, url])
    setUrlInput('')
    setError('')
  }

  const removeImage = (index: number) => onChange(images.filter((_, i) => i !== index))

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return
    const updated = [...images]
    const [item] = updated.splice(from, 1)
    updated.splice(to, 0, item)
    onChange(updated)
  }

  const canAddMore = images.length < maxImages

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div>
          <p style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.7rem', marginBottom: 10 }}>
            {images.length}/{maxImages} image{images.length !== 1 ? 's' : ''} — drag to reorder · first is the main photo
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {images.map((url, i) => (
              <div key={i} draggable
                onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDragIdx(i) }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (dragIdx !== null && dragIdx !== i) { moveImage(dragIdx, i); setDragIdx(null) }
                }}
                onDragEnd={() => setDragIdx(null)}
                style={{
                  position: 'relative', width: 100, height: 100,
                  background: 'rgba(255,255,255,0.04)',
                  border: dragIdx === i ? '2px dashed #C9A84C' : i === 0 ? '2px solid rgba(201,168,76,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  overflow: 'hidden', cursor: 'grab',
                  opacity: dragIdx === i ? 0.4 : 1, transition: 'opacity 0.15s',
                }}>
                <Image src={url} alt={`Product image ${i + 1}`} fill sizes="100px" style={{ objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 3, left: 3, color: 'rgba(255,255,255,0.5)', pointerEvents: 'none' }}>
                  <GripVertical size={11} />
                </div>
                <button type="button" onClick={() => removeImage(i)}
                  style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: '50%', background: 'rgba(220,38,38,0.9)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>×</button>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: i === 0 ? '#C9A84C' : 'rgba(0,0,0,0.55)',
                  color: i === 0 ? '#0A0A0F' : 'rgba(255,255,255,0.6)',
                  fontSize: '0.5rem', fontWeight: 700, padding: '3px 0',
                  textAlign: 'center', letterSpacing: '0.06em',
                }}>
                  {i === 0 ? 'MAIN PHOTO' : `PHOTO ${i + 1}`}
                </div>
              </div>
            ))}

            {/* Inline add-more slot */}
            {canAddMore && !uploading && (
              <div onClick={() => fileRef.current?.click()}
                style={{ width: 100, height: 100, border: '2px dashed rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#C9A84C')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}>
                <Upload size={16} style={{ color: 'rgba(245,242,236,0.3)' }} />
                <span style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.58rem', letterSpacing: '0.05em' }}>ADD MORE</span>
              </div>
            )}
            {uploading && (
              <div style={{ width: 100, height: 100, border: '1px solid rgba(201,168,76,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(201,168,76,0.04)' }}>
                <Loader size={18} style={{ color: '#C9A84C', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ color: '#C9A84C', fontSize: '0.55rem', textAlign: 'center', padding: '0 6px' }}>{uploadProgress}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drop zone — only when no images yet */}
      {images.length === 0 && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => !uploading && fileRef.current?.click()}
          style={{ border: `2px dashed ${dragOver ? '#C9A84C' : 'rgba(255,255,255,0.15)'}`, background: dragOver ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.02)', padding: '44px 24px', textAlign: 'center', cursor: uploading ? 'wait' : 'pointer', transition: 'all 0.2s' }}>
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <Loader size={28} style={{ color: '#C9A84C', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#C9A84C', fontSize: '0.875rem' }}>{uploadProgress}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 56, height: 56, border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {dragOver ? <Upload size={22} style={{ color: '#C9A84C' }} /> : <ImageIcon size={22} style={{ color: 'rgba(245,242,236,0.3)' }} />}
              </div>
              <div>
                <p style={{ color: 'rgba(245,242,236,0.7)', fontSize: '0.875rem', fontWeight: 500 }}>{dragOver ? 'Drop to upload' : 'Click to upload or drag & drop'}</p>
                <p style={{ color: 'rgba(245,242,236,0.3)', fontSize: '0.75rem', marginTop: 4 }}>JPG, PNG, WebP · Max 5MB each · Up to {maxImages} photos</p>
              </div>
            </div>
          )}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple style={{ display: 'none' }}
        onChange={e => { handleFiles(e.target.files); e.target.value = '' }} />

      {/* URL input */}
      <div>
        <p style={{ color: 'rgba(245,242,236,0.35)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Or paste an image URL</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <LinkIcon size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,242,236,0.2)', pointerEvents: 'none' }} />
            <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
              placeholder="https://example.com/product-image.jpg" disabled={!canAddMore}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F2EC', padding: '10px 14px 10px 34px', width: '100%', outline: 'none', fontSize: '0.8rem', opacity: !canAddMore ? 0.4 : 1 }} />
          </div>
          <button type="button" onClick={addUrl} disabled={!urlInput.trim() || !canAddMore}
            style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', padding: '10px 18px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: (!urlInput.trim() || !canAddMore) ? 0.35 : 1 }}>
            Add
          </button>
        </div>
        <p style={{ color: 'rgba(245,242,236,0.2)', fontSize: '0.7rem', marginTop: 6 }}>Works with Unsplash, Cloudinary, or any direct image URL</p>
      </div>

      {/* Success hint */}
      {images.length > 0 && !uploading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={13} style={{ color: '#4ade80' }} />
          <p style={{ color: '#4ade80', fontSize: '0.75rem' }}>{images.length} image{images.length !== 1 ? 's' : ''} ready · images are saved when you click Save Product</p>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 14px' }}>
          <X size={14} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: '#f87171', fontSize: '0.8rem', lineHeight: 1.5, flex: 1 }}>{error}</p>
          <button type="button" onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', flexShrink: 0, fontSize: '16px' }}>×</button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
