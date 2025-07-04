"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { SERVICE_CATEGORIES } from "@/lib/models"
import { Eye, EyeOff, Mail, Phone, Lock, ArrowLeft, ArrowRight, User, CheckCircle, Loader2 } from "lucide-react"

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    categories: [] as string[],
    location: "",
    agreeToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get("role")

  // Set role from URL parameter
  useState(() => {
    if (roleParam && (roleParam === "client" || roleParam === "fundi")) {
      setFormData((prev) => ({ ...prev, role: roleParam }))
    }
  })

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }))
  }

  const validateStep1 = () => {
    if (!formData.role) {
      toast({
        title: "Select Role",
        description: "Please choose whether you're a client or fundi",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your full name",
        variant: "destructive",
      })
      return false
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your phone number",
        variant: "destructive",
      })
      return false
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return false
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const validateStep3 = () => {
    if (formData.role === "fundi" && formData.categories.length === 0) {
      toast({
        title: "Select Services",
        description: "Please select at least one service category",
        variant: "destructive",
      })
      return false
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleRegister = async () => {
    if (!validateStep3()) return

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create user account
      const userId = `user_${Date.now()}`
      const token = btoa(JSON.stringify({ userId, exp: Date.now() + 24 * 60 * 60 * 1000 }))

      const userData = {
        id: userId,
        name: formData.name,
        phone: formData.phone.startsWith("+") ? formData.phone : `+254${formData.phone.replace(/^0/, "")}`,
        email: formData.email,
        role: formData.role as "client" | "fundi",
        categories: formData.role === "fundi" ? formData.categories : undefined,
        location: formData.location || "Nairobi, Kenya",
        is_verified: false,
      }

      // Save to localStorage (simulate database)
      const existingUsers = JSON.parse(localStorage.getItem("fundilink_users") || "[]")
      existingUsers.push(userData)
      localStorage.setItem("fundilink_users", JSON.stringify(existingUsers))

      login(token, userData)

      toast({
        title: "Account Created!",
        description: `Welcome to FundiLink, ${formData.name}!`,
      })

      setStep(4) // Success step
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    // Redirect based on role
    if (formData.role === "client") {
      router.push("/client/dashboard")
    } else if (formData.role === "fundi") {
      router.push("/fundi/dashboard")
    } else {
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex">
      <div className="absolute inset-0 glow-effect"></div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-500/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold gradient-text">Join FundiLink</h1>
              <p className="text-xl text-muted-foreground">Start your journey with Kenya's leading service platform</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4 bg-card/30 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Join as Client</h3>
                  <p className="text-sm text-muted-foreground">Book trusted fundis for your needs</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-card/30 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔧</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Join as Fundi</h3>
                  <p className="text-sm text-muted-foreground">Grow your business and earn more</p>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {step} of 4</span>
                <span>{Math.round((step / 4) * 100)}%</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(step / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <Card className="w-full max-w-md bg-card/50 border-border/50 backdrop-blur-sm">
          {step === 1 && (
            <>
              <CardHeader className="text-center">
                <div className="lg:hidden mb-4">
                  <h1 className="text-3xl font-bold gradient-text">FundiLink</h1>
                </div>
                <CardTitle className="text-2xl">Choose Your Role</CardTitle>
                <CardDescription>Are you looking for services or providing them?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === "client"
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-border bg-card/30"
                    }`}
                    onClick={() => handleInputChange("role", "client")}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">I'm a Client</h3>
                        <p className="text-sm text-muted-foreground">I need services from skilled fundis</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            Book Services
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Track Jobs
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Rate Fundis
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === "fundi"
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-border bg-card/30"
                    }`}
                    onClick={() => handleInputChange("role", "fundi")}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🔧</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">I'm a Fundi</h3>
                        <p className="text-sm text-muted-foreground">I provide professional services</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            Get Jobs
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Earn Money
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Build Reputation
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Link href="/login">
                    <Button variant="outline" className="bg-transparent border-border/50">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                  <Button onClick={handleNext} disabled={!formData.role} className="bg-primary hover:bg-primary/90">
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Personal Information</CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="pl-10 bg-background/50 border-border/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+254 XXX XXX XXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="pl-10 bg-background/50 border-border/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10 bg-background/50 border-border/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="pl-10 pr-10 bg-background/50 border-border/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)} className="bg-transparent border-border/50">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {formData.role === "fundi" ? "Service Categories" : "Almost Done!"}
                </CardTitle>
                <CardDescription>
                  {formData.role === "fundi"
                    ? "Select the services you provide"
                    : "Review and complete your registration"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.role === "fundi" && (
                  <div className="space-y-4">
                    <Label>Select Your Services</Label>
                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {SERVICE_CATEGORIES.map((category) => (
                        <div
                          key={category.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            formData.categories.includes(category.id)
                              ? "border-primary bg-primary/10"
                              : "border-border/50 hover:border-border bg-card/30"
                          }`}
                          onClick={() => toggleCategory(category.id)}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-1">{category.icon}</div>
                            <div className="text-sm font-medium">{category.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Nairobi, Kenya"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:text-primary/80">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:text-primary/80">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)} className="bg-transparent border-border/50">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleRegister} disabled={loading} className="bg-primary hover:bg-primary/90">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <CheckCircle className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-2xl text-green-600">Welcome to FundiLink!</CardTitle>
                <CardDescription>Your account has been created successfully</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium">What's Next?</h4>
                  {formData.role === "client" ? (
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Browse and book services from verified fundis</li>
                      <li>• Track your bookings and service history</li>
                      <li>• Rate and review fundis after service completion</li>
                    </ul>
                  ) : (
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Complete your profile and upload certifications</li>
                      <li>• Set your availability and service areas</li>
                      <li>• Start receiving job requests from clients</li>
                    </ul>
                  )}
                </div>

                <Button onClick={handleComplete} className="w-full bg-primary hover:bg-primary/90">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                    Sign in here
                  </Link>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
