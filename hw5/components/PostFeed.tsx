"use client"

import { useState, useEffect, useCallback } from "react"
import PostCard from "./PostCard"
import Pusher from "pusher-js"

interface Post {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    userID: string
    name: string | null
    image: string | null
  }
  _count: {
    comments: number
    likes: number
    reposts: number
  }
  isLiked?: boolean
  parentPost?: Post | null
}

interface PostFeedProps {
  type: "all" | "following"
  userId?: string
}

export default function PostFeed({ type, userId }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    try {
      let url = "/api/posts"
      if (userId) {
        url = `/api/users/${userId}/posts?type=posts`
        if (cursor) url += `&cursor=${cursor}`
      } else {
        const params = new URLSearchParams({ type, limit: "20" })
        if (cursor) params.append("cursor", cursor)
        url = `/api/posts?${params}`
      }

      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch posts")

      const data = await res.json()
      if (cursor) {
        setPosts((prev) => [...prev, ...data.posts])
      } else {
        setPosts(data.posts)
      }
      setCursor(data.nextCursor)
      setHasMore(!!data.nextCursor)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }, [type, userId, cursor])

  useEffect(() => {
    setCursor(null)
    setPosts([])
    setLoading(true)
    fetchPosts()
  }, [type, userId])

  useEffect(() => {
    // Set up Pusher for real-time updates
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
    })

    const channel = pusher.subscribe("posts")
    channel.bind("new-post", (data: { post: Post }) => {
      // Only add if it matches the current feed type
      if (type === "all" || (type === "following" && data.post)) {
        setPosts((prev) => [data.post, ...prev])
      }
    })

    return () => {
      pusher.unsubscribe("posts")
      pusher.disconnect()
    }
  }, [type])

  const handlePostUpdate = () => {
    // Refresh posts when a post is updated
    setCursor(null)
    fetchPosts()
  }

  if (loading && posts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">Loading posts...</div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        No posts yet. Be the first to post!
      </div>
    )
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onUpdate={handlePostUpdate} />
      ))}
      {hasMore && (
        <div className="p-4 text-center">
          <button
            onClick={() => fetchPosts()}
            className="text-blue-500 hover:text-blue-400"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  )
}

