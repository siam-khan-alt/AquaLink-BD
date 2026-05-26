import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const path = request.nextUrl.pathname;
  
  // Protect /dashboard/farmer/* routes
  if (path.startsWith("/dashboard/farmer")) {
    if (!token || !token.id || token.role !== "farmer") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Protect /dashboard/admin/* routes
  if (path.startsWith("/dashboard/admin")) {
    if (!token || !token.id || token.role !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Protect /dashboard/doctor/* routes
  if (path.startsWith("/dashboard/doctor")) {
    if (!token || !token.id || token.role !== "doctor") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/farmer/:path*",
    "/dashboard/admin/:path*",
    "/dashboard/doctor/:path*",
  ],
};
