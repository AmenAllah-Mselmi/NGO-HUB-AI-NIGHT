import supabase from './supabase'

// File validation constants
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Validate file type and size
 */
export const validateFile = (
  file: File,
  allowedTypes: string[],
  maxSize: number
): { valid: boolean; error?: string } => {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`
    }
  }

  return { valid: true }
}

/**
 * Generate unique filename
 */
const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${timestamp}-${randomString}.${extension}`
}
export const uploadAvatarImage = async (file: File): Promise<UploadResult> => {
  try {
    // Validate file
    const validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name)
    const filePath = `avatar/${filename}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profiles_images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profiles_images')
      .getPublicUrl(data.path)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'Failed to upload image' }
  }
}


/**
 * Upload activity image to Supabase Storage
 */
export const uploadActivityImage = async (file: File): Promise<UploadResult> => {
  try {
    // Validate file
    const validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name)
    const filePath = `activities/${filename}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('activity-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('activity-images')
      .getPublicUrl(data.path)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'Failed to upload image' }
  }
}

/**
 * Upload activity attachment (PV, course materials, etc.)
 */
export const uploadActivityAttachment = async (file: File): Promise<UploadResult> => {
  try {
    // Validate file
    const validation = validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name)
    const filePath = `attachments/${filename}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('activity-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('activity-attachments')
      .getPublicUrl(data.path)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'Failed to upload attachment' }
  }
}

/**
 * Upload multiple recap images
 */
export const uploadRecapImages = async (files: File[]): Promise<UploadResult[]> => {
  const uploadPromises = files.map(file => uploadActivityImage(file))
  return Promise.all(uploadPromises)
}

/**
 * Delete file from Supabase Storage
 */
export const deleteFile = async (fileUrl: string, bucket: 'activity-images' | 'activity-attachments'): Promise<boolean> => {
  try {
    // Extract file path from URL
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split(`/storage/v1/object/public/${bucket}/`)
    if (pathParts.length < 2) {
      console.error('Invalid file URL')
      return false
    }
    const filePath = pathParts[1]

    // Delete from storage
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

/**
 * Extract file path from Supabase Storage URL
 */
export const extractFilePath = (url: string): string | null => {
  try {
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/)
    return pathMatch ? pathMatch[1] : null
  } catch {
    return null
  }
}
