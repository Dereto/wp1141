"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { formatRelativeTime, extractUrls } from "@/lib/utils"
import Link from "next/link"
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

interface PostCardProps {
  post: Post
  onUpdate?: () => void
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [likesCount, setLikesCount] = useState(post._count.likes)
  const [commentsCount, setCommentsCount] = useState(post._count.comments)
  const [repostsCount, setRepostsCount] = useState(post._count.reposts)
  const [loading, setLoading] = useState(false)

  const user = session?.user as any
  const isOwnPost = user?.id === post.author.id

  // Set up Pusher for real-time updates
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
    })

    const channel = pusher.subscribe(`post-${post.id}`)
    channel.bind("like-updated", (data: { likesCount: number; isLiked: boolean }) => {
      setIsLiked(data.isLiked)
      setLikesCount(data.likesCount)
    })

    channel.bind("repost-updated", (data: { repostsCount: number }) => {
      setRepostsCount(data.repostsCount)
    })

    return () => {
      pusher.unsubscribe(`post-${post.id}`)
      pusher.disconnect()
    }
  }, [post.id])

  const formatContent = (text: string) => {
    // Replace URLs with links
    const urls = extractUrls(text)
    let formatted = text
    urls.forEach((url) => {
      formatted = formatted.replace(
        url,
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`
      )
    })

    // Replace @mentions with links
    formatted = formatted.replace(
      /@(\w+)/g,
      '<a href="/profile/$1" class="text-blue-500 hover:underline">@$1</a>'
    )

    // Replace #hashtags with links
    formatted = formatted.replace(
      /#(\w+)/g,
      '<a href="/hashtag/$1" class="text-blue-500 hover:underline">#$1</a>'
    )

    return formatted
  }

  const handleLike = async () => {
    if (!session || loading) return

    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      })

      if (!res.ok) throw new Error("Failed to like post")

      const data = await res.json()
      setIsLiked(data.isLiked)
      setLikesCount(data.likesCount)
    } catch (error) {
      console.error("Error liking post:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRepost = async () => {
    if (!session || loading) return

    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${post.id}/repost`, {
        method: "POST",
      })

      if (!res.ok) throw new Error("Failed to repost")

      const data = await res.json()
      setRepostsCount(data.repostsCount)
      onUpdate?.()
    } catch (error) {
      console.error("Error reposting:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!isOwnPost || !confirm("Are you sure you want to delete this post?")) return

    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete post")

      onUpdate?.()
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("Failed to delete post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="border-b border-gray-800 p-4 hover:bg-gray-900/50 transition-colors">
      {/* Repost indicator */}
      {post.parentPost && (
        <div className="text-gray-500 text-sm mb-2 ml-12">
          Reposted from @{post.parentPost.author.userID}
        </div>
      )}

      <div className="flex space-x-4">
        {/* Avatar */}
        <Link href={`/profile/${post.author.userID}`}>
          <img
            src={post.author.image || "/default-avatar.png"}
            alt={post.author.name || "User"}
            className="w-12 h-12 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-1">
            <Link
              href={`/profile/${post.author.userID}`}
              className="font-semibold text-white hover:underline"
            >
              {post.author.name || "User"}
            </Link>
            <Link
              href={`/profile/${post.author.userID}`}
              className="text-gray-500 hover:underline"
            >
              @{post.author.userID}
            </Link>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{formatRelativeTime(new Date(post.createdAt))}</span>
            {isOwnPost && (
              <>
                <span className="text-gray-500">·</span>
                <button
                  onClick={handleDelete}
                  className="text-gray-500 hover:text-red-500 text-sm"
                  disabled={loading}
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {/* Post Content */}
          <div
            className="text-white mb-3 whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
          />

          {/* Original Post (if repost) */}
          {post.parentPost && (
            <div className="border border-gray-800 rounded-lg p-4 mb-3 bg-gray-900/50">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-500">
                  @{post.parentPost.author.userID}
                </span>
              </div>
              <div className="text-gray-300">{post.parentPost.content}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-6 text-gray-500">
            <button
              onClick={() => router.push(`/post/${post.id}`)}
              className="flex items-center space-x-2 hover:text-blue-500 transition-colors"
            >
              <span>💬</span>
              <span>{commentsCount}</span>
            </button>

            <button
              onClick={handleRepost}
              disabled={loading}
              className="flex items-center space-x-2 hover:text-green-500 transition-colors disabled:opacity-50"
            >
              <span>🔄</span>
              <span>{repostsCount}</span>
            </button>

            <button
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center space-x-2 transition-colors disabled:opacity-50 ${
                isLiked ? "text-red-500" : "hover:text-red-500"
              }`}
            >
              <span>{isLiked ? "❤️" : "🤍"}</span>
              <span>{likesCount}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

