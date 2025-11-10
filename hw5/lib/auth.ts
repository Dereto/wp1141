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
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log("Event: signIn", {
        email: user.email,
        provider: account?.provider,
        isNewUser,
        userId: user.id,
      })
    },
    async createUser({ user }) {
      console.log("Event: createUser", { email: user.email, id: user.id })
    },
    async linkAccount({ user, account }) {
      console.log("Event: linkAccount", {
        email: user.email,
        provider: account.provider,
        userId: user.id,
      })
    },
    async session({ session, token }) {
      // This is called on every session check
      // We don't need to log here as it's too verbose
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        
        // Extract original email from modified email (remove +provider part)
        // Format: user+provider@domain.com -> user@domain.com
        if (user.email && user.email.includes('+')) {
          const [localPart, rest] = user.email.split('+')
          const domain = rest.includes('@') ? rest.split('@')[1] : user.email.split('@')[1]
          session.user.email = `${localPart}@${domain}`
        }
        
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

      if (!account) {
        console.error("SignIn: No account provided")
        return false
      }
      
      // Modify email to be unique per provider to prevent account linking
      // This ensures each provider creates a separate user
      // We'll store the original email in a separate field or extract it later if needed
      // For now, we'll append the provider to make it unique
      const originalEmail = user.email
      user.email = `${originalEmail.split('@')[0]}+${account.provider}@${originalEmail.split('@')[1]}`
      
      console.log("SignIn: Modified email for separate user per provider", {
        original: originalEmail,
        modified: user.email,
        provider: account.provider,
      })
      
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

