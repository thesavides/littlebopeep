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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setError(null)

    // Check total count
    if (selectedFiles.length + files.length > maxPhotos) {
      setError(t('walker.photoMaxExceeded', { max: maxPhotos }, `Maximum ${maxPhotos} photos allowed`))
      return
    }

    // Validate each file
    const validFiles: File[] = []
    const newPreviews: string[] = []

    files.forEach(file => {
      const validation = validatePhoto(file)
      if (validation.valid) {
        validFiles.push(file)
        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          if (newPreviews.length === validFiles.length) {
            setPreviews([...previews, ...newPreviews])
          }
        }
        reader.readAsDataURL(file)
      } else {
        setError(validation.error || 'Invalid file')
      }
    })

    setSelectedFiles([...selectedFiles, ...validFiles])
  }

  const handleRemove = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setPreviews(newPreviews)
    setError(null)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError(t('walker.noPhotosSelected', {}, 'No photos selected'))
      return
    }

    setUploading(true)
    setError(null)

    try {
      const uploadPromises = selectedFiles.map(file => uploadPhoto(file, reportId))
      const results = await Promise.all(uploadPromises)

      const successfulUrls = results
        .filter(r => r.success)
        .map(r => r.url!)

      const failedCount = results.filter(r => !r.success).length

      if (failedCount > 0) {
        setError(t('walker.somePhotosFailed', { count: failedCount }, `${failedCount} photo(s) failed to upload`))
      }

      if (successfulUrls.length > 0) {
        setUploadedUrls([...uploadedUrls, ...successfulUrls])
        onPhotosUploaded([...uploadedUrls, ...successfulUrls])
        // Clear selected files and previews
        setSelectedFiles([])
        setPreviews([])
      }
    } catch (error) {
      console.error('Upload error:', error)
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

      {/* Selected Photos Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#614270]">
              {t('walker.selectedPhotos', {}, 'Selected Photos')}
            </span>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-[#7D8DCC] text-white rounded-lg hover:bg-[#6b7bb8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {uploading ? t('walker.uploading', {}, 'Uploading...') : t('walker.uploadPhotos', {}, 'Upload Photos')}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemove(index)}
                  disabled={uploading}
                  className="absolute top-1 right-1 p-1 bg-[#FA9335] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
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
