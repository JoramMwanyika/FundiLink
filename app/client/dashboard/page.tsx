"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SERVICE_CATEGORIES, type Booking } from "@/lib/models"
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Plus,
  Settings,
  LogOut,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react"

export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "client") {
      router.push("/login")
      return
    }
    fetchBookings()
  }, [user, router])

  const fetchBookings = async () => {
    try {
      // Mock bookings data
      const mockBookings = [
        {
          _id: "1",
          clientName: user?.name || "You",
          fundiName: "John Mwangi",
          serviceCategory: "plumber",
          location: "Westlands, Nairobi",
          date: "2024-12-31",
          time: "10:00",
          status: "confirmed" as const,
          description: "Fix leaking kitchen tap",
          price: 1500,
          createdAt: "2024-12-28",
        },
        {
          _id: "2",
          clientName: user?.name || "You",
          fundiName: "Mary Wanjiku",
          serviceCategory: "electrician",
          location: "Kilimani, Nairobi",
          date: "2025-01-02",
          time: "14:00",
          status: "pending" as const,
          description: "Install new lighting fixtures",
          price: 2500,
          createdAt: "2024-12-29",
        },
        {
          _id: "3",
          clientName: user?.name || "You",
          fundiName: "Peter Ochieng",
          serviceCategory: "carpenter",
          location: "Karen, Nairobi",
          date: "2024-12-25",
          time: "09:00",
          status: "completed" as const,
          description: "Repair wooden door",
          price: 1200,
          createdAt: "2024-12-20",
        },
      ]
      setBookings(mockBookings)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const upcomingBookings = bookings.filter(
    (booking) => booking.status === "confirmed" && new Date(booking.date) >= new Date(),
  )
  const recentBookings = bookings.slice(0, 3)
  const completedBookings = bookings.filter((booking) => booking.status === "completed")

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute inset-0 glow-effect"></div>

      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm bg-background/80 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Client Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/client/profile">
                <Button variant="outline" size="sm" className="bg-transparent border-border/50">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="bg-transparent border-border/50">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/book" className="flex-1">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 group">
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
                Book a Service
              </Button>
            </Link>
            <Link href="/client/bookings" className="flex-1">
              <Button
                size="lg"
                variant="outline"
                className="w-full bg-transparent border-border/50 hover:bg-primary/10"
              >
                <Calendar className="h-5 w-5 mr-2" />
                My Bookings
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold gradient-text">{upcomingBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold gradient-text">{completedBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Star className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold gradient-text">4.8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Settings className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold gradient-text">{bookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="gradient-text">Recent Bookings</CardTitle>
                    <CardDescription>Your latest service requests</CardDescription>
                  </div>
                  <Link href="/client/bookings">
                    <Button variant="outline" size="sm" className="bg-transparent border-border/50">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading bookings...</p>
                  </div>
                ) : recentBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No bookings yet</p>
                    <p className="text-sm text-muted-foreground mt-2">Book your first service to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking._id} className="border border-border/50 rounded-lg p-4 bg-background/30">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{booking.fundiName}</h4>
                              <Badge className={`${getStatusColor(booking.status)} border`}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(booking.status)}
                                  {booking.status}
                                </div>
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <span className="font-medium mr-2">Service:</span>
                                {SERVICE_CATEGORIES.find((cat) => cat.id === booking.serviceCategory)?.name}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                {booking.date} at {booking.time}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                {booking.location}
                              </div>
                              {booking.description && (
                                <div className="mt-2">
                                  <span className="font-medium">Description:</span> {booking.description}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary">KES {booking.price}</div>
                            {booking.status === "completed" && (
                              <Link href={`/client/rate/${booking._id}`}>
                                <Button size="sm" variant="outline" className="mt-2 bg-transparent border-border/50">
                                  <Star className="h-4 w-4 mr-1" />
                                  Rate
                                </Button>
                              </Link>
                            )}
                            {booking.status === "confirmed" && (
                              <Button size="sm" variant="outline" className="mt-2 bg-transparent border-border/50">
                                <Phone className="h-4 w-4 mr-1" />
                                Contact
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Info */}
          <div className="space-y-6">
            {/* Service Categories */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="gradient-text">Popular Services</CardTitle>
                <CardDescription>Book these services quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {SERVICE_CATEGORIES.slice(0, 6).map((category) => (
                    <Link key={category.id} href={`/book?category=${category.id}`}>
                      <div className="p-3 border border-border/50 rounded-lg hover:border-primary/50 transition-colors cursor-pointer bg-background/30 hover:bg-primary/5">
                        <div className="text-center">
                          <div className="text-2xl mb-1">{category.icon}</div>
                          <div className="text-xs font-medium">{category.name}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="gradient-text">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{user.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{user.location || "Not set"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Member since:</span>
                    <span className="font-medium">Dec 2024</span>
                  </div>
                </div>
                <Link href="/client/profile">
                  <Button variant="outline" className="w-full bg-transparent border-border/50">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
