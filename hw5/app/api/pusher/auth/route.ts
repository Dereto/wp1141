import { NextRequest, NextResponse } from "next/server"
import { pusherServer } from "@/lib/pusher"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { socket_id, channel_name } = await req.json()

    const auth = pusherServer.authorizeChannel(socket_id, channel_name, {
      user_id: session.user.id,
      user_info: {
        name: session.user.name || "",
        userID: (session.user as any).userID || "",
      },
    })

    return NextResponse.json(auth)
  } catch (error) {
    console.error("Pusher auth error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

