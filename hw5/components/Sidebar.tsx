"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"

export default function Sidebar() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [showLogout, setShowLogout] = useState(false)
  const logoutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (logoutRef.current && !logoutRef.current.contains(event.target as Node)) {
        setShowLogout(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!session?.user) {
    return null
  }

  const user = session.user as any
  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 border-r border-gray-800 bg-black flex flex-col">
      {/* Logo */}
      <div className="p-4">
        <Link href="/home" className="text-2xl font-bold text-white">
          X-Clone
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavItem
          href="/home"
          label="Home"
          icon="🏠"
          active={isActive("/home")}
        />
        <NavItem
          href={`/profile/${user.userID || ""}`}
          label="Profile"
          icon="👤"
          active={pathname?.startsWith("/profile")}
        />
        <NavItem
          href="/post"
          label="Post"
          icon="✍️"
          active={isActive("/post")}
          highlight
        />
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <div className="relative" ref={logoutRef}>
          <button
            onClick={() => setShowLogout(!showLogout)}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-900 transition-colors"
          >
            <img
              src={user.image || "/default-avatar.png"}
              alt={user.name || "User"}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 text-left">
              <p className="text-white font-semibold text-sm">{user.name || "User"}</p>
              <p className="text-gray-400 text-xs">@{user.userID || "user"}</p>
            </div>
          </button>

          {showLogout && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-white hover:bg-gray-800 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function NavItem({
  href,
  label,
  icon,
  active,
  highlight = false,
}: {
  href: string
  label: string
  icon: string
  active: boolean
  highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        highlight
          ? "bg-blue-500 text-white"
          : active
          ? "bg-gray-900 text-white"
          : "text-gray-400 hover:bg-gray-900 hover:text-white"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-semibold">{label}</span>
    </Link>
  )
}

