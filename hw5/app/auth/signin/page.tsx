"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

export default function SignInPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/home"

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 border border-gray-800">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Welcome to X-Clone</h1>
        <p className="text-gray-400 text-center mb-8">Sign in to continue</p>

        <div className="space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center space-x-3 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            <span>🔵</span>
            <span>Continue with Google</span>
          </button>

          <button
            onClick={() => signIn("github", { callbackUrl })}
            className="w-full flex items-center justify-center space-x-3 bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <span>⚫</span>
            <span>Continue with GitHub</span>
          </button>
        </div>
      </div>
    </div>
  )
}

