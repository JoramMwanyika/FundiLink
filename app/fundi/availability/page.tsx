"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, CalendarIcon, Save, Plus, Trash2 } from "lucide-react"

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  isBooked: boolean
  bookingId?: string
}

interface DayAvailability {
  date: string
  isAvailable: boolean
  timeSlots: TimeSlot[]
}

export default function FundiAvailabilityPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [availability, setAvailability] = useState<DayAvailability[]>([])
  const [loading, setLoading] = useState(false)
  const [isGloballyAvailable, setIsGloballyAvailable] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "fundi") {
      router.push("/login")
      return
    }
    loadAvailability()
  }, [user, router])

  const loadAvailability = () => {
    // Mock availability data
    const mockAvailability: DayAvailability[] = [
      {
        date: "2024-12-31",
        isAvailable: true,
        timeSlots: [
          { id: "1", startTime: "08:00", endTime: "10:00", isBooked: false },
          { id: "2", startTime: "10:00", endTime: "12:00", isBooked: true, bookingId: "booking1" },
          { id: "3", startTime: "14:00", endTime: "16:00", isBooked: false },
          { id: "4", startTime: "16:00", endTime: "18:00", isBooked: false },
        ],
      },
      {
        date: "2025-01-01",
        isAvailable: false,
        timeSlots: [],
      },
      {
        date: "2025-01-02",
        isAvailable: true,
        timeSlots: [
          { id: "5", startTime: "09:00", endTime: "11:00", isBooked: false },
          { id: "6", startTime: "11:00", endTime: "13:00", isBooked: false },
          { id: "7", startTime: "14:00", endTime: "16:00", isBooked: true, bookingId: "booking2" },
        ],
      },
    ]
    setAvailability(mockAvailability)
  }

  const getSelectedDateAvailability = (): DayAvailability | null => {
    if (!selectedDate) return null
    const dateString = selectedDate.toISOString().split("T")[0]
    return availability.find((day) => day.date === dateString) || null
  }

  const toggleDayAvailability = (date: Date, isAvailable: boolean) => {
    const dateString = date.toISOString().split("T")[0]
    setAvailability((prev) => {
      const existing = prev.find((day) => day.date === dateString)
      if (existing) {
        return prev.map((day) =>
          day.date === dateString
            ? {
                ...day,
                isAvailable,
                timeSlots: isAvailable ? day.timeSlots : [],
              }
            : day,
        )
      } else {
        return [
          ...prev,
          {
            date: dateString,
            isAvailable,
            timeSlots: isAvailable
              ? [
                  { id: `${Date.now()}-1`, startTime: "08:00", endTime: "10:00", isBooked: false },
                  { id: `${Date.now()}-2`, startTime: "10:00", endTime: "12:00", isBooked: false },
                  { id: `${Date.now()}-3`, startTime: "14:00", endTime: "16:00", isBooked: false },
                  { id: `${Date.now()}-4`, startTime: "16:00", endTime: "18:00", isBooked: false },
                ]
              : [],
          },
        ]
      }
    })
  }

  const addTimeSlot = (date: Date, startTime: string, endTime: string) => {
    const dateString = date.toISOString().split("T")[0]
    const newSlot: TimeSlot = {
      id: `${Date.now()}`,
      startTime,
      endTime,
      isBooked: false,
    }

    setAvailability((prev) =>
      prev.map((day) =>
        day.date === dateString
          ? {
              ...day,
              timeSlots: [...day.timeSlots, newSlot].sort((a, b) => a.startTime.localeCompare(b.startTime)),
            }
          : day,
      ),
    )
  }

  const removeTimeSlot = (date: Date, slotId: string) => {
    const dateString = date.toISOString().split("T")[0]
    setAvailability((prev) =>
      prev.map((day) =>
        day.date === dateString
          ? {
              ...day,
              timeSlots: day.timeSlots.filter((slot) => slot.id !== slotId),
            }
          : day,
      ),
    )
  }

  const saveAvailability = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Availability Updated",
        description: "Your availability has been saved successfully",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save availability. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedDayAvailability = getSelectedDateAvailability()
  const timeOptions = [
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ]

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute inset-0 glow-effect"></div>

      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm bg-background/80 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link href="/fundi/dashboard">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Manage Availability</h1>
                <p className="text-muted-foreground">Set your working hours and available time slots</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Available for bookings:</span>
                <Switch checked={isGloballyAvailable} onCheckedChange={setIsGloballyAvailable} />
                <span className={`text-sm font-medium ${isGloballyAvailable ? "text-green-500" : "text-red-500"}`}>
                  {isGloballyAvailable ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="gradient-text flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Select Date
              </CardTitle>
              <CardDescription>Choose a date to manage your availability</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border border-border/50 bg-background/30"
                disabled={(date) => date < new Date()}
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Legend:</span>
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>Unavailable</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Day Availability */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="gradient-text">
                      {selectedDate ? selectedDate.toLocaleDateString() : "Select a Date"}
                    </CardTitle>
                    <CardDescription>Manage time slots for this day</CardDescription>
                  </div>
                  {selectedDate && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Available:</span>
                      <Switch
                        checked={selectedDayAvailability?.isAvailable || false}
                        onCheckedChange={(checked) => toggleDayAvailability(selectedDate, checked)}
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedDate ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a date from the calendar to manage availability</p>
                  </div>
                ) : !selectedDayAvailability?.isAvailable ? (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">You're not available on this day</p>
                    <Button
                      onClick={() => toggleDayAvailability(selectedDate, true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Make Available
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Time Slots */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Time Slots</h4>
                      {selectedDayAvailability.timeSlots.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-border/50 rounded-lg">
                          <p className="text-muted-foreground">No time slots set for this day</p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                          {selectedDayAvailability.timeSlots.map((slot) => (
                            <div
                              key={slot.id}
                              className={`p-3 rounded-lg border flex items-center justify-between ${
                                slot.isBooked
                                  ? "bg-red-500/10 border-red-500/20"
                                  : "bg-green-500/10 border-green-500/20"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-3 h-3 rounded-full ${slot.isBooked ? "bg-red-500" : "bg-green-500"}`}
                                ></div>
                                <span className="font-medium">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                {slot.isBooked && <Badge variant="destructive">Booked</Badge>}
                              </div>
                              {!slot.isBooked && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeTimeSlot(selectedDate, slot.id)}
                                  className="bg-transparent border-border/50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Time Slot */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Add Time Slot</h4>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Select>
                            <SelectTrigger className="bg-background/50 border-border/50">
                              <SelectValue placeholder="Start Time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Select>
                            <SelectTrigger className="bg-background/50 border-border/50">
                              <SelectValue placeholder="End Time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={() => addTimeSlot(selectedDate, "09:00", "11:00")}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Quick Actions</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Add morning slots
                            addTimeSlot(selectedDate, "08:00", "10:00")
                            addTimeSlot(selectedDate, "10:00", "12:00")
                          }}
                          className="bg-transparent border-border/50"
                        >
                          Add Morning (8-12)
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Add afternoon slots
                            addTimeSlot(selectedDate, "14:00", "16:00")
                            addTimeSlot(selectedDate, "16:00", "18:00")
                          }}
                          className="bg-transparent border-border/50"
                        >
                          Add Afternoon (2-6)
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Add full day
                            addTimeSlot(selectedDate, "08:00", "12:00")
                            addTimeSlot(selectedDate, "14:00", "18:00")
                          }}
                          className="bg-transparent border-border/50"
                        >
                          Add Full Day
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button onClick={saveAvailability} disabled={loading} size="lg" className="bg-primary hover:bg-primary/90">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Availability
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
