import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-for-development"

export interface JWTPayload {
  userId: string
  role: string
  phone: string
}

export function generateToken(payload: JWTPayload): string {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
  } catch (error) {
    console.error("JWT generation error:", error)
    throw new Error("Failed to generate authentication token")
  }
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error("JWT verification error:", error)
    return null
  }
}
