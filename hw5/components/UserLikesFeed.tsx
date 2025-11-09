"use client"

import { useState, useEffect } from "react"
import PostCard from "./PostCard"

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

interface UserLikesFeedProps {
  userID: string
}

export default function UserLikesFeed({ userID }: UserLikesFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLikes()
  }, [userID])

  const fetchLikes = async () => {
    try {
      const res = await fetch(`/api/users/${userID}/posts?type=likes`)
      if (!res.ok) throw new Error("Failed to fetch likes")

      const data = await res.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error("Error fetching likes:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>
  }

  if (posts.length === 0) {
    return <div className="p-8 text-center text-gray-400">No liked posts yet</div>
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onUpdate={fetchLikes} />
      ))}
    </div>
  )
}

