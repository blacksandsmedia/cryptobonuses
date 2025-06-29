import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    console.log('[Visitor Tracking] Processing visitor data:', {
      actionType: data.actionType,
      path: data.path,
      sessionId: data.sessionId
    });

    // Validate required fields
    if (!data.actionType || !data.path || !data.sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get client IP for additional uniqueness
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIP = forwarded ? forwarded.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Create a unique visitor identifier combining session ID and IP
    const visitorId = `${data.sessionId}_${clientIP}`;
    
    // Check if this exact visitor has already been tracked today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingVisit = await prisma.offerTracking.findFirst({
      where: {
        actionType: 'page_visit',
        path: data.path,
        searchTerm: visitorId, // Using searchTerm field to store visitor ID
        createdAt: {
          gte: today
        }
      }
    });

    if (existingVisit) {
      console.log('[Visitor Tracking] 📝 Visitor already tracked today:', visitorId);
      return NextResponse.json({ 
        success: true, 
        message: 'Already tracked today',
        isNewVisitor: false
      });
    }

    // Record the page visit
    const trackingId = `tr_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    await prisma.offerTracking.create({
      data: {
        id: trackingId,
        actionType: 'page_visit',
        path: data.path,
        searchTerm: visitorId, // Store visitor ID in searchTerm field
        createdAt: new Date()
      }
    });

    console.log('[Visitor Tracking] ✅ New visitor recorded:', {
      trackingId,
      visitorId,
      path: data.path
    });

    return NextResponse.json({ 
      success: true,
      isNewVisitor: true,
      trackingId
    });

  } catch (error) {
    console.error('[Visitor Tracking] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 