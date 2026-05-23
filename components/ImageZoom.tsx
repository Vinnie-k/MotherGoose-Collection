'use client'

import Image from 'next/image'
import { useState, useRef, useCallback } from 'react'
import { ZoomIn, ZoomOut, X } from 'lucide-react'

interface ImageZoomProps {
  src: string
  alt: string
}

export default function ImageZoom({ src, alt }: ImageZoomProps) {
  const [zoomed, setZoomed] = useState(false)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }, [zoomed])

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={`relative overflow-hidden bg-white/5 ${zoomed ? 'cursor-none' : 'cursor-zoom-in'}`}
        style={{ aspectRatio: '1' }}
        onClick={() => !zoomed && setZoomed(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => zoomed && setPosition({ x: 50, y: 50 })}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-100"
          style={
            zoomed
              ? {
                  transform: 'scale(2.5)',
                  transformOrigin: `${position.x}% ${position.y}%`,
                }
              : undefined
          }
          draggable={false}
        />

        {/* Zoom hint overlay */}
        {!zoomed && (
          <div className="absolute bottom-3 right-3 bg-obsidian/70 backdrop-blur-sm border border-white/10 px-3 py-1.5 flex items-center gap-1.5 text-ivory/50 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn size={12} />
            Click to zoom
          </div>
        )}
      </div>

      {/* Zoom controls */}
      {zoomed && (
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <button
            onClick={() => setZoomed(false)}
            className="w-8 h-8 bg-obsidian/80 backdrop-blur-sm border border-white/20 flex items-center justify-center text-ivory/70 hover:text-gold hover:border-gold/40 transition-all"
            aria-label="Close zoom"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
