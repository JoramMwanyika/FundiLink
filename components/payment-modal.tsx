"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle, Smartphone, CreditCard } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  description: string
  type: "subscription" | "booking_payment" | "commission"
  referenceId?: string
  onSuccess?: () => void
}

export function PaymentModal({
  isOpen,
  onClose,
  amount,
  description,
  type,
  referenceId,
  onSuccess,
}: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "failed">("idle")
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!isOpen) {
      setStatus("idle")
      setTransactionId(null)
      setPhoneNumber("")
    }
  }, [isOpen])

  const handlePayment = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter your M-Pesa phone number",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setStatus("processing")

    try {
      const response = await fetch("/api/payments/mpesa/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          amount,
          type,
          referenceId,
          description,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTransactionId(data.transactionId)
        toast({
          title: "Payment request sent",
          description: "Check your phone for the M-Pesa payment prompt",
        })

        // Poll for payment status
        pollPaymentStatus(data.transactionId)
      } else {
        setStatus("failed")
        toast({
          title: "Payment failed",
          description: data.message || "Failed to initiate payment",
          variant: "destructive",
        })
      }
    } catch (error) {
      setStatus("failed")
      toast({
        title: "Payment error",
        description: "An error occurred while processing payment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const pollPaymentStatus = async (txnId: string) => {
    const maxAttempts = 30 // 30 attempts = 1.5 minutes
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/payments/mpesa/initiate?transactionId=${txnId}`)
        const data = await response.json()

        if (data.success && data.transaction) {
          if (data.transaction.status === "completed") {
            setStatus("success")
            toast({
              title: "Payment successful!",
              description: `Payment of KES ${amount} completed successfully`,
            })
            onSuccess?.()
            return
          } else if (data.transaction.status === "failed") {
            setStatus("failed")
            toast({
              title: "Payment failed",
              description: "The payment was not completed",
              variant: "destructive",
            })
            return
          }
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000) // Poll every 3 seconds
        } else {
          setStatus("failed")
          toast({
            title: "Payment timeout",
            description: "Payment verification timed out. Please check your M-Pesa messages.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error polling payment status:", error)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000)
        }
      }
    }

    poll()
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")

    // Format as +254 XXX XXX XXX
    if (digits.length === 0) return ""
    if (digits.startsWith("254")) {
      const formatted = digits.substring(3)
      if (formatted.length <= 3) return `+254 ${formatted}`
      if (formatted.length <= 6) return `+254 ${formatted.substring(0, 3)} ${formatted.substring(3)}`
      return `+254 ${formatted.substring(0, 3)} ${formatted.substring(3, 6)} ${formatted.substring(6, 9)}`
    }
    if (digits.startsWith("0")) {
      const formatted = digits.substring(1)
      if (formatted.length <= 3) return `+254 ${formatted}`
      if (formatted.length <= 6) return `+254 ${formatted.substring(0, 3)} ${formatted.substring(3)}`
      return `+254 ${formatted.substring(0, 3)} ${formatted.substring(3, 6)} ${formatted.substring(6, 9)}`
    }
    // Assume it's a 9-digit number without country code
    if (digits.length <= 3) return `+254 ${digits}`
    if (digits.length <= 6) return `+254 ${digits.substring(0, 3)} ${digits.substring(3)}`
    return `+254 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6, 9)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount to pay:</span>
                <span className="text-2xl font-bold text-green-600">KES {amount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {status === "idle" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 XXX XXX XXX"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">Enter the phone number registered with M-Pesa</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handlePayment} disabled={loading || !phoneNumber} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay KES ${amount}`
                  )}
                </Button>
              </div>
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
              <p className="text-gray-600 mb-4">Please check your phone for the M-Pesa payment prompt</p>
              <p className="text-sm text-gray-500">Enter your M-Pesa PIN when prompted to complete the payment</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-600 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">
                Your payment of KES {amount.toLocaleString()} has been processed successfully
              </p>
              <Button onClick={onClose} className="w-full">
                Continue
              </Button>
            </div>
          )}

          {status === "failed" && (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Payment Failed</h3>
              <p className="text-gray-600 mb-4">The payment could not be completed. Please try again.</p>
              <div className="flex gap-3">
                <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={() => setStatus("idle")} className="flex-1">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
