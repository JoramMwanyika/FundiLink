import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = createServerClient()

    const { data: booking, error } = await supabase.from("bookings").select("*").eq("id", id).single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      booking: {
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
      },
    })
  } catch (error) {
    console.error("Get booking error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updates = await request.json()
    const supabase = createServerClient()

    const { data: booking, error } = await supabase.from("bookings").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, message: "Failed to update booking" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      booking: {
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
      },
    })
  } catch (error) {
    console.error("Update booking error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
