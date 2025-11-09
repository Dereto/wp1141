"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

interface User {
  id: string
  userID: string
  name: string | null
  image: string | null
  description: string | null
  backgroundImage: string | null
}

interface EditProfileModalProps {
  user: User
  onClose: () => void
  onUpdate: (user: Partial<User>) => void
}

export default function EditProfileModal({ user, onClose, onUpdate }: EditProfileModalProps) {
  const { data: session, update } = useSession()
  const [description, setDescription] = useState(user.description || "")
  const [backgroundImage, setBackgroundImage] = useState(user.backgroundImage || "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/users/${user.userID}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, backgroundImage }),
      })

      if (!res.ok) throw new Error("Failed to update profile")

      const data = await res.json()
      onUpdate(data.user)
      await update()
      onClose()
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label
              htmlFor="backgroundImage"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Background Image URL
            </label>
            <input
              id="backgroundImage"
              type="url"
              value={backgroundImage}
              onChange={(e) => setBackgroundImage(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

