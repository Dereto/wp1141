"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Wait for session to finish loading before making any decisions
    if (status === "loading") {
      return
    }

    // Prevent multiple redirects
    if (hasRedirected) {
      return
    }

    setHasRedirected(true)

    if (!session) {
      // No session - redirect to sign in
      router.push("/auth/signin")
    } else {
      const user = session.user as any
      if (!user.userID) {
        // Has session but no userID - redirect to register
        router.push("/auth/register")
      } else {
        // Has session and userID - redirect to home
        router.push("/home")
      }
    }
  }, [session, status, router, hasRedirected])

  // Show loading while session is being fetched
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )
}
