// Helper functions for handling image paths in the application

/**
 * Normalizes image paths to ensure they point to the correct location
 * @param imagePath The original image path
 * @returns A normalized image path that correctly points to the image
 */
export function normalizeImagePath(imagePath: string | null): string {
  if (!imagePath) {
    // If no image path is provided, use a fallback image
    return '/images/Simplified Logo.png';
  }
  
  // Handle absolute URLs (http/https) - return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Fix ONLY clearly broken paths that include 'public/images'
  if (imagePath.includes('public/images/')) {
    return imagePath.replace('/images/public/images/', '/images/').replace('public/images/', '/images/');
  }
  
  // If path already starts with /images/, preserve it exactly as is
  if (imagePath.startsWith('/images/')) {
    return imagePath;
  }
  
  // If path starts with /uploads/, preserve it (for Railway volume storage)
  if (imagePath.startsWith('/uploads/')) {
    return imagePath;
  }
  
  // Fix paths that include just 'images/' without leading slash
  if (imagePath.startsWith('images/')) {
    return `/${imagePath}`;
  }
  
  // For casino logo images, check if file exists in /images directory by name
  if (imagePath.includes('Logo') || imagePath.toLowerCase().includes('logo')) {
    // Try to use the correct path format for logo files
    const filename = imagePath.split('/').pop();
    if (filename) {
      // Handle both formats: with or without spaces, with or without .png extension
      const normalizedFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
      return `/images/${normalizedFilename}`;
    }
  }
  
  // For uploaded files, ensure they're in uploads directory
  if (imagePath.startsWith('/')) {
    // Path already has leading slash, return as is
    return imagePath;
  }
  
  // If it's just a filename, first try as a logo in images folder
  if (!imagePath.includes('/')) {
    const casinoName = imagePath.replace(/[^a-zA-Z0-9]/g, ''); // Remove non-alphanumeric chars
    
    // If the filename doesn't end with .png, add it
    const filename = imagePath.endsWith('.png') ? imagePath : `${imagePath}.png`;
    
    // Return the properly formatted path
    return `/images/${filename}`;
  }
  
  // If all else fails, assume it's in the images folder
  return `/images/${imagePath}`;
}