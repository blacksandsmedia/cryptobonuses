import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30; // Reduced from 60 to 30 seconds for better UX
export const dynamic = 'force-dynamic'; // Prevent static generation

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7days';
    const casinoId = searchParams.get('casinoId') || null;
    const forceRefresh = searchParams.get('refresh') === 'true';
    const debug = searchParams.get('debug') === 'true';
    
    // Get custom date range parameters if present
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    // Get the current timezone offset in minutes
    const timezoneOffsetMinutes = new Date().getTimezoneOffset();
    const timezoneOffsetMs = timezoneOffsetMinutes * 60 * 1000;
    const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    console.log(`Current timezone: ${clientTimezone}`);
    console.log(`Timezone offset: ${timezoneOffsetMinutes} minutes (${timezoneOffsetMs} ms)`);
    
    // Debug mode - return raw data without processing
    if (debug) {
      const rawData = await prisma.offerTracking.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      });
      return NextResponse.json(rawData);
    }

    // Calculate date range based on timeframe
    const currentDate = new Date();
    let startDate = new Date();
    
    // If custom date range is provided, use it
    if (timeframe === 'custom' && startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      // For end date, set time to end of day to include the entire day
      currentDate.setTime(new Date(endDateParam).getTime());
      currentDate.setHours(23, 59, 59, 999);
      
      console.log(`Using custom date range: ${startDate.toISOString()} to ${currentDate.toISOString()}`);
    } else {
      // Adjust the start date based on the selected timeframe
      switch (timeframe) {
        case 'today':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
          break;
        case 'yesterday':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1);
          currentDate.setDate(currentDate.getDate() - 1);
          currentDate.setHours(23, 59, 59, 999);
          break;
        case '7days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'alltime':
          // Instead of beginning of time, use a reasonable limit (e.g., 1 year ago)
          // to prevent performance issues with very large datasets
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7); // Default to 7 days
      }
    }
    
    // Apply timezone offset to make sure we're getting the right dates in local time
    // The database might store dates in UTC, but we want to filter based on local time
    const startDateUTC = new Date(startDate.getTime() - (timezoneOffsetMinutes * 60000));
    const currentDateUTC = new Date(currentDate.getTime() - (timezoneOffsetMinutes * 60000));
    
    // Base query conditions
    const where = {
      createdAt: {
        gte: startDateUTC,
        lte: currentDateUTC
      }
    };
    
    // If we're getting data for a specific casino, add that condition
    if (casinoId) {
      // For single casino view - use proper joins
      const casino = await prisma.casino.findUnique({
        where: { id: casinoId },
        include: {
          bonuses: true
        }
      });
      
      if (!casino) {
        return NextResponse.json({ error: "Casino not found" }, { status: 404 });
      }
      
      // Get tracking data for this casino within the timeframe with proper joins
      const isAllTime = timeframe === 'alltime';
      const trackingLimit = isAllTime ? 5000 : undefined; // Limit to 5k records for all-time casino view
      
      const trackings = await prisma.offerTracking.findMany({
        where: {
          ...where,
          casinoId: casinoId,
          // Only include tracking records for non-search actions
          actionType: {
            in: ['code_copy', 'offer_click']
          }
        },
        include: {
          casino: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true
            }
          },
          bonus: {
            select: {
              id: true,
              title: true,
              code: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        ...(trackingLimit && { take: trackingLimit })
      });
      
      // Process trackings data to get statistics
      const transformedTrackings = trackings.map(tracking => ({
        id: tracking.id,
        casinoId: tracking.casinoId,
        bonusId: tracking.bonusId,
        actionType: tracking.actionType,
        createdAt: tracking.createdAt,
        casinoName: tracking.casino?.name || casino.name,
        casinoSlug: tracking.casino?.slug || casino.slug,
        casinoLogo: tracking.casino?.logo || casino.logo,
        bonusTitle: tracking.bonus?.title || "Unknown Bonus",
        bonusCode: tracking.bonus?.code || null
      }));
      
      // Organize data by date for the chart
      const dailyActivityMap = new Map();
      
      // For "alltime", only initialize dates that have actual data to prevent memory issues
      // For other timeframes, initialize the full range
      if (timeframe === 'alltime') {
        // Only create entries for dates that have actual tracking data
        transformedTrackings.forEach(tracking => {
          const date = new Date(tracking.createdAt);
          const dateString = date.toISOString().split('T')[0];
          if (!dailyActivityMap.has(dateString)) {
            dailyActivityMap.set(dateString, { date: dateString, copies: 0, clicks: 0, total: 0 });
          }
        });
      } else {
        // Initialize with dates in the selected range for other timeframes
        let currentDay = new Date(startDate);
        while (currentDay <= currentDate) {
          const dateString = currentDay.toISOString().split('T')[0];
          dailyActivityMap.set(dateString, { date: dateString, copies: 0, clicks: 0, total: 0 });
          currentDay.setDate(currentDay.getDate() + 1);
        }
      }
      
      // Populate with actual data
      transformedTrackings.forEach(tracking => {
        const date = new Date(tracking.createdAt);
        const dateString = date.toISOString().split('T')[0];
        
        if (!dailyActivityMap.has(dateString)) {
          dailyActivityMap.set(dateString, { date: dateString, copies: 0, clicks: 0, total: 0 });
        }
        
        const dayData = dailyActivityMap.get(dateString);
        
        if (tracking.actionType === 'code_copy') {
          dayData.copies += 1;
        } else if (tracking.actionType === 'offer_click') {
          dayData.clicks += 1;
        }
        
        dayData.total += 1;
      });
      
      // Convert Map to array and sort by date
      const dailyActivity = Array.from(dailyActivityMap.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculate totals
      const totalActions = transformedTrackings.length;
      const totalCopies = transformedTrackings.filter(t => t.actionType === 'code_copy').length;
      const totalClicks = transformedTrackings.filter(t => t.actionType === 'offer_click').length;
      
      // For single casino view
      return NextResponse.json({
        casinoDetails: {
          id: casino.id,
          name: casino.name,
          slug: casino.slug,
          logo: casino.logo,
          description: casino.description,
          rating: casino.rating
        },
        bonusDetails: casino.bonuses.map(bonus => ({
          id: bonus.id,
          title: bonus.title,
          code: bonus.code,
          types: bonus.types,
          value: bonus.value,
          copies: transformedTrackings.filter(t => t.bonusId === bonus.id && t.actionType === "code_copy").length,
          clicks: transformedTrackings.filter(t => t.bonusId === bonus.id && t.actionType === "offer_click").length
        })),
        analytics: {
          totalActions,
          totalCopies,
          totalClicks,
          dailyActivity,
          recentActivity: transformedTrackings
        }
      });
    } else {
      // For overall analytics dashboard - use proper joins
      
      // Get tracking data within the timeframe with proper joins
      // For "alltime", limit to prevent performance issues
      const isAllTime = timeframe === 'alltime';
      const trackingLimit = isAllTime ? 10000 : undefined; // Limit to 10k records for all-time
      
      const trackings = await prisma.offerTracking.findMany({
        where: {
          ...where,
          // Only include tracking records for non-search actions
          actionType: {
            in: ['code_copy', 'offer_click']
          }
        },
        include: {
          casino: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true
            }
          },
          bonus: {
            select: {
              id: true,
              title: true,
              code: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        ...(trackingLimit && { take: trackingLimit })
      });
      
      // Process trackings data to get statistics for overall analytics dashboard
      const transformedTrackings = trackings.map(tracking => ({
        id: tracking.id,
        casinoId: tracking.casinoId,
        bonusId: tracking.bonusId,
        actionType: tracking.actionType,
        createdAt: tracking.createdAt,
        casinoName: tracking.casino?.name || "Unknown Casino",
        casinoSlug: tracking.casino?.slug || "",
        casinoLogo: tracking.casino?.logo || "",
        bonusTitle: tracking.bonus?.title || "Unknown Bonus",
        bonusCode: tracking.bonus?.code || null
      }));
      
      // Get all casinos with their bonuses for analytics
      const casinos = await prisma.casino.findMany({
        include: {
          bonuses: true
        }
      });
      
      // Calculate casino-specific analytics
      const casinoAnalytics = casinos.map(casino => {
        const casinoTrackings = transformedTrackings.filter(t => t.casinoId === casino.id);
        const totalActions = casinoTrackings.length;
        const copies = casinoTrackings.filter(t => t.actionType === 'code_copy').length;
        const clicks = casinoTrackings.filter(t => t.actionType === 'offer_click').length;
        
        return {
          id: casino.id,
          name: casino.name,
          slug: casino.slug,
          logo: casino.logo,
          totalActions,
          copies,
          clicks,
          bonuses: casino.bonuses.map(bonus => ({
            id: bonus.id,
            title: bonus.title,
            code: bonus.code,
            types: bonus.types,
            value: bonus.value,
            copies: casinoTrackings.filter(t => t.bonusId === bonus.id && t.actionType === "code_copy").length,
            clicks: casinoTrackings.filter(t => t.bonusId === bonus.id && t.actionType === "offer_click").length
          }))
        };
      }).sort((a, b) => b.totalActions - a.totalActions); // Sort by most actions
      
      // Organize data by date for the chart
      const dailyActivityMap = new Map();
      
      // For "alltime", only initialize dates that have actual data to prevent memory issues
      // For other timeframes, initialize the full range
      if (timeframe === 'alltime') {
        // Only create entries for dates that have actual tracking data
        transformedTrackings.forEach(tracking => {
          const date = new Date(tracking.createdAt);
          const dateString = date.toISOString().split('T')[0];
          if (!dailyActivityMap.has(dateString)) {
            dailyActivityMap.set(dateString, { date: dateString, copies: 0, clicks: 0, total: 0 });
          }
        });
      } else {
        // Initialize with dates in the selected range for other timeframes
        let currentDay = new Date(startDate);
        while (currentDay <= currentDate) {
          const dateString = currentDay.toISOString().split('T')[0];
          dailyActivityMap.set(dateString, { date: dateString, copies: 0, clicks: 0, total: 0 });
          currentDay.setDate(currentDay.getDate() + 1);
        }
      }
      
      // Populate with actual data
      transformedTrackings.forEach(tracking => {
        const date = new Date(tracking.createdAt);
        const dateString = date.toISOString().split('T')[0];
        
        if (!dailyActivityMap.has(dateString)) {
          dailyActivityMap.set(dateString, { date: dateString, copies: 0, clicks: 0, total: 0 });
        }
        
        const dayData = dailyActivityMap.get(dateString);
        
        if (tracking.actionType === 'code_copy') {
          dayData.copies += 1;
        } else if (tracking.actionType === 'offer_click') {
          dayData.clicks += 1;
        }
        
        dayData.total += 1;
      });
      
      // Convert Map to array and sort by date
      const dailyActivity = Array.from(dailyActivityMap.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculate totals
      const totalActions = transformedTrackings.length;
      const totalCopies = transformedTrackings.filter(t => t.actionType === 'code_copy').length;
      const totalClicks = transformedTrackings.filter(t => t.actionType === 'offer_click').length;
      
      // For overall dashboard
      return NextResponse.json({
        overall: {
          totalActions,
          totalCopies,
          totalClicks
        },
        casinoAnalytics,
        dailyActivity,
        recentActivity: transformedTrackings
      });
    }
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 });
  }
} 