"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Phone, MessageSquare, Send, X } from "lucide-react"

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  contactName: string
  contactPhone: string
  contactType: "fundi" | "client"
  bookingId?: string
}

export function ContactModal({
  isOpen,
  onClose,
  contactName,
  contactPhone,
  contactType,
  bookingId,
}: ContactModalProps) {
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate sending message
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${contactName}`,
      })

      setMessage("")
      onClose()
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCall = () => {
    window.open(`tel:${contactPhone}`, "_self")
    toast({
      title: "Calling...",
      description: `Initiating call to ${contactName}`,
    })
  }

  const handleWhatsApp = () => {
    const whatsappMessage = encodeURIComponent(
      `Hi ${contactName}, I'm contacting you regarding our FundiLink booking${bookingId ? ` (ID: ${bookingId})` : ""}. ${message || "Looking forward to hearing from you!"}`,
    )
    window.open(`https://wa.me/${contactPhone.replace(/\D/g, "")}?text=${whatsappMessage}`, "_blank")
    toast({
      title: "Opening WhatsApp",
      description: `Opening WhatsApp chat with ${contactName}`,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-card/95 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="gradient-text">Contact {contactName}</CardTitle>
              <CardDescription>Choose how you'd like to get in touch with your {contactType}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Info */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-semibold">
                {contactName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-semibold">{contactName}</h4>
                <p className="text-sm text-muted-foreground">{contactPhone}</p>
              </div>
            </div>
          </div>

          {/* Quick Contact Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleCall}
              variant="outline"
              className="bg-transparent border-border/50 hover:bg-green-500/10 hover:border-green-500/50"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button
              onClick={handleWhatsApp}
              variant="outline"
              className="bg-transparent border-border/50 hover:bg-green-500/10 hover:border-green-500/50"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>

          {/* Send Message */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Send a Message</Label>
              <Textarea
                id="message"
                placeholder={`Write a message to ${contactName}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="bg-background/50 border-border/50"
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={loading || !message.trim()}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-muted-foreground text-center">
            <p>Messages are sent through the FundiLink platform</p>
            <p>Both parties will receive notifications</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
