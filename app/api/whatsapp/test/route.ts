import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { AI_PROMPTS } from "@/lib/ai-prompts"
import { SERVICE_CATEGORIES } from "@/lib/models"

const TEST_SCENARIOS = [
  {
    name: "Basic Booking Request",
    message: "I need a plumber tomorrow at 10am in Westlands",
    expectedIntent: "booking_request",
    expectedExtraction: {
      service: "plumber",
      hasDate: true,
      hasTime: true,
      hasLocation: true,
    },
  },
  {
    name: "Vague Service Request",
    message: "My tap is leaking, can someone help?",
    expectedIntent: "clarification_needed",
    expectedService: "plumber",
  },
  {
    name: "Multi-Service Request",
    message: "I need a plumber for the kitchen and electrician for the lights",
    expectedIntent: "multi_service",
    expectedServices: ["plumber", "electrician"],
  },
  {
    name: "Reschedule Request",
    message: "Can we move my appointment to Friday at 2pm?",
    expectedIntent: "reschedule",
    expectedChange: true,
  },
  {
    name: "Cancellation Request",
    message: "I want to cancel my plumbing appointment tomorrow",
    expectedIntent: "cancellation",
    expectedConfirmation: true,
  },
  {
    name: "Status Inquiry",
    message: "What's my next appointment?",
    expectedIntent: "status_inquiry",
  },
  {
    name: "Natural Language Booking",
    message: "Hey, I'm having issues with my car engine, need someone to check it out this weekend",
    expectedIntent: "booking_request",
    expectedService: "mechanic",
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testName = searchParams.get("test")

  if (testName) {
    const scenario = TEST_SCENARIOS.find((s) => s.name.toLowerCase().includes(testName.toLowerCase()))
    if (scenario) {
      const result = await runSingleTest(scenario)
      return NextResponse.json({ scenario: scenario.name, result })
    }
  }

  // Run all tests
  const results = []
  for (const scenario of TEST_SCENARIOS) {
    const result = await runSingleTest(scenario)
    results.push({ scenario: scenario.name, result })
  }

  return NextResponse.json({
    summary: {
      total: results.length,
      passed: results.filter((r) => r.result.passed).length,
      failed: results.filter((r) => !r.result.passed).length,
    },
    results,
  })
}

async function runSingleTest(scenario: any) {
  try {
    // Test intent detection
    const { text: intentAnalysis } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an intent classifier for FundiLink. Analyze the message and determine the intent.

Available intents: booking_request, reschedule, cancellation, status_inquiry, confirmation, clarification_needed, multi_service, general

Respond with JSON: {"type": "intent_name", "confidence": 0.9}`,
      prompt: `User message: "${scenario.message}"`,
    })

    const intent = JSON.parse(intentAnalysis)

    // Test booking extraction if it's a booking request
    let extraction = null
    if (intent.type === "booking_request") {
      const { text: extractedInfo } = await generateText({
        model: openai("gpt-4o"),
        system:
          AI_PROMPTS.BOOKING_EXTRACTION +
          `

Available service categories: ${SERVICE_CATEGORIES.map((cat) => `${cat.id} (${cat.name})`).join(", ")}

Respond with JSON:
{
  "service": "category_id or null",
  "date": "YYYY-MM-DD or null", 
  "time": "HH:MM or null",
  "location": "extracted location or null",
  "missing": ["list of missing info"],
  "isComplete": true/false
}`,
        prompt: `User message: "${scenario.message}"`,
      })

      extraction = JSON.parse(extractedInfo)
    }

    // Validate results
    const validation = validateTestResult(scenario, intent, extraction)

    return {
      passed: validation.passed,
      intent: intent,
      extraction: extraction,
      validation: validation,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      passed: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}

function validateTestResult(scenario: any, intent: any, extraction: any) {
  const issues = []
  let passed = true

  // Validate intent
  if (scenario.expectedIntent && intent.type !== scenario.expectedIntent) {
    issues.push(`Expected intent '${scenario.expectedIntent}', got '${intent.type}'`)
    passed = false
  }

  // Validate extraction for booking requests
  if (extraction && scenario.expectedExtraction) {
    if (scenario.expectedExtraction.hasDate && !extraction.date) {
      issues.push("Expected date to be extracted")
      passed = false
    }
    if (scenario.expectedExtraction.hasTime && !extraction.time) {
      issues.push("Expected time to be extracted")
      passed = false
    }
    if (scenario.expectedExtraction.hasLocation && !extraction.location) {
      issues.push("Expected location to be extracted")
      passed = false
    }
    if (scenario.expectedExtraction.service && extraction.service !== scenario.expectedExtraction.service) {
      issues.push(`Expected service '${scenario.expectedExtraction.service}', got '${extraction.service}'`)
      passed = false
    }
  }

  return { passed, issues }
}

export async function POST(request: NextRequest) {
  const { message } = await request.json()

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  // Test the message against all AI prompts
  const results = {}

  // Intent Detection
  const { text: intentResult } = await generateText({
    model: openai("gpt-4o"),
    system: `You are an intent classifier for FundiLink. Determine the user's intent from their message.`,
    prompt: `User message: "${message}"`,
  })
  results.intent = intentResult

  // Booking Extraction
  const { text: extractionResult } = await generateText({
    model: openai("gpt-4o"),
    system: AI_PROMPTS.BOOKING_EXTRACTION,
    prompt: `User message: "${message}"`,
  })
  results.extraction = extractionResult

  // Clarification
  const { text: clarificationResult } = await generateText({
    model: openai("gpt-4o"),
    system: AI_PROMPTS.CLARIFICATION_REQUEST,
    prompt: `User message: "${message}"`,
  })
  results.clarification = clarificationResult

  return NextResponse.json({
    message,
    results,
    timestamp: new Date().toISOString(),
  })
}
