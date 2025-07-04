"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Shield, Users, Database, BarChart3, Settings, CheckCircle, AlertTriangle, ArrowRight, Zap } from "lucide-react"

export default function AdminAccessPage() {
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isCreatingTestData, setIsCreatingTestData] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Check if we're in development
  const isDevelopment = process.env.NODE_ENV === "development"

  const createTestData = async () => {
    setIsCreatingTestData(true)
    try {
      // Create test users
      const testUsers = [
        {
          name: "John Mwangi",
          phone: "+254712345678",
          email: "john@example.com",
          role: "fundi",
          categories: ["plumbing", "electrical"],
          location: "Nairobi, Kenya",
          is_verified: true,
          subscription_status: "active",
          rating: 4.8,
        },
        {
          name: "Mary Wanjiku",
          phone: "+254723456789",
          email: "mary@example.com",
          role: "fundi",
          categories: ["cleaning", "gardening"],
          location: "Mombasa, Kenya",
          is_verified: false,
          subscription_status: "free",
          rating: 4.2,
        },
        {
          name: "Peter Kiprotich",
          phone: "+254734567890",
          email: "peter@example.com",
          role: "fundi",
          categories: ["carpentry", "painting"],
          location: "Kisumu, Kenya",
          is_verified: true,
          subscription_status: "expired",
          rating: 4.5,
        },
        {
          name: "Alice Njeri",
          phone: "+254745678901",
          email: "alice@example.com",
          role: "client",
          location: "Nakuru, Kenya",
        },
        {
          name: "David Ochieng",
          phone: "+254756789012",
          email: "david@example.com",
          role: "client",
          location: "Eldoret, Kenya",
        },
      ]

      // Register test users
      for (const user of testUsers) {
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...user,
            password: "testpass123",
          }),
        })
      }

      // Create test bookings
      const testBookings = [
        {
          name: "Alice Njeri",
          phone: "+254745678901",
          location: "Nakuru, Kenya",
          serviceCategory: "plumbing",
          date: "2024-01-15",
          time: "10:00",
          description: "Fix kitchen sink leak",
          fundiId: "john-mwangi-id",
          quotedPrice: 2500,
        },
        {
          name: "David Ochieng",
          phone: "+254756789012",
          location: "Eldoret, Kenya",
          serviceCategory: "electrical",
          date: "2024-01-16",
          time: "14:00",
          description: "Install ceiling fan",
          fundiId: "john-mwangi-id",
          quotedPrice: 3500,
        },
        {
          name: "Alice Njeri",
          phone: "+254745678901",
          location: "Nakuru, Kenya",
          serviceCategory: "cleaning",
          date: "2024-01-17",
          time: "09:00",
          description: "Deep house cleaning",
          fundiId: "mary-wanjiku-id",
          quotedPrice: 4000,
        },
      ]

      // Create bookings (this might fail if fundis don't exist, but that's okay for demo)
      for (const booking of testBookings) {
        try {
          await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(booking),
          })
        } catch (error) {
          console.log("Booking creation failed (expected):", error)
        }
      }

      toast({
        title: "Test Data Created",
        description: "Sample users and bookings have been added to the system",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test data",
        variant: "destructive",
      })
    } finally {
      setIsCreatingTestData(false)
    }
  }

  const loginAsAdmin = async () => {
    setIsLoggingIn(true)
    try {
      // First, try to register the admin user
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin User",
          phone: "+254700000000",
          email: "admin@fundilink.co.ke",
          password: "admin123",
          role: "admin",
        }),
      })

      // Then login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: "+254700000000",
          password: "admin123",
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Store token and user data
        localStorage.setItem("token", data.token)
        login(data.user)

        toast({
          title: "Admin Login Successful",
          description: "Redirecting to admin dashboard...",
        })

        // Redirect to admin dashboard
        setTimeout(() => {
          router.push("/admin")
        }, 1000)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Failed to login as admin",
        variant: "destructive",
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (!isDevelopment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <Card className="w-full max-w-md bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Access Restricted</CardTitle>
            <CardDescription>Admin access is only available in development mode</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold gradient-text">Admin Portal Access</h1>
              <p className="text-muted-foreground">Development Environment Only</p>
            </div>
            <Badge variant="destructive" className="animate-pulse">
              Development Mode
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Banner */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-500 mb-2">Development Only</h3>
              <p className="text-muted-foreground">
                This admin access page is only available in development mode and will not be accessible in production.
                All test data is stored locally and will not affect production systems.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Admin Login Card */}
          <Card className="card-hover bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Admin Access</CardTitle>
                  <CardDescription>Login as administrator to access the admin dashboard</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-secondary/50 p-4 rounded-lg border border-border/50">
                <h4 className="font-semibold text-foreground mb-3">Admin Credentials</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="text-foreground">Admin User</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-foreground">admin@fundilink.co.ke</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="text-foreground">+254700000000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Role:</span>
                    <span className="text-primary font-medium">Administrator</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={loginAsAdmin}
                disabled={isLoggingIn}
                className="w-full bg-primary hover:bg-primary/90 group"
                size="lg"
              >
                {isLoggingIn ? (
                  <>
                    <Zap className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login as Admin
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Test Data Card */}
          <Card className="card-hover bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Database className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-xl">Test Data</CardTitle>
                  <CardDescription>Create sample data for testing admin features</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-secondary/50 p-4 rounded-lg border border-border/50">
                <h4 className="font-semibold text-foreground mb-3">Sample Data Includes</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />3 Sample Fundis (various verification
                    statuses)
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />2 Sample Clients
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />3 Sample Bookings
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Different subscription tiers
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Ratings and locations
                  </div>
                </div>
              </div>
              <Button
                onClick={createTestData}
                disabled={isCreatingTestData}
                variant="outline"
                className="w-full border-green-500/30 hover:bg-green-500/10 group bg-transparent"
                size="lg"
              >
                {isCreatingTestData ? (
                  <>
                    <Database className="mr-2 h-5 w-5 animate-pulse" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Test Data
                    <Database className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Features Overview */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Dashboard Features</CardTitle>
            <CardDescription>What you'll have access to once logged in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Users,
                  title: "User Management",
                  description: "View, verify, and manage all users",
                  color: "text-blue-400",
                },
                {
                  icon: CheckCircle,
                  title: "Booking Oversight",
                  description: "Monitor all platform bookings",
                  color: "text-green-400",
                },
                {
                  icon: BarChart3,
                  title: "Analytics",
                  description: "Platform statistics and metrics",
                  color: "text-primary",
                },
                {
                  icon: Settings,
                  title: "System Settings",
                  description: "Manage categories and configuration",
                  color: "text-purple-400",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 rounded-lg bg-secondary/30 border border-border/30"
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-r from-${feature.color}/20 to-${feature.color}/10`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Quick Start Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                "Click 'Create Test Data' to populate the system with sample users and bookings (optional)",
                "Click 'Login as Admin' to authenticate as administrator",
                "You'll be automatically redirected to the admin dashboard",
                "Start managing users, bookings, and platform settings",
              ].map((instruction, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-semibold border border-primary/30">
                    {index + 1}
                  </div>
                  <span className="text-muted-foreground">{instruction}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
