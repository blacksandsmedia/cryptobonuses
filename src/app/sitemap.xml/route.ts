import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const baseUrl = 'https://cryptobonuses.com';
    
    // Get all active casinos
    const casinos = await prisma.casino.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get user profiles (if any are public)
    const users = await prisma.user.findMany({
      select: {
        username: true,
        updatedAt: true,
      },
      where: {
        username: {
          not: null
        }
      },
      take: 100 // Limit to prevent huge sitemaps
    });

    // Define static pages
    const staticPages = [
      {
        url: baseUrl,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        url: `${baseUrl}/contact`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.8'
      },
      {
        url: `${baseUrl}/privacy`,
        lastmod: new Date().toISOString(),
        changefreq: 'yearly',
        priority: '0.3'
      },
      {
        url: `${baseUrl}/terms`,
        lastmod: new Date().toISOString(),
        changefreq: 'yearly',
        priority: '0.3'
      },
      {
        url: `${baseUrl}/spin`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: '0.7'
      }
    ];

    // Generate casino pages
    const casinoPages = casinos.map(casino => ({
      url: `${baseUrl}/${casino.slug}`,
      lastmod: casino.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: '0.9'
    }));

    // Generate user profile pages
    const userPages = users
      .filter(user => user.username)
      .map(user => ({
        url: `${baseUrl}/user/${user.username}`,
        lastmod: user.updatedAt.toISOString(),
        changefreq: 'monthly',
        priority: '0.5'
      }));

    // Combine all pages
    const allPages = [...staticPages, ...casinoPages, ...userPages];

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return a basic sitemap on error
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://cryptobonuses.com</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(basicSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
} 