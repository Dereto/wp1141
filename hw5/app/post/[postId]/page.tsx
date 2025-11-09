"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import MainLayout from "@/components/MainLayout"
import PostCard from "@/components/PostCard"
import CommentList from "@/components/CommentList"
import CommentComposer from "@/components/CommentComposer"

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

export default function PostDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const postId = params.postId as string
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchPost()
  }, [postId, session])

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`)
      if (!res.ok) throw new Error("Failed to fetch post")

      const data = await res.json()
      setPost(data.post)
    } catch (error) {
      console.error("Error fetching post:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = () => {
    fetchPost()
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen p-8">
          <div className="text-gray-400">Loading...</div>
        </div>
      </MainLayout>
    )
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen p-8">
          <div className="text-gray-400">Post not found</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen">
        {/* Back button */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-gray-800 z-10 p-4">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Post */}
        <PostCard post={post} onUpdate={handleUpdate} />

        {/* Comment Composer */}
        <div className="border-b border-gray-800 p-4">
          <CommentComposer postId={postId} onCommentCreated={handleUpdate} />
        </div>

        {/* Comments */}
        <CommentList postId={postId} />
      </div>
    </MainLayout>
  )
}

