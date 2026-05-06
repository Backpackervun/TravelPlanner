import { NextResponse } from "next/server";

export function middleware(request) {
  const isLoggedIn = request.cookies.get("token");
  const { pathname } = request.nextUrl;

  // Protect dashboard and admin
  if (!isLoggedIn && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
