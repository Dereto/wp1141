import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Allow auth routes and root to proceed without checking
  if (path.startsWith("/auth") || path === "/") {
    return NextResponse.next()
  }

  // Allow API routes, static files, etc.
  if (path.startsWith("/api") || path.startsWith("/_next")) {
    return NextResponse.next()
  }

  // Check if session cookie exists (works in Edge Runtime without database access)
  // NextAuth uses different cookie names in production vs development
  // Also check for __Host- prefix which is used in some configurations
  const sessionToken = 
    req.cookies.get('__Secure-next-auth.session-token')?.value ||  // Production (HTTPS)
    req.cookies.get('__Host-next-auth.session-token')?.value ||    // Production with __Host- prefix
    req.cookies.get('next-auth.session-token')?.value              // Development

  if (!sessionToken) {
    // No session cookie, redirect to sign-in
    // But allow the request to proceed if it's a page that can handle its own auth
    // This prevents redirect loops when session is being established
    console.log("Middleware: No session cookie found, redirecting to /auth/signin")
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  // Session cookie exists, user is authenticated (or was authenticated)
  // Let the request through - page components will check userID and redirect if needed
  // We can't check userID here because Prisma doesn't work in Edge Runtime
  console.log("Middleware: Session cookie found, allowing access to", path)
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

