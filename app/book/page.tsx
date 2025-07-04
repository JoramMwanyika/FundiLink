"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PaymentModal } from "@/components/payment-modal"
import { SERVICE_CATEGORIES } from "@/lib/models"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, MapPin, Phone, User, CreditCard } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function BookingPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    serviceCategory: "",
    date: "",
    time: "",
    description: "",
  })
  const [availableFundis, setAvailableFundis] = useState<any[]>([])
  const [selectedFundi, setSelectedFundi] = useState("")
  const [quotedPrice, setQuotedPrice] = useState(0)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const { toast } = useToast()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")

  useEffect(() => {
    if (categoryParam) {
      setFormData((prev) => ({ ...prev, serviceCategory: categoryParam }))
    }
  }, [categoryParam])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const searchFundis = async () => {
    if (!formData.serviceCategory || !formData.date || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in service category, date, and time",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Mock fundis data with pricing
      const mockFundis = [
        {
          _id: "fundi1",
          name: "John Mwangi",
          location: "Westlands, Nairobi",
          rating: 4.8,
          categories: [formData.serviceCategory],
          subscription_status: "active",
          basePrice: 1500,
        },
        {
          _id: "fundi2",
          name: "Mary Wanjiku",
          location: "Kilimani, Nairobi",
          rating: 4.9,
          categories: [formData.serviceCategory],
          subscription_status: "active",
          basePrice: 1800,
        },
        {
          _id: "fundi3",
          name: "Peter Ochieng",
          location: "Industrial Area, Nairobi",
          rating: 4.7,
          categories: [formData.serviceCategory],
          subscription_status: "free",
          basePrice: 1200,
        },
      ]

      setAvailableFundis(mockFundis)
      setStep(2)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search for fundis. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFundiSelection = (fundiId: string) => {
    setSelectedFundi(fundiId)
    const fundi = availableFundis.find((f: any) => f._id === fundiId)
    if (fundi) {
      setQuotedPrice((fundi as any).basePrice)
    }
  }

  const proceedToPayment = () => {
    if (!selectedFundi) {
      toast({
        title: "Select a Fundi",
        description: "Please select a fundi to proceed with booking",
        variant: "destructive",
      })
      return
    }

    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    toast({
      title: "Booking Confirmed!",
      description: "Your booking has been confirmed and payment processed.",
    })
    setStep(3)
  }

  const selectedCategory = SERVICE_CATEGORIES.find((cat) => cat.id === formData.serviceCategory)
  const selectedFundiData = availableFundis.find((f: any) => f._id === selectedFundi)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="bg-background/80 border-b border-border/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold gradient-text ml-4">Book a Service</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 && (
          <Card className="bg-card/80 border border-border/50 shadow-2xl shadow-primary/10 card-hover animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gradient-text">
                <Calendar className="h-5 w-5 mr-2" />
                Service Details
              </CardTitle>
              <CardDescription className="text-muted-foreground">Tell us what service you need and when you need it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-foreground">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-primary" />
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="pl-10 input-glow"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-primary" />
                    <Input
                      id="phone"
                      placeholder="+254 XXX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="pl-10 input-glow"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-primary" />
                  <Input
                    id="location"
                    placeholder="e.g. Westlands, Nairobi"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="pl-10 input-glow"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="serviceCategory">Service Category</Label>
                  <Select
                    value={formData.serviceCategory}
                    onValueChange={(value) => handleInputChange("serviceCategory", value)}
                  >
                    <SelectTrigger className="input-glow">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-foreground">
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="input-glow"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    className="input-glow"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the work needed..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="input-glow"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={searchFundis}
                  disabled={loading}
                  className="btn-glow px-8 py-3 text-lg"
                >
                  {loading ? "Searching..." : "Find Fundis"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Fundis</CardTitle>
              <CardDescription>
                Select a fundi for your {selectedCategory?.name} service on {formData.date} at {formData.time}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableFundis.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No fundis available for the selected time slot.</p>
                  <Button onClick={() => setStep(1)} variant="outline">
                    Try Different Time
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableFundis.map((fundi: any) => (
                    <div
                      key={fundi._id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedFundi === fundi._id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleFundiSelection(fundi._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{fundi.name}</h4>
                            {fundi.subscription_status === "active" && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{fundi.location}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm text-gray-600 ml-1">
                              {fundi.rating} ({Math.floor(Math.random() * 50) + 10} reviews)
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-green-600">KES {fundi.basePrice}</span>
                          <p className="text-sm text-gray-500">Estimated</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {selectedFundi && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Selected Fundi</h4>
                      <p className="text-green-700 text-sm mb-3">
                        {(selectedFundiData as any)?.name} - KES {quotedPrice}
                      </p>
                      <div className="flex gap-4">
                        <Button onClick={() => setStep(1)} variant="outline" className="flex-1 bg-transparent">
                          Back
                        </Button>
                        <Button onClick={proceedToPayment} className="flex-1">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Proceed to Payment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-green-600">Booking Confirmed!</CardTitle>
              <CardDescription>Your service has been booked and paid for successfully</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Booking Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Service:</strong> {selectedCategory?.name}
                  </p>
                  <p>
                    <strong>Fundi:</strong> {(selectedFundiData as any)?.name}
                  </p>
                  <p>
                    <strong>Date:</strong> {formData.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {formData.time}
                  </p>
                  <p>
                    <strong>Location:</strong> {formData.location}
                  </p>
                  <p>
                    <strong>Amount Paid:</strong> KES {quotedPrice}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Your fundi will contact you shortly to confirm the appointment details.
              </p>

              <div className="flex gap-4">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    Back to Home
                  </Button>
                </Link>
                <Button onClick={() => window.location.reload()} className="flex-1">
                  Book Another Service
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={quotedPrice}
          description={`${selectedCategory?.name} service by ${(selectedFundiData as any)?.name}`}
          type="booking_payment"
          referenceId={selectedFundi}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  )
}
