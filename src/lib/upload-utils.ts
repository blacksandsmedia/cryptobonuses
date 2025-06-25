import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Get upload directory from environment or default to Railway volume
export const UPLOAD_DIR = process.env.UPLOAD_DIR || '/data/uploads';

/**
 * Ensure the upload directory exists
 */
export async function ensureUploadDir(): Promise<string> {
  try {
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
      console.log(`Created upload directory: ${UPLOAD_DIR}`);
    }
    return UPLOAD_DIR;
  } catch (error) {
    console.error('Error creating upload directory:', error);
    throw error;
  }
}

/**
 * Generate a public URL for an uploaded file
 * @param filename The filename of the uploaded file
 * @returns The public URL to access the file
 */
export function publicUploadUrl(filename: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  return `${baseUrl}/uploads/${filename}`;
}

/**
 * Get the full file path for an uploaded file
 * @param filename The filename of the uploaded file
 * @returns The full file system path
 */
export function getUploadPath(filename: string): string {
  return path.join(UPLOAD_DIR, filename);
}

/**
 * Create a SEO-friendly filename with timestamp
 * @param originalName The original filename
 * @param context Optional context (e.g., casino name)
 * @param type Optional type (e.g., 'logo', 'featured', 'screenshot')
 * @returns A clean, SEO-friendly filename
 */
export function createSEOFilename(originalName: string, context?: string, type?: string): string {
  // Get file extension
  const fileExt = originalName.split('.').pop() || 'png';
  
  if (context && type === 'featured') {
    // Create descriptive filename for featured images: "[casino-name]-bonus-offer"
    const cleanCasinoName = context
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    const timestamp = Date.now();
    return `${cleanCasinoName}-bonus-offer-${timestamp}.${fileExt}`;
  }
  
  if (context && type === 'logo') {
    // Create descriptive filename for logos: "[casino-name]-logo"
    const cleanCasinoName = context
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    const timestamp = Date.now();
    return `${cleanCasinoName}-logo-${timestamp}.${fileExt}`;
  }
  
  if (context && type === 'screenshot') {
    // Create descriptive filename for screenshots: "[casino-name]-screenshot"
    const cleanCasinoName = context
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    const timestamp = Date.now();
    return `${cleanCasinoName}-screenshot-${timestamp}.${fileExt}`;
  }
  
  if (context && type === 'profile') {
    // Create descriptive filename for profile pictures
    const cleanName = context
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    const timestamp = Date.now();
    return `${cleanName}-profile-${timestamp}.${fileExt}`;
  }
  
  // Fallback: create a timestamp-based filename
  const cleanOriginal = originalName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  const nameWithoutExt = cleanOriginal.replace(/\.[^/.]+$/, '');
  const timestamp = Date.now();
  
  return `${nameWithoutExt}-${timestamp}.${fileExt}`;
}

/**
 * Validate uploaded file type
 * @param fileType The MIME type of the uploaded file
 * @returns True if the file type is allowed
 */
export function isValidImageType(fileType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];
  
  return validTypes.includes(fileType);
}

/**
 * Validate file size
 * @param fileSize The size of the file in bytes
 * @param maxSizeMB Maximum allowed size in MB (default: 10MB)
 * @returns True if the file size is within limits
 */
export function isValidFileSize(fileSize: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
} 