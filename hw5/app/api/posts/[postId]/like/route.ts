import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { pusherServer } from "@/lib/pusher"

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: params.postId,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      })

      const post = await prisma.post.findUnique({
        where: { id: params.postId },
        include: {
          _count: {
            select: { likes: true },
          },
        },
      })

      // Trigger Pusher event
      await pusherServer.trigger(`post-${params.postId}`, "like-updated", {
        postId: params.postId,
        likesCount: post?._count.likes || 0,
        isLiked: false,
      })

      return NextResponse.json({ isLiked: false, likesCount: post?._count.likes || 0 }, { status: 200 })
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: params.postId,
        },
      })

      const post = await prisma.post.findUnique({
        where: { id: params.postId },
        include: {
          _count: {
            select: { likes: true },
          },
        },
      })

      // Trigger Pusher event
      await pusherServer.trigger(`post-${params.postId}`, "like-updated", {
        postId: params.postId,
        likesCount: post?._count.likes || 0,
        isLiked: true,
      })

      return NextResponse.json({ isLiked: true, likesCount: post?._count.likes || 0 }, { status: 200 })
    }
  } catch (error) {
    console.error("Like post error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

