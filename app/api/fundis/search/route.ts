import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { category, date, time, location } = await request.json()

    if (!category || !date || !time) {
      return NextResponse.json({ success: false, message: "Category, date, and time are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Find fundis with matching category
    const { data: fundis, error } = await supabase
      .from("users")
      .select("id, name, location, rating, categories")
      .eq("role", "fundi")
      .eq("is_verified", true)
      .contains("categories", [category])

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, message: "Failed to search fundis" }, { status: 500 })
    }

    // If location is provided, prioritize fundis in the same location
    let sortedFundis = fundis || []
    if (location) {
      sortedFundis = sortedFundis.sort((a, b) => {
        const aLocationMatch = a.location?.toLowerCase().includes(location.toLowerCase()) ? 1 : 0
        const bLocationMatch = b.location?.toLowerCase().includes(location.toLowerCase()) ? 1 : 0
        return bLocationMatch - aLocationMatch
      })
    }

    return NextResponse.json({
      success: true,
      fundis: sortedFundis.map((fundi) => ({
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
