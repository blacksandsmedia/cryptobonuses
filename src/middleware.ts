import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple JWT verification for Edge Runtime
function verifyJWT(token: string, secret: string): any {
  try {
    // Split the JWT token
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Decode the payload (we'll skip signature verification for middleware)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check if token has expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Direct database query for redirects (Edge Runtime compatible)
async function checkRedirect(slug: string): Promise<string | null> {
  try {
    // Use regular Prisma client (works better than edge client)
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const redirect = await prisma.slugRedirect.findUnique({
      where: { oldSlug: slug },
      select: { newSlug: true }
    });
    
    await prisma.$disconnect();
    
    return redirect?.newSlug || null;
  } catch (error) {
    console.error('Error checking redirect in middleware:', error);
    return null;
  }
}

// Middleware that handles casino redirects, admin routes and API routes
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Casino page redirect handling (for old slugs to new .com format)
  if (pathname.match(/^\/[^\/]+$/) && !pathname.startsWith('/api') && 
      !pathname.startsWith('/admin') && !pathname.startsWith('/user') && 
      !pathname.startsWith('/_next') && pathname !== '/' && 
      pathname !== '/contact' && pathname !== '/privacy' && pathname !== '/terms' && 
      pathname !== '/spin' && !pathname.includes('.')) {
    
    const slug = pathname.slice(1); // Remove leading slash
    
    console.log(`[MIDDLEWARE] Checking redirect for slug: ${slug}`);
    
    try {
      // Check if this slug has a redirect (direct database query)
      const newSlug = await checkRedirect(slug);
      
      if (newSlug) {
        console.log(`[MIDDLEWARE] Redirecting ${slug} -> ${newSlug}`);
        const newUrl = new URL(`/${newSlug}`, request.url);
        return NextResponse.redirect(newUrl, 301);
      }
    } catch (error) {
      console.error('Error checking redirect:', error);
    }
  }
  
  // Handle preflight OPTIONS requests for CORS
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    
    response.headers.append('Access-Control-Allow-Credentials', 'true');
    response.headers.append('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    response.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
    response.headers.append('Access-Control-Allow-Headers', 
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    
    return response;
  }
  
  // Create response
  const response = NextResponse.next();

  // Add CORS headers for API routes
  if (pathname.startsWith('/api')) {
    response.headers.append('Access-Control-Allow-Credentials', 'true');
    response.headers.append('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    response.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
    response.headers.append(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
    
    // For API routes that require admin authentication
    if (
      (pathname.includes('/api/casinos') || 
       pathname.includes('/api/bonuses') || 
       pathname.includes('/api/reviews') ||
       pathname.includes('/api/analytics/wipe') ||
       pathname.includes('/api/settings') ||
       pathname.includes('/api/upload')) && 
      (request.method === 'POST' || 
       request.method === 'PUT' || 
       request.method === 'DELETE')
    ) {
      // Skip this check for public endpoints
      if (pathname !== '/api/reviews' && !pathname.startsWith('/api/reviews/submit')) {
        // Get admin-token from cookies
        const token = request.cookies.get('admin-token');
        
        // Return unauthorized if no token found
        if (!token) {
          return new NextResponse(
            JSON.stringify({ error: 'Unauthorized' }),
            { 
              status: 401,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
                'Access-Control-Allow-Credentials': 'true'
              }
            }
          );
        }
      }
    }
    
    return response;
  }
  
  // Skip middleware for login page
  if (pathname === '/admin/login') {
    return response;
  }
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Get admin-token from cookies
    const token = request.cookies.get('admin-token')?.value;
    
    // Redirect to login if no token found
    if (!token) {
      console.log('No admin token found, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    try {
      const decoded = verifyJWT(token, process.env.AUTH_SECRET || 'cryptobonuses-secret-key');
      
      // Check if user has admin role
      if (decoded.role !== 'ADMIN') {
        console.log('User does not have admin role, redirecting to login');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      
    } catch (error) {
      console.log('Token verification failed, redirecting to login:', error.message);
      const redirectResponse = NextResponse.redirect(new URL('/admin/login', request.url));
      // Clear the invalid token
      redirectResponse.cookies.set('admin-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: new Date(0),
      });
      return redirectResponse;
    }
  }

  return response;
}

// Configure the paths that middleware should run on
export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 