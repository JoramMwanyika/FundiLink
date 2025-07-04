import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = createServerClient()

    const { data: user, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        categories: user.categories,
        location: user.location,
        rating: user.rating,
        is_verified: user.is_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updates = await request.json()
    const supabase = createServerClient()

    const { data: user, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, message: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        categories: user.categories,
        location: user.location,
        rating: user.rating,
        is_verified: user.is_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
