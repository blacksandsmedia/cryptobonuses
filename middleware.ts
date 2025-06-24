import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only handle casino slug paths (pattern: /[slug])
  const casinoSlugMatch = pathname.match(/^\/([^\/]+)$/)
  
  if (casinoSlugMatch) {
    const slug = casinoSlugMatch[1]
    
    // Skip API routes, static files, and special Next.js paths
    if (
      slug.startsWith('_') ||
      slug.startsWith('api') ||
      slug === 'spin' ||
      slug === 'admin' ||
      slug === 'privacy' ||
      slug === 'terms' ||
      slug === 'contact' ||
      slug.includes('.') || // Files with extensions
      slug === 'favicon.ico'
    ) {
      return NextResponse.next()
    }

    try {
      // Check if this slug exists as a redirect using internal API
      const redirectResponse = await fetch(new URL('/api/redirects/check', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug })
      })

      if (redirectResponse.ok) {
        const data = await redirectResponse.json()
        if (data.redirect) {
          // 301 redirect to new slug
          const newUrl = new URL(`/${data.redirect.newSlug}`, request.url)
          return NextResponse.redirect(newUrl, 301)
        }
      }
    } catch (error) {
      console.error('Error checking slug redirect:', error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 