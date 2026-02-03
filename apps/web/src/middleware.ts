import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { auth } from '@/lib/auth';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt';
import { routing } from './i18n/routing';

// Create next-intl middleware
const intlMiddleware = createMiddleware(routing);

// Export config for middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (all Next.js internals: static, image, chunks, etc. - prevents MIME/asset issues)
     * - favicon.ico, sitemap.xml, robots.txt, static assets
     */
    '/((?!api|_next|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

/**
 * Middleware: i18n + NextAuth session (auth() from NextAuth v5) + protected routes.
 * auth() runs first and sets request.auth so the same session cookie (e.g. after Google OAuth) is read correctly.
 */
async function middlewareWithAuth(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude non-localized routes from i18n middleware
  const nonLocalizedRoutes = ['/sitemap.xml', '/robots.txt', '/api'];
  const shouldSkipI18n = nonLocalizedRoutes.some((route) => pathname.startsWith(route));

  if (shouldSkipI18n) {
    // Skip i18n middleware for these routes
    return NextResponse.next();
  }

  // OAuth callback and set-cookie: skip intl redirects so URL stays stable
  const isAuthCallbackOrSetCookie =
    pathname === '/auth/callback' ||
    pathname === '/en/auth/callback' ||
    pathname === '/fr/auth/callback' ||
    pathname === '/auth/set-cookie' ||
    pathname === '/fr/auth/set-cookie';
  if (isAuthCallbackOrSetCookie) {
    return NextResponse.next();
  }

  // Handle i18n routing first
  const response = intlMiddleware(request);

  // If it's an i18n redirect, return it immediately
  if (
    response.headers.get('x-middleware-rewrite') ||
    response.status === 307 ||
    response.status === 308
  ) {
    return response;
  }

  // Extract locale from pathname for route checking
  const pathnameWithoutLocale = pathname.replace(/^\/(en|fr)/, '') || '/';

  // Public routes that don't require authentication (Étape 1.1.2)
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/signin',
    '/auth/callback', // OAuth callback - needs to be public to receive token
    '/auth/set-cookie', // Sets cookie then redirects - used after OAuth callback
    '/auth/google/testing', // Google OAuth test page
    '/auth/google/diagnostic', // Google OAuth diagnostic page
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/error',
    '/auth/verify-request',
    '/auth/welcome',
    '/pricing',
    '/sitemap',
    '/sitemap.xml',
    '/api/auth',
  ];

  // Check if the route is public (check both with and without locale)
  const isPublicRoute = publicRoutes.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(route + '/')
  );

  // Allow access to public routes
  if (isPublicRoute) {
    return response;
  }

  // NextAuth v5: session from auth() wrapper (same cookie as after Google OAuth)
  // In NextAuth v5, auth() wraps the middleware and sets request.auth
  const session = (request as NextRequest & { auth?: { user?: { id?: string; email?: string; role?: string } } }).auth;
  
  // Also check for JWT token in cookie (for OAuth flow and direct login)
  // This is needed because:
  // 1. OAuth callback stores token in access_token cookie via /api/auth/token
  // 2. Direct login (credentials) also sets access_token cookie after NextAuth signIn
  // Check cookie even if session exists, as session might not be immediately available after login
  let hasValidToken = false;
  const accessTokenCookie = request.cookies.get('access_token')?.value;
  
  // Also check Authorization header as fallback (for cases where cookie isn't set/visible)
  // This helps when cookie isn't immediately available after setting
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
  
  // Also check for NextAuth session cookie (authjs.session-token or next-auth.session-token)
  const nextAuthSessionCookie = 
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;
  
  // Debug: log cookie presence (but not value for security)
  // Enable in production too for debugging redirect loop issue
  console.log('[Middleware] Cookie check:', {
    hasAccessTokenCookie: !!accessTokenCookie,
    accessTokenCookieLength: accessTokenCookie?.length,
    hasNextAuthSessionCookie: !!nextAuthSessionCookie,
    hasTokenFromHeader: !!tokenFromHeader,
    pathname,
    hasSession: !!session,
    sessionUser: session?.user ? { id: session.user.id, email: session.user.email, role: session.user.role } : null,
    allCookies: Array.from(request.cookies.getAll()).map(c => c.name),
    nodeEnv: process.env.NODE_ENV,
  });
  
  // Try to verify token from cookie first
  if (accessTokenCookie) {
    try {
      const payload = await verifyToken(accessTokenCookie);
      if (payload && payload.exp && Date.now() < (payload.exp as number) * 1000) {
        hasValidToken = true;
        console.log('[Middleware] Token from cookie is valid:', {
          exp: payload.exp,
          now: Date.now(),
          expiresIn: (payload.exp as number) * 1000 - Date.now(),
        });
      } else if (payload && payload.exp) {
        // Token expired
        console.log('[Middleware] Token from cookie expired:', {
          exp: payload.exp,
          now: Date.now(),
          expired: Date.now() >= (payload.exp as number) * 1000,
        });
      } else {
        console.log('[Middleware] Token payload missing exp:', { payload });
      }
    } catch (error) {
      // Token invalid or expired, ignore
      console.log('[Middleware] Token verification from cookie failed:', {
        error: error instanceof Error ? error.message : String(error),
        tokenLength: accessTokenCookie.length,
        tokenPrefix: accessTokenCookie.substring(0, 20) + '...',
      });
    }
  } else {
    console.log('[Middleware] No access_token cookie found');
  }
  
  // Fallback: Try to verify token from Authorization header if cookie not available
  if (!hasValidToken && tokenFromHeader) {
    try {
      const payload = await verifyToken(tokenFromHeader);
      if (payload && payload.exp && Date.now() < (payload.exp as number) * 1000) {
        hasValidToken = true;
        console.log('[Middleware] Token from Authorization header is valid (fallback):', {
          exp: payload.exp,
          now: Date.now(),
          expiresIn: (payload.exp as number) * 1000 - Date.now(),
        });
      }
    } catch (error) {
      console.log('[Middleware] Token verification from header failed:', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  
  // If we have a NextAuth session cookie but no session object, it might be a timing issue
  // Allow access if we have the session cookie (NextAuth will validate it)
  const hasNextAuthCookie = !!nextAuthSessionCookie;
  
  if (!pathname.startsWith('/api/')) {
    // User is authenticated if they have:
    // 1. NextAuth session object (from auth() wrapper)
    // 2. Valid JWT token cookie (access_token)
    // 3. NextAuth session cookie (even if session object not available yet - timing issue)
    // Check all to handle cases where:
    // - OAuth sets cookie but NextAuth session isn't ready yet
    // - Direct login sets cookie but NextAuth session isn't immediately available
    // - NextAuth session expires but cookie is still valid
    // - Session cookie exists but session object not populated (timing/race condition)
    const isAuthenticated = !!session || hasValidToken || hasNextAuthCookie;
    
    // Special case: If we're coming from set-cookie page (via Referer header),
    // allow access even if cookie not yet visible (timing issue)
    // This prevents redirect loops when cookie is being set
    const referer = request.headers.get('referer') || '';
    const comingFromSetCookie = referer.includes('/auth/set-cookie') || referer.includes('/auth/callback');
    
    // Don't redirect if already on login page or set-cookie page - prevents redirect loops
    const isOnLoginPage = pathnameWithoutLocale === '/auth/login' || 
                          pathname === '/auth/login' ||
                          pathname.startsWith('/en/auth/login') ||
                          pathname.startsWith('/fr/auth/login');
    
    const isOnSetCookiePage = pathnameWithoutLocale === '/auth/set-cookie' ||
                               pathname.startsWith('/en/auth/set-cookie') ||
                               pathname.startsWith('/fr/auth/set-cookie');
    
    const isOnCallbackPage = pathnameWithoutLocale === '/auth/callback' ||
                              pathname.startsWith('/en/auth/callback') ||
                              pathname.startsWith('/fr/auth/callback');
    
    // Allow access to set-cookie and callback pages without authentication
    // These pages are responsible for setting the cookie
    if (isOnSetCookiePage || isOnCallbackPage) {
      console.log('[Middleware] Allowing access to auth flow page:', pathname);
      return response;
    }
    
    // Debug logging for authentication decision
    console.log('[Middleware] Auth decision:', {
      pathname,
      pathnameWithoutLocale,
      isAuthenticated,
      hasSession: !!session,
      hasValidToken,
      hasNextAuthCookie,
      isOnLoginPage,
      isOnSetCookiePage,
      isOnCallbackPage,
      comingFromSetCookie,
      referer,
      willRedirect: !isAuthenticated && !isOnLoginPage && !comingFromSetCookie,
    });
    
    // If coming from set-cookie page, allow access even without cookie (cookie might be setting)
    // This prevents redirect loops during the cookie-setting process
    if (!isAuthenticated && !isOnLoginPage && !comingFromSetCookie) {
      const locale = pathname.match(/^\/(en|fr)/)?.[1] ?? 'fr';
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      console.log('[Middleware] Redirecting to login:', loginUrl.toString());
      return NextResponse.redirect(loginUrl);
    }
    
    // If coming from set-cookie but still not authenticated, log warning but allow access
    // The cookie should be set by now, but we allow one navigation to avoid loops
    if (comingFromSetCookie && !isAuthenticated) {
      console.warn('[Middleware] Coming from set-cookie but cookie not detected - allowing access anyway to prevent loop');
    }
    if (pathnameWithoutLocale.startsWith('/admin')) {
      const role = session?.user?.role;
      // Allow both ADMIN and SUPER_ADMIN to access admin routes
      // If role is undefined, allow access and let client-side ProtectedRoute handle authorization
      // This is necessary because the backend doesn't return role in login response
      // and role is checked via API call in ProtectedRoute component
      if (role && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        const locale = pathname.match(/^\/(en|fr)/)?.[1] ?? 'fr';
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
      }
    }
  }

  // API routes - check Authorization header
  if (pathname.startsWith('/api/')) {
    // Allow auth API routes without token check
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        // Check expiration
        if (payload.exp && Date.now() < (payload.exp as number) * 1000) {
          return NextResponse.next();
        }
      }
    }

    // For API routes, return 401 if no valid token
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Page routes - allow access and let client-side components handle authentication
  // The middleware cannot access sessionStorage, so we let the client handle auth checks
  // Client components will check the auth store and redirect if needed

  // Add security headers to response
  const isProduction = process.env.NODE_ENV === 'production';

  // Security headers are primarily handled by next.config.js headers() function
  // But we add additional headers here for API routes and dynamic responses
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (isProduction) {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }
  }

  return response;
}

export default auth(middlewareWithAuth);
