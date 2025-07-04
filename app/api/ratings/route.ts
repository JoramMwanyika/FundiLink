import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { bookingId, rating, review, clientId, fundiId } = await request.json()

    if (!bookingId || !rating || !clientId || !fundiId) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Create rating record
    const { data: ratingData, error: ratingError } = await supabase
      .from("ratings")
      .insert([
        {
          booking_id: bookingId,
          client_id: clientId,
          fundi_id: fundiId,
          rating,
          review: review || null,
        },
      ])
      .select()
      .single()

    if (ratingError) {
      console.error("Rating creation error:", ratingError)
      return NextResponse.json({ success: false, message: "Failed to create rating" }, { status: 500 })
    }

    // Update fundi's average rating
    const { data: ratings, error: ratingsError } = await supabase
      .from("ratings")
      .select("rating")
      .eq("fundi_id", fundiId)

    if (!ratingsError && ratings) {
      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length

      await supabase
        .from("users")
        .update({ rating: Math.round(averageRating * 10) / 10 })
        .eq("id", fundiId)
    }

    return NextResponse.json({
      success: true,
      rating: ratingData,
      message: "Rating submitted successfully",
    })
  } catch (error) {
    console.error("Submit rating error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fundiId = searchParams.get("fundiId")
    const clientId = searchParams.get("clientId")

    const supabase = createServerClient()
    let query = supabase.from("ratings").select("*")

    if (fundiId) {
      query = query.eq("fundi_id", fundiId)
    }
    if (clientId) {
      query = query.eq("client_id", clientId)
    }

    const { data: ratings, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch ratings" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      ratings: ratings || [],
    })
  } catch (error) {
    console.error("Get ratings error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
