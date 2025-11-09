"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/MainLayout"
import PostModal from "@/components/PostModal"

export default function PostPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [showModal, setShowModal] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
    }
  }, [session, router])

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

