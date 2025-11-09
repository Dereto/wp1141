"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [userID, setUserID] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/signin")
    }
  }, [session, router])

  if (!session?.user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registration failed")
        return
      }

      // Update session
      await update()
      router.push("/home")
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const validateUserID = (id: string) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(id)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-2">Complete Your Registration</h1>
        <p className="text-gray-400 mb-6">
          Choose a unique userID (3-20 alphanumeric characters or underscores)
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="userID" className="block text-sm font-medium text-gray-300 mb-2">
              UserID
            </label>
            <input
              id="userID"
              type="text"
              value={userID}
              onChange={(e) => {
                setUserID(e.target.value)
                setError("")
              }}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., ric2k1"
              required
            />
            {userID && !validateUserID(userID) && (
              <p className="mt-1 text-sm text-red-400">
                Must be 3-20 alphanumeric characters or underscores
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !validateUserID(userID)}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  )
}

