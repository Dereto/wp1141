import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { Adapter } from "next-auth/adapters"
import { PrismaClient } from "@prisma/client"

/**
 * Custom adapter that ensures each OAuth account (even with same email) 
 * creates a separate user by preventing email-based user lookup.
 * The email is modified in the signIn callback to include providerAccountId.
 */
export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  const baseAdapter = PrismaAdapter(prisma) as Adapter

  return {
    ...baseAdapter,
    async getUserByEmail(email: string) {
      // Don't use email lookup for OAuth - we want separate users per account
      // This prevents PrismaAdapter from linking accounts by email
      // Return null to force creation of new user for each account
      return null
    },
    async getUserByAccount({ providerAccountId, provider }) {
      // This is the correct way to find users - by provider + providerAccountId
      // Each account (unique providerAccountId) gets its own user
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        select: { user: true },
      })
      return account?.user ?? null
    },
  } as Adapter
}

