import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { category, date, time } = await request.json()

    if (!category || !date || !time) {
      return NextResponse.json({ success: false, message: "Category, date, and time are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Find fundis with matching category and available for the requested date and time
    const { data: fundis, error } = await supabase
      .from("users")
      .select("id, name, location, rating, categories, availability")
      .eq("role", "fundi")
      .eq("is_verified", true)
      .contains("categories", [category])

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, message: "Failed to search fundis" }, { status: 500 })
    }

    // Filter fundis by availability for the requested date and time
    const availableFundis = (fundis || []).filter(fundi =>
      Array.isArray(fundi.availability) &&
      fundi.availability.some(slot => slot.date === date && slot.time === time && slot.available)
    )

    return NextResponse.json({
      success: true,
      fundis: availableFundis.map((fundi) => ({
        _id: fundi.id, // Keep _id for compatibility with frontend
        name: fundi.name,
        location: fundi.location,
        rating: fundi.rating,
        categories: fundi.categories,
      })),
    })
  } catch (error) {
    console.error("Search fundis error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
