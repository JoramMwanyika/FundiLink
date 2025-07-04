import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading FundiLink</h3>
          <p className="text-sm text-gray-600 text-center">Please wait while we prepare your experience...</p>
        </CardContent>
      </Card>
    </div>
  )
}
