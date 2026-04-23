'use client'

import { useState, useRef } from 'react'
import { uploadPhoto, validatePhoto, getMaxPhotos } from '@/lib/photo-upload'
import { useTranslation } from '@/contexts/TranslationContext'

interface PhotoUploadProps {
  reportId: string
  onPhotosUploaded: (urls: string[]) => void
  maxPhotos?: number
}

export default function PhotoUpload({ reportId, onPhotosUploaded, maxPhotos = getMaxPhotos() }: PhotoUploadProps) {
  const { t } = useTranslation()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    // Clear the input value so selecting the same file again still fires onChange
    if (e.target) e.target.value = ''
    setError(null)

    if (files.length === 0) return

    // Check total count (already uploaded + already selected + new)
    if (uploadedUrls.length + selectedFiles.length + files.length > maxPhotos) {
      setError(t('walker.photoMaxExceeded', { max: maxPhotos }, `Maximum ${maxPhotos} photos allowed`))
      return
    }

    // Validate each file
    const validFiles: File[] = []
    files.forEach(file => {
      const validation = validatePhoto(file)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        setError(validation.error || 'Invalid file')
      }
    })

    if (validFiles.length === 0) return

    // Build previews (data URLs) for the new files
    const previewPromises = validFiles.map(file => new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('read failed'))
      reader.readAsDataURL(file)
    }))
    try {
      const newPreviews = await Promise.all(previewPromises)
      setPreviews(prev => [...prev, ...newPreviews])
    } catch {
      // Non-fatal — upload still proceeds
    }

    setSelectedFiles(prev => [...prev, ...validFiles])

    // Auto-upload immediately so the user doesn't need a second tap
    setUploading(true)
    try {
      const results = await Promise.all(validFiles.map(file => uploadPhoto(file, reportId)))
      const successfulUrls = results.filter(r => r.success).map(r => r.url!)
      const failedCount = results.filter(r => !r.success).length

      if (failedCount > 0) {
        setError(t('walker.somePhotosFailed', { count: failedCount }, `${failedCount} photo(s) failed to upload`))
      }

      if (successfulUrls.length > 0) {
        const nextUploaded = [...uploadedUrls, ...successfulUrls]
        setUploadedUrls(nextUploaded)
        onPhotosUploaded(nextUploaded)
        // Clear selected/preview state — the uploaded thumbnails show below
        setSelectedFiles([])
        setPreviews([])
      }
    } catch (err) {
      console.error('Auto-upload error:', err)
      setError(t('walker.uploadFailed', {}, 'Upload failed. Please try again.'))
    } finally {
      setUploading(false)
    }
  }

  const canAddMore = selectedFiles.length + uploadedUrls.length < maxPhotos

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {canAddMore && (
        <div className="space-y-2">
          {/* Camera input — single shot, no multiple (Android compatible) */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
          {/* Gallery input — multiple files, no capture */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex gap-2">
            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 px-3 py-3 border-2 border-dashed border-[#92998B]/50 rounded-lg text-[#92998B] hover:border-[#7D8DCC] hover:text-[#7D8DCC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1"
            >
              <span className="text-2xl">📷</span>
              <span className="text-xs font-medium">{t('walker.takePhoto', {}, 'Take photo')}</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 px-3 py-3 border-2 border-dashed border-[#92998B]/50 rounded-lg text-[#92998B] hover:border-[#7D8DCC] hover:text-[#7D8DCC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1"
            >
              <span className="text-2xl">🖼️</span>
              <span className="text-xs font-medium">{t('walker.choosePhoto', {}, 'From gallery')}</span>
            </button>
          </div>
          <p className="text-xs text-[#92998B] text-center">
            {uploadedUrls.length + selectedFiles.length}/{maxPhotos} {t('walker.photosAdded', {}, 'photos')} · {t('walker.photoFormats', {}, 'Max 20MB each')}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-[#FA9335]/10 border border-[#FA9335]/30 rounded-lg text-sm text-[#a0522d]">
          {error}
        </div>
      )}

      {/* Uploading indicator with previews */}
      {uploading && previews.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin text-[#7D8DCC]" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-sm text-[#614270]">
              {t('walker.uploading', {}, 'Uploading...')}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg opacity-60"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Photos */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-[#2a5200]">
            ✓ {t('walker.uploadedPhotos', { count: uploadedUrls.length }, `${uploadedUrls.length} photo(s) uploaded`)}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-[#9ED663]"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
