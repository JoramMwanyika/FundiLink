"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaymentModal } from "@/components/payment-modal"
import { useToast } from "@/hooks/use-toast"
import { Smartphone, CheckCircle, Clock, CreditCard, Play, RefreshCw, AlertCircle } from "lucide-react"

interface PaymentStep {
  id: number
  title: string
  description: string
  status: "pending" | "active" | "completed" | "failed"
  timestamp?: string
}

export default function PaymentDemoPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [demoSteps, setDemoSteps] = useState<PaymentStep[]>([
    {
      id: 1,
      title: "Payment Initiated",
      description: "M-Pesa STK Push request sent to phone",
      status: "pending",
    },
    {
      id: 2,
      title: "Phone Prompt Received",
      description: "User receives M-Pesa payment prompt",
      status: "pending",
    },
    {
      id: 3,
      title: "PIN Entered",
      description: "User enters M-Pesa PIN to authorize payment",
      status: "pending",
    },
    {
      id: 4,
      title: "Payment Processing",
      description: "M-Pesa processes the payment",
      status: "pending",
    },
    {
      id: 5,
      title: "Payment Confirmed",
      description: "Payment successful and callback received",
      status: "pending",
    },
  ])
  const [currentStep, setCurrentStep] = useState(0)
  const [isRunningDemo, setIsRunningDemo] = useState(false)
  const { toast } = useToast()

  const testPaymentData = {
    amount: 150,
    description: "FundiLink Standard Plan - Weekly Subscription",
    type: "subscription" as const,
    testPhone: "+254 700 123 456",
  }

  const runPaymentDemo = async () => {
    setIsRunningDemo(true)
    setCurrentStep(0)

    // Reset all steps
    setDemoSteps((prev) => prev.map((step) => ({ ...step, status: "pending" as const })))

    // Simulate payment flow steps
    const steps = [
      { delay: 1000, message: "Initiating M-Pesa payment..." },
      { delay: 2000, message: "STK Push sent to phone" },
      { delay: 3000, message: "Waiting for user authorization..." },
      { delay: 2000, message: "Processing payment..." },
      { delay: 2000, message: "Payment confirmed!" },
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, steps[i].delay))

      setCurrentStep(i + 1)
      setDemoSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          status: index < i + 1 ? "completed" : index === i + 1 ? "active" : "pending",
          timestamp: index === i ? new Date().toLocaleTimeString() : step.timestamp,
        })),
      )

      toast({
        title: "Payment Step",
        description: steps[i].message,
      })
    }

    setIsRunningDemo(false)
    toast({
      title: "Demo Complete!",
      description: "Payment flow demonstration finished successfully",
    })
  }

  const resetDemo = () => {
    setCurrentStep(0)
    setDemoSteps((prev) => prev.map((step) => ({ ...step, status: "pending" as const, timestamp: undefined })))
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "active":
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    toast({
      title: "Payment Successful!",
      description: "Test payment completed successfully",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">M-Pesa Payment Flow Demo</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Demo Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Payment Demo Controls
                </CardTitle>
                <CardDescription>Simulate the complete M-Pesa payment flow with test data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Test Payment Details */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">Test Payment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Amount:</span>
                      <span className="font-medium">KES {testPaymentData.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Description:</span>
                      <span className="font-medium text-right">{testPaymentData.description}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Test Phone:</span>
                      <span className="font-medium">{testPaymentData.testPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Type:</span>
                      <span className="font-medium capitalize">{testPaymentData.type}</span>
                    </div>
                  </div>
                </div>

                {/* Demo Controls */}
                <div className="space-y-4">
                  <Button onClick={runPaymentDemo} disabled={isRunningDemo} className="w-full" size="lg">
                    {isRunningDemo ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Running Demo...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Payment Demo
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetDemo}
                    variant="outline"
                    className="w-full bg-transparent"
                    disabled={isRunningDemo}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Demo
                  </Button>

                  <Button onClick={() => setShowPaymentModal(true)} variant="secondary" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Try Real Payment Modal
                  </Button>
                </div>

                {/* Demo Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Demo Status</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Progress:</span>
                    <Badge variant={isRunningDemo ? "default" : currentStep === 5 ? "secondary" : "outline"}>
                      {isRunningDemo ? "Running" : currentStep === 5 ? "Completed" : "Ready"}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(currentStep / 5) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Step {currentStep} of 5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone Simulation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  Phone Simulation
                </CardTitle>
                <CardDescription>What the user sees on their phone during payment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black rounded-2xl p-4 max-w-xs mx-auto">
                  <div className="bg-green-600 text-white p-4 rounded-lg">
                    <div className="text-center mb-3">
                      <div className="text-lg font-bold">M-PESA</div>
                      <div className="text-sm opacity-90">Safaricom</div>
                    </div>

                    {currentStep >= 2 ? (
                      <div className="space-y-2 text-sm">
                        <div>Pay Merchant</div>
                        <div className="font-bold">KES {testPaymentData.amount}.00</div>
                        <div>to FUNDILINK</div>
                        <div className="text-xs opacity-75 mt-2">{testPaymentData.description}</div>

                        {currentStep >= 3 && (
                          <div className="mt-3 p-2 bg-green-700 rounded text-center">
                            {currentStep === 3
                              ? "Enter PIN..."
                              : currentStep === 4
                                ? "Processing..."
                                : "Payment Successful!"}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-sm opacity-75">Waiting for payment request...</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Flow Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Flow Steps</CardTitle>
              <CardDescription>Real-time visualization of the M-Pesa payment process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 ${
                      step.status === "active"
                        ? "bg-blue-50 border border-blue-200"
                        : step.status === "completed"
                          ? "bg-green-50 border border-green-200"
                          : step.status === "failed"
                            ? "bg-red-50 border border-red-200"
                            : "bg-gray-50"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">{getStepIcon(step.status)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`font-medium ${
                            step.status === "completed"
                              ? "text-green-900"
                              : step.status === "active"
                                ? "text-blue-900"
                                : step.status === "failed"
                                  ? "text-red-900"
                                  : "text-gray-700"
                          }`}
                        >
                          {step.title}
                        </h4>

                        {step.timestamp && <span className="text-xs text-gray-500">{step.timestamp}</span>}
                      </div>

                      <p
                        className={`text-sm mt-1 ${
                          step.status === "completed"
                            ? "text-green-700"
                            : step.status === "active"
                              ? "text-blue-700"
                              : step.status === "failed"
                                ? "text-red-700"
                                : "text-gray-600"
                        }`}
                      >
                        {step.description}
                      </p>

                      {step.status === "active" && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                            <span className="text-xs text-blue-600">Processing...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {currentStep === 5 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <h4 className="font-medium text-green-900">Payment Completed Successfully!</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Transaction ID: MPE{Date.now().toString().slice(-8)}
                      </p>
                      <p className="text-sm text-green-700">
                        Receipt: {testPaymentData.testPhone} confirmed payment of KES {testPaymentData.amount}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Technical Details */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Technical Implementation Details</CardTitle>
            <CardDescription>How the M-Pesa integration works behind the scenes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">1. STK Push Initiation</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Generate OAuth token</p>
                  <p>• Format phone number</p>
                  <p>• Create payment request</p>
                  <p>• Send to M-Pesa API</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">2. User Authorization</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• User receives phone prompt</p>
                  <p>• Enters M-Pesa PIN</p>
                  <p>• M-Pesa validates payment</p>
                  <p>• Processes transaction</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">3. Callback Processing</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Receive payment callback</p>
                  <p>• Update transaction status</p>
                  <p>• Process business logic</p>
                  <p>• Notify user of success</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Development Mode</h4>
              <p className="text-sm text-yellow-700">
                This demo runs in development mode where payments are simulated. In production, real M-Pesa API calls
                would be made to Safaricom's servers.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={testPaymentData.amount}
          description={testPaymentData.description}
          type={testPaymentData.type}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  )
}
