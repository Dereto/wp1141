import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "@/lib/prisma"
import { CustomPrismaAdapter } from "@/lib/custom-adapter"

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(prisma),
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
        
        // Extract original email from modified email (remove +provider-providerAccountId part)
        // Format: user+provider-accountId@domain.com -> user@domain.com
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
      
      // Modify email to include providerAccountId to ensure each account gets a unique user
      // Format: user+provider-providerAccountId@domain.com
      // This ensures that even two Google accounts with the same email get separate users
      const originalEmail = user.email
      const [localPart, domain] = originalEmail.split('@')
      // Use first 8 chars of providerAccountId to keep it reasonable
      const accountIdShort = account.providerAccountId.substring(0, 8)
      user.email = `${localPart}+${account.provider}-${accountIdShort}@${domain}`
      
      console.log("SignIn: Modified email for separate user per account", {
        original: originalEmail,
        modified: user.email,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
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

