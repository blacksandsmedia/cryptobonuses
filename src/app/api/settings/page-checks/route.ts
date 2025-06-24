import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth-utils';

export async function GET() {
  try {
    const adminUser = await verifyAdminToken();
    
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create settings
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          autoCheckEnabled: true,
          autoCheckFrequency: 'weekly',
          autoCheckUserId: null,
        },
      });
    }

    // Get all admin users for the dropdown
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({
      settings: {
        autoCheckEnabled: settings.autoCheckEnabled,
        autoCheckFrequency: settings.autoCheckFrequency,
        autoCheckUserId: settings.autoCheckUserId,
      },
      adminUsers,
    });
  } catch (error) {
    console.error('Error fetching page check settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const adminUser = await verifyAdminToken();
    
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate the data
    if (typeof data.autoCheckEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'autoCheckEnabled must be a boolean' },
        { status: 400 }
      );
    }

    if (!['daily', 'weekly', 'monthly'].includes(data.autoCheckFrequency)) {
      return NextResponse.json(
        { error: 'autoCheckFrequency must be daily, weekly, or monthly' },
        { status: 400 }
      );
    }

    if (data.autoCheckUserId && typeof data.autoCheckUserId !== 'string') {
      return NextResponse.json(
        { error: 'autoCheckUserId must be a string or null' },
        { status: 400 }
      );
    }

    // Verify the user exists and is an admin if provided
    if (data.autoCheckUserId) {
      const user = await prisma.user.findUnique({
        where: { id: data.autoCheckUserId },
        select: { role: true },
      });

      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Selected user must be an admin' },
          { status: 400 }
        );
      }
    }

    // Get or create settings
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          autoCheckEnabled: data.autoCheckEnabled,
          autoCheckFrequency: data.autoCheckFrequency,
          autoCheckUserId: data.autoCheckUserId,
        },
      });
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          autoCheckEnabled: data.autoCheckEnabled,
          autoCheckFrequency: data.autoCheckFrequency,
          autoCheckUserId: data.autoCheckUserId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        autoCheckEnabled: settings.autoCheckEnabled,
        autoCheckFrequency: settings.autoCheckFrequency,
        autoCheckUserId: settings.autoCheckUserId,
      },
    });
  } catch (error) {
    console.error('Error updating page check settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 