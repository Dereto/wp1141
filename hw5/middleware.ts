import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // If user doesn't have userID and trying to access protected routes
    if (token && !(token as any).userID && path !== "/auth/register") {
      if (path.startsWith("/auth")) {
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL("/auth/register", req.url))
    }

    // If user has userID and on register page, redirect to home
    if (token && (token as any).userID && path === "/auth/register") {
      return NextResponse.redirect(new URL("/home", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Public routes
        if (path.startsWith("/auth") || path === "/") {
          return true
        }

        // Protected routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

