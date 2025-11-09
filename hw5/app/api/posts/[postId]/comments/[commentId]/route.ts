import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const comment = await prisma.comment.findUnique({
      where: { id: params.commentId },
      include: {
        author: {
          select: {
            id: true,
            userID: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            replies: true,
            likes: true,
          },
        },
      },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Get replies
    const replies = await prisma.comment.findMany({
      where: { commentId: params.commentId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            userID: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            replies: true,
            likes: true,
          },
        },
      },
    })

    // Check if user has liked the comment and replies
    if (userId) {
      const like = await prisma.like.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId: comment.id,
          },
        },
      })
      ;(comment as any).isLiked = !!like

      for (const reply of replies) {
        const replyLike = await prisma.like.findUnique({
          where: {
            userId_commentId: {
              userId,
              commentId: reply.id,
            },
          },
        })
        ;(reply as any).isLiked = !!replyLike
      }
    }

    return NextResponse.json({ comment, replies }, { status: 200 })
  } catch (error) {
    console.error("Get comment error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

