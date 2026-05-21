import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path)
  );

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
    if (userRole !== 'farmer' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  if (pathname.startsWith('/dashboard/expert')) {
    if (userRole !== 'expert' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  if (pathname.startsWith('/dashboard/admin')) {
    if (userRole !== 'admin') {
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
