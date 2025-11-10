import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering since we use getServerSession which accesses headers
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        authenticated: false,
        message: "Not authenticated" 
      }, { status: 401 })
    }

    // Get full user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
        _count: {
          select: {
            accounts: true,
            sessions: true,
          },
        },
      },
    })

    return NextResponse.json({
      authenticated: true,
      session: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        userID: (session.user as any).userID,
      },
      dbUser: dbUser ? {
        id: dbUser.id,
        userID: dbUser.userID,
        email: dbUser.email,
        name: dbUser.name,
        accounts: dbUser.accounts,
        accountCount: dbUser._count.accounts,
        sessionCount: dbUser._count.sessions,
      } : null,
    }, { status: 200 })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    )
  }
}

