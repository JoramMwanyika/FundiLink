"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Phone, Lock, ArrowLeft, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")

  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateInput = () => {
    if (!formData.emailOrPhone.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your email or phone number",
        variant: "destructive",
      })
      return false
    }

    if (!formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter your password",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleLogin = async () => {
    if (!validateInput()) return
    setLoading(true)
    try {
      let phone = formData.emailOrPhone
      let email = ""
      if (phone.includes("@")) {
        email = phone
        phone = ""
      } else {
        let normalizedPhone = phone.replace(/\s/g, "")
        if (normalizedPhone.startsWith("0")) {
          normalizedPhone = "+254" + normalizedPhone.substring(1)
        } else if (normalizedPhone.startsWith("254")) {
          normalizedPhone = "+" + normalizedPhone
        }
        phone = normalizedPhone
      }
      // Call backend API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email, password: formData.password }),
      })
      const data = await response.json()
      if (data.success) {
        login(data.token, data.user)
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${data.user.name}!`,
        })
        // Role-based redirection
        switch (data.user.role) {
          case "client":
            router.push("/client/dashboard")
            break
          case "fundi":
            router.push("/fundi/dashboard")
            break
          case "admin":
            router.push("/admin")
            break
          default:
            router.push("/")
        }
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      toast({
        title: "Missing Email",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Reset Link Sent",
      description: "Check your email for password reset instructions",
    })
    setShowForgotPassword(false)
    setResetEmail("")
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
        <div className="absolute inset-0 glow-effect"></div>
        <Card className="w-full max-w-md bg-card/50 border-border/50 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl gradient-text">Reset Password</CardTitle>
            <CardDescription>Enter your email to receive reset instructions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email Address</Label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>
            <div className="space-y-4">
              <Button onClick={handleForgotPassword} className="w-full bg-primary hover:bg-primary/90">
                Send Reset Link
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                className="w-full bg-transparent border-border/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex">
      <div className="absolute inset-0 glow-effect"></div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-500/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold gradient-text">FundiLink</h1>
              <p className="text-xl text-muted-foreground">Connect with Verified Technicians</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4 bg-card/30 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔧</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">For Clients</h3>
                  <p className="text-sm text-muted-foreground">Book skilled fundis instantly</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-card/30 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💼</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">For Fundis</h3>
                  <p className="text-sm text-muted-foreground">Grow your business with more clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <Card className="w-full max-w-md bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="lg:hidden mb-4">
              <h1 className="text-3xl font-bold gradient-text">FundiLink</h1>
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrPhone">Email or Phone Number</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-muted-foreground">
                    {formData.emailOrPhone.includes("@") ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                  </div>
                  <Input
                    id="emailOrPhone"
                    placeholder="Enter email or phone number"
                    value={formData.emailOrPhone}
                    onChange={(e) => handleInputChange("emailOrPhone", e.target.value)}
                    className="pl-10 bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10 bg-background/50 border-border/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                />
                <Label htmlFor="rememberMe" className="text-sm">
                  Remember me
                </Label>
              </div>
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button onClick={handleLogin} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
                Sign up here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
