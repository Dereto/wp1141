import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

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

  try {
    // Get session token from cookies
    // NextAuth uses different cookie names in production vs development
    const sessionToken = 
      req.cookies.get('__Secure-next-auth.session-token')?.value ||  // Production (HTTPS)
      req.cookies.get('next-auth.session-token')?.value              // Development

    if (!sessionToken) {
      // No session token, redirect to sign-in
      console.log("Middleware: No session token found, redirecting to /auth/signin")
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Query the database for the session
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      select: { 
        userId: true,
        expires: true 
      },
    })

    if (!session) {
      // Session not found in database, redirect to sign-in
      console.log("Middleware: Session not found in database, redirecting to /auth/signin")
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Check if session is expired
    if (session.expires < new Date()) {
      console.log("Middleware: Session expired, redirecting to /auth/signin")
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    const userId = session.userId
    console.log("Middleware: Found authenticated user", userId, "for path", path)

    // Fetch userID from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userID: true },
    })

    if (!user?.userID) {
      // User is authenticated but hasn't registered userID yet
      console.log("Middleware: User", userId, "needs registration, redirecting to /auth/register")
      return NextResponse.redirect(new URL("/auth/register", req.url))
    } else {
      // User has userID, if on register page, redirect to home
      if (path === "/auth/register") {
        console.log("Middleware: User", userId, "already has userID, redirecting to /home")
        return NextResponse.redirect(new URL("/home", req.url))
      }
    }

    // User is authenticated and has userID, allow access
    return NextResponse.next()
  } catch (error) {
    // If database query fails, log error and redirect to sign-in for safety
    console.error("Middleware database error:", error)
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

