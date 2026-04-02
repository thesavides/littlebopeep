import { supabase } from './supabase-client'

/**
 * Photo upload utilities for sheep report photos
 * Handles compression, validation, and Supabase Storage upload
 */

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB (HEIC files can be large before conversion)
const MAX_PHOTOS = 3
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const BUCKET_NAME = 'sheep-report-photos'

/**
 * Convert HEIC/HEIF to JPEG using heic2any (client-side, no server needed)
 */
async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import('heic2any')).default
  const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 }) as Blob
  // heic2any can return an array when converting multi-page; take first
  const resultBlob = Array.isArray(blob) ? blob[0] : blob
  const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
  return new File([resultBlob], newName, { type: 'image/jpeg' })
}

export interface PhotoUploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Validate photo file before upload
 */
export function validatePhoto(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  // Accept all image/* types — browsers may report HEIC as empty string on some devices
  const isImage = file.type.startsWith('image/') || ALLOWED_TYPES.includes(file.type) || file.type === ''
  if (!isImage) {
    return { valid: false, error: 'Please select an image file' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
  }

  return { valid: true }
}

/**
 * Compress image to reduce file size
 * Uses canvas to resize and compress
 */
export async function compressPhoto(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Could not compress image'))
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () => reject(new Error('Could not load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Upload photo to Supabase Storage
 */
export async function uploadPhoto(
  file: File,
  reportId: string
): Promise<PhotoUploadResult> {
  try {
    // Validate file
    const validation = validatePhoto(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Convert HEIC/HEIF to JPEG before compressing (non-Safari browsers can't decode HEIC on canvas)
    const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || /\.(heic|heif)$/i.test(file.name)
    const processableFile = isHeic ? await convertHeicToJpeg(file) : file

    // Compress image
    const compressedBlob = await compressPhoto(processableFile)

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${reportId}/${timestamp}-${randomString}.${extension}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, compressedBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg',
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error('Photo upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Upload multiple photos
 */
export async function uploadMultiplePhotos(
  files: File[],
  reportId: string
): Promise<PhotoUploadResult[]> {
  if (files.length > MAX_PHOTOS) {
    throw new Error(`Maximum ${MAX_PHOTOS} photos allowed per report`)
  }

  const uploadPromises = files.map((file) => uploadPhoto(file, reportId))
  return Promise.all(uploadPromises)
}

/**
 * Delete photo from Supabase Storage
 */
export async function deletePhoto(photoUrl: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = photoUrl.split('/storage/v1/object/public/sheep-report-photos/')
    if (urlParts.length < 2) {
      console.error('Invalid photo URL format')
      return false
    }

    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('Error deleting photo:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Photo deletion error:', error)
    return false
  }
}

/**
 * Delete all photos for a report
 */
export async function deleteReportPhotos(photoUrls: string[]): Promise<void> {
  const deletePromises = photoUrls.map((url) => deletePhoto(url))
  await Promise.all(deletePromises)
}

/**
 * Get storage bucket info
 */
export function getStorageBucketName(): string {
  return BUCKET_NAME
}

/**
 * Get max photos allowed
 */
export function getMaxPhotos(): number {
  return MAX_PHOTOS
}
