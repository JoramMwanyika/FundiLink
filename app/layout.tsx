import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { Chatbot } from "@/components/chatbot"
import { validateEnv } from "@/lib/env"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FundiLink - Connect with Verified Technicians",
  description:
    "AI-powered platform connecting clients with skilled fundis - plumbers, electricians, mechanics and more",
    generator: 'v0.dev'
}

// Validate environment variables on app startup
if (typeof window === "undefined") {
  try {
    validateEnv()
  } catch (error) {
    console.error("Environment validation failed:", error)
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
          <Chatbot />
        </AuthProvider>
      </body>
    </html>
  )
}
