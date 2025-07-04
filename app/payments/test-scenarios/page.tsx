"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaymentModal } from "@/components/payment-modal"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Smartphone, Users, Crown, CheckCircle, XCircle, Clock } from "lucide-react"

interface TestScenario {
  id: string
  title: string
  description: string
  amount: number
  type: "subscription" | "booking_payment" | "commission"
  icon: React.ReactNode
  color: string
  testPhone: string
  expectedResult: "success" | "failure" | "timeout"
}

export default function PaymentTestScenariosPage() {
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, "success" | "failure" | "pending">>({})
  const { toast } = useToast()

  const testScenarios: TestScenario[] = [
    {
      id: "subscription-basic",
      title: "Basic Subscription",
      description: "Weekly basic plan subscription payment",
      amount: 50,
      type: "subscription",
      icon: <CreditCard className="h-5 w-5" />,
      color: "bg-blue-50 border-blue-200",
      testPhone: "+254 700 000 001",
      expectedResult: "success",
    },
    {
      id: "subscription-premium",
      title: "Premium Subscription",
      description: "Monthly premium plan with all features",
      amount: 700,
      type: "subscription",
      icon: <Crown className="h-5 w-5" />,
      color: "bg-purple-50 border-purple-200",
      testPhone: "+254 700 000 002",
      expectedResult: "success",
    },
    {
      id: "booking-plumber",
      title: "Plumbing Service",
      description: "Emergency plumbing repair booking",
      amount: 1500,
      type: "booking_payment",
      icon: <Users className="h-5 w-5" />,
      color: "bg-green-50 border-green-200",
      testPhone: "+254 700 000 003",
      expectedResult: "success",
    },
    {
      id: "booking-electrician",
      title: "Electrical Service",
      description: "Home electrical installation",
      amount: 2500,
      type: "booking_payment",
      icon: <Users className="h-5 w-5" />,
      color: "bg-yellow-50 border-yellow-200",
      testPhone: "+254 700 000 004",
      expectedResult: "success",
    },
    {
      id: "commission-payment",
      title: "Commission Payment",
      description: "Platform commission collection",
      amount: 250,
      type: "commission",
      icon: <Smartphone className="h-5 w-5" />,
      color: "bg-orange-50 border-orange-200",
      testPhone: "+254 700 000 005",
      expectedResult: "success",
    },
    {
      id: "failed-payment",
      title: "Failed Payment Test",
      description: "Test payment failure scenario",
      amount: 100,
      type: "subscription",
      icon: <XCircle className="h-5 w-5" />,
      color: "bg-red-50 border-red-200",
      testPhone: "+254 700 000 999",
      expectedResult: "failure",
    },
  ]

  const handleTestScenario = (scenario: TestScenario) => {
    setSelectedScenario(scenario)
    setShowPaymentModal(true)
    setTestResults((prev) => ({ ...prev, [scenario.id]: "pending" }))
  }

  const handlePaymentSuccess = () => {
    if (selectedScenario) {
      setTestResults((prev) => ({ ...prev, [selectedScenario.id]: "success" }))
      toast({
        title: "Test Successful!",
        description: `${selectedScenario.title} payment completed successfully`,
      })
    }
    setShowPaymentModal(false)
  }

  const handlePaymentFailure = () => {
    if (selectedScenario) {
      setTestResults((prev) => ({ ...prev, [selectedScenario.id]: "failure" }))
      toast({
        title: "Test Failed",
        description: `${selectedScenario.title} payment failed as expected`,
        variant: "destructive",
      })
    }
    setShowPaymentModal(false)
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failure":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
      default:
        return null
    }
  }

  const getResultBadge = (result: string) => {
    switch (result) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "failure":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Testing...</Badge>
      default:
        return <Badge variant="outline">Not Tested</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Payment Test Scenarios</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payment Testing Suite</CardTitle>
            <CardDescription>
              Test different payment scenarios with various amounts, types, and expected outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{testScenarios.length}</div>
                <div className="text-sm text-gray-600">Total Scenarios</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(testResults).filter((r) => r === "success").length}
                </div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(testResults).filter((r) => r === "failure").length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {Object.values(testResults).filter((r) => r === "pending").length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Scenarios Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testScenarios.map((scenario) => (
            <Card key={scenario.id} className={`${scenario.color} hover:shadow-lg transition-shadow`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {scenario.icon}
                    <CardTitle className="text-lg">{scenario.title}</CardTitle>
                  </div>
                  {testResults[scenario.id] && getResultIcon(testResults[scenario.id])}
                </div>
                <CardDescription>{scenario.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">KES {scenario.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold capitalize">{scenario.type.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Test Phone:</span>
                    <span className="font-mono text-xs">{scenario.testPhone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expected:</span>
                    <Badge
                      variant={scenario.expectedResult === "success" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {scenario.expectedResult}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => handleTestScenario(scenario)}
                    className="w-full"
                    disabled={testResults[scenario.id] === "pending"}
                  >
                    {testResults[scenario.id] === "pending" ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-pulse" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Test Payment
                      </>
                    )}
                  </Button>

                  <div className="flex justify-center">{getResultBadge(testResults[scenario.id] || "")}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Test Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
            <CardDescription>How to use the payment test scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Test Phone Numbers</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Success scenarios:</span>
                    <span className="font-mono">+254 700 000 001-005</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failure scenario:</span>
                    <span className="font-mono">+254 700 000 999</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Any valid number:</span>
                    <span className="font-mono">+254 7XX XXX XXX</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">What Each Test Does</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    • <strong>Subscription:</strong> Tests fundi plan payments
                  </p>
                  <p>
                    • <strong>Booking:</strong> Tests service payment flow
                  </p>
                  <p>
                    • <strong>Commission:</strong> Tests platform fee collection
                  </p>
                  <p>
                    • <strong>Failed Payment:</strong> Tests error handling
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Development Mode</h4>
              <p className="text-sm text-blue-700">
                All payments are simulated in development mode. Real M-Pesa integration would require production
                credentials and actual phone numbers.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        {selectedScenario && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false)
              if (testResults[selectedScenario.id] === "pending") {
                handlePaymentFailure()
              }
            }}
            amount={selectedScenario.amount}
            description={selectedScenario.description}
            type={selectedScenario.type}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  )
}
