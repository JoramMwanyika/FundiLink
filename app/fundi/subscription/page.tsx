"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaymentModal } from "@/components/payment-modal"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Crown, Star, Shield, TrendingUp, Calendar, Phone, Award } from "lucide-react"

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  period: string
  features: string[]
  popular?: boolean
  current?: boolean
}

export default function FundiSubscriptionPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)

  useEffect(() => {
    if (!user || user.role !== "fundi") {
      router.push("/login")
      return
    }
    fetchSubscriptionData()
  }, [user, router])

  const fetchSubscriptionData = () => {
    // Mock current subscription data
    setCurrentSubscription({
      plan: "free",
      status: "active",
      expiresAt: null,
      leadsReceived: 5,
      leadsLimit: 10,
    })
  }

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "free",
      name: "Free Plan",
      price: 0,
      period: "forever",
      features: ["Up to 10 leads per month", "Basic profile listing", "Standard support", "Mobile app access"],
      current: currentSubscription?.plan === "free",
    },
    {
      id: "basic",
      name: "Basic Plan",
      price: 500,
      period: "month",
      features: [
        "Up to 50 leads per month",
        "Priority profile listing",
        "WhatsApp integration",
        "Email support",
        "Basic analytics",
      ],
    },
    {
      id: "premium",
      name: "Premium Plan",
      price: 1000,
      period: "month",
      popular: true,
      features: [
        "Unlimited leads",
        "Top profile placement",
        "WhatsApp & SMS integration",
        "Priority support",
        "Advanced analytics",
        "Customer reviews management",
        "Booking calendar integration",
      ],
    },
    {
      id: "professional",
      name: "Professional Plan",
      price: 2000,
      period: "month",
      features: [
        "Everything in Premium",
        "Dedicated account manager",
        "Custom branding",
        "API access",
        "Advanced reporting",
        "Marketing tools",
        "24/7 phone support",
      ],
    },
  ]

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (plan.price === 0) {
      toast({
        title: "Already on Free Plan",
        description: "You're currently using the free plan",
      })
      return
    }

    setSelectedPlan(plan)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    toast({
      title: "Subscription Activated!",
      description: `You've successfully subscribed to the ${selectedPlan?.name}`,
    })

    // Update subscription status
    setCurrentSubscription({
      plan: selectedPlan?.id,
      status: "active",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      leadsReceived: 0,
      leadsLimit: selectedPlan?.id === "basic" ? 50 : selectedPlan?.id === "premium" ? 999 : 999,
    })
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free":
        return <Shield className="h-6 w-6" />
      case "basic":
        return <Star className="h-6 w-6" />
      case "premium":
        return <Crown className="h-6 w-6" />
      case "professional":
        return <Award className="h-6 w-6" />
      default:
        return <Shield className="h-6 w-6" />
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
            <Link href="/fundi/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Subscription Plans</h1>
              <p className="text-muted-foreground">Choose the plan that works best for your business</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Current Subscription Status */}
        <Card className="mb-8 bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {subscriptionPlans.find((p) => p.id === currentSubscription?.plan)?.name || "Free Plan"}
                  </h3>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <p className="text-muted-foreground">
                  {currentSubscription?.expiresAt
                    ? `Expires on ${new Date(currentSubscription.expiresAt).toLocaleDateString()}`
                    : "No expiration"}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Leads This Month</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted/30 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-orange-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min((currentSubscription?.leadsReceived / currentSubscription?.leadsLimit) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {currentSubscription?.leadsReceived}/{currentSubscription?.leadsLimit}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Quick Actions</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="bg-transparent border-border/50">
                    <Calendar className="h-4 w-4 mr-1" />
                    View Usage
                  </Button>
                  <Button size="sm" variant="outline" className="bg-transparent border-border/50">
                    <Phone className="h-4 w-4 mr-1" />
                    Support
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subscriptionPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative bg-card/50 border-border/50 backdrop-blur-sm card-hover ${
                plan.popular ? "ring-2 ring-primary/50" : ""
              } ${plan.current ? "ring-2 ring-green-500/50" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white">Current Plan</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle className="gradient-text">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    KES {plan.price.toLocaleString()}
                    {plan.price > 0 && (
                      <span className="text-lg font-normal text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
                  {plan.price === 0 && <p className="text-sm text-muted-foreground">Forever free</p>}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={plan.current}
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-transparent border border-border/50 hover:bg-primary/10"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.current ? "Current Plan" : plan.price === 0 ? "Current Plan" : "Subscribe"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card className="mt-12 bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="gradient-text">Feature Comparison</CardTitle>
            <CardDescription>Compare all features across different plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">Free</th>
                    <th className="text-center py-3 px-4">Basic</th>
                    <th className="text-center py-3 px-4">Premium</th>
                    <th className="text-center py-3 px-4">Professional</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4">Monthly Leads</td>
                    <td className="text-center py-3 px-4">10</td>
                    <td className="text-center py-3 px-4">50</td>
                    <td className="text-center py-3 px-4">Unlimited</td>
                    <td className="text-center py-3 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4">Profile Priority</td>
                    <td className="text-center py-3 px-4">Standard</td>
                    <td className="text-center py-3 px-4">High</td>
                    <td className="text-center py-3 px-4">Top</td>
                    <td className="text-center py-3 px-4">Featured</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4">WhatsApp Integration</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">✅</td>
                    <td className="text-center py-3 px-4">✅</td>
                    <td className="text-center py-3 px-4">✅</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4">Analytics</td>
                    <td className="text-center py-3 px-4">Basic</td>
                    <td className="text-center py-3 px-4">Basic</td>
                    <td className="text-center py-3 px-4">Advanced</td>
                    <td className="text-center py-3 px-4">Advanced</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4">Support</td>
                    <td className="text-center py-3 px-4">Email</td>
                    <td className="text-center py-3 px-4">Email</td>
                    <td className="text-center py-3 px-4">Priority</td>
                    <td className="text-center py-3 px-4">24/7 Phone</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mt-8 bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="gradient-text">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Can I change my plan anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">What happens if I exceed my lead limit?</h4>
              <p className="text-sm text-muted-foreground">
                You'll receive a notification when you're close to your limit. You can upgrade your plan to continue
                receiving leads.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Is there a contract or commitment?</h4>
              <p className="text-sm text-muted-foreground">
                No, all plans are month-to-month with no long-term commitment. You can cancel anytime.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={selectedPlan?.price || 0}
          description={`${selectedPlan?.name} subscription`}
          type="subscription"
          referenceId={selectedPlan?.id || ""}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  )
}
