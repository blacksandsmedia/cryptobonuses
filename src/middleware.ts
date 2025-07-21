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
  ['7bit', '7bitcasino.com'],
  ['bspin', 'bspin.io'],
  ['crashino', 'crashino.com'],
  ['duelbits', 'duelbits.com'],
  ['everygame', 'everygame.eu'],
  ['mega-dice', 'megadice.com'],
  ['metaspins', 'metaspins.com'],
  ['roobet', 'roobet.com'],
  ['rollbit', 'rollbit.com'],
  ['stake', 'stake.com'],
  ['thunderpick', 'thunderpick.io'],
  ['wolfbet', 'wolfbet.com'],
  ['wazamba', 'wazamba.com'],
  ['winz-io', 'winz.io'],
  ['vave', 'vave.com'],
  ['sportsbet-io', 'sportsbet.io'],
  ['gamdom', 'gamdom.com'],
  ['888starz', '888starz.bet'],
  ['betpanda', 'betpanda.io'],
  ['casinoin', 'casinoin.io'],
  ['coinplay', 'coinplay.com'],
  ['moonwin', 'moonwin.com'],
  ['1xbit', '1xbit.com'],
  ['0xbet', '0xbet.com'],
  ['cryptogames', 'cryptogames.com'],
  ['slots-palace', 'slotspalace.com'],
  ['weiss-bet', 'weiss.bet'],
  ['cosmobet', 'cosmobet.com'],
  ['casinozer', 'casinozer.com'],
  ['mbit', 'mbit.casino'],
  ['crypto-games', 'cryptogames.com'],
  ['betchain', 'betchain.com'],
  ['betonic', 'betonic.com'],
  ['bitsler', 'bitsler.com'],
  ['freebitco-in', 'freebitco.in'],
  ['primedice', 'primedice.com'],
  ['chipstars', 'chipstars.bet'],
  ['chips-gg', 'chips.gg'],
  ['bitdice', 'bitdice.me'],
  ['crypto-com', ''],
  ['kucoin', ''],
  ['bingx', ''],
  ['bitfinex', ''],
  ['stormgain', ''],
  ['csgoempire', ''],
  ['pixel-gg', ''],
]);

// Supported locales for simple locale detection
const supportedLocales = ['en', 'pl', 'tr', 'es', 'pt', 'vi', 'ja', 'ko', 'fr'];

// Helper function to extract locale from pathname
function getLocaleFromPathname(pathname: string): string | null {
  const segments = pathname.split('/');
  const firstSegment = segments[1];
  return supportedLocales.includes(firstSegment) ? firstSegment : null;
}

// Helper function to remove locale from pathname
function removeLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/');
  const firstSegment = segments[1];
  if (supportedLocales.includes(firstSegment)) {
    return '/' + segments.slice(2).join('/');
  }
  return pathname;
}

// Middleware that handles i18n, admin routes, API routes, and casino redirects
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip i18n handling for specific paths
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('/sitemap') ||
    pathname.includes('/robots')
  ) {
    // Handle these paths with existing logic
    return handleNonI18nPaths(request);
  }

  // Extract locale from pathname for casino redirect checks
  const detectedLocale = getLocaleFromPathname(pathname);
  const pathWithoutLocale = removeLocaleFromPathname(pathname);

  // Handle casino redirects BEFORE Next.js processes trailing slashes
  // This prevents double redirects (308 for trailing slash removal + 301 for casino redirect)
  
  // Check for casino redirects with trailing slash (e.g., /stake/ or /pl/stake/)
  if (pathWithoutLocale.endsWith('/') && pathWithoutLocale.length > 1) {
    const casinoSlug = pathWithoutLocale.slice(1, -1); // Remove leading slash and trailing slash
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
  
  // Check for casino redirects without trailing slash (e.g., /stake or /pl/stake)
  if (pathWithoutLocale.startsWith('/') && !pathWithoutLocale.endsWith('/') && pathWithoutLocale.split('/').length === 2) {
    const casinoSlug = pathWithoutLocale.slice(1); // Remove leading slash
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

  // For locale-prefixed paths, continue with the request
  // Set locale header for the application to use
  const currentLocale = getLocaleFromPathname(pathname) || 'en';
  const response = NextResponse.next();
  response.headers.set('x-locale', currentLocale);
  return response;
}

// Handle non-i18n paths (API, static files, etc.)
async function handleNonI18nPaths(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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
  
  // Admin route authentication
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin-token');
    
    if (!token) {
      const redirectResponse = NextResponse.redirect(new URL('/admin/login', request.url));
      
      // Clear any existing admin-token cookie
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
    // Match all paths except specific static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}; 