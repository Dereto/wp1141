"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import MainLayout from "@/components/MainLayout"
import PostFeed from "@/components/PostFeed"
import ProfileHeader from "@/components/ProfileHeader"

interface User {
  id: string
  userID: string
  name: string | null
  image: string | null
  description: string | null
  backgroundImage: string | null
  createdAt: string
  _count: {
    posts: number
    following: number
    followers: number
  }
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const userID = params.userID as string
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [tab, setTab] = useState<"posts" | "likes">("posts")

  const currentUser = session?.user as any
  const isOwnProfile = currentUser?.userID === userID

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchUser()
    if (!isOwnProfile) {
      checkFollowStatus()
    }
  }, [userID, session])

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/users/${userID}`)
      if (!res.ok) throw new Error("Failed to fetch user")

      const data = await res.json()
      setUser(data.user)
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkFollowStatus = async () => {
    try {
      const res = await fetch(`/api/users/${userID}/follow`)
      if (!res.ok) return

      const data = await res.json()
      setIsFollowing(data.isFollowing)
    } catch (error) {
      console.error("Error checking follow status:", error)
    }
  }

  const handleFollow = async () => {
    if (!session) return

    try {
      const res = await fetch(`/api/users/${userID}/follow`, {
        method: "POST",
      })

      if (!res.ok) throw new Error("Failed to follow user")

      const data = await res.json()
      setIsFollowing(data.isFollowing)
      fetchUser() // Refresh to update follower count
    } catch (error) {
      console.error("Error following user:", error)
    }
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

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen p-8">
          <div className="text-gray-400">User not found</div>
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
            onClick={() => router.push("/home")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Profile Header */}
        <ProfileHeader
          user={user}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollow={handleFollow}
        />

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setTab("posts")}
            className={`flex-1 px-4 py-4 text-center font-semibold transition-colors ${
              tab === "posts"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Posts
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setTab("likes")}
              className={`flex-1 px-4 py-4 text-center font-semibold transition-colors ${
                tab === "likes"
                  ? "text-white border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Likes
            </button>
          )}
        </div>

        {/* Posts Feed */}
        {tab === "posts" ? (
          <PostFeed type="all" userId={userID} />
        ) : (
          <UserLikesFeed userID={userID} />
        )}
      </div>
    </MainLayout>
  )
}

