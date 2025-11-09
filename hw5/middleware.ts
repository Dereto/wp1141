import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Allow auth routes and root to proceed
    if (path.startsWith("/auth") || path === "/") {
      return NextResponse.next()
    }

    // If user is authenticated, check if they have userID
    if (token) {
      // For database sessions, token contains user info
      // Check if userID is already in token (from session callback)
      const userID = (token as any).userID
      
      if (!userID) {
        // userID not in token, fetch from database
        const userId = (token as any).id || (token as any).sub
        if (userId) {
          try {
            const user = await prisma.user.findUnique({
              where: { id: userId },
              select: { userID: true },
            })

            if (!user?.userID) {
              // User is authenticated but hasn't registered userID yet
              return NextResponse.redirect(new URL("/auth/register", req.url))
            }
          } catch (error) {
            // If database query fails, allow through (will be handled by page)
            console.error("Middleware database error:", error)
          }
        }
      } else {
        // User has userID, if on register page, redirect to home
        if (path === "/auth/register") {
          return NextResponse.redirect(new URL("/home", req.url))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Public routes (always allow)
        if (path.startsWith("/auth") || path === "/") {
          return true
        }

        // For protected routes, allow if user is authenticated
        // The middleware function will handle redirecting to /auth/register if no userID
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

