"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PaymentModal } from "@/components/payment-modal"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Smartphone, Receipt } from "lucide-react"

export default function PaymentsTestPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState({
    amount: 100,
    description: "Test Payment",
    type: "subscription" as "subscription" | "booking_payment" | "commission",
  })
  const { toast } = useToast()

  const handleTestPayment = () => {
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    toast({
      title: "Payment successful!",
      description: "Test payment completed successfully",
    })
  }

  const quickAmounts = [50, 100, 200, 500, 1000, 2000]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Payment Testing</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Test Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Test M-Pesa Payment
              </CardTitle>
              <CardDescription>Test the M-Pesa payment integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Quick Amounts</Label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentData((prev) => ({ ...prev, amount }))}
                      className="bg-transparent"
                    >
                      KES {amount}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={paymentData.description}
                  onChange={(e) => setPaymentData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Payment Type</Label>
                <Select
                  value={paymentData.type}
                  onValueChange={(value: any) => setPaymentData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="booking_payment">Booking Payment</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleTestPayment} className="w-full" size="lg">
                <Smartphone className="h-4 w-4 mr-2" />
                Test Payment
              </Button>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                Payment Information
              </CardTitle>
              <CardDescription>How payments work in FundiLink</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">M-Pesa Integration</h4>
                  <p className="text-blue-700 text-sm">
                    Secure payments via Safaricom M-Pesa STK Push. Enter your M-Pesa registered phone number to pay.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Subscription Payments</h4>
                  <p className="text-green-700 text-sm">
                    Fundis can subscribe to weekly or monthly plans for better visibility and more features.
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Booking Payments</h4>
                  <p className="text-purple-700 text-sm">
                    Clients can pay for services directly through the platform with automatic commission tracking.
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">Commission System</h4>
                  <p className="text-orange-700 text-sm">
                    10% platform commission on completed jobs. Fundis keep 90% of all earnings.
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Test Phone Numbers</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• +254 700 000 000 (Test number)</p>
                  <p>• +254 711 111 111 (Test number)</p>
                  <p>• Use any valid Kenyan number format</p>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Development Mode</h4>
                <p className="text-yellow-700 text-sm">
                  In development mode, payments are simulated and complete automatically after 3 seconds.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={paymentData.amount}
          description={paymentData.description}
          type={paymentData.type}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  )
}
