import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import { generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  // Always return JSON, even for errors
  try {
    console.log("Registration API called")

    let body
    try {
      body = await request.json()
      console.log("Request body:", body)
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

    const { name, phone, email, role, categories, location, password } = body

    // Basic validation
    if (!name || !phone || !role || !password) {
      return NextResponse.json(
        { success: false, message: "Name, phone, role, and password are required" },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Normalize phone number
    let normalizedPhone = phone.replace(/\s/g, "")
    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = "+254" + normalizedPhone.substring(1)
    } else if (normalizedPhone.startsWith("254")) {
      normalizedPhone = "+" + normalizedPhone
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

    // Check if user already exists in Supabase
    const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("id")
      .eq("phone", normalizedPhone)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Account already exists for this phone number" },
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user in Supabase
    const newUser = {
      name: name.trim(),
      phone: normalizedPhone,
      email: email?.trim() || null,
      role,
      categories: role === "fundi" ? categories || [] : null,
      location: location?.trim() || null,
      is_verified: false,
      subscription_status: role === "fundi" ? "free" : "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      password: hashedPassword,
    }
    console.log("New user object to insert:", newUser)

    const { data: insertedUser, error: insertError } = await supabase
      .from("users")
      .insert([newUser])
      .select()
      .single()
    console.log("Inserted user:", insertedUser, "Insert error:", insertError)

    if (insertError || !insertedUser) {
      console.error("Supabase insert error:", insertError)
      return NextResponse.json(
        { success: false, message: "Failed to create user account" },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: insertedUser.id,
      role: insertedUser.role,
      phone: insertedUser.phone,
    })

    // Return success response
    const responseUser = {
      id: insertedUser.id,
      name: insertedUser.name,
      phone: insertedUser.phone,
      email: insertedUser.email,
      role: insertedUser.role,
      categories: insertedUser.categories,
      location: insertedUser.location,
      is_verified: insertedUser.is_verified,
      subscription_status: insertedUser.subscription_status,
      subscription_end_date: insertedUser.subscription_end_date,
    }

    return NextResponse.json(
      {
        success: true,
        token,
        user: responseUser,
        message: "Account created successfully!",
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Registration error:", error)
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
      message: "Registration API is working",
      timestamp: new Date().toISOString(),
    },
    {
      headers: { "Content-Type": "application/json" },
    },
  )
}
