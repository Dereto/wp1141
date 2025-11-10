"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import MainLayout from "@/components/MainLayout"
import CommentList from "@/components/CommentList"
import CommentComposer from "@/components/CommentComposer"
import { formatRelativeTime, extractUrls } from "@/lib/utils"
import Link from "next/link"

interface Comment {
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
    replies: number
    likes: number
  }
  isLiked?: boolean
}

export default function CommentDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const commentId = params.commentId as string
  const postId = params.postId as string
  const [comment, setComment] = useState<Comment | null>(null)
  const [replies, setReplies] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for session to finish loading
    if (status === "loading") {
      return
    }

    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchComment()
  }, [commentId, postId, session, status, router])

  const fetchComment = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`)
      if (!res.ok) throw new Error("Failed to fetch comment")

      const data = await res.json()
      setComment(data.comment)
      setReplies(data.replies || [])
    } catch (error) {
      console.error("Error fetching comment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = () => {
    fetchComment()
  }

  const formatContent = (text: string) => {
    const urls = extractUrls(text)
    let formatted = text
    urls.forEach((url) => {
      formatted = formatted.replace(
        url,
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`
      )
    })
    formatted = formatted.replace(
      /@(\w+)/g,
      '<a href="/profile/$1" class="text-blue-500 hover:underline">@$1</a>'
    )
    formatted = formatted.replace(
      /#(\w+)/g,
      '<a href="/hashtag/$1" class="text-blue-500 hover:underline">#$1</a>'
    )
    return formatted
  }

  // Show loading while session is being fetched
  if (status === "loading" || loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen p-8">
          <div className="text-gray-400">Loading...</div>
        </div>
      </MainLayout>
    )
  }

  if (!comment) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen p-8">
          <div className="text-gray-400">Comment not found</div>
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

        {/* Comment */}
        <div className="border-b border-gray-800 p-4">
          <div className="flex space-x-4">
            <Link href={`/profile/${comment.author.userID}`}>
              <img
                src={comment.author.image || "/default-avatar.png"}
                alt={comment.author.name || "User"}
                className="w-12 h-12 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Link
                  href={`/profile/${comment.author.userID}`}
                  className="font-semibold text-white hover:underline"
                >
                  {comment.author.name || "User"}
                </Link>
                <Link
                  href={`/profile/${comment.author.userID}`}
                  className="text-gray-500 hover:underline"
                >
                  @{comment.author.userID}
                </Link>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500">
                  {formatRelativeTime(new Date(comment.createdAt))}
                </span>
              </div>

              <div
                className="text-white mb-3 whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{ __html: formatContent(comment.content) }}
              />
            </div>
          </div>
        </div>

        {/* Reply Composer */}
        <div className="border-b border-gray-800 p-4">
          <CommentComposer
            postId={postId}
            commentId={commentId}
            onCommentCreated={handleUpdate}
            placeholder="Post your reply"
          />
        </div>

        {/* Replies */}
        <CommentList postId={postId} commentId={commentId} showReplies={false} />
      </div>
    </MainLayout>
  )
}
