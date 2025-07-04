"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { SERVICE_CATEGORIES, type Booking } from "@/lib/models"
import { ArrowLeft, Star, Calendar, MapPin, CheckCircle, Send } from "lucide-react"

export default function RateFundiPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!user || user.role !== "client") {
      router.push("/login")
      return
    }
    fetchBooking()
  }, [user, router, bookingId])

  const fetchBooking = async () => {
    try {
      // Mock booking data - in real app, fetch by ID
      const mockBooking = {
        _id: bookingId,
        clientName: user?.name || "You",
        fundiName: "John Mwangi",
        serviceCategory: "plumber",
        location: "Westlands, Nairobi",
        date: "2024-12-25",
        time: "09:00",
        status: "completed" as const,
        description: "Fix leaking kitchen tap and replace washers",
        price: 1500,
        createdAt: "2024-12-20",
        fundi_id: "someFundiId",
      }
      setBooking(mockBooking)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch booking details",
        variant: "destructive",
      })
    }
  }

  const handleRatingClick = (value: number) => {
    setRating(value)
  }

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking._id,
          rating,
          review,
          clientId: user?.id,
          fundiId: booking.fundi_id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Rating Submitted!",
          description: "Thank you for your feedback. It helps improve our service.",
        })
        setSubmitted(true)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "Poor"
      case 2:
        return "Fair"
      case 3:
        return "Good"
      case 4:
        return "Very Good"
      case 5:
        return "Excellent"
      default:
        return "Select Rating"
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return "text-red-500"
    if (rating === 3) return "text-yellow-500"
    return "text-green-500"
  }

  if (!user || !booking) return null

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="absolute inset-0 glow-effect"></div>
        <Card className="w-full max-w-md bg-card/50 border-border/50 backdrop-blur-sm relative z-10">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-green-600">Thank You!</h3>
              <p className="text-muted-foreground">Your rating has been submitted successfully</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-sm font-medium">{getRatingText(rating)} Service</p>
              {review && <p className="text-sm text-muted-foreground">"{review}"</p>}
            </div>

            <div className="space-y-3">
              <Link href="/client/bookings" className="block">
                <Button variant="outline" className="w-full bg-transparent border-border/50">
                  View All Bookings
                </Button>
              </Link>
              <Link href="/book" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90">Book Another Service</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute inset-0 glow-effect"></div>

      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm bg-background/80 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/client/bookings">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bookings
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Rate Your Fundi</h1>
              <p className="text-muted-foreground">Share your experience with {booking.fundiName}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Service Summary */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="gradient-text">Service Summary</CardTitle>
              <CardDescription>Details of your completed service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-lg">{booking.fundiName}</h4>
                  <Badge variant="outline" className="border-border/50">
                    {SERVICE_CATEGORIES.find((cat) => cat.id === booking.serviceCategory)?.name}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {booking.date} at {booking.time}
                    </span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{booking.location}</span>
                  </div>
                </div>

                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Service:</span> {booking.description}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                  <span className="font-medium">Total Paid:</span>
                  <span className="text-lg font-bold text-primary">KES {booking.price}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Form */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="gradient-text">Rate Your Experience</CardTitle>
                <CardDescription>Help other clients by sharing your honest feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Star Rating */}
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">How was your service?</h3>
                    <p className="text-sm text-muted-foreground">Click on the stars to rate</p>
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      >
                        <Star
                          className={`h-10 w-10 transition-colors ${
                            star <= (hoveredRating || rating)
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300 hover:text-yellow-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {(rating > 0 || hoveredRating > 0) && (
                    <p className={`text-lg font-semibold ${getRatingColor(hoveredRating || rating)}`}>
                      {getRatingText(hoveredRating || rating)}
                    </p>
                  )}
                </div>

                {/* Review Text */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Write a Review (Optional)</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Share details about your experience to help other clients
                    </p>
                  </div>
                  <Textarea
                    placeholder="Tell us about the quality of work, punctuality, professionalism, etc..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={4}
                    className="bg-background/50 border-border/50"
                  />
                  <p className="text-xs text-muted-foreground">{review.length}/500 characters</p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Link href="/client/bookings" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent border-border/50">
                      Skip for Now
                    </Button>
                  </Link>
                  <Button
                    onClick={handleSubmitRating}
                    disabled={loading || rating === 0}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Rating
                      </>
                    )}
                  </Button>
                </div>

                {/* Rating Guidelines */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Rating Guidelines</h5>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>⭐ 1 Star: Poor service, major issues</p>
                    <p>⭐⭐ 2 Stars: Below expectations, some problems</p>
                    <p>⭐⭐⭐ 3 Stars: Average service, met basic needs</p>
                    <p>⭐⭐⭐⭐ 4 Stars: Good service, exceeded expectations</p>
                    <p>⭐⭐⭐⭐⭐ 5 Stars: Excellent service, highly recommend</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
