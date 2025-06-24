import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic'; // Prevent static generation

// POST - Subscribe to newsletter
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscription = await prisma.newsletter.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingSubscription) {
      if (existingSubscription.status === 'SUBSCRIBED') {
        return NextResponse.json(
          { message: 'Email is already subscribed to our newsletter' },
          { status: 200 }
        );
      } else {
        // Resubscribe if previously unsubscribed
        await prisma.newsletter.update({
          where: { email: email.toLowerCase() },
          data: { status: 'SUBSCRIBED', updatedAt: new Date() }
        });
        return NextResponse.json(
          { message: 'Successfully resubscribed to the newsletter!' },
          { status: 200 }
        );
      }
    }

    // Create new subscription
    await prisma.newsletter.create({
      data: {
        email: email.toLowerCase()
      }
    });

    return NextResponse.json(
      { message: 'Successfully subscribed to the newsletter!' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

// GET - Export newsletter list (Admin only)
export async function GET(request: Request) {
  try {
    const adminUser = await verifyAdminToken();
    
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const newsletters = await prisma.newsletter.findMany({
      where: { status: 'SUBSCRIBED' },
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'csv') {
      // Return CSV format
      const csvHeaders = 'Email,Subscribed Date\n';
      const csvData = newsletters.map(sub => 
        `${sub.email},${sub.createdAt.toISOString().split('T')[0]}`
      ).join('\n');
      
      const csvContent = csvHeaders + csvData;
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Return JSON format with stats
    const totalSubscribers = newsletters.length;
    const subscribersThisMonth = newsletters.filter(sub => {
      const subDate = new Date(sub.createdAt);
      const now = new Date();
      return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear();
    }).length;

    return NextResponse.json({
      totalSubscribers,
      subscribersThisMonth,
      subscribers: newsletters.map(sub => ({
        id: sub.id,
        email: sub.email,
        status: sub.status,
        subscribedAt: sub.createdAt
      }))
    });

  } catch (error) {
    console.error('Newsletter export error:', error);
    return NextResponse.json(
      { error: 'Failed to export newsletter data' },
      { status: 500 }
    );
  }
} 