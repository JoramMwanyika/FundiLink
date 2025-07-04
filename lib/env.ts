// Environment variable validation and type safety
export const env = {
  // Public variables (accessible on client)
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Server-only variables (only accessible on server)
  ...(typeof window === "undefined" && {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    JWT_SECRET: process.env.JWT_SECRET!,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY!,
    MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY!,
    MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET!,
    MPESA_BUSINESS_SHORTCODE: process.env.MPESA_BUSINESS_SHORTCODE!,
    MPESA_PASSKEY: process.env.MPESA_PASSKEY!,
    MPESA_CALLBACK_URL: process.env.MPESA_CALLBACK_URL!,
    MPESA_ENVIRONMENT: process.env.MPESA_ENVIRONMENT || "sandbox",
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
  }),
}

// Validation function to check required environment variables
export function validateEnv() {
  const requiredPublicVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

  const requiredServerVars = ["SUPABASE_SERVICE_ROLE_KEY", "JWT_SECRET", "OPENROUTER_API_KEY"]

  // Check public variables
  for (const varName of requiredPublicVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`)
    }
  }

  // Check server variables (only on server)
  if (typeof window === "undefined") {
    for (const varName of requiredServerVars) {
      if (!process.env[varName]) {
        console.warn(`Missing server environment variable: ${varName}`)
      }
    }
  }
}
