"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SERVICE_CATEGORIES, type Booking } from "@/lib/models"
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  Eye,
  Star,
  Award,
  Target,
  BarChart3,
} from "lucide-react"

interface EarningsData {
  period: string
  amount: number
  jobs: number
  avgRating: number
}

export default function FundiEarningsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState("this-month")
  const [completedJobs, setCompletedJobs] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "fundi") {
      router.push("/login")
      return
    }
    fetchEarningsData()
  }, [user, router])

  const fetchEarningsData = async () => {
    try {
      // Mock completed jobs data
      const mockJobs = [
        {
          _id: "1",
          clientName: "John Doe",
          fundiName: user?.name || "You",
          serviceCategory: "plumber",
          location: "Westlands, Nairobi",
          date: "2024-12-25",
          time: "09:00",
          status: "completed" as const,
          description: "Fix leaking kitchen tap",
          price: 1500,
          createdAt: "2024-12-20",
          rating: 5,
        },
        {
          _id: "2",
          clientName: "Mary Johnson",
          fundiName: user?.name || "You",
          serviceCategory: "plumber",
          location: "Karen, Nairobi",
          date: "2024-12-22",
          time: "14:00",
          status: "completed" as const,
          description: "Repair bathroom pipes",
          price: 3000,
          createdAt: "2024-12-18",
          rating: 4,
        },
        {
          _id: "3",
          clientName: "Peter Wilson",
          fundiName: user?.name || "You",
          serviceCategory: "electrician",
          location: "Embakasi, Nairobi",
          date: "2024-12-20",
          time: "16:00",
          status: "completed" as const,
          description: "Fix electrical wiring",
          price: 2000,
          createdAt: "2024-12-15",
          rating: 5,
        },
        {
          _id: "4",
          clientName: "Sarah Njeri",
          fundiName: user?.name || "You",
          serviceCategory: "electrician",
          location: "Kilimani, Nairobi",
          date: "2024-12-18",
          time: "10:00",
          status: "completed" as const,
          description: "Install new lighting",
          price: 2500,
          createdAt: "2024-12-12",
          rating: 5,
        },
        {
          _id: "5",
          clientName: "David Kimani",
          fundiName: user?.name || "You",
          serviceCategory: "plumber",
          location: "Industrial Area, Nairobi",
          date: "2024-12-15",
          time: "11:00",
          status: "completed" as const,
          description: "Pipe installation",
          price: 4000,
          createdAt: "2024-12-10",
          rating: 4,
        },
      ]
      setCompletedJobs(mockJobs)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch earnings data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getEarningsData = (): EarningsData[] => {
    const now = new Date()
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const filterJobsByPeriod = (startDate: Date, endDate?: Date) => {
      return completedJobs.filter((job) => {
        const jobDate = new Date(job.date)
        return jobDate >= startDate && (!endDate || jobDate <= endDate)
      })
    }

    const calculateStats = (jobs: Booking[]) => ({
      amount: jobs.reduce((sum, job) => sum + (job.price || 0), 0),
      jobs: jobs.length,
      avgRating: jobs.length > 0 ? jobs.reduce((sum, job) => sum + (job.rating || 0), 0) / jobs.length : 0,
    })

    const thisWeekJobs = filterJobsByPeriod(thisWeek)
    const thisMonthJobs = filterJobsByPeriod(thisMonth)
    const lastMonthJobs = filterJobsByPeriod(lastMonth, thisMonth)

    return [
      { period: "this-week", ...calculateStats(thisWeekJobs) },
      { period: "this-month", ...calculateStats(thisMonthJobs) },
      { period: "last-month", ...calculateStats(lastMonthJobs) },
      { period: "all-time", ...calculateStats(completedJobs) },
    ]
  }

  const earningsData = getEarningsData()
  const currentPeriodData = earningsData.find((data) => data.period === selectedPeriod)
  const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.price || 0), 0)
  const averageJobValue = completedJobs.length > 0 ? totalEarnings / completedJobs.length : 0
  const topServiceCategory = SERVICE_CATEGORIES.find((cat) => {
    const categoryJobs = completedJobs.filter((job) => job.serviceCategory === cat.id)
    return categoryJobs.length > 0
  })

  const handleDownloadReport = () => {
    toast({
      title: "Report Downloaded",
      description: "Your earnings report has been downloaded successfully",
    })
  }

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
                <h1 className="text-2xl font-bold gradient-text">Earnings Dashboard</h1>
                <p className="text-muted-foreground">Track your income and performance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40 bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="all-time">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleDownloadReport} variant="outline" className="bg-transparent border-border/50">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    {selectedPeriod.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())} Earnings
                  </p>
                  <p className="text-2xl font-bold gradient-text">
                    KES {currentPeriodData?.amount.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Jobs Completed</p>
                  <p className="text-2xl font-bold gradient-text">{currentPeriodData?.jobs || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold gradient-text">{currentPeriodData?.avgRating.toFixed(1) || "0.0"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Target className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg per Job</p>
                  <p className="text-2xl font-bold gradient-text">KES {Math.round(averageJobValue).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Earnings */}
              <div className="lg:col-span-2">
                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="gradient-text flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Recent Earnings
                    </CardTitle>
                    <CardDescription>Your latest completed jobs and payments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-2">Loading earnings...</p>
                      </div>
                    ) : completedJobs.length === 0 ? (
                      <div className="text-center py-8">
                        <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No completed jobs yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {completedJobs.slice(0, 5).map((job) => (
                          <div
                            key={job._id}
                            className="flex items-center justify-between p-4 bg-background/30 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{job.clientName}</h4>
                                <Badge variant="outline" className="border-border/50">
                                  {SERVICE_CATEGORIES.find((cat) => cat.id === job.serviceCategory)?.name}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  {job.date}
                                </div>
                                <p>{job.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-green-600 text-lg">+KES {job.price}</div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                {job.rating || "N/A"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Performance Summary */}
              <div className="space-y-6">
                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="gradient-text flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Jobs:</span>
                        <span className="font-semibold">{completedJobs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Earned:</span>
                        <span className="font-semibold text-green-600">KES {totalEarnings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Average Rating:</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-semibold">{user.rating || 4.8}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Top Service:</span>
                        <span className="font-semibold">{topServiceCategory?.name || "N/A"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="gradient-text">Goals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Monthly Target</span>
                        <span>KES 15,000</span>
                      </div>
                      <div className="w-full bg-muted/30 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-orange-500 h-2 rounded-full"
                          style={{ width: `${Math.min(((currentPeriodData?.amount || 0) / 15000) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(((currentPeriodData?.amount || 0) / 15000) * 100)}% of monthly goal
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Jobs Target</span>
                        <span>10 jobs</span>
                      </div>
                      <div className="w-full bg-muted/30 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${Math.min(((currentPeriodData?.jobs || 0) / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {currentPeriodData?.jobs || 0} of 10 jobs completed
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="gradient-text">All Transactions</CardTitle>
                <CardDescription>Complete history of your earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedJobs.map((job) => (
                    <div key={job._id} className="flex items-center justify-between p-4 bg-background/30 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{job.clientName}</h4>
                          <Badge variant="outline" className="border-border/50">
                            {SERVICE_CATEGORIES.find((cat) => cat.id === job.serviceCategory)?.name}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>{job.description}</p>
                          <p className="flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            {job.date} • {job.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600 text-lg">+KES {job.price}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          {job.rating || "N/A"}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="ml-4 bg-transparent border-border/50">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="gradient-text">Earnings by Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {SERVICE_CATEGORIES.filter((cat) =>
                      completedJobs.some((job) => job.serviceCategory === cat.id),
                    ).map((category) => {
                      const categoryJobs = completedJobs.filter((job) => job.serviceCategory === category.id)
                      const categoryEarnings = categoryJobs.reduce((sum, job) => sum + (job.price || 0), 0)
                      const percentage = (categoryEarnings / totalEarnings) * 100

                      return (
                        <div key={category.id} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              {category.icon} {category.name}
                            </span>
                            <span className="text-sm font-semibold">KES {categoryEarnings.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-muted/30 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary to-orange-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{categoryJobs.length} jobs</span>
                            <span>{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="gradient-text">Monthly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {earningsData.slice(0, 3).map((data) => (
                      <div
                        key={data.period}
                        className="flex items-center justify-between p-3 bg-background/30 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium capitalize">{data.period.replace("-", " ")}</h4>
                          <p className="text-sm text-muted-foreground">{data.jobs} jobs completed</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">KES {data.amount.toLocaleString()}</div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            {data.avgRating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
