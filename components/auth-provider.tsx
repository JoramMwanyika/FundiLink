"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/models"

interface AuthContextType {
  user: User | null
  login: (token: string, user: User) => void
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>
  logout: () => void
  updateUser: (userData: User) => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("fundilink_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem("fundilink_user")
      }
    }
    setLoading(false)
  }, [])

  const login = (token: string, user: User): void => {
    setUser(user)
    localStorage.setItem("fundilink_user", JSON.stringify(user))
    localStorage.setItem("fundilink_token", token)

    // Redirect based on role
    if (user.role === "admin") {
      router.push("/admin")
    } else if (user.role === "fundi") {
      router.push("/fundi/dashboard")
    } else {
      router.push("/client/dashboard")
    }
  }

  const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        localStorage.setItem("fundilink_user", JSON.stringify(data.user))

        // Redirect based on role
        if (data.user.role === "fundi") {
          router.push("/fundi/dashboard")
        } else {
          router.push("/client/dashboard")
        }

        return true
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Failed to create account",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const updateUser = async (userData: User): Promise<void> => {
    try {
      const response = await fetch(`/api/users/${userData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        localStorage.setItem("fundilink_user", JSON.stringify(data.user))
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile",
        variant: "destructive",
      })
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("fundilink_user")
    localStorage.removeItem("fundilink_token")
    document.cookie = "fundilink_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/")
    window.location.reload()
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
