"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import MainLayout from "@/components/MainLayout"
import PostFeed from "@/components/PostFeed"
import PostComposer from "@/components/PostComposer"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [feedType, setFeedType] = useState<"all" | "following">("all")

  useEffect(() => {
    // Wait for session to finish loading
    if (status === "loading") {
      return
    }

    if (!session) {
      router.push("/auth/signin")
      return
    }

    const user = session.user as any
    if (!user.userID) {
      router.push("/auth/register")
    }
  }, [session, status, router])

  // Show loading while session is being fetched
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-gray-800 z-10">
          <div className="flex">
            <button
              onClick={() => setFeedType("all")}
              className={`flex-1 px-4 py-4 text-center font-semibold transition-colors ${
                feedType === "all"
                  ? "text-white border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFeedType("following")}
              className={`flex-1 px-4 py-4 text-center font-semibold transition-colors ${
                feedType === "following"
                  ? "text-white border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Following
            </button>
          </div>
        </div>

        {/* Post Composer */}
        <div className="border-b border-gray-800 p-4">
          <PostComposer />
        </div>

        {/* Feed */}
        <PostFeed type={feedType} />
      </div>
    </MainLayout>
  )
}

