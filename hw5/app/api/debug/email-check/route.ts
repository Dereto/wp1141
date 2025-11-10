import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Debug endpoint to check if same email with different providers creates multiple users
 * 
 * This endpoint:
 * 1. Extracts the original email from the current user's modified email
 * 2. Finds all users with emails that match the original email pattern
 * 3. Shows if multiple users exist for the same original email
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        authenticated: false,
        message: "Not authenticated" 
      }, { status: 401 })
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
      },
    })

    if (!currentUser || !currentUser.email) {
      return NextResponse.json({ 
        error: "User not found or no email" 
      }, { status: 404 })
    }

    // Extract original email from modified email
    // Format: user+provider-accountId@domain.com -> user@domain.com
    let originalEmail = currentUser.email
    if (currentUser.email.includes('+')) {
      const [localPart] = currentUser.email.split('+')
      const domain = currentUser.email.split('@')[1]
      originalEmail = `${localPart}@${domain}`
    }

    // Find all users whose email starts with the same local part
    // This will catch all variations: user+google-xxx, user+github-xxx, etc.
    const [localPart] = originalEmail.split('@')
    const domain = originalEmail.split('@')[1]
    
    // Get all users with emails matching the pattern
    const allUsers = await prisma.user.findMany({
      where: {
        email: {
          startsWith: `${localPart}+`,
        },
      },
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Also check for exact original email match (in case there's a user without modification)
    const exactMatch = await prisma.user.findFirst({
      where: {
        email: originalEmail,
      },
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
      },
    })

    const usersWithSameEmail = exactMatch && !allUsers.some(u => u.id === exactMatch.id)
      ? [...allUsers, exactMatch]
      : allUsers

    return NextResponse.json({
      currentUser: {
        id: currentUser.id,
        email: currentUser.email,
        userID: currentUser.userID,
        originalEmail,
        accounts: currentUser.accounts,
      },
      analysis: {
        originalEmail,
        totalUsersWithSameEmail: usersWithSameEmail.length,
        users: usersWithSameEmail.map(u => ({
          id: u.id,
          email: u.email,
          userID: u.userID,
          createdAt: u.createdAt,
          accounts: u.accounts,
          providers: u.accounts.map(a => a.provider),
        })),
      },
      conclusion: usersWithSameEmail.length > 1
        ? `YES - Same email (${originalEmail}) has ${usersWithSameEmail.length} different users with potentially different userIDs`
        : `NO - Only one user exists for email ${originalEmail}`,
    }, { status: 200 })
  } catch (error) {
    console.error("Email check error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    )
  }
}

