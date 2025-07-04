import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import { generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("Login API called")

    let body
    try {
      body = await request.json()
      console.log("Login request body:", body)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return NextResponse.json(
        { success: false, message: "Invalid request format" },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const { phone, email, password } = body

    if ((!phone && !email) || !password) {
      return NextResponse.json(
        { success: false, message: "Phone/email and password are required" },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Normalize phone number if provided
    let normalizedPhone = phone
    if (phone) {
      normalizedPhone = phone.replace(/\s/g, "")
      if (normalizedPhone.startsWith("0")) {
        normalizedPhone = "+254" + normalizedPhone.substring(1)
      } else if (normalizedPhone.startsWith("254")) {
        normalizedPhone = "+" + normalizedPhone
      }
    }
    console.log("Normalized phone:", normalizedPhone)

    // Initialize Supabase client
    let supabase
    try {
      supabase = createServerClient()
    } catch (supabaseError) {
      console.error("Supabase initialization error:", supabaseError)
      return NextResponse.json({ success: false, message: "Database connection failed" }, { status: 500 })
    }

    // Query Supabase for user by phone or email
    let userQuery = supabase.from("users").select("*")
    if (normalizedPhone) {
      userQuery = userQuery.eq("phone", normalizedPhone)
    } else if (email) {
      userQuery = userQuery.eq("email", email)
    }
    const { data: user, error } = await userQuery.single()
    console.log("Queried user:", user, "Query error:", error)

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: "No account found with these credentials" },
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Incorrect password" },
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      role: user.role,
      phone: user.phone,
    })

    // Return user data without sensitive information
    const userData = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      categories: user.categories,
      location: user.location,
      is_verified: user.is_verified,
      subscription_status: user.subscription_status,
      subscription_end_date: user.subscription_end_date,
    }

    return NextResponse.json(
      {
        success: true,
        token,
        user: userData,
        message: "Login successful",
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// Add GET method for debugging
export async function GET() {
  return NextResponse.json(
    {
      message: "Login API is working",
      timestamp: new Date().toISOString(),
    },
    {
      headers: { "Content-Type": "application/json" },
    },
  )
}
