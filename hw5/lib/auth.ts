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
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { userID: true },
        })
        if (dbUser && dbUser.userID) {
          session.user.userID = dbUser.userID as string
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (!user.email) return false
      
      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: {
          accounts: {
            some: {
              provider: account?.provider,
              providerAccountId: account?.providerAccountId,
            },
          },
        },
      })

      // If user doesn't exist, they need to register with userID
      // This will be handled in the registration flow
      return true
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

