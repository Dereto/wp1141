"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/MainLayout"
import PostModal from "@/components/PostModal"

export default function PostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showModal, setShowModal] = useState(true)

  useEffect(() => {
    // Wait for session to finish loading
    if (status === "loading") {
      return
    }

    if (!session) {
      router.push("/auth/signin")
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

  const handleClose = () => {
    setShowModal(false)
    router.push("/home")
  }

  const handlePostCreated = () => {
    router.push("/home")
  }

  return (
    <MainLayout>
      {showModal && (
        <PostModal onClose={handleClose} onPostCreated={handlePostCreated} />
      )}
    </MainLayout>
  )
}

