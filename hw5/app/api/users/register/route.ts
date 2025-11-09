import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateUserID } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userID } = await req.json()

    if (!userID || !validateUserID(userID)) {
      return NextResponse.json(
        { error: "Invalid userID. Must be 3-20 alphanumeric characters or underscores." },
        { status: 400 }
      )
    }

    // Check if userID is already taken
    const existingUser = await prisma.user.findUnique({
      where: { userID },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "UserID already taken" },
        { status: 409 }
      )
    }

    // Update user with userID
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { userID },
      select: {
        id: true,
        userID: true,
        name: true,
        email: true,
        image: true,
      },
    })

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

