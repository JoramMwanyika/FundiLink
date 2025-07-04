"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SERVICE_CATEGORIES, type Booking } from "@/lib/models"
import {
  Calendar,
  MapPin,
  Phone,
  Star,
  Search,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  MessageSquare,
  RotateCcw,
} from "lucide-react"
import { ContactModal } from "@/components/contact-modal"

export default function ClientBookingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")

  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<{ name: string; phone: string; bookingId: string } | null>(
    null,
  )

  useEffect(() => {
    if (!user || user.role !== "client") {
      router.push("/login")
      return
    }
    fetchBookings()
  }, [user, router])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter, serviceFilter])

  const fetchBookings = async () => {
    try {
      // Mock bookings data
      const mockBookings = [
        {
          _id: "1",
          clientName: user?.name || "You",
          fundiName: "John Mwangi",
          fundi_id: "254712345678",
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
          fundi_id: "254722345678",
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
          fundi_id: "254733345678",
          serviceCategory: "carpenter",
          location: "Karen, Nairobi",
          date: "2024-12-25",
          time: "09:00",
          status: "completed" as const,
          description: "Repair wooden door",
          price: 1200,
          createdAt: "2024-12-20",
        },
        {
          _id: "4",
          clientName: user?.name || "You",
          fundiName: "Sarah Njeri",
          fundi_id: "254744345678",
          serviceCategory: "cleaner",
          location: "Embakasi, Nairobi",
          date: "2024-12-20",
          time: "08:00",
          status: "completed" as const,
          description: "Deep house cleaning",
          price: 3000,
          createdAt: "2024-12-15",
        },
        {
          _id: "5",
          clientName: user?.name || "You",
          fundiName: "David Kimani",
          fundi_id: "254755345678",
          serviceCategory: "mechanic",
          location: "Industrial Area, Nairobi",
          date: "2024-12-18",
          time: "11:00",
          status: "cancelled" as const,
          description: "Car engine diagnostics",
          price: 2000,
          createdAt: "2024-12-10",
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

  const filterBookings = () => {
    let filtered = bookings

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.fundiName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter)
    }

    // Service filter
    if (serviceFilter !== "all") {
      filtered = filtered.filter((booking) => booking.serviceCategory === serviceFilter)
    }

    setFilteredBookings(filtered)
  }

  const handleReschedule = (bookingId: string) => {
    toast({
      title: "Reschedule Request",
      description: "Your reschedule request has been sent to the fundi",
    })
  }

  const handleCancel = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((booking) => (booking._id === bookingId ? { ...booking, status: "cancelled" as const } : booking)),
    )
    toast({
      title: "Booking Cancelled",
      description: "Your booking has been cancelled successfully",
    })
  }

  const handleContactFundi = (booking: Booking) => {
    setSelectedContact({
      name: booking.fundiName,
      phone: booking.fundi_id, // This should be the fundi's phone number
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
              <h1 className="text-2xl font-bold gradient-text">My Bookings</h1>
              <p className="text-muted-foreground">Manage your service bookings</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Filters */}
        <Card className="mb-6 bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by fundi name, location, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-background/50 border-border/50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-40 bg-background/50 border-border/50">
                    <SelectValue placeholder="Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {SERVICE_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading your bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || statusFilter !== "all" || serviceFilter !== "all"
                  ? "Try adjusting your filters to see more results"
                  : "You haven't made any bookings yet"}
              </p>
              <Link href="/book">
                <Button className="bg-primary hover:bg-primary/90">Book Your First Service</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking._id} className="bg-card/50 border-border/50 backdrop-blur-sm card-hover">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{booking.fundiName}</h3>
                        <Badge className={`${getStatusColor(booking.status)} border flex items-center gap-1`}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </Badge>
                        <Badge variant="outline" className="border-border/50">
                          {SERVICE_CATEGORIES.find((cat) => cat.id === booking.serviceCategory)?.name}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>
                              {booking.date} at {booking.time}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{booking.location}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">Price:</span>
                            <span className="text-primary font-semibold">KES {booking.price}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-2">Booked:</span>
                            <span>{booking.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      {booking.description && (
                        <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm">
                            <span className="font-medium">Description:</span> {booking.description}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 lg:w-48">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContactFundi(booking)}
                            className="bg-transparent border-border/50"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contact Fundi
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(booking._id!)}
                            className="bg-transparent border-red-500/50 text-red-500 hover:bg-red-500/10"
                          >
                            Cancel Booking
                          </Button>
                        </>
                      )}

                      {booking.status === "confirmed" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContactFundi(booking)}
                            className="bg-transparent border-border/50"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Contact Fundi
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReschedule(booking._id!)}
                            className="bg-transparent border-border/50"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reschedule
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(booking._id!)}
                            className="bg-transparent border-red-500/50 text-red-500 hover:bg-red-500/10"
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {booking.status === "completed" && (
                        <>
                          <Link href={`/client/rate/${booking._id}`}>
                            <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                              <Star className="h-4 w-4 mr-2" />
                              Rate Fundi
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline" className="bg-transparent border-border/50">
                            Book Again
                          </Button>
                        </>
                      )}

                      {booking.status === "cancelled" && (
                        <Button size="sm" variant="outline" className="bg-transparent border-border/50">
                          Book Similar Service
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <Link href="/book">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Book Another Service
            </Button>
          </Link>
        </div>
      </div>
      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        contactName={selectedContact?.name || ""}
        contactPhone={selectedContact?.phone || ""}
        contactType="fundi"
        bookingId={selectedContact?.bookingId}
      />
    </div>
  )
}
