export function normalizeImagePath(path: string | null | undefined): string {
  if (!path) {
    // If no image path is provided, use a fallback image
    return '/images/Simplified Logo.png';
  }
  
  // Handle absolute URLs (http/https) - return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Fix ONLY clearly broken paths that include 'public/images'
  if (path.includes('public/images/')) {
    return path.replace('/images/public/images/', '/images/').replace('public/images/', '/images/');
  }
  
  // If path already starts with /images/, preserve it exactly as is
  if (path.startsWith('/images/')) {
    return path;
  }
  
  // If path starts with /uploads/, preserve it (for Railway volume storage)
  if (path.startsWith('/uploads/')) {
    return path;
  }
  
  // Fix paths that include just 'images/' without leading slash
  if (path.startsWith('images/')) {
    return `/${path}`;
  }
  
  // If it's just a filename, try to determine if it's a logo or upload
  if (!path.includes('/')) {
    // If it looks like an upload ID (UUID-like), treat as upload
    if (path.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i)) {
      return `/uploads/${path}`;
    }
    
    // If it contains 'Logo' or looks like a logo filename, use images folder
    if (path.includes('Logo') || path.toLowerCase().includes('logo')) {
      const filename = path.endsWith('.png') ? path : `${path}.png`;
      return `/images/${filename}`;
    }
    
    // Default to uploads for other filenames
    return `/uploads/${path}`;
  }
  
  // If the path starts with /, return as is
  if (path.startsWith('/')) {
    return path;
  }
  
  // If all else fails, assume it's in the images folder
  return `/images/${path}`;
}

/**
 * Formats a date as a human-readable "time ago" string (e.g., "5 minutes ago", "2 hours ago")
 * @param date The date to format (ISO string or Date object)
 * @returns A human-readable string representing the time elapsed
 */
export function formatTimeAgo(date: Date | string): string {
  let dateObj: Date;
  
  // Handle string dates properly
  if (typeof date === 'string') {
    // Parse ISO string to ensure consistent timezone handling
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'unknown';
  }
  
  // Get current time
  const now = new Date();
  
  // Calculate the time difference in milliseconds
  // Account for timezone offset issues by using UTC times
  const nowUTC = now.getTime();
  const dateUTC = dateObj.getTime();
  
  // If the date appears to be in the future (timezone issue), adjust it
  let timeDiff = nowUTC - dateUTC;
  if (timeDiff < 0 && Math.abs(timeDiff) < 7200000) { // Less than 2 hours in the future
    // Likely a timezone issue, adjust by 1 hour (3600000 ms)
    timeDiff = timeDiff + 3600000;
  }
  
  // Convert to seconds
  const seconds = Math.floor(Math.abs(timeDiff) / 1000);
  
  // Less than a minute - show seconds
  if (seconds < 60) {
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
  }
  
  // Less than an hour - show minutes
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day - show hours
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a week - show days
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Format as date if older than a week
  return dateObj.toLocaleDateString();
} 