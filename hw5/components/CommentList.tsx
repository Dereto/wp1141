"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { formatRelativeTime, extractUrls } from "@/lib/utils"
import Link from "next/link"
import Pusher from "pusher-js"

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

interface CommentListProps {
  postId: string
  commentId?: string
  onCommentClick?: (commentId: string) => void
  showReplies?: boolean
}

export default function CommentList({ postId, commentId, onCommentClick, showReplies = true }: CommentListProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [postId, commentId])

  useEffect(() => {
    // Set up Pusher for real-time comment updates
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
    })

    const channel = pusher.subscribe(`post-${postId}`)
    channel.bind("new-comment", (data: { comment: Comment }) => {
      if (!commentId || data.comment.id === commentId) {
        setComments((prev) => [data.comment, ...prev])
      }
    })

    channel.bind("like-updated", (data: { commentId: string; likesCount: number; isLiked: boolean }) => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === data.commentId
            ? { ...c, isLiked: data.isLiked, _count: { ...c._count, likes: data.likesCount } }
            : c
        )
      )
    })

    return () => {
      pusher.unsubscribe(`post-${postId}`)
      pusher.disconnect()
    }
  }, [postId, commentId])

  const fetchComments = async () => {
    try {
      const url = commentId
        ? `/api/posts/${postId}/comments/${commentId}`
        : `/api/posts/${postId}/comments`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch comments")

      const data = await res.json()
      if (commentId) {
        setComments(data.replies || [])
      } else {
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (commentId: string, currentLiked: boolean, currentCount: number) => {
    if (!session) return

    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      })

      if (!res.ok) throw new Error("Failed to like comment")

      const data = await res.json()
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, isLiked: data.isLiked, _count: { ...c._count, likes: data.likesCount } }
            : c
        )
      )
    } catch (error) {
      console.error("Error liking comment:", error)
    }
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
      '<a href="/hashtag/$1" class="text-blue-500 hover:underline">#$1</a>`
    )
    return formatted
  }

  if (loading) {
    return <div className="p-4 text-gray-400">Loading comments...</div>
  }

  if (comments.length === 0) {
    return <div className="p-4 text-gray-400 text-center">No comments yet</div>
  }

  return (
    <div>
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="border-b border-gray-800 p-4 hover:bg-gray-900/50 transition-colors"
        >
          <div className="flex space-x-4">
            <Link href={`/profile/${comment.author.userID}`}>
              <img
                src={comment.author.image || "/default-avatar.png"}
                alt={comment.author.name || "User"}
                className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
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
                className="text-white mb-2 whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{ __html: formatContent(comment.content) }}
              />

              <div className="flex items-center space-x-6 text-gray-500">
                {comment._count.replies > 0 && showReplies && (
                  <Link
                    href={`/post/${postId}/comment/${comment.id}`}
                    className="flex items-center space-x-2 hover:text-blue-500 transition-colors"
                  >
                    <span>💬</span>
                    <span>{comment._count.replies}</span>
                  </Link>
                )}

                <button
                  onClick={() => handleLike(comment.id, comment.isLiked || false, comment._count.likes)}
                  className={`flex items-center space-x-2 transition-colors ${
                    comment.isLiked ? "text-red-500" : "hover:text-red-500"
                  }`}
                >
                  <span>{comment.isLiked ? "❤️" : "🤍"}</span>
                  <span>{comment._count.likes}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

