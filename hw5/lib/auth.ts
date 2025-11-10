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
      
      try {
        // Check if user already exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        })

        if (existingUser) {
          // Check if this account is already linked
          const existingAccount = existingUser.accounts.find(
            (acc) => acc.provider === account.provider && acc.providerAccountId === account.providerAccountId
          )

          if (!existingAccount) {
            // User exists but account is not linked - manually link it
            console.log("SignIn: User exists, manually linking account for", user.email, "provider:", account.provider)
            
            try {
              // Manually create the account record linking to existing user
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              })
              console.log("SignIn: Successfully linked account for", user.email)
            } catch (linkError: any) {
              // If account already exists (race condition), that's okay
              if (linkError.code === 'P2002') {
                console.log("SignIn: Account already exists (race condition), continuing")
              } else {
                console.error("SignIn: Error linking account:", linkError)
                // Still allow sign-in - PrismaAdapter might handle it
              }
            }
          } else {
            console.log("SignIn: Account already linked for", user.email, "provider:", account.provider)
          }
        } else {
          console.log("SignIn: New user signing in with", user.email, "provider:", account.provider)
        }
      } catch (error) {
        console.error("SignIn: Error checking/linking user:", error)
        // Continue anyway - PrismaAdapter will handle it
      }
      
      // Always return true - we've handled account linking manually if needed
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

