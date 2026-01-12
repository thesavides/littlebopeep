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
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm">
                {t('walker.addPhotos', {}, 'Add Photos')} ({uploadedUrls.length + selectedFiles.length}/{maxPhotos})
              </span>
              <span className="text-xs text-slate-400">
                {t('walker.photoFormats', {}, 'JPEG, PNG, WebP • Max 5MB')}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Selected Photos Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              {t('walker.selectedPhotos', {}, 'Selected Photos')}
            </span>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
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
          <span className="text-sm font-medium text-green-700">
            ✓ {t('walker.uploadedPhotos', { count: uploadedUrls.length }, `${uploadedUrls.length} photo(s) uploaded`)}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-green-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
