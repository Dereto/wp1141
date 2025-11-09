"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    if (status === "loading" || hasRedirected) return

    if (!session) {
      setHasRedirected(true)
      router.push("/auth/signin")
    } else {
      const user = session.user as any
      setHasRedirected(true)
      if (!user.userID) {
        router.push("/auth/register")
      } else {
        router.push("/home")
      }
    }
  }, [session, status, router, hasRedirected])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )
}
