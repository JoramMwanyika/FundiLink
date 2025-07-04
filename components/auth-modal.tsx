"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { SERVICE_CATEGORIES } from "@/lib/models"
import { Phone, User, Mail, MapPin, AlertCircle, CheckCircle } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: "login" | "register"
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { toast } = useToast()
  const { login } = useAuth()

  // Login form state
  const [loginData, setLoginData] = useState({
    phone: "",
    email: "",
    password: "",
  })

  // Registration form state
  const [registerData, setRegisterData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
    location: "",
    categories: [] as string[],
    password: "",
  })

  const clearForms = () => {
    setLoginData({ phone: "", email: "", password: "" })
    setRegisterData({
      name: "",
      phone: "",
      email: "",
      role: "",
      location: "",
      categories: [],
      password: "",
    })
    setError("")
    setSuccess("")
  }

  const handleClose = () => {
    clearForms()
    onClose()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (!loginData.phone && !loginData.email) {
        setError("Please enter your phone number or email")
        return
      }
      if (!loginData.password) {
        setError("Please enter your password")
        return
      }
      // Normalize phone number if present
      let normalizedPhone = loginData.phone
      if (loginData.phone) {
        normalizedPhone = loginData.phone.replace(/\s/g, "")
        if (normalizedPhone.startsWith("0")) {
          normalizedPhone = "+254" + normalizedPhone.substring(1)
        } else if (normalizedPhone.startsWith("254")) {
          normalizedPhone = "+" + normalizedPhone
        }
      }
      // Call backend API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizedPhone,
          email: loginData.email,
          password: loginData.password,
        }),
      })
      const data = await response.json()
      if (data.success) {
        login(data.token, data.user)
        setSuccess("Login successful!")
        toast({
          title: "Welcome back!",
          description: `Logged in as ${data.user.name}`,
        })
        setTimeout(() => {
          handleClose()
        }, 1000)
      } else {
        setError(data.message || "Login failed. Please try again.")
      }
    } catch (error) {
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (!registerData.name || !registerData.phone || !registerData.role || !registerData.password) {
        setError("Please fill in all required fields")
        return
      }
      if (registerData.role === "fundi" && registerData.categories.length === 0) {
        setError("Please select at least one service category")
        return
      }
      // Normalize phone number
      let normalizedPhone = registerData.phone.replace(/\s/g, "")
      if (normalizedPhone.startsWith("0")) {
        normalizedPhone = "+254" + normalizedPhone.substring(1)
      } else if (normalizedPhone.startsWith("254")) {
        normalizedPhone = "+" + normalizedPhone
      }
      // Call backend API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerData.name,
          phone: normalizedPhone,
          email: registerData.email,
          role: registerData.role,
          categories: registerData.categories,
          location: registerData.location,
          password: registerData.password,
        }),
      })
      const data = await response.json()
      if (data.success) {
        login(data.token, data.user)
        setSuccess("Account created successfully!")
        toast({
          title: "Welcome to FundiLink!",
          description: `Account created for ${data.user.name}`,
        })
        setTimeout(() => {
          handleClose()
        }, 1000)
      } else {
        setError(data.message || "Registration failed. Please try again.")
      }
    } catch (error) {
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setRegisterData((prev) => ({
      ...prev,
      categories: checked ? [...prev.categories, categoryId] : prev.categories.filter((id) => id !== categoryId),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Welcome to FundiLink</DialogTitle>
          <DialogDescription>Sign in to your account or create a new one to get started</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* Status Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-phone"
                    type="tel"
                    placeholder="+254 XXX XXX XXX"
                    value={loginData.phone}
                    onChange={(e) => setLoginData({ phone: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Create one here
              </button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-name"
                      placeholder="Your name"
                      value={registerData.name}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, name: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="+254 XXX XXX XXX"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email (Optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData((prev) => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-role">I want to *</Label>
                <Select
                  value={registerData.role}
                  onValueChange={(value) => setRegisterData((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Book services (Client)</SelectItem>
                    <SelectItem value="fundi">Offer services (Fundi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-location"
                    placeholder="e.g., Westlands, Nairobi"
                    value={registerData.location}
                    onChange={(e) => setRegisterData((prev) => ({ ...prev, location: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {registerData.role === "fundi" && (
                <div className="space-y-3">
                  <Label>Service Categories *</Label>
                  <p className="text-sm text-gray-600">Select the services you can provide</p>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {SERVICE_CATEGORIES.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`register-${category.id}`}
                          checked={registerData.categories.includes(category.id)}
                          onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                        />
                        <Label htmlFor={`register-${category.id}`} className="text-sm font-normal">
                          {category.icon} {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in here
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
