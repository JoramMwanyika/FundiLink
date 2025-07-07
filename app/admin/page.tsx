"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { SERVICE_CATEGORIES, type User, type Booking } from "@/lib/models"
import { Users, Calendar, TrendingUp, Settings, Search, Eye, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/auth/login")
      return
    }
    fetchData()
  }, [user, router])

  const fetchData = async () => {
    try {
      const [usersResponse, bookingsResponse] = await Promise.all([fetch("/api/admin/users"), fetch("/api/bookings")])

      const usersData = await usersResponse.json()
      const bookingsData = await bookingsResponse.json()

      if (usersData.success) setUsers(usersData.users)
      if (bookingsData.success) setBookings(bookingsData.bookings)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: "verify" | "suspend") => {
    try {
      const response = await fetch("/api/admin/users/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ userId, action }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: `User ${action}ed successfully`,
        })
        fetchData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.phone.includes(searchTerm)
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus
    return matchesStatus
  })

  const stats = {
    totalUsers: users.length,
    totalFundis: users.filter((u) => u.role === "fundi").length,
    totalClients: users.filter((u) => u.role === "client").length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    completedBookings: bookings.filter((b) => b.status === "completed").length,
    availableFundis: users.filter((u) => u.role === "fundi" && Array.isArray(u.availability) && u.availability.some((slot) => slot.available)).length,
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute inset-0 glow-effect"></div>
      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm bg-background/80 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
              <p className="text-muted-foreground">FundiLink Platform Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="bg-transparent border-border/50">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={logout} className="bg-transparent border-border/50">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-card/80 border border-border/50 shadow-2xl shadow-primary/10 card-hover animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border border-border/50 shadow-2xl shadow-primary/10 card-hover animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-400/20 rounded-lg">
                  <Settings className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Fundis</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalFundis}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border border-border/50 shadow-2xl shadow-primary/10 card-hover animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-400/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Available Fundis</p>
                  <p className="text-2xl font-bold text-foreground">{stats.availableFundis}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border border-border/50 shadow-2xl shadow-primary/10 card-hover animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-400/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border border-border/50 shadow-2xl shadow-primary/10 card-hover animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-400/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{stats.completedBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="bookings">Booking Oversight</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage fundis and clients on the platform</CardDescription>
                <div className="flex gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="client">Clients</SelectItem>
                      <SelectItem value="fundi">Fundis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading users...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{user.name}</h4>
                              <Badge variant={user.role === "fundi" ? "default" : "secondary"}>{user.role}</Badge>
                              <Badge
                                className={
                                  user.is_verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {user.is_verified ? "Verified" : "Pending"}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>Phone: {user.phone}</div>
                              <div>Location: {user.location || "Not provided"}</div>
                              {user.categories && (
                                <div>
                                  Services:{" "}
                                  {user.categories
                                    .map((catId) => SERVICE_CATEGORIES.find((cat) => cat.id === catId)?.name)
                                    .join(", ")}
                                </div>
                              )}
                              <div>Joined: {new Date(user.created_at!).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {!user.is_verified && (
                              <Button size="sm" onClick={() => handleUserAction(user.id!, "verify")}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verify
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUserAction(user.id!, "suspend")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Oversight</CardTitle>
                <CardDescription>Monitor and manage all platform bookings</CardDescription>
                <div className="flex gap-4 mt-4">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">
                              {booking.client_name} → {booking.fundi_name}
                            </h4>
                            <Badge
                              className={
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : booking.status === "completed"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-red-100 text-red-800"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>
                              Service: {SERVICE_CATEGORIES.find((cat) => cat.id === booking.service_category)?.name}
                            </div>
                            <div>
                              Date: {booking.date} at {booking.time}
                            </div>
                            <div>Location: {booking.location}</div>
                            <div>Created: {new Date(booking.created_at!).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            Contact Parties
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Category Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {SERVICE_CATEGORIES.map((category) => {
                      const categoryBookings = bookings.filter((b) => b.service_category === category.id).length
                      const categoryFundis = users.filter((u) => u.categories?.includes(category.id)).length

                      return (
                        <div key={category.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{category.icon}</span>
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-sm text-gray-600">{categoryFundis} fundis</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{categoryBookings}</div>
                            <div className="text-sm text-gray-600">bookings</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Success Rate</span>
                      <span className="text-xl font-bold text-blue-600">
                        {Math.round((stats.completedBookings / stats.totalBookings) * 100) || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Active Fundis</span>
                      <span className="text-xl font-bold text-green-600">{stats.totalFundis}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">Total Clients</span>
                      <span className="text-xl font-bold text-purple-600">{stats.totalClients}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">Pending Bookings</span>
                      <span className="text-xl font-bold text-orange-600">{stats.pendingBookings}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Service Categories</CardTitle>
                <CardDescription>Manage available service categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {SERVICE_CATEGORIES.map((category) => (
                    <div key={category.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <span className="text-3xl mr-3">{category.icon}</span>
                          <div>
                            <h4 className="font-medium">{category.name}</h4>
                            <p className="text-sm text-gray-600">{category.description}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        <strong>Examples:</strong> {category.examples.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-6">Add New Category</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
