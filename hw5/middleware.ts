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
      try {
        // For database sessions, the token should have user ID
        // Try different possible fields where user ID might be stored
        const userId = (token as any).id || (token as any).sub || (token as any).userId
        
        if (userId) {
          // Fetch userID from database
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { userID: true },
          })

          if (!user?.userID) {
            // User is authenticated but hasn't registered userID yet
            console.log("Middleware: User", userId, "needs registration")
            return NextResponse.redirect(new URL("/auth/register", req.url))
          } else {
            // User has userID, if on register page, redirect to home
            if (path === "/auth/register") {
              return NextResponse.redirect(new URL("/home", req.url))
            }
          }
        } else {
          console.log("Middleware: Token exists but no user ID found", Object.keys(token))
        }
      } catch (error) {
        // If database query fails, allow through (will be handled by page)
        console.error("Middleware database error:", error)
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

