'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'

const CROP_SIZE = 200 // output square size in px

interface CategoryImageUploaderProps {
  currentImageUrl?: string
  onUploaded: (url: string) => void
  onClear: () => void
}

export default function CategoryImageUploader({ currentImageUrl, onUploaded, onClear }: CategoryImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [imgSrc, setImgSrc] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, ox: 0, oy: 0 })
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })

  const imgRef = useRef<HTMLImageElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) { setError('Please select an image file'); return }
    setError('')
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      setImgSrc(src)
      setScale(1)
      setOffset({ x: 0, y: 0 })
      const img = new Image()
      img.onload = () => {
        setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
        const minDim = Math.min(img.naturalWidth, img.naturalHeight)
        const defaultScale = CROP_SIZE / minDim
        setScale(defaultScale)
        setOffset({
          x: (CROP_SIZE - img.naturalWidth * defaultScale) / 2,
          y: (CROP_SIZE - img.naturalHeight * defaultScale) / 2,
        })
      }
      img.src = src
    }
    reader.readAsDataURL(f)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y })
  }

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return
    setOffset({
      x: dragStart.ox + (e.clientX - dragStart.x),
      y: dragStart.oy + (e.clientY - dragStart.y),
    })
  }, [dragging, dragStart])

  const onMouseUp = useCallback(() => setDragging(false), [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    setDragging(true)
    setDragStart({ x: t.clientX, y: t.clientY, ox: offset.x, oy: offset.y })
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return
    const t = e.touches[0]
    setOffset({
      x: dragStart.ox + (t.clientX - dragStart.x),
      y: dragStart.oy + (t.clientY - dragStart.y),
    })
  }

  const handleConfirm = async () => {
    if (!imgSrc || !file) return
    setUploading(true)
    setError('')
    try {
      const canvas = canvasRef.current!
      canvas.width = CROP_SIZE
      canvas.height = CROP_SIZE
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE)
      const img = new Image()
      img.src = imgSrc
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej })
      ctx.drawImage(img, offset.x, offset.y, naturalSize.w * scale, naturalSize.h * scale)

      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob(b => b ? res(b) : rej(new Error('Canvas empty')), 'image/png', 0.92)
      )

      const path = `cat-${Date.now()}.png`
      const { error: upErr } = await supabase.storage
        .from('category-images')
        .upload(path, blob, { contentType: 'image/png', upsert: false })
      if (upErr) throw upErr

      const { data: urlData } = supabase.storage.from('category-images').getPublicUrl(path)
      onUploaded(urlData.publicUrl)
      setFile(null)
      setImgSrc('')
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (!imgSrc && !currentImageUrl) {
    return (
      <div>
        <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-[#92998B]/50 rounded-xl p-4 hover:border-[#7D8DCC] transition-colors">
          <span className="text-2xl">🖼️</span>
          <div>
            <div className="text-sm font-medium text-[#614270]">Upload category image</div>
            <div className="text-xs text-[#92998B]">PNG, JPG or GIF — will be cropped to a square</div>
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
        </label>
        {error && <p className="text-xs text-[#FA9335] mt-1">{error}</p>}
      </div>
    )
  }

  if (currentImageUrl && !imgSrc) {
    return (
      <div className="flex items-center gap-3">
        <img src={currentImageUrl} alt="Category" className="w-16 h-16 object-contain rounded-lg border border-[#92998B]/30" />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#614270] font-medium cursor-pointer hover:text-[#4e3359]">
            Replace image
            <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
          </label>
          <button type="button" onClick={onClear} className="text-xs text-[#FA9335] hover:text-[#c96a00] text-left">
            Remove image
          </button>
        </div>
      </div>
    )
  }

  // Crop editor
  const displayW = naturalSize.w * scale
  const displayH = naturalSize.h * scale

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-[#614270]">Crop image — drag to reposition, use slider to zoom</div>
      <div
        ref={viewportRef}
        className="relative overflow-hidden rounded-xl border-2 border-[#7D8DCC] bg-[#D1D9C5]"
        style={{ width: CROP_SIZE, height: CROP_SIZE, cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={() => setDragging(false)}
      >
        {imgSrc && (
          <img
            ref={imgRef}
            src={imgSrc}
            alt="Crop preview"
            draggable={false}
            style={{
              position: 'absolute',
              left: offset.x,
              top: offset.y,
              width: displayW,
              height: displayH,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        )}
        {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-4 h-4 border-[#7D8DCC] ${i < 2 ? 'border-t-2' : 'border-b-2'} ${i % 2 === 0 ? 'border-l-2' : 'border-r-2'}`} />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-[#92998B]">Zoom</span>
        <input
          type="range"
          min={0.1}
          max={5}
          step={0.05}
          value={scale}
          onChange={e => setScale(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-xs text-[#92998B] w-10 text-right">{Math.round(scale * 100)}%</span>
      </div>

      {error && <p className="text-xs text-[#FA9335]">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={uploading}
          className="flex-1 py-2 bg-[#7D8DCC] text-white rounded-lg text-sm font-semibold hover:bg-[#6b7bb8] disabled:opacity-60 transition-colors"
        >
          {uploading ? 'Uploading…' : 'Use this crop'}
        </button>
        <button
          type="button"
          onClick={() => { setFile(null); setImgSrc('') }}
          className="px-4 py-2 bg-[#D1D9C5] text-[#614270] rounded-lg text-sm hover:bg-[#c5cdb9] transition-colors"
        >
          Cancel
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
