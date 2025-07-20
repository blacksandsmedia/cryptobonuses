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

// Casino redirect mappings - comprehensive list from database
const CASINO_REDIRECTS = new Map([
  ['betplay', 'betplay.io'],
  ['bitstarz', 'bitstarz.com'],
  ['jackbit', 'jackbit.com'],
  ['luckybird', 'luckybird.io'],
  ['jacks-club', 'jacksclub.io'],
  ['betiro', 'betiro.com'],
  ['spinarium', 'spinarium.com'],
  ['wild-io', 'wild.io'],
  ['ignition-casino', 'ignitioncasino.eu'],
  ['bc-game', 'bc.game'],
  ['cloudbet', 'cloudbet.com'],
  ['bets-io', 'bets.io'],
  ['mbitcasino', 'mbitcasino.io'],
  ['fortunejack', 'fortunejack.com'],
  ['betfury', 'betfury.com'],
  ['coins-game', 'coins.game'],
  ['nanogames', 'nanogames.io'],
  ['leebet', 'leebet.io'],
  ['stake-us', 'stake.us'],
  ['bovada', 'bovada.lv'],
  ['oshi', 'oshi.io'],
  ['bitcasino', 'bitcasino.io'],
  ['trustdice', 'trustdice.win'],
  ['chips-gg', 'chips.gg'],
  ['7bit-casino', '7bitcasino.com'],
  ['gamdom', 'gamdom.com'],
  ['betchain', 'betchain.com'],
  ['rollbit', 'rollbit.com'],
  ['cryptoleo', 'cryptoleo.com'],
  ['1xbit', '1xbit1.com'],
  ['metaspins', 'metaspins.com'],
  ['coinpoker', 'coinpoker.com'],
  ['justbit', 'justbit.io'],
  ['roobet', 'roobet.com'],
  ['thunderpick', 'thunderpick.io'],
  ['sportsbet', 'sportsbet.io'],
  ['vave', 'vave.com'],
  ['tether-bet', 'tether.bet'],
  ['stake', 'stake.com'],
  ['bitsler', 'bitsler.com'],
  ['crashino', 'crashino.com/en'],
  ['cryptogames', 'crypto-games.io'],
  ['betpanda', 'betpanda.io'],
  ['sirwin', 'sirwin.com'],
  ['primedice', 'primedice.com'],
  ['destinyx', 'destinyx.com'],
  ['lottery', 'spin'],
  // Add the missing redirects that were causing issues
  ['phemex', ''],
  ['primexbt', ''],
  ['app', ''],
  ['crypto-com', ''],
  ['kucoin', ''],
  ['bingx', ''],
  ['bitfinex', ''],
  ['stormgain', ''],
  ['csgoempire', ''],
  ['pixel-gg', ''],
]);

// Middleware that handles admin routes, API routes, and casino redirects
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Handle casino redirects BEFORE Next.js processes trailing slashes
  // This prevents double redirects (308 for trailing slash removal + 301 for casino redirect)
  
  // Check for casino redirects with trailing slash (e.g., /stake/)
  if (pathname.endsWith('/') && pathname.length > 1) {
    const casinoSlug = pathname.slice(1, -1); // Remove leading slash and trailing slash
    if (CASINO_REDIRECTS.has(casinoSlug)) {
      const targetDomain = CASINO_REDIRECTS.get(casinoSlug);
      const destination = targetDomain === '' ? '/' : `/${targetDomain}`;
      console.log(`[Middleware] Casino redirect (trailing slash): ${pathname} → ${destination}`);
      
      // Return direct 301 redirect to prevent double redirects
      return NextResponse.redirect(
        new URL(destination, request.url), 
        { status: 301 }
      );
    }
  }
  
  // Check for casino redirects without trailing slash (e.g., /stake)
  if (pathname.startsWith('/') && !pathname.endsWith('/') && pathname.split('/').length === 2) {
    const casinoSlug = pathname.slice(1); // Remove leading slash
    if (CASINO_REDIRECTS.has(casinoSlug)) {
      const targetDomain = CASINO_REDIRECTS.get(casinoSlug);
      const destination = targetDomain === '' ? '/' : `/${targetDomain}`;
      console.log(`[Middleware] Casino redirect (no trailing slash): ${pathname} → ${destination}`);
      
      // Return direct 301 redirect
      return NextResponse.redirect(
        new URL(destination, request.url), 
        { status: 301 }
      );
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