"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bot, MessageCircle, Users, Calendar, MapPin, Wrench } from 'lucide-react'

export default function ChatbotPage() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">FundiLink AI Assistant</h1>
          <p className="text-xl text-muted-foreground">
            Your intelligent companion for finding and booking skilled technicians
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary" />
                <CardTitle>AI-Powered</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced AI that understands your needs and finds the perfect fundi for your job.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Verified Fundis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connect with pre-verified, skilled technicians in your area.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Instant Booking</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Book appointments instantly with just a few clicks or voice commands.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5" />
                <span>Available Services</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Plumbing</span>
                  <Badge variant="secondary">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Electrical</span>
                  <Badge variant="secondary">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mechanical</span>
                  <Badge variant="secondary">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cleaning</span>
                  <Badge variant="secondary">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Carpentry</span>
                  <Badge variant="secondary">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>General</span>
                  <Badge variant="secondary">Available</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Coverage Areas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Nairobi</span>
                  <Badge variant="outline">Full Coverage</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mombasa</span>
                  <Badge variant="outline">Full Coverage</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Kisumu</span>
                  <Badge variant="outline">Full Coverage</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Nakuru</span>
                  <Badge variant="outline">Full Coverage</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Eldoret</span>
                  <Badge variant="outline">Full Coverage</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Other Cities</span>
                  <Badge variant="outline">Expanding</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Try Our AI Assistant</CardTitle>
              <p className="text-muted-foreground">
                Click the button below to start chatting with our AI assistant. 
                You can ask for help finding fundis, get quotes, or book appointments.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setIsChatbotOpen(true)}
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
                size="lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Start Chatting
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Example Conversations */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">Example Conversations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Finding a Plumber</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted/50 p-3 rounded">
                  <p className="text-sm font-medium">You:</p>
                  <p className="text-sm">"I need a plumber in Westlands, Nairobi"</p>
                </div>
                <div className="bg-primary/10 p-3 rounded">
                  <p className="text-sm font-medium">AI:</p>
                  <p className="text-sm">"I found 3 verified plumbers in Westlands. Would you like to see their details and book an appointment?"</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Booking an Electrician</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted/50 p-3 rounded">
                  <p className="text-sm font-medium">You:</p>
                  <p className="text-sm">"I need an electrician to install new lighting tomorrow"</p>
                </div>
                <div className="bg-primary/10 p-3 rounded">
                  <p className="text-sm font-medium">AI:</p>
                  <p className="text-sm">"I'll help you book an electrician. What's your location and preferred time?"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 