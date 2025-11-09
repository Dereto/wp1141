import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: { userID: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "posts" // "posts" or "likes"
    const limit = parseInt(searchParams.get("limit") || "20")
    const cursor = searchParams.get("cursor")

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const user = await prisma.user.findUnique({
      where: { userID: params.userID },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (type === "likes") {
      // Only show likes for own profile
      if (userId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const likes = await prisma.like.findMany({
        where: {
          userId: user.id,
          postId: { not: null },
        },
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { createdAt: "desc" },
        include: {
          post: {
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
          },
        },
      })

      const hasMore = likes.length > limit
      const data = hasMore ? likes.slice(0, limit) : likes
      const nextCursor = hasMore ? data[data.length - 1].id : null

      return NextResponse.json({ posts: data.map((l) => l.post), nextCursor }, { status: 200 })
    } else {
      // Get user's posts and reposts
      const posts = await prisma.post.findMany({
        where: {
          authorId: user.id,
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
    }
  } catch (error) {
    console.error("Get user posts error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

