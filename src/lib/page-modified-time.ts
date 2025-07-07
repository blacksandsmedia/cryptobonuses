import { prisma } from '@/lib/prisma';

interface PageModifiedTimeOptions {
  pageSlug?: string;
  pageType?: 'homepage' | 'casino' | 'legal' | 'other';
  contentUpdatedAt?: Date | string | null;
}

/**
 * Determines the most recent modification time for a page based on:
 * 1. Content updates (database record updatedAt)
 * 2. Page check timestamps
 * 3. Falls back to current time if no data available
 */
export async function getPageModifiedTime(options: PageModifiedTimeOptions): Promise<string> {
  const { pageSlug, pageType = 'other', contentUpdatedAt } = options;
  
  let mostRecentTime = new Date();
  
  try {
    // Convert content updated time to Date if provided
    let contentTime: Date | null = null;
    if (contentUpdatedAt) {
      contentTime = new Date(contentUpdatedAt);
    }
    
    // Get the most recent page check for this page
    let pageCheckTime: Date | null = null;
    if (pageSlug) {
      const mostRecentPageCheck = await prisma.pageCheck.findFirst({
        where: {
          pageSlug: pageSlug,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          createdAt: true,
        },
      });
      
      if (mostRecentPageCheck) {
        pageCheckTime = mostRecentPageCheck.createdAt;
      }
    }
    
    // For homepage, also check for recent casino updates
    if (pageType === 'homepage') {
      const recentCasinoUpdate = await prisma.casino.findFirst({
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          updatedAt: true,
        },
      });
      
      if (recentCasinoUpdate && recentCasinoUpdate.updatedAt) {
        const casinoUpdateTime = new Date(recentCasinoUpdate.updatedAt);
        if (!contentTime || casinoUpdateTime > contentTime) {
          contentTime = casinoUpdateTime;
        }
      }
    }
    
    // Determine the most recent time
    const times = [contentTime, pageCheckTime].filter(Boolean) as Date[];
    
    if (times.length > 0) {
      mostRecentTime = new Date(Math.max(...times.map(t => t.getTime())));
    }
    
  } catch (error) {
    console.error('Error determining page modified time:', error);
    // Fall back to current time on error
    mostRecentTime = new Date();
  }
  
  return mostRecentTime.toISOString();
}

/**
 * Gets the most recent modification time for the homepage
 * Considers casino updates and general page checks
 */
export async function getHomepageModifiedTime(): Promise<string> {
  return getPageModifiedTime({
    pageType: 'homepage',
    pageSlug: 'homepage', // Use a consistent slug for homepage checks
  });
}

/**
 * Gets the most recent modification time for a casino page
 */
export async function getCasinoPageModifiedTime(casinoSlug: string, casinoUpdatedAt?: Date | string | null): Promise<string> {
  return getPageModifiedTime({
    pageSlug: casinoSlug,
    pageType: 'casino',
    contentUpdatedAt: casinoUpdatedAt,
  });
}

/**
 * Gets the most recent modification time for a legal page
 */
export async function getLegalPageModifiedTime(pageSlug: string, legalPageUpdatedAt?: Date | string | null): Promise<string> {
  return getPageModifiedTime({
    pageSlug: pageSlug,
    pageType: 'legal',
    contentUpdatedAt: legalPageUpdatedAt,
  });
} 