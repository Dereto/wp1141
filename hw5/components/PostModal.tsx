"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { calculatePostLength } from "@/lib/utils"

interface Draft {
  id: string
  content: string
  createdAt: string
  updatedAt: string
}

interface PostModalProps {
  onClose: () => void
  onPostCreated?: () => void
}

export default function PostModal({ onClose, onPostCreated }: PostModalProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [showDrafts, setShowDrafts] = useState(false)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    try {
      const res = await fetch("/api/drafts")
      if (res.ok) {
        const data = await res.json()
        setDrafts(data.drafts)
      }
    } catch (error) {
      console.error("Error fetching drafts:", error)
    }
  }

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

      onPostCreated?.()
      onClose()
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!content.trim()) {
      onClose()
      return
    }

    try {
      await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      onClose()
    } catch (error) {
      console.error("Error saving draft:", error)
      onClose()
    }
  }

  const handleDiscard = () => {
    setContent("")
    onClose()
  }

  const handleClose = () => {
    if (content.trim()) {
      setShowDiscardConfirm(true)
    } else {
      onClose()
    }
  }

  const loadDraft = (draft: Draft) => {
    setContent(draft.content)
    setShowDrafts(false)
  }

  if (!session) return null

  const user = session.user as any

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black rounded-lg w-full max-w-2xl border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
          <button
            onClick={() => setShowDrafts(!showDrafts)}
            className="text-blue-500 hover:text-blue-400 transition-colors"
          >
            Drafts
          </button>
        </div>

        {/* Drafts List */}
        {showDrafts && (
          <div className="border-b border-gray-800 p-4 max-h-64 overflow-y-auto">
            {drafts.length === 0 ? (
              <p className="text-gray-400 text-center">No drafts</p>
            ) : (
              <div className="space-y-2">
                {drafts.map((draft) => (
                  <button
                    key={draft.id}
                    onClick={() => loadDraft(draft)}
                    className="w-full text-left p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <p className="text-white text-sm line-clamp-2">{draft.content}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(draft.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex space-x-4 mb-4">
            <img
              src={user.image || "/default-avatar.png"}
              alt={user.name || "User"}
              className="w-12 h-12 rounded-full flex-shrink-0"
            />
            <textarea
              value={content}
              onChange={(e) => {
                const newContent = e.target.value
                const length = calculatePostLength(newContent)
                if (length <= 280) {
                  setContent(newContent)
                }
              }}
              placeholder="What's happening?"
              className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-lg"
              rows={6}
              maxLength={1000}
            />
          </div>

          <div className="flex items-center justify-between">
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
                onClick={handleClose}
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
        </form>

        {/* Discard Confirmation */}
        {showDiscardConfirm && (
          <div className="border-t border-gray-800 p-4">
            <p className="text-white mb-4">Save as draft or discard?</p>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveDraft}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={handleDiscard}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

