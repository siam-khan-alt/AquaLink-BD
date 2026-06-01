import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * IP Whitelist Configuration
 * Add trusted IP addresses for admin dashboard access
 */
const ADMIN_IP_WHITELIST = process.env.ADMIN_IP_WHITELIST
  ? process.env.ADMIN_IP_WHITELIST.split(',').map(ip => ip.trim())
  : [];

/**
 * Check if IP is whitelisted
 */
const isIPWhitelisted = (ip: string): boolean => {
  if (ADMIN_IP_WHITELIST.length === 0) {
    // If whitelist is empty, allow all IPs (for development)
    return true;
  }
  return ADMIN_IP_WHITELIST.includes(ip);
};

/**
 * Get client IP address from request
 */
const getClientIP = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  return 'unknown';
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/market-prices',
    '/fish-diseases',
    '/contact',
    '/api/auth',
  ];

  const isPublicPath = publicPaths.some(path => {
    if (pathname === path) return true;
    if (path.endsWith('/')) return pathname.startsWith(path);
    return pathname === path || pathname.startsWith(path + '/');
  });

  if (isPublicPath) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = token.role as string;

  if (pathname.startsWith('/dashboard/farmer')) {
    if (userRole !== 'farmer') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  if (pathname.startsWith('/dashboard/admin')) {
    // IP Whitelist check for admin dashboard
    const clientIP = getClientIP(request);
    if (!isIPWhitelisted(clientIP)) {
      console.warn(`Admin access denied from IP: ${clientIP}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  if (pathname.startsWith('/dashboard/doctor')) {
    if (userRole !== 'doctor') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
