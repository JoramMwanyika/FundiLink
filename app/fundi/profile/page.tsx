"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { FileUpload } from "@/components/file-upload"
import { ImageGallery } from "@/components/image-gallery"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SERVICE_CATEGORIES } from "@/lib/models"
import { ArrowLeft, Save, Camera, Award, User, Star } from "lucide-react"

export default function FundiProfilePage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    categories: [] as string[],
    bio: "",
    experience: "",
    hourlyRate: "",
  })
  const [profileImage, setProfileImage] = useState<string>("")
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])
  const [certificates, setCertificates] = useState<string[]>([])

  useEffect(() => {
    if (!user || user.role !== "fundi") {
      router.push("/login")
      return
    }

    // Initialize form with user data
    setProfileData({
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      location: user.location || "",
      categories: user.categories || [],
      bio: "",
      experience: "",
      hourlyRate: "",
    })
  }, [user, router])

  const handleInputChange = (field: string, value: string | string[]) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCategoryToggle = (categoryId: string) => {
    setProfileData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }))
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
        categories: profileData.categories,
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

  const handleImageUpload = (type: "profile" | "portfolio" | "certificate", url: string) => {
    if (type === "profile") {
      setProfileImage(url)
    } else if (type === "portfolio") {
      setPortfolioImages((prev) => [...prev, url])
    } else {
      setCertificates((prev) => [...prev, url])
    }

    toast({
      title: "Image Uploaded",
      description: `${type} image uploaded successfully`,
    })
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute inset-0 glow-effect"></div>

      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm bg-background/80 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/fundi/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold gradient-text">My Profile</h1>
              <p className="text-muted-foreground">Manage your professional profile and portfolio</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
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
              {/* Profile Image */}
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                    {profileImage ? (
                      <img
                        src={profileImage || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0">
                    <FileUpload onUpload={(url) => handleImageUpload("profile", url)} accept="image/*" maxSize={5}>
                      <Button size="sm" className="rounded-full w-10 h-10 p-0">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </FileUpload>
                  </div>
                </div>
                <h3 className="text-lg font-semibold">{profileData.name}</h3>
                <p className="text-muted-foreground">{profileData.location}</p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Rating:</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-semibold">{user.rating || 4.8}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className={user.is_verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {user.is_verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Member Since:</span>
                  <span className="font-semibold">Dec 2024</span>
                </div>
              </div>

              {/* Service Categories */}
              <div>
                <h4 className="font-medium mb-2">Services Offered</h4>
                <div className="flex flex-wrap gap-2">
                  {profileData.categories.map((categoryId) => {
                    const category = SERVICE_CATEGORIES.find((cat) => cat.id === categoryId)
                    return (
                      <Badge key={categoryId} variant="secondary">
                        {category?.icon} {category?.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="gradient-text">Basic Information</CardTitle>
                <CardDescription>Update your personal and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="e.g., Nairobi, Kenya"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell clients about your experience and expertise..."
                    rows={3}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      value={profileData.experience}
                      onChange={(e) => handleInputChange("experience", e.target.value)}
                      placeholder="e.g., 5 years"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (KES)</Label>
                    <Input
                      id="hourlyRate"
                      value={profileData.hourlyRate}
                      onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                      placeholder="e.g., 1500"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Categories */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="gradient-text">Service Categories</CardTitle>
                <CardDescription>Select the services you offer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {SERVICE_CATEGORIES.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={profileData.categories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <Label htmlFor={category.id} className="flex items-center cursor-pointer">
                        <span className="mr-2">{category.icon}</span>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">{category.description}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="gradient-text">Portfolio</CardTitle>
                <CardDescription>Showcase your work with photos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUpload
                  onUpload={(url) => handleImageUpload("portfolio", url)}
                  accept="image/*"
                  maxSize={10}
                  multiple
                >
                  <Button variant="outline" className="w-full bg-transparent border-border/50">
                    <Camera className="h-4 w-4 mr-2" />
                    Add Portfolio Images
                  </Button>
                </FileUpload>

                {portfolioImages.length > 0 && <ImageGallery images={portfolioImages} />}
              </CardContent>
            </Card>

            {/* Certificates */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="gradient-text flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Certificates & Qualifications
                </CardTitle>
                <CardDescription>Upload your professional certificates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUpload
                  onUpload={(url) => handleImageUpload("certificate", url)}
                  accept="image/*,.pdf"
                  maxSize={10}
                  multiple
                >
                  <Button variant="outline" className="w-full bg-transparent border-border/50">
                    <Award className="h-4 w-4 mr-2" />
                    Upload Certificates
                  </Button>
                </FileUpload>

                {certificates.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {certificates.map((cert, index) => (
                      <div key={index} className="p-3 bg-background/30 rounded-lg">
                        <img
                          src={cert || "/placeholder.svg"}
                          alt={`Certificate ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
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
          </div>
        </div>
      </div>
    </div>
  )
}
