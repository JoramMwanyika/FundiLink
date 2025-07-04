"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, X, Send, Bot, User, Loader2, Calendar, MapPin, Wrench } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth-provider'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface BookingForm {
  service_category: string
  location: string
  date: string
  time: string
  description: string
  client_name: string
  client_phone: string
}

export function Chatbot() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m FundiLink, your AI assistant. I can help you find skilled technicians (fundis) and book appointments. What service do you need today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    service_category: '',
    location: '',
    date: '',
    time: '',
    description: '',
    client_name: '',
    client_phone: ''
  })
  const [isBooking, setIsBooking] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    addMessage('user', userMessage)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      const data = await response.json()

      if (data.success) {
        addMessage('assistant', data.response)
        
        // Check if the response suggests booking
        if (data.response.toLowerCase().includes('book') || 
            data.response.toLowerCase().includes('appointment') ||
            data.response.toLowerCase().includes('schedule')) {
          setShowBookingForm(true)
        }
      } else {
        addMessage('assistant', 'Sorry, I encountered an error. Please try again.')
      }
    } catch (error) {
      console.error('Chat error:', error)
      addMessage('assistant', 'Sorry, I\'m having trouble connecting. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookingSubmit = async () => {
    if (!bookingForm.service_category || !bookingForm.location || !bookingForm.date || 
        !bookingForm.time || !bookingForm.description || !bookingForm.client_name || 
        !bookingForm.client_phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsBooking(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_booking',
          bookingData: bookingForm
        })
      })

      const data = await response.json()

      if (data.success) {
        addMessage('assistant', data.response)
        setShowBookingForm(false)
        setBookingForm({
          service_category: '',
          location: '',
          date: '',
          time: '',
          description: '',
          client_name: '',
          client_phone: ''
        })
        toast({
          title: "Booking Created",
          description: "Your booking has been successfully created!",
        })
      } else {
        addMessage('assistant', data.response || 'Failed to create booking. Please try again.')
      }
    } catch (error) {
      console.error('Booking error:', error)
      addMessage('assistant', 'Sorry, I encountered an error while creating your booking.')
    } finally {
      setIsBooking(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  if (!user) return null

  return (
    <>
      {/* Chatbot Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chatbot Window */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 z-40 w-96 h-[500px] shadow-xl border-2">
          <CardHeader className="pb-3 bg-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <CardTitle className="text-lg">FundiLink Assistant</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 h-full flex flex-col">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === 'assistant' && (
                          <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Booking Form */}
            {showBookingForm && (
              <div className="border-t p-4 bg-muted/50">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Service (e.g., plumber)"
                      value={bookingForm.service_category}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, service_category: e.target.value }))}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Location"
                      value={bookingForm.location}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, location: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                      className="text-sm"
                    />
                    <Input
                      type="time"
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, time: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <Input
                    placeholder="Your name"
                    value={bookingForm.client_name}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, client_name: e.target.value }))}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Phone number"
                    value={bookingForm.client_phone}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, client_phone: e.target.value }))}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Description of work needed"
                    value={bookingForm.description}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, description: e.target.value }))}
                    className="text-sm"
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleBookingSubmit}
                      disabled={isBooking}
                      className="flex-1 text-sm"
                      size="sm"
                    >
                      {isBooking ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        'Book Now'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowBookingForm(false)}
                      className="text-sm"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
} 