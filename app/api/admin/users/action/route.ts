import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ success: false, message: "User ID and action are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    let updateData: any = {}

    switch (action) {
      case "verify":
        updateData = { is_verified: true }
        break
      case "suspend":
        updateData = { is_verified: false }
        break
      default:
        return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 })
    }

    const { error } = await supabase.from("users").update(updateData).eq("id", userId)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, message: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `User ${action}ed successfully`,
    })
  } catch (error) {
    console.error("User action error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
