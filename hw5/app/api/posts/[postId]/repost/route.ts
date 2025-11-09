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

    // Check if already reposted
    const existingRepost = await prisma.repost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: params.postId,
        },
      },
    })

    if (existingRepost) {
      return NextResponse.json(
        { error: "Already reposted" },
        { status: 400 }
      )
    }

    // Create repost record
    await prisma.repost.create({
      data: {
        userId: session.user.id,
        postId: params.postId,
      },
    })

    // Create a post that references the original post
    await prisma.post.create({
      data: {
        content: "",
        authorId: session.user.id,
        parentPostId: params.postId,
      },
    })

    const post = await prisma.post.findUnique({
      where: { id: params.postId },
      include: {
        _count: {
          select: { reposts: true },
        },
      },
    })

    // Trigger Pusher event
    await pusherServer.trigger(`post-${params.postId}`, "repost-updated", {
      postId: params.postId,
      repostsCount: post?._count.reposts || 0,
    })

    return NextResponse.json({ repostsCount: post?._count.reposts || 0 }, { status: 200 })
  } catch (error) {
    console.error("Repost error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

