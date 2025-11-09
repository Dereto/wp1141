"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { calculatePostLength } from "@/lib/utils"

interface CommentComposerProps {
  postId: string
  commentId?: string
  onCommentCreated?: () => void
  placeholder?: string
}

export default function CommentComposer({
  postId,
  commentId,
  onCommentCreated,
  placeholder = "Post your reply",
}: CommentComposerProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  if (!session) return null

  const user = session.user as any
  const postLength = calculatePostLength(content)
  const remainingChars = 280 - postLength
  const canPost = content.trim().length > 0 && postLength <= 280 && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canPost) return

    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, commentId }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Failed to create comment")
        return
      }

      setContent("")
      onCommentCreated?.()
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-4">
        <img
          src={user.image || "/default-avatar.png"}
          alt={user.name || "User"}
          className="w-10 h-10 rounded-full flex-shrink-0"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => {
              const newContent = e.target.value
              const length = calculatePostLength(newContent)
              if (length <= 280) {
                setContent(newContent)
              }
            }}
            placeholder={placeholder}
            className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none"
            rows={3}
            maxLength={1000}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pl-14">
        <div className="text-sm text-gray-400">
          {remainingChars < 0 ? (
            <span className="text-red-500">{Math.abs(remainingChars)} over limit</span>
          ) : (
            <span>{remainingChars} characters remaining</span>
          )}
        </div>
        <button
          type="submit"
          disabled={!canPost}
          className="px-6 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Posting..." : "Reply"}
        </button>
      </div>
    </form>
  )
}

