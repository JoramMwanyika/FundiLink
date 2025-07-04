import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createServerClient } from "@/lib/supabase"
import { SERVICE_CATEGORIES } from "@/lib/models"

// Store conversation context (in production, use Redis or database)
const conversationContext = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract WhatsApp message data
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    if (!message) {
      return NextResponse.json({ success: true })
    }

    const phoneNumber = message.from
    const messageText = message.text?.body
    const messageId = message.id

    if (!messageText) {
      return NextResponse.json({ success: true })
    }

    // Get or create conversation context
    const context = conversationContext.get(phoneNumber) || {
      stage: "initial",
      bookingData: {},
      lastMessage: null,
      pendingBookings: [],
    }

    // Determine the intent and stage of conversation
    const intent = await determineIntent(messageText, context)

    let response = ""

    switch (intent.type) {
      case "booking_request":
        response = await handleBookingRequest(messageText, phoneNumber, context)
        break
      case "reschedule":
        response = await handleReschedule(messageText, phoneNumber, context)
        break
      case "cancellation":
        response = await handleCancellation(messageText, phoneNumber, context)
        break
      case "status_inquiry":
        response = await handleStatusInquiry(messageText, phoneNumber, context)
        break
      case "confirmation":
        response = await handleConfirmation(messageText, phoneNumber, context)
        break
      case "clarification_needed":
        response = await handleClarification(messageText, phoneNumber, context)
        break
      case "multi_service":
        response = await handleMultiService(messageText, phoneNumber, context)
        break
      case "general":
        response = await handleGeneral(messageText, phoneNumber, context)
        break
      default:
        response = await handleGeneral(messageText, phoneNumber, context)
    }

    // Update conversation context
    context.lastMessage = messageText
    conversationContext.set(phoneNumber, context)

    await sendWhatsAppMessage(phoneNumber, response)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("WhatsApp webhook error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

async function determineIntent(messageText: string, context: any) {
  const { text: intentAnalysis } = await generateText({
    model: openai("gpt-4o"),
    system: `You are an intent classifier for FundiLink, a platform connecting clients with technicians.

Analyze the user's message and determine their intent. Consider the conversation context.

Available intents:
- booking_request: User wants to book a new service
- reschedule: User wants to change existing booking time/date
- cancellation: User wants to cancel a booking
- status_inquiry: User asking about their appointment status
- confirmation: User confirming a suggested booking or fundi
- clarification_needed: User's request is unclear and needs more info
- multi_service: User requesting multiple services
- general: General questions about services

Context: ${JSON.stringify(context)}

Respond with JSON: {"type": "intent_name", "confidence": 0.9, "reasoning": "why"}`,
    prompt: `User message: "${messageText}"`,
  })

  try {
    return JSON.parse(intentAnalysis)
  } catch {
    return { type: "general", confidence: 0.5, reasoning: "Failed to parse intent" }
  }
}

// Add lead tracking when fundis are suggested to clients
async function handleBookingRequest(messageText: string, phoneNumber: string, context: any) {
  const { text: extractedInfo } = await generateText({
    model: openai("gpt-4o"),
    system: `You are a smart assistant that helps people book technicians (known as fundis) for services like plumbing, electrical repairs, internet setup, and more.

When someone sends a message requesting help (e.g., "I need a plumber tomorrow at 10 in Donholm"), your job is to extract and clearly understand these four things:

1. What service they need (plumber, electrician, mechanic, internet installer, etc.)
2. The date they want the service
3. The time of day they prefer  
4. The location where the service is needed

Available service categories: ${SERVICE_CATEGORIES.map((cat) => `${cat.id} (${cat.name})`).join(", ")}

Make sure you convert natural expressions like "tomorrow" or "next Friday" into actual calendar dates (YYYY-MM-DD format), and "in the morning" into a time like "09:00".

If any information is missing or unclear, note it in the response.

Respond with JSON:
{
  "service": "category_id or null",
  "date": "YYYY-MM-DD or null", 
  "time": "HH:MM or null",
  "location": "extracted location or null",
  "missing": ["list of missing info"],
  "isComplete": true/false
}`,
    prompt: `User message: "${messageText}"`,
  })

  try {
    const bookingInfo = JSON.parse(extractedInfo)

    if (!bookingInfo.isComplete) {
      return await handleClarification(messageText, phoneNumber, { ...context, bookingData: bookingInfo })
    }

    // Search for available fundis with subscription priority
    const supabase = createServerClient()
    const { data: availableFundis, error } = await supabase
      .from("users")
      .select(`
        id, name, location, rating, categories, subscription_status,
        fundi_subscriptions!inner(status, end_date, plan_id,
          subscription_plans!inner(priority_listing)
        )
      `)
      .eq("role", "fundi")
      .eq("is_verified", true)
      .contains("categories", [bookingInfo.service])
      .or("subscription_status.eq.active,subscription_status.eq.free")
      .limit(5)

    if (error || !availableFundis || availableFundis.length === 0) {
      return await suggestAlternative(bookingInfo, phoneNumber)
    }

    // Sort by subscription priority (premium first, then by rating)
    const sortedFundis = availableFundis
      .sort((a, b) => {
        // Priority: Active subscription with priority listing > Active subscription > Free
        const aPriority =
          a.subscription_status === "active" && a.fundi_subscriptions?.[0]?.subscription_plans?.priority_listing
            ? 3
            : a.subscription_status === "active"
              ? 2
              : 1

        const bPriority =
          b.subscription_status === "active" && b.fundi_subscriptions?.[0]?.subscription_plans?.priority_listing
            ? 3
            : b.subscription_status === "active"
              ? 2
              : 1

        if (aPriority !== bPriority) return bPriority - aPriority
        return (b.rating || 0) - (a.rating || 0)
      })
      .slice(0, 3)

    // Create leads for each suggested fundi
    for (const fundi of sortedFundis) {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundiId: fundi.id,
          clientPhone: phoneNumber,
          clientName: "WhatsApp User",
          serviceCategory: bookingInfo.service,
          location: bookingInfo.location,
          leadSource: "whatsapp",
        }),
      })
    }

    // Store booking data in context
    context.stage = "fundi_selection"
    context.bookingData = bookingInfo
    context.availableFundis = sortedFundis

    const serviceCategory = SERVICE_CATEGORIES.find((cat) => cat.id === bookingInfo.service)

    return `Great! I found ${sortedFundis.length} available ${serviceCategory?.name}s for ${bookingInfo.date} at ${bookingInfo.time} in ${bookingInfo.location}.

Here are your top options:
${sortedFundis
  .map((fundi, index) => {
    const verifiedBadge = fundi.subscription_status === "active" ? " ✅" : ""
    const priorityBadge =
      fundi.subscription_status === "active" && fundi.fundi_subscriptions?.[0]?.subscription_plans?.priority_listing
        ? " 🌟"
        : ""
    return `${index + 1}. ${fundi.name}${verifiedBadge}${priorityBadge} - ${fundi.location} (⭐ ${fundi.rating || 4.5})`
  })
  .join("\n")}

Reply with the number of your preferred fundi to confirm the booking, or type "more options" to see alternatives.`
  } catch (error) {
    console.error("Error parsing booking info:", error)
    return "I'd be happy to help you book a service! Could you please tell me what type of technician you need and when you'd like them to come?"
  }
}

async function handleReschedule(messageText: string, phoneNumber: string, context: any) {
  const { text: rescheduleInfo } = await generateText({
    model: openai("gpt-4o"),
    system: `You are assisting someone who already has an appointment with a technician but wants to change the time or date.

Carefully read their message and figure out the new date and time they want to move the booking to.

Make sure you understand clearly if they mentioned a new day or time. If they didn't provide enough details, gently ask them to clarify what time or day works best.

Respond with JSON:
{
  "newDate": "YYYY-MM-DD or null",
  "newTime": "HH:MM or null", 
  "hasEnoughInfo": true/false,
  "clarificationNeeded": "what to ask if info is missing"
}`,
    prompt: `User message: "${messageText}"`,
  })

  try {
    const reschedule = JSON.parse(rescheduleInfo)

    if (!reschedule.hasEnoughInfo) {
      return reschedule.clarificationNeeded || "What new date and time would work better for you?"
    }

    // In a real implementation, you'd update the booking in the database
    return `I'll help you reschedule your appointment to ${reschedule.newDate} at ${reschedule.newTime}. Let me check availability and get back to you shortly.`
  } catch {
    return "I understand you'd like to reschedule. What new date and time would work better for you?"
  }
}

async function handleCancellation(messageText: string, phoneNumber: string, context: any) {
  const { text: cancellationInfo } = await generateText({
    model: openai("gpt-4o"),
    system: `You're helping a client who wants to cancel their appointment.

Identify if they are talking about canceling, and make sure you know:
- What service the appointment was for
- The day and time it was scheduled  
- The location

Confirm with the client before you proceed. For example, say: "Are you sure you want to cancel your plumbing appointment on Saturday in Donholm?"

Respond with JSON:
{
  "wantsToCancel": true/false,
  "serviceType": "extracted service or null",
  "appointmentDate": "extracted date or null",
  "needsConfirmation": true/false,
  "confirmationMessage": "message to confirm cancellation"
}`,
    prompt: `User message: "${messageText}"`,
  })

  try {
    const cancellation = JSON.parse(cancellationInfo)

    if (cancellation.needsConfirmation) {
      context.stage = "cancellation_confirmation"
      return cancellation.confirmationMessage
    }

    return "Your appointment has been cancelled. You'll receive a confirmation message shortly."
  } catch {
    return "I can help you cancel your appointment. Could you please confirm which booking you'd like to cancel?"
  }
}

async function handleStatusInquiry(messageText: string, phoneNumber: string, context: any) {
  const { text: statusResponse } = await generateText({
    model: openai("gpt-4o"),
    system: `A client wants to know their upcoming appointment.

Find the booking that's next on their schedule and provide the following details:
- The fundi's name
- The service category  
- The day and time
- The location

Respond in a friendly tone, such as: "You have a confirmed appointment with Peter the Electrician on Saturday at 3PM in South B."

If no booking information is available in context, politely ask them to provide their phone number or booking reference.`,
    prompt: `User message: "${messageText}"\nContext: ${JSON.stringify(context)}`,
  })

  // In a real implementation, you'd query the database for user's bookings
  return statusResponse || "Let me check your upcoming appointments. Could you please confirm your phone number?"
}

async function handleConfirmation(messageText: string, phoneNumber: string, context: any) {
  if (context.stage === "fundi_selection" && context.availableFundis) {
    const selectedIndex = Number.parseInt(messageText) - 1

    if (selectedIndex >= 0 && selectedIndex < context.availableFundis.length) {
      const selectedFundi = context.availableFundis[selectedIndex]

      // Create booking in database
      const supabase = createServerClient()
      const { data: bookingData, error } = await supabase
        .from("bookings")
        .insert([
          {
            client_id: phoneNumber,
            fundi_id: selectedFundi.id,
            client_name: "WhatsApp User", // You'd get this from user profile
            fundi_name: selectedFundi.name,
            service_category: context.bookingData.service,
            location: context.bookingData.location,
            date: context.bookingData.date,
            time: context.bookingData.time,
            status: "confirmed",
          },
        ])
        .select()
        .single()

      if (error) {
        return "Sorry, there was an error confirming your booking. Please try again."
      }

      // Clear context
      context.stage = "initial"
      context.bookingData = {}
      context.availableFundis = []

      return `✅ Booking Confirmed!

📋 Details:
👤 Fundi: ${selectedFundi.name}
🔧 Service: ${SERVICE_CATEGORIES.find((cat) => cat.id === context.bookingData.service)?.name}
📅 Date: ${context.bookingData.date}
⏰ Time: ${context.bookingData.time}
📍 Location: ${context.bookingData.location}

Your fundi will contact you shortly. Have a great day! 🎉`
    }
  }

  return "I didn't understand your selection. Could you please choose a number from the options provided?"
}

async function handleClarification(messageText: string, phoneNumber: string, context: any) {
  const missing = context.bookingData?.missing || []

  const { text: clarificationResponse } = await generateText({
    model: openai("gpt-4o"),
    system: `You received a message from a client asking for help, but it's unclear what kind of service they need.

From the list of available services (plumber, electrician, mechanic, internet services, carpenter, cleaner, or general technician), help them identify the right one.

Politely ask them to clarify by suggesting possible matches based on what they said, or asking them to pick from the list.

Missing information: ${missing.join(", ")}
Available services: ${SERVICE_CATEGORIES.map((cat) => `${cat.name} (${cat.description})`).join(", ")}`,
    prompt: `User message: "${messageText}"`,
  })

  return clarificationResponse
}

async function handleMultiService(messageText: string, phoneNumber: string, context: any) {
  const { text: multiServiceResponse } = await generateText({
    model: openai("gpt-4o"),
    system: `A client might be requesting two or more services in one message. For example: "I need a plumber for the kitchen and also an electrician for the lights."

Your task is to identify each service they need and break it down.

Try to determine the preferred time and location for each service if it's mentioned. If it's not mentioned, you can follow up with the user to ask for more details for each task.

Available services: ${SERVICE_CATEGORIES.map((cat) => cat.name).join(", ")}`,
    prompt: `User message: "${messageText}"`,
  })

  return multiServiceResponse
}

async function handleGeneral(messageText: string, phoneNumber: string, context: any) {
  const { text: generalResponse } = await generateText({
    model: openai("gpt-4o"),
    system: `You are a helpful assistant for FundiLink, a platform that connects clients with skilled technicians (fundis).

Available services: ${SERVICE_CATEGORIES.map((cat) => `${cat.name} - ${cat.description}`).join(", ")}

Provide helpful information about our services, how to book, or answer general questions. Always be friendly and guide users toward booking if appropriate.

If they seem interested in booking, encourage them to tell you what service they need, when, and where.`,
    prompt: `User message: "${messageText}"`,
  })

  return generalResponse
}

async function suggestAlternative(bookingInfo: any, phoneNumber: string) {
  const { text: alternativeResponse } = await generateText({
    model: openai("gpt-4o"),
    system: `Unfortunately, no technicians are available at the exact time and date the client requested.

Look for the closest alternative time or day when someone is available for that service and suggest it politely to the client.

Ask them if they would like to reschedule to the suggested time. Be kind and respectful — your goal is to help the client still get what they need with minimal delay.`,
    prompt: `Requested: ${JSON.stringify(bookingInfo)}`,
  })

  return (
    alternativeResponse ||
    `Sorry, no ${SERVICE_CATEGORIES.find((cat) => cat.id === bookingInfo.service)?.name}s are available for ${bookingInfo.date} at ${bookingInfo.time}. 

Would you like me to suggest alternative times, or you can visit our website at fundilink.co.ke to see all available slots?`
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge)
  }

  return new NextResponse("Forbidden", { status: 403 })
}

async function sendWhatsAppMessage(to: string, message: string) {
  // This would integrate with Twilio or Meta WhatsApp API
  console.log(`Sending WhatsApp message to ${to}: ${message}`)

  // Example Twilio integration:
  /*
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const client = require('twilio')(accountSid, authToken)
  
  await client.messages.create({
    from: 'whatsapp:+14155238886',
    to: `whatsapp:${to}`,
    body: message
  })
  */
}
