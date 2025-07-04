import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    {
      message: "API is working correctly",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    return NextResponse.json(
      {
        message: "POST request received successfully",
        receivedData: body,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error processing POST request",
        error: error.message,
      },
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
