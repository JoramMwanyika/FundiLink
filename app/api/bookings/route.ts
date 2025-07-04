import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// Update the POST method to include pricing and commission tracking
export async function POST(request: NextRequest) {
  try {
    const { name, phone, location, serviceCategory, date, time, description, fundiId, quotedPrice } =
      await request.json()

    if (!name || !phone || !serviceCategory || !date || !time || !fundiId) {
      return NextResponse.json({ success: false, message: "All required fields must be provided" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get fundi details
    const { data: fundi, error: fundiError } = await supabase.from("users").select("name").eq("id", fundiId).single()

    if (fundiError || !fundi) {
      return NextResponse.json({ success: false, message: "Fundi not found" }, { status: 404 })
    }

    // Create booking with pricing
    const newBooking = {
      client_id: phone, // Using phone as client ID for WhatsApp users
      fundi_id: fundiId,
      client_name: name,
      fundi_name: fundi.name,
      service_category: serviceCategory,
      location,
      date,
      time,
      status: "confirmed" as const,
      description,
      quoted_price: quotedPrice || null,
      payment_status: "pending" as const,
    }

    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .insert([newBooking])
      .select()
      .single()

    if (bookingError) {
      console.error("Supabase error:", bookingError)
      return NextResponse.json({ success: false, message: "Failed to create booking" }, { status: 500 })
    }

    // Update lead status to converted if exists
    await supabase
      .from("leads")
      .update({
        status: "converted",
        converted_booking_id: bookingData.id,
      })
      .eq("fundi_id", fundiId)
      .eq("client_phone", phone)
      .eq("service_category", serviceCategory)
      .eq("status", "new")

    return NextResponse.json({
      success: true,
      bookingId: bookingData.id,
      message: "Booking created successfully",
      booking: bookingData,
    })
  } catch (error) {
    console.error("Create booking error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const role = searchParams.get("role")

    const supabase = createServerClient()

    let query = supabase.from("bookings").select("*")

    if (userId && role === "fundi") {
      query = query.eq("fundi_id", userId)
    } else if (userId && role === "client") {
      query = query.eq("client_id", userId)
    }

    const { data: bookings, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch bookings" }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedBookings =
      bookings?.map((booking) => ({
        _id: booking.id,
        clientId: booking.client_id,
        fundiId: booking.fundi_id,
        clientName: booking.client_name,
        fundiName: booking.fundi_name,
        serviceCategory: booking.service_category,
        location: booking.location,
        date: booking.date,
        time: booking.time,
        status: booking.status,
        description: booking.description,
        price: booking.price,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at,
      })) || []

    return NextResponse.json({
      success: true,
      bookings: transformedBookings,
    })
  } catch (error) {
    console.error("Get bookings error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
