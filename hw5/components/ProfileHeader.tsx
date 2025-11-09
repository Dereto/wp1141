"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import EditProfileModal from "./EditProfileModal"

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

interface ProfileHeaderProps {
  user: User
  isOwnProfile: boolean
  isFollowing: boolean
  onFollow: () => void
}

export default function ProfileHeader({
  user,
  isOwnProfile,
  isFollowing,
  onFollow,
}: ProfileHeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState(false)
  const [userData, setUserData] = useState(user)

  const handleProfileUpdate = (updatedUser: User) => {
    setUserData(updatedUser)
  }

  return (
    <>
      <div className="relative">
        {/* Background Image */}
        <div
          className="h-48 bg-gray-800 bg-cover bg-center"
          style={{
            backgroundImage: userData.backgroundImage
              ? `url(${userData.backgroundImage})`
              : undefined,
          }}
        >
          {isOwnProfile && (
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="absolute bottom-0 left-4 transform translate-y-1/2">
          <img
            src={userData.image || "/default-avatar.png"}
            alt={userData.name || "User"}
            className="w-32 h-32 rounded-full border-4 border-black"
          />
        </div>

        {/* Follow Button (for other users) */}
        {!isOwnProfile && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={onFollow}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                isFollowing
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="pt-16 px-4 pb-4">
        <h1 className="text-2xl font-bold text-white">{userData.name || "User"}</h1>
        <p className="text-gray-500">@{userData.userID}</p>
        {userData.description && (
          <p className="text-white mt-4 whitespace-pre-wrap">{userData.description}</p>
        )}

        {/* Stats */}
        <div className="flex space-x-4 mt-4 text-gray-500">
          <span>
            <span className="text-white font-semibold">{userData._count.posts}</span> Posts
          </span>
          <span>
            <span className="text-white font-semibold">{userData._count.following}</span> Following
          </span>
          <span>
            <span className="text-white font-semibold">{userData._count.followers}</span> Followers
          </span>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal
          user={userData}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </>
  )
}

