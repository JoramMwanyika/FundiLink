"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SERVICE_CATEGORIES } from "@/lib/models"
import Link from "next/link"
import { ArrowRight, Star, Users, Clock, Shield, CheckCircle, Phone } from "lucide-react"
import { AuthButtons } from "@/components/auth-buttons"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <h1 className="text-2xl font-bold gradient-text">FundiLink</h1>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full border border-primary/30">
                AI-Powered
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <AuthButtons />
              {process.env.NODE_ENV === "development" && (
                <Link href="/admin-access">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"
                  >
                    Admin Portal
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 glow-effect"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 ${isVisible ? "slide-in-left" : "opacity-0"}`}>
              <div className="space-y-4">
                <p className="text-primary font-medium tracking-wide">Hello,</p>
                <h2 className="text-5xl md:text-7xl font-bold leading-tight">
                  Connect with
                  <span className="gradient-text block">Verified Fundis</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                  Book skilled technicians instantly via web or WhatsApp. From plumbers to electricians, find the right
                  fundi for your needs with AI-powered matching.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/book">
                  <Button size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 group">
                    Book a Service
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-primary/30 hover:bg-primary/10 group bg-transparent"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  WhatsApp: +254-XXX-XXXX
                </Button>
              </div>
            </div>

            <div className={`relative ${isVisible ? "slide-in-right" : "opacity-0"}`}>
              <div className="relative w-80 h-80 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-500 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute inset-4 bg-gradient-to-r from-primary/40 to-orange-500/40 rounded-full"></div>
                <div className="absolute inset-8 bg-background rounded-full flex items-center justify-center">
                  <div className="text-6xl">🔧</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h3 className="text-4xl font-bold mb-6">
              Why Choose <span className="gradient-text">FundiLink?</span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We make finding and booking skilled technicians simple, fast, and reliable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Verified Fundis",
                description: "All technicians are background-checked and verified",
                color: "text-blue-400",
              },
              {
                icon: Clock,
                title: "Quick Booking",
                description: "Book in minutes via web or WhatsApp",
                color: "text-green-400",
              },
              {
                icon: Star,
                title: "AI Matching",
                description: "Smart AI finds the best fundi for your needs",
                color: "text-primary",
              },
              {
                icon: Users,
                title: "Trusted Network",
                description: "Join thousands of satisfied customers",
                color: "text-purple-400",
              },
            ].map((feature, index) => (
              <Card key={index} className="card-hover bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-r from-${feature.color}/20 to-${feature.color}/10 flex items-center justify-center mx-auto`}
                    >
                      <feature.icon className={`h-8 w-8 ${feature.color}`} />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-6">
              Our <span className="gradient-text">Services</span>
            </h3>
            <p className="text-xl text-muted-foreground">Choose from our wide range of professional services</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICE_CATEGORIES.map((category, index) => (
              <Card key={category.id} className="card-hover bg-card/50 border-border/50 backdrop-blur-sm group">
                <CardHeader className="text-center pb-4">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription className="text-sm">{category.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    {category.examples.slice(0, 3).map((example, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-primary mr-2 flex-shrink-0" />
                        {example}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/book?category=${category.id}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90 group">
                      Book Now
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-orange-500/5"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Trusted by <span className="gradient-text">Thousands</span>
            </h3>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "1000+", label: "Verified Fundis" },
              { number: "5000+", label: "Happy Clients" },
              { number: "10000+", label: "Jobs Completed" },
              { number: "4.9★", label: "Average Rating" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-orange-500/10"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h3 className="text-4xl font-bold mb-6">
            Ready to Get <span className="gradient-text">Started?</span>
          </h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust FundiLink for their service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book">
              <Button size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90">
                Book a Service Now
              </Button>
            </Link>
            <Link href="/register?role=fundi">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-primary/30 hover:bg-primary/10 bg-transparent"
              >
                Join as a Fundi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4 gradient-text">FundiLink</h4>
              <p className="text-muted-foreground text-sm">
                Connecting clients with verified technicians across Kenya.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>Plumbing</li>
                <li>Electrical</li>
                <li>Carpentry</li>
                <li>Cleaning</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>WhatsApp Bot</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>WhatsApp: +254-XXX-XXXX</li>
                <li>Email: support@fundilink.co.ke</li>
                <li>Nairobi, Kenya</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2024 FundiLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
