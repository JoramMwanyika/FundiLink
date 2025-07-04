import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    const supabase = createServerClient()

    const { data: users, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedUsers =
      users?.map((user) => ({
        _id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        categories: user.categories,
        location: user.location,
        availability: user.availability,
        rating: user.rating,
        isVerified: user.is_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      })) || []

    return NextResponse.json({
      success: true,
      users: transformedUsers,
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
