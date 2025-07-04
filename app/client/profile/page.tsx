"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, User, MapPin, Phone, Mail, Star } from "lucide-react"

export default function ClientProfilePage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    preferences: "",
  })

  useEffect(() => {
    if (!user || user.role !== "client") {
      router.push("/login")
      return
    }

    // Initialize form with user data
    setProfileData({
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      location: user.location || "",
      preferences: "",
    })
  }, [user, router])

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // Simulate API call to update profile
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update user context
      await updateUser({
        ...user!,
        name: profileData.name,
        email: profileData.email,
        location: profileData.location,
      })

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute inset-0 glow-effect"></div>

      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm bg-background/80 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/client/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold gradient-text">My Profile</h1>
              <p className="text-muted-foreground">Manage your account information and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="gradient-text flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Avatar */}
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-semibold">{profileData.name}</h3>
                <p className="text-muted-foreground">{profileData.location || "Location not set"}</p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Member Since:</span>
                  <span className="font-semibold">Dec 2024</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Bookings:</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Favorite Rating:</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-semibold">4.8</span>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Status:</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="gradient-text">Personal Information</CardTitle>
                <CardDescription>Update your contact details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={profileData.name}
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
                        value={profileData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="pl-10 bg-background/50 border-border/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10 bg-background/50 border-border/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="e.g., Nairobi, Kenya"
                        className="pl-10 bg-background/50 border-border/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferences">Service Preferences</Label>
                  <Textarea
                    id="preferences"
                    value={profileData.preferences}
                    onChange={(e) => handleInputChange("preferences", e.target.value)}
                    placeholder="Tell us about your preferred service times, special requirements, etc..."
                    rows={3}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                {/* Notification Preferences */}
                <div className="space-y-4">
                  <h4 className="font-medium">Notification Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                      <div>
                        <div className="font-medium">SMS Notifications</div>
                        <div className="text-sm text-muted-foreground">Receive booking updates via SMS</div>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                      <div>
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-muted-foreground">Receive booking confirmations via email</div>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                      <div>
                        <div className="font-medium">Marketing Updates</div>
                        <div className="text-sm text-muted-foreground">Receive promotional offers and updates</div>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
