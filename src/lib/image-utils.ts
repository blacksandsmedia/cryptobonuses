// Helper functions for handling image paths and optimization in the application

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
  
  // If path already starts with /images/ or /uploads/, preserve it exactly as is
  if (imagePath.startsWith('/images/') || imagePath.startsWith('/uploads/')) {
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
    
    // Try different variations of logo filename patterns
    const possibleLogoFiles = [
      `/images/${imagePath}.png`,
      `/images/${imagePath} Logo.png`,
      `/images/${casinoName} Logo.png`,
      `/images/${casinoName}Logo.png`
    ];
    
    // Default to first pattern, but in production you might want to check if files exist
    return possibleLogoFiles[0];
  }
  
  // If all else fails, assume it's in the uploads folder
  return `/uploads/${imagePath}`;
}

/**
 * Generate SEO-friendly alt text for casino images
 * @param casinoName The name of the casino
 * @param imageType The type of image (logo, screenshot, featured)
 * @param bonusInfo Optional bonus information
 * @returns SEO-optimized alt text
 */
export function generateImageAltText(
  casinoName: string, 
  imageType: 'logo' | 'screenshot' | 'featured' | 'bonus' | 'thumbnail' | 'card',
  bonusInfo?: string
): string {
  const currentYear = new Date().getFullYear();
  
  switch (imageType) {
    case 'logo':
      return `${casinoName} Logo - Crypto Casino Bonuses ${currentYear}`;
    case 'screenshot':
      return `${casinoName} Casino Screenshot - Bitcoin Gaming Platform ${currentYear}`;
    case 'featured':
      return `${casinoName} Casino${bonusInfo ? ` - ${bonusInfo}` : ''} - Crypto Bonuses ${currentYear}`;
    case 'bonus':
      return `${casinoName} Bonus Offer${bonusInfo ? ` - ${bonusInfo}` : ''} - Cryptocurrency Casino ${currentYear}`;
    case 'thumbnail':
      return `${casinoName} Casino Thumbnail - Crypto Gaming ${currentYear}`;
    case 'card':
      return `${casinoName} Casino Card - Bitcoin Bonuses ${currentYear}`;
    default:
      return `${casinoName} - Crypto Casino ${currentYear}`;
  }
}

/**
 * Get optimal image dimensions for different use cases
 * @param imageType The type of image
 * @returns Object with width and height
 */
export function getOptimalImageDimensions(imageType: 'logo' | 'screenshot' | 'featured' | 'thumbnail' | 'card') {
  const dimensions = {
    logo: { width: 200, height: 100 },
    screenshot: { width: 800, height: 600 },
    featured: { width: 1200, height: 630 }, // Perfect for social sharing
    thumbnail: { width: 300, height: 200 },
    card: { width: 400, height: 250 }
  };
  
  return dimensions[imageType] || dimensions.thumbnail;
}

/**
 * Generate Next.js Image component props for optimal performance
 * @param src Image source path
 * @param casinoName Casino name for alt text
 * @param imageType Type of image
 * @param priority Whether to load with priority
 * @returns Object with optimized props for Next.js Image component
 */
export function getOptimizedImageProps(
  src: string,
  casinoName: string,
  imageType: 'logo' | 'screenshot' | 'featured' | 'thumbnail' | 'card' = 'thumbnail',
  priority: boolean = false
) {
  const dimensions = getOptimalImageDimensions(imageType);
  const altText = generateImageAltText(casinoName, imageType);
  
  return {
    src: normalizeImagePath(src),
    alt: altText,
    width: dimensions.width,
    height: dimensions.height,
    priority,
    quality: imageType === 'logo' ? 100 : 90,
    className: imageType === 'logo' ? 'logo-crisp' : '',
    sizes: getSizesAttribute(imageType),
    loading: priority ? 'eager' as const : 'lazy' as const,
  };
}

/**
 * Get the sizes attribute for responsive images
 * @param imageType Type of image
 * @returns Sizes attribute string for responsive images
 */
function getSizesAttribute(imageType: string): string {
  switch (imageType) {
    case 'logo':
      return '(max-width: 768px) 150px, 200px';
    case 'featured':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px';
    case 'screenshot':
      return '(max-width: 768px) 90vw, (max-width: 1200px) 70vw, 800px';
    case 'card':
      return '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 400px';
    default:
      return '(max-width: 768px) 50vw, 300px';
  }
}

/**
 * Check if an image path is from the uploads directory (user uploaded)
 * @param imagePath The image path to check
 * @returns True if the image is from uploads directory
 */
export function isUploadedImage(imagePath: string): boolean {
  return imagePath.startsWith('/uploads/') || imagePath.includes('/uploads/');
}

/**
 * Get fallback image paths for error handling
 * @param casinoName Casino name
 * @param imageType Type of image
 * @returns Array of fallback image paths to try
 */
export function getFallbackImagePaths(casinoName: string, imageType: 'logo' | 'screenshot' | 'featured'): string[] {
  const cleanName = casinoName.replace(/[^a-zA-Z0-9]/g, '');
  const fallbacks: string[] = [];
  
  if (imageType === 'logo') {
    fallbacks.push(
      `/images/${casinoName} Logo.png`,
      `/images/${casinoName.replace(/\s+/g, '')} Logo.png`,
      `/images/${cleanName} Logo.png`,
      `/images/${cleanName}Logo.png`,
      '/images/Simplified Logo.png' // Ultimate fallback
    );
  } else {
    fallbacks.push('/images/Simplified Logo.png');
  }
  
  return fallbacks;
}

/**
 * Create a structured data object for images (SEO)
 * @param imagePath Image path
 * @param casinoName Casino name
 * @param imageType Type of image
 * @returns Structured data object for SEO
 */
export function createImageStructuredData(
  imagePath: string,
  casinoName: string,
  imageType: 'logo' | 'screenshot' | 'featured'
) {
  const baseUrl = 'https://cryptobonuses.com';
  const fullImageUrl = imagePath.startsWith('http') ? imagePath : `${baseUrl}${normalizeImagePath(imagePath)}`;
  
  return {
    '@type': 'ImageObject',
    url: fullImageUrl,
    name: generateImageAltText(casinoName, imageType),
    description: `${casinoName} casino ${imageType} - Crypto bonuses and Bitcoin gaming`,
    contentUrl: fullImageUrl,
    width: getOptimalImageDimensions(imageType).width,
    height: getOptimalImageDimensions(imageType).height,
  };
}