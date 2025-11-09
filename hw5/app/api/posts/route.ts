import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { calculatePostLength, extractMentions, extractHashtags } from "@/lib/utils"
import { pusherServer } from "@/lib/pusher"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "all" // "all" or "following"
    const limit = parseInt(searchParams.get("limit") || "20")
    const cursor = searchParams.get("cursor")

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    let where: any = {
      parentPostId: null, // Only original posts, not reposts
    }

    if (type === "following" && userId) {
      // Get posts from users that the current user follows
      const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      })
      const followingIds = following.map((f) => f.followingId)
      where.authorId = { in: followingIds }
    }

    const posts = await prisma.post.findMany({
      where,
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

    // Check if user has liked each post
    if (userId) {
      for (const post of posts) {
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
    }

    const hasMore = posts.length > limit
    const data = hasMore ? posts.slice(0, limit) : posts
    const nextCursor = hasMore ? data[data.length - 1].id : null

    return NextResponse.json({ posts: data, nextCursor }, { status: 200 })
  } catch (error) {
    console.error("Get posts error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, parentPostId } = await req.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    const postLength = calculatePostLength(content)
    if (postLength > 280) {
      return NextResponse.json(
        { error: "Post exceeds 280 character limit" },
        { status: 400 }
      )
    }

    // Extract mentions and hashtags
    const mentionUserIDs = extractMentions(content)
    const hashtags = extractHashtags(content)

    // Create post first
    const post = await prisma.post.create({
      data: {
        content,
        authorId: session.user.id,
        parentPostId: parentPostId || null,
        hashtags: {
          create: hashtags.map((name) => ({
            hashtag: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
        },
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
            comments: true,
            likes: true,
            reposts: true,
          },
        },
      },
    })

    // Create mentions if any
    if (mentionUserIDs.length > 0) {
      const mentionedUsers = await prisma.user.findMany({
        where: { userID: { in: mentionUserIDs } },
        select: { id: true },
      })

      if (mentionedUsers.length > 0) {
        await prisma.mention.createMany({
          data: mentionedUsers.map((user) => ({
            userId: user.id,
            postId: post.id,
          })),
          skipDuplicates: true,
        })
      }
    }

    // Trigger Pusher event for new post
    await pusherServer.trigger("posts", "new-post", {
      post,
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error("Create post error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

