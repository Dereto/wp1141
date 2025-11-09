import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { calculatePostLength, extractMentions, extractHashtags } from "@/lib/utils"
import { pusherServer } from "@/lib/pusher"

export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const cursor = searchParams.get("cursor")

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const comments = await prisma.comment.findMany({
      where: {
        postId: params.postId,
        commentId: null, // Top-level comments only
      },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
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

    // Check if user has liked each comment
    if (userId) {
      for (const comment of comments) {
        const like = await prisma.like.findUnique({
          where: {
            userId_commentId: {
              userId,
              commentId: comment.id,
            },
          },
        })
        ;(comment as any).isLiked = !!like
      }
    }

    const hasMore = comments.length > limit
    const data = hasMore ? comments.slice(0, limit) : comments
    const nextCursor = hasMore ? data[data.length - 1].id : null

    return NextResponse.json({ comments: data, nextCursor }, { status: 200 })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, commentId } = await req.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    const postLength = calculatePostLength(content)
    if (postLength > 280) {
      return NextResponse.json(
        { error: "Comment exceeds 280 character limit" },
        { status: 400 }
      )
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        postId: commentId ? null : params.postId,
        commentId: commentId || null,
      },
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

    // Trigger Pusher event for new comment
    await pusherServer.trigger(`post-${params.postId}`, "new-comment", {
      comment,
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("Create comment error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

