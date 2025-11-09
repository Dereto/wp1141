"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { calculatePostLength, extractUrls } from "@/lib/utils"

interface PostComposerProps {
  onPostCreated?: () => void
  initialContent?: string
  placeholder?: string
}

export default function PostComposer({
  onPostCreated,
  initialContent = "",
  placeholder = "What's happening?",
}: PostComposerProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState(initialContent)
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isExpanded])

  const postLength = calculatePostLength(content)
  const remainingChars = 280 - postLength
  const canPost = content.trim().length > 0 && postLength <= 280 && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canPost || !session) return

    setLoading(true)
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Failed to create post")
        return
      }

      setContent("")
      setIsExpanded(false)
      onPostCreated?.()
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!session) return null

  const user = session.user as any

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-4">
        <img
          src={user.image || "/default-avatar.png"}
          alt={user.name || "User"}
          className="w-12 h-12 rounded-full flex-shrink-0"
        />
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              const newContent = e.target.value
              const length = calculatePostLength(newContent)
              if (length <= 280) {
                setContent(newContent)
              }
            }}
            onFocus={() => setIsExpanded(true)}
            placeholder={placeholder}
            className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-lg"
            rows={isExpanded ? 4 : 1}
            maxLength={1000} // Allow typing, but validate on submit
          />
        </div>
      </div>

      {isExpanded && (
        <div className="flex items-center justify-between pl-16">
          <div className="text-sm text-gray-400">
            {remainingChars < 0 ? (
              <span className="text-red-500">{Math.abs(remainingChars)} over limit</span>
            ) : (
              <span>{remainingChars} characters remaining</span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => {
                setContent("")
                setIsExpanded(false)
              }}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canPost}
              className="px-6 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}

