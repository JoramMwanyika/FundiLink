import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { fundiId, clientPhone, clientName, serviceCategory, location, leadSource } = await request.json()

    if (!fundiId || !clientPhone || !serviceCategory) {
      return NextResponse.json(
        { success: false, message: "Fundi ID, client phone, and service category are required" },
        { status: 400 },
      )
    }

    const supabase = createServerClient()

    // Check if lead already exists for this fundi and client
    const { data: existingLead } = await supabase
      .from("leads")
      .select("id")
      .eq("fundi_id", fundiId)
      .eq("client_phone", clientPhone)
      .eq("service_category", serviceCategory)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Within last 24 hours
      .single()

    if (existingLead) {
      return NextResponse.json({
        success: true,
        message: "Lead already exists",
        leadId: existingLead.id,
      })
    }

    // Create new lead
    const { data: lead, error } = await supabase
      .from("leads")
      .insert([
        {
          fundi_id: fundiId,
          client_phone: clientPhone,
          client_name: clientName,
          service_category: serviceCategory,
          location: location,
          lead_source: leadSource || "whatsapp",
          status: "new",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Lead creation error:", error)
      return NextResponse.json({ success: false, message: "Failed to create lead" }, { status: 500 })
    }

    // Check if fundi has active subscription to charge for lead
    const { data: subscription } = await supabase
      .from("fundi_subscriptions")
      .select("*")
      .eq("fundi_id", fundiId)
      .eq("status", "active")
      .gte("end_date", new Date().toISOString())
      .single()

    // If no active subscription, charge per lead
    if (!subscription) {
      await supabase.from("leads").update({ charged: true }).eq("id", lead.id)

      // In a real implementation, you might want to:
      // 1. Send payment request to fundi
      // 2. Deduct from prepaid balance
      // 3. Add to pending charges
    }

    return NextResponse.json({
      success: true,
      lead: lead,
      message: "Lead created successfully",
    })
  } catch (error) {
    console.error("Create lead error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fundiId = searchParams.get("fundiId")
    const status = searchParams.get("status")

    const supabase = createServerClient()

    let query = supabase.from("leads").select("*").order("created_at", { ascending: false })

    if (fundiId) {
      query = query.eq("fundi_id", fundiId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data: leads, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch leads" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      leads: leads,
    })
  } catch (error) {
    console.error("Get leads error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
