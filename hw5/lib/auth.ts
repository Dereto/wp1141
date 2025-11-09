import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { userID: true },
          })
          if (dbUser && dbUser.userID) {
            session.user.userID = dbUser.userID as string
          } else {
            console.log("Session: User", user.id, "does not have userID yet")
          }
        } catch (error) {
          console.error("Session callback error:", error)
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (!user.email) {
        console.error("SignIn: No email provided")
        return false
      }
      
      // PrismaAdapter will handle creating the user and account
      // We just need to return true to allow the sign-in
      console.log("SignIn: Allowing sign-in for", user.email)
      return true
    },
    async redirect({ url, baseUrl }) {
      // After OAuth, always redirect to root to let middleware handle routing
      // This ensures session is fully loaded before checking userID
      if (url.startsWith("/")) {
        // If it's an auth route, allow it
        if (url.startsWith("/auth")) {
          return `${baseUrl}${url}`
        }
        // Otherwise redirect to root, which will check session and redirect appropriately
        return `${baseUrl}/`
      }
      // Allow same origin URLs
      if (new URL(url).origin === baseUrl) return url
      // Default to root
      return `${baseUrl}/`
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

