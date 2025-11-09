import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
  req: NextRequest,
  { params }: { params: { userID: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { userID: params.userID },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (targetUser.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      )
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUser.id,
        },
      },
    })

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      })

      const user = await prisma.user.findUnique({
        where: { id: targetUser.id },
        include: {
          _count: {
            select: { followers: true },
          },
        },
      })

      return NextResponse.json(
        { isFollowing: false, followersCount: user?._count.followers || 0 },
        { status: 200 }
      )
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId: targetUser.id,
        },
      })

      const user = await prisma.user.findUnique({
        where: { id: targetUser.id },
        include: {
          _count: {
            select: { followers: true },
          },
        },
      })

      return NextResponse.json(
        { isFollowing: true, followersCount: user?._count.followers || 0 },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("Follow user error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { userID: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { userID: params.userID },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUser.id,
        },
      },
    })

    return NextResponse.json({ isFollowing: !!follow }, { status: 200 })
  } catch (error) {
    console.error("Check follow status error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

