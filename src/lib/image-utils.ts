// Helper functions for handling image paths in the application

/**
 * Generate alternative logo paths for fallback handling
 * @param casinoName The name of the casino
 * @param currentPath The current image path that failed
 * @returns Array of alternative image paths to try
 */
export function getAlternativeLogoPaths(casinoName: string, currentPath: string): string[] {
  const alternatives: string[] = [];
  
  // Start with the current path
  alternatives.push(currentPath);
  
  // Try various logo naming conventions
  const cleanName = casinoName.replace(/[^a-zA-Z0-9]/g, '');
  const nameWithSpaces = casinoName;
  
  // Add different possible paths
  alternatives.push(`/images/${nameWithSpaces} Logo.png`);
  alternatives.push(`/images/${cleanName} Logo.png`);
  alternatives.push(`/images/${nameWithSpaces}Logo.png`);
  alternatives.push(`/images/${cleanName}Logo.png`);
  alternatives.push(`/images/${nameWithSpaces.toLowerCase()} logo.png`);
  alternatives.push(`/images/${cleanName.toLowerCase()} logo.png`);
  
  // Try uploads directory
  alternatives.push(`/uploads/${nameWithSpaces} Logo.png`);
  alternatives.push(`/uploads/${cleanName} Logo.png`);
  
  // Final fallbacks
  alternatives.push('/images/Simplified Logo.png');
  alternatives.push('/images/CryptoBonuses Logo.png');
  
  // Remove duplicates and return
  return [...new Set(alternatives)];
}