import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

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
        // For database sessions, try to get user ID from token
        // The token structure may vary, so try multiple possible fields
        let userId: string | undefined = undefined
        
        // Try different token structures
        if (typeof token === 'object' && token !== null) {
          userId = (token as any).id || (token as any).sub || (token as any).userId || (token as any).user?.id
        }

        // If we still don't have userId, try getting it from the JWT token
        if (!userId) {
          const jwtToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
          if (jwtToken) {
            userId = (jwtToken as any).id || (jwtToken as any).sub || (jwtToken as any).userId
          }
        }

        // If we still don't have userId, try to get it from the session cookie
        if (!userId) {
          const sessionToken = req.cookies.get('next-auth.session-token')?.value || 
                              req.cookies.get('__Secure-next-auth.session-token')?.value
          
          if (sessionToken) {
            // Query the database for the session
            const session = await prisma.session.findUnique({
              where: { sessionToken },
              select: { userId: true },
            })
            if (session) {
              userId = session.userId
            }
          }
        }

        if (userId) {
          console.log("Middleware: Found user ID", userId, "for path", path)
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
        } else {
          console.log("Middleware: Token exists but no user ID found. Token keys:", token ? Object.keys(token as any) : 'null')
        }
      } catch (error) {
        // If database query fails, allow through (will be handled by page)
        console.error("Middleware database error:", error)
      }
    } else {
      console.log("Middleware: No token found for path", path)
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

