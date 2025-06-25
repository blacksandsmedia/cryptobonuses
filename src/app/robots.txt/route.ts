import { NextResponse } from 'next/server';

export function GET() {
  const robotsTxt = `# Robots.txt for CryptoBonuses.com
# Allow all crawlers access to all content
User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/

# Disallow upload directories
Disallow: /uploads/

# Sitemap location
Sitemap: https://cryptobonuses.com/sitemap.xml

# Crawl-delay for responsible crawling
Crawl-delay: 1`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
} 