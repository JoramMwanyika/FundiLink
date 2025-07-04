import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get all active subscription plans
    const { data: plans, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("price_weekly", { ascending: true })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch plans" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      plans: plans,
    })
  } catch (error) {
    console.error("Get plans error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== "fundi") {
      return NextResponse.json({ success: false, message: "Fundi access required" }, { status: 403 })
    }

    const { planId, paymentPeriod } = await request.json()

    if (!planId || !paymentPeriod) {
      return NextResponse.json({ success: false, message: "Plan ID and payment period are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get the subscription plan
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ success: false, message: "Invalid subscription plan" }, { status: 400 })
    }

    // Calculate amount based on payment period
    const amount = paymentPeriod === "weekly" ? plan.price_weekly : plan.price_monthly

    // Create subscription record
    const endDate = new Date()
    if (paymentPeriod === "weekly") {
      endDate.setDate(endDate.getDate() + 7)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .from("fundi_subscriptions")
      .insert([
        {
          fundi_id: payload.userId,
          plan_id: planId,
          status: "pending",
          end_date: endDate.toISOString(),
        },
      ])
      .select()
      .single()

    if (subscriptionError) {
      console.error("Subscription creation error:", subscriptionError)
      return NextResponse.json({ success: false, message: "Failed to create subscription" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      subscription: subscription,
      amount: amount,
      message: "Subscription created. Proceed to payment.",
    })
  } catch (error) {
    console.error("Create subscription error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
