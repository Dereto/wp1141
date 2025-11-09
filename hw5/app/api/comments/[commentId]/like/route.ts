import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { pusherServer } from "@/lib/pusher"

export async function POST(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: params.commentId,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      })

      const comment = await prisma.comment.findUnique({
        where: { id: params.commentId },
        include: {
          _count: {
            select: { likes: true },
          },
        },
      })

      // Trigger Pusher event
      await pusherServer.trigger(`comment-${params.commentId}`, "like-updated", {
        commentId: params.commentId,
        likesCount: comment?._count.likes || 0,
        isLiked: false,
      })

      return NextResponse.json({ isLiked: false, likesCount: comment?._count.likes || 0 }, { status: 200 })
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          commentId: params.commentId,
        },
      })

      const comment = await prisma.comment.findUnique({
        where: { id: params.commentId },
        include: {
          _count: {
            select: { likes: true },
          },
        },
      })

      // Trigger Pusher event
      await pusherServer.trigger(`comment-${params.commentId}`, "like-updated", {
        commentId: params.commentId,
        likesCount: comment?._count.likes || 0,
        isLiked: true,
      })

      return NextResponse.json({ isLiked: true, likesCount: comment?._count.likes || 0 }, { status: 200 })
    }
  } catch (error) {
    console.error("Like comment error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

