"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SERVICE_CATEGORIES, type Booking } from "@/lib/models"
import {
  CalendarIcon,
  Clock,
  MapPin,
  Phone,
  Star,
  LogOut,
  User,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Bell,
  Award,
  Eye,
} from "lucide-react"
import { ContactModal } from "@/components/contact-modal"

export default function FundiDashboard() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(true)
  const [isAvailable, setIsAvailable] = useState(true)
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New booking request from John Doe", time: "5 min ago", type: "booking" },
    { id: 2, message: "Payment received for completed job", time: "1 hour ago", type: "payment" },
    { id: 3, message: "Client rated you 5 stars!", time: "2 hours ago", type: "rating" },
  ])

  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<{ name: string; phone: string; bookingId: string } | null>(
    null,
  )

  useEffect(() => {
    if (!user || user.role !== "fundi") {
      router.push("/login")
      return
    }
    fetchBookings()
  }, [user, router])

  const fetchBookings = async () => {
    try {
      // Mock bookings data for fundi
      const mockBookings = [
        {
          _id: "1",
          clientName: "John Doe",
          fundiName: user?.name || "You",
          serviceCategory: "plumber",
          location: "Westlands, Nairobi",
          date: "2024-12-31",
          time: "10:00",
          status: "confirmed" as const,
          description: "Fix leaking kitchen tap",
          price: 1500,
          createdAt: "2024-12-28",
          client_id: "254712345678",
        },
        {
          _id: "2",
          clientName: "Jane Smith",
          fundiName: user?.name || "You",
          serviceCategory: "electrician",
          location: "Kilimani, Nairobi",
          date: "2025-01-02",
          time: "14:00",
          status: "pending" as const,
          description: "Install new lighting fixtures",
          price: 2500,
          createdAt: "2024-12-29",
          client_id: "254723456789",
        },
        {
          _id: "3",
          clientName: "Mary Johnson",
          fundiName: user?.name || "You",
          serviceCategory: "plumber",
          location: "Karen, Nairobi",
          date: "2024-12-25",
          time: "09:00",
          status: "completed" as const,
          description: "Repair bathroom pipes",
          price: 3000,
          createdAt: "2024-12-20",
          client_id: "254734567890",
        },
        {
          _id: "4",
          clientName: "Peter Wilson",
          fundiName: user?.name || "You",
          serviceCategory: "electrician",
          location: "Embakasi, Nairobi",
          date: "2024-12-30",
          time: "16:00",
          status: "completed" as const,
          description: "Fix electrical wiring",
          price: 2000,
          createdAt: "2024-12-25",
          client_id: "254745678901",
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

  const handleAcceptBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((booking) => (booking._id === bookingId ? { ...booking, status: "confirmed" as const } : booking)),
    )
    toast({
      title: "Booking Accepted",
      description: "You have accepted the booking request",
    })
  }

  const handleRejectBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((booking) => (booking._id === bookingId ? { ...booking, status: "cancelled" as const } : booking)),
    )
    toast({
      title: "Booking Rejected",
      description: "You have rejected the booking request",
    })
  }

  const handleCompleteJob = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((booking) => (booking._id === bookingId ? { ...booking, status: "completed" as const } : booking)),
    )
    toast({
      title: "Job Completed",
      description: "Job marked as completed successfully",
    })
  }

  const handleContactClient = (booking: Booking) => {
    setSelectedContact({
      name: booking.clientName,
      phone: booking.client_id, // Using client_id as phone for WhatsApp users
      bookingId: booking._id!,
    })
    setShowContactModal(true)
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
  const pendingBookings = bookings.filter((booking) => booking.status === "pending")
  const completedBookings = bookings.filter((booking) => booking.status === "completed")
  const todayBookings = bookings.filter((booking) => booking.date === new Date().toISOString().split("T")[0])

  const totalEarnings = completedBookings.reduce((sum, booking) => sum + (booking.price || 0), 0)
  const thisWeekEarnings = completedBookings
    .filter((booking) => {
      const bookingDate = new Date(booking.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return bookingDate >= weekAgo
    })
    .reduce((sum, booking) => sum + (booking.price || 0), 0)

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute inset-0 glow-effect"></div>

      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm bg-background/80 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Fundi Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Available:</span>
                <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
                <span className={`text-sm font-medium ${isAvailable ? "text-green-500" : "text-red-500"}`}>
                  {isAvailable ? "Online" : "Offline"}
                </span>
              </div>
              <Link href="/fundi/profile">
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
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Today's Jobs</p>
                  <p className="text-2xl font-bold gradient-text">{todayBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Clock className="h-6 w-6 text-green-400" />
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
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold gradient-text">{user.rating || 4.8}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold gradient-text">KES {thisWeekEarnings.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Pending Requests */}
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="gradient-text flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
                    Pending Requests ({pendingBookings.length})
                  </CardTitle>
                  <CardDescription>New booking requests awaiting your response</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No pending requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingBookings.map((booking) => (
                        <div key={booking._id} className="border border-border/50 rounded-lg p-4 bg-background/30">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{booking.clientName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {SERVICE_CATEGORIES.find((cat) => cat.id === booking.serviceCategory)?.name}
                                </p>
                              </div>
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                KES {booking.price}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                {booking.date} at {booking.time}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                {booking.location}
                              </div>
                            </div>
                            <p className="text-sm">{booking.description}</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptBooking(booking._id!)}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectBooking(booking._id!)}
                                className="flex-1 bg-transparent border-border/50"
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleContactClient(booking)}
                                className="flex-1 bg-transparent border-border/50"
                              >
                                <Phone className="h-4 w-4 mr-1" />
                                Contact
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Confirmed Bookings */}
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="gradient-text flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Confirmed Jobs ({upcomingBookings.length})
                  </CardTitle>
                  <CardDescription>Your upcoming confirmed bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No upcoming jobs</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <div key={booking._id} className="border border-border/50 rounded-lg p-4 bg-background/30">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{booking.clientName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {SERVICE_CATEGORIES.find((cat) => cat.id === booking.serviceCategory)?.name}
                                </p>
                              </div>
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                KES {booking.price}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                {booking.date} at {booking.time}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                {booking.location}
                              </div>
                            </div>
                            <p className="text-sm">{booking.description}</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleContactClient(booking)}
                                className="flex-1 bg-transparent border-border/50"
                              >
                                <Phone className="h-4 w-4 mr-1" />
                                Contact
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleCompleteJob(booking._id!)}
                                className="flex-1 bg-primary hover:bg-primary/90"
                              >
                                Complete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Completed */}
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="gradient-text flex items-center">
                    <Award className="h-5 w-5 mr-2 text-blue-500" />
                    Recent Completed ({completedBookings.length})
                  </CardTitle>
                  <CardDescription>Your recently completed jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  {completedBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No completed jobs yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {completedBookings.slice(0, 3).map((booking) => (
                        <div key={booking._id} className="border border-border/50 rounded-lg p-4 bg-background/30">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{booking.clientName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {SERVICE_CATEGORIES.find((cat) => cat.id === booking.serviceCategory)?.name}
                                </p>
                              </div>
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">KES {booking.price}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                {booking.date}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                {booking.location}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="text-sm">5.0</span>
                              </div>
                              <Button size="sm" variant="outline" className="bg-transparent border-border/50">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="availability">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="gradient-text">Set Availability</CardTitle>
                  <CardDescription>Select dates when you're available for bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border border-border/50 bg-background/30"
                  />
                  <div className="mt-4 space-y-2">
                    <Button className="w-full bg-primary hover:bg-primary/90">Set Available Times</Button>
                    <p className="text-sm text-muted-foreground text-center">Click on dates to set your availability</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="gradient-text">Availability Status</CardTitle>
                  <CardDescription>Your current availability settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <span className="text-sm font-medium">Today</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Available</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <span className="text-sm font-medium">Tomorrow</span>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">2 slots booked</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border/50">
                      <span className="text-sm font-medium">This Weekend</span>
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">Not set</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4 bg-transparent border-border/50">
                    Manage All Availability
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="gradient-text flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Earnings Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">This Week:</span>
                      <span className="font-semibold text-green-600">KES {thisWeekEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">This Month:</span>
                      <span className="font-semibold text-green-600">KES {totalEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Earned:</span>
                      <span className="font-semibold text-green-600">KES {totalEarnings.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Jobs Completed:</span>
                      <span className="font-semibold">{completedBookings.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average per Job:</span>
                      <span className="font-semibold">
                        KES {completedBookings.length > 0 ? Math.round(totalEarnings / completedBookings.length) : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="gradient-text">Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedBookings.slice(0, 4).map((booking) => (
                      <div
                        key={booking._id}
                        className="flex justify-between items-center p-3 bg-background/30 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">{booking.clientName}</p>
                          <p className="text-xs text-muted-foreground">{booking.date}</p>
                        </div>
                        <span className="font-semibold text-green-600">+KES {booking.price}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="gradient-text">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rating:</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="font-semibold">{user.rating || 4.8}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completion Rate:</span>
                      <span className="font-semibold text-green-600">95%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Response Time:</span>
                      <span className="font-semibold">&lt; 1 hour</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent border-border/50">
                    <Award className="h-4 w-4 mr-2" />
                    View All Reviews
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="gradient-text flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </CardTitle>
                <CardDescription>Stay updated with your latest activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start space-x-4 p-4 bg-background/30 rounded-lg border border-border/50"
                    >
                      <div className="p-2 bg-primary/20 rounded-full">
                        {notification.type === "booking" && <CalendarIcon className="h-4 w-4 text-primary" />}
                        {notification.type === "payment" && <DollarSign className="h-4 w-4 text-green-500" />}
                        {notification.type === "rating" && <Star className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent border-border/50">
                  View All Notifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* Contact Modal */}
        <ContactModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          contactName={selectedContact?.name || ""}
          contactPhone={selectedContact?.phone || ""}
          contactType="client"
          bookingId={selectedContact?.bookingId}
        />
      </div>
    </div>
  )
}
