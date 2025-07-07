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
import type { Booking } from '@/lib/models'

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
  const [isScrolledUp, setIsScrolledUp] = useState(false)
  const [fundiBookings, setFundiBookings] = useState<Booking[]>([])
  const [showAppointments, setShowAppointments] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleScroll = () => {
    if (!scrollAreaRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
    setIsScrolledUp(scrollTop + clientHeight < scrollHeight - 50)
  }

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages(prev => {
      if (role === 'assistant' && prev.length > 0 && prev[prev.length - 1].role === 'assistant' && prev[prev.length - 1].content === content) {
        return prev
      }
      return [...prev, {
        id: Date.now().toString(),
        role,
        content,
        timestamp: new Date()
      }]
    })
  }

  const showBookingFormOnce = () => {
    setShowBookingForm(prev => prev ? true : true)
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    addMessage('user', userMessage)
    setIsLoading(true)

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('fundilink_token') : null
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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
        
        if ((data.response.toLowerCase().includes('book') || data.response.toLowerCase().includes('appointment') || data.response.toLowerCase().includes('schedule')) && !showBookingForm) {
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
      const token = typeof window !== 'undefined' ? localStorage.getItem('fundilink_token') : null
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m FundiLink, your AI assistant. I can help you find skilled technicians (fundis) and book appointments. What service do you need today?',
        timestamp: new Date()
      }
    ])
    setShowBookingForm(false)
  }

  // Fetch fundi bookings if user is fundi
  useEffect(() => {
    if (user && user.role === 'fundi') {
      fetch(`/api/bookings?userId=${user.id}&role=fundi`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setFundiBookings(data.bookings)
        })
    }
  }, [user])

  if (!user) return null

  return (
    <>
      {/* Chatbot Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        size="icon"
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chatbot Window */}
      {isOpen && (
        <Card
          className="fixed bottom-0 right-0 md:bottom-20 md:right-4 z-40 w-full md:w-96 max-w-full h-full md:h-[500px] shadow-xl border-2 chatbot-window animate-fade-in flex flex-col md:rounded-lg rounded-none"
          style={{ maxHeight: '100dvh' }}
        >
          <CardHeader className="pb-3 bg-primary text-primary-foreground chatbot-drag-handle cursor-move rounded-t-lg md:rounded-t-lg rounded-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <CardTitle className="text-lg">FundiLink Assistant</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={clearChat} className="text-primary-foreground hover:bg-primary-foreground/20" aria-label="Clear chat">
                  <span className="text-xs">Clear</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary-foreground/20" aria-label="Close chatbot">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-xs mt-1 opacity-80">Welcome to FundiLink! Ask me anything about finding or booking a fundi.</div>
            {user && user.role === 'fundi' && (
              <Button
                className="mt-2 text-xs bg-white/10 hover:bg-white/20 text-primary-foreground border border-white/20"
                size="sm"
                onClick={() => setShowAppointments((v) => !v)}
              >
                {showAppointments ? 'Hide My Appointments' : 'Show My Appointments'}
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col h-full min-h-0">
            {/* Fundi Appointments */}
            {user && user.role === 'fundi' && showAppointments && (
              <div className="p-4 overflow-y-auto flex-1">
                <h4 className="font-semibold mb-2 flex items-center text-primary">
                  <Calendar className="h-4 w-4 mr-2" />
                  My Appointments
                </h4>
                {fundiBookings.length === 0 ? (
                  <div className="text-muted-foreground">No appointments found.</div>
                ) : (
                  <ul className="space-y-2">
                    {fundiBookings.map((b) => (
                      <li key={b.id} className="bg-muted/60 rounded p-2 border border-border/20">
                        <div className="font-medium">{b.service_category} - {b.status}</div>
                        <div className="text-xs">{b.date} at {b.time}</div>
                        <div className="text-xs">Client: {b.client_name}</div>
                        <div className="text-xs">Location: {b.location}</div>
                        <div className="text-xs">Description: {b.description}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {/* Messages Area */}
            {!showAppointments && (
              <ScrollArea className="flex-1 p-4 min-h-0" ref={scrollAreaRef} onScroll={handleScroll}>
                <div className="space-y-4 pb-4 md:pb-0">
                  {messages.map((message, idx) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 shadow-md transition-all duration-200 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground self-end'
                            : 'bg-muted/80 text-foreground self-start border border-border/30'
                        }`}
                        style={{ animationDelay: `${idx * 30}ms` }}
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
                    <div className="flex justify-start animate-fade-in">
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
                {isScrolledUp && (
                  <Button
                    className="fixed bottom-32 right-8 z-50 animate-fade-in"
                    size="sm"
                    onClick={scrollToBottom}
                    variant="secondary"
                  >
                    Scroll to latest
                  </Button>
                )}
              </ScrollArea>
            )}
            {/* Booking Form (only for non-fundi users) */}
            {user && user.role !== 'fundi' && showBookingForm && (
              <div className="border-t p-4 bg-muted/50 rounded-b-lg animate-fade-in flex flex-col max-h-[60vh] md:max-h-[300px]">
                <h4 className="font-semibold mb-2 flex items-center text-primary">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book a Fundi Appointment
                </h4>
                <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                  {/* Service & Location */}
                  <div>
                    <label className="block text-xs font-medium mb-1">Service Category</label>
                    <div className="relative">
                      <select
                        value={bookingForm.service_category}
                        onChange={e => setBookingForm(prev => ({ ...prev, service_category: e.target.value }))}
                        className="w-full text-sm rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select service...</option>
                        <option value="plumber">Plumber</option>
                        <option value="electrician">Electrician</option>
                        <option value="mechanic">Mechanic</option>
                        <option value="cleaner">Cleaner</option>
                        <option value="carpenter">Carpenter</option>
                        <option value="general">General</option>
                      </select>
                      <Wrench className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    {isBooking && !bookingForm.service_category && (
                      <span className="text-xs text-destructive">Service is required</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Location</label>
                    <div className="relative">
                      <select
                        value={bookingForm.location}
                        onChange={e => setBookingForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full text-sm rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select location...</option>
                        <option value="Nairobi">Nairobi</option>
                        <option value="Mombasa">Mombasa</option>
                        <option value="Kisumu">Kisumu</option>
                        <option value="Nakuru">Nakuru</option>
                        <option value="Eldoret">Eldoret</option>
                        <option value="Thika">Thika</option>
                        <option value="Other">Other</option>
                      </select>
                      <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    {isBooking && !bookingForm.location && (
                      <span className="text-xs text-destructive">Location is required</span>
                    )}
                  </div>
                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Date</label>
                      <Input
                        type="date"
                        value={bookingForm.date}
                        onChange={e => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                        className="text-sm"
                        aria-label="Booking date"
                      />
                      {isBooking && !bookingForm.date && (
                        <span className="text-xs text-destructive">Date is required</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Time</label>
                      <Input
                        type="time"
                        value={bookingForm.time}
                        onChange={e => setBookingForm(prev => ({ ...prev, time: e.target.value }))}
                        className="text-sm"
                        aria-label="Booking time"
                      />
                      {isBooking && !bookingForm.time && (
                        <span className="text-xs text-destructive">Time is required</span>
                      )}
                    </div>
                  </div>
                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Your Name</label>
                      <Input
                        placeholder="Full name"
                        value={bookingForm.client_name}
                        onChange={e => setBookingForm(prev => ({ ...prev, client_name: e.target.value }))}
                        className="text-sm"
                        aria-label="Your name"
                      />
                      {isBooking && !bookingForm.client_name && (
                        <span className="text-xs text-destructive">Name is required</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Phone Number</label>
                      <Input
                        placeholder="e.g. +2547XXXXXXXX"
                        value={bookingForm.client_phone}
                        onChange={e => setBookingForm(prev => ({ ...prev, client_phone: e.target.value }))}
                        className="text-sm"
                        aria-label="Phone number"
                      />
                      <span className="text-xs text-muted-foreground">Format: +2547XXXXXXXX</span>
                      {isBooking && !bookingForm.client_phone && (
                        <span className="text-xs text-destructive">Phone is required</span>
                      )}
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium mb-1">Description</label>
                    <Input
                      placeholder="Describe the work needed..."
                      value={bookingForm.description}
                      onChange={e => setBookingForm(prev => ({ ...prev, description: e.target.value }))}
                      className="text-sm"
                      aria-label="Description"
                    />
                    <span className="text-xs text-muted-foreground">Be as detailed as possible for better service.</span>
                    {isBooking && !bookingForm.description && (
                      <span className="text-xs text-destructive">Description is required</span>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex space-x-2 mt-2 pt-2 bg-muted/80 sticky bottom-0 z-10">
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
            )}
            {/* Input Area */}
            <div className="border-t p-4 bg-background/80 sticky bottom-0 z-50 flex-shrink-0">
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
                  className="shrink-0"
                  aria-label="Send message"
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