import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const post = await prisma.post.findUnique({
      where: { id: params.postId },
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
            comments: true,
            likes: true,
            reposts: true,
          },
        },
        parentPost: {
          include: {
            author: {
              select: {
                id: true,
                userID: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user has liked the post
    if (userId) {
      const like = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId: post.id,
          },
        },
      })
      ;(post as any).isLiked = !!like
    }

    return NextResponse.json({ post }, { status: 200 })
  } catch (error) {
    console.error("Get post error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await prisma.post.findUnique({
      where: { id: params.postId },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if this is a repost (has parentPostId)
    if (post.parentPostId) {
      return NextResponse.json(
        { error: "Cannot delete reposts" },
        { status: 400 }
      )
    }

    await prisma.post.delete({
      where: { id: params.postId },
    })

    return NextResponse.json({ message: "Post deleted" }, { status: 200 })
  } catch (error) {
    console.error("Delete post error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

