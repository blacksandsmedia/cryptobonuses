import { prisma } from './prisma';

/**
 * Generate a username from a user's name
 */
export function generateBaseUsername(name: string | null): string {
  if (!name || name.trim() === '') {
    return 'user';
  }

  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 20) // Limit length
    || 'user'; // Fallback if everything was removed
}

/**
 * Generate a unique username from a user's name
 */
export async function generateUniqueUsername(name: string | null): Promise<string> {
  const baseUsername = generateBaseUsername(name);
  
  // Check if base username is available
  const existingUser = await prisma.user.findUnique({
    where: { username: baseUsername }
  });

  if (!existingUser) {
    return baseUsername;
  }

  // If base username exists, try with numbers
  let counter = 1;
  let uniqueUsername = `${baseUsername}-${counter}`;
  
  while (counter < 1000) { // Limit attempts to prevent infinite loop
    const existing = await prisma.user.findUnique({
      where: { username: uniqueUsername }
    });
    
    if (!existing) {
      return uniqueUsername;
    }
    
    counter++;
    uniqueUsername = `${baseUsername}-${counter}`;
  }

  // If all attempts fail, use a random string
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseUsername}-${randomSuffix}`;
} 