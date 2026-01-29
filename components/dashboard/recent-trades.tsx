"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface RecentTradesProps {
  trades: Array<{
    id: string
    item: string
    with: string
    status: 'pending' | 'accepted' | 'completed' | 'rejected'
    created_at: string
  }>
}

export function RecentTrades({ trades }: RecentTradesProps) {
  if (trades.length === 0) {
    return null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="bg-green-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span>Recent Trades</span>
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
            <Link href="/dashboard/trades" className="flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {trades.slice(0, 5).map((trade) => (
            <Link key={trade.id} href={`/dashboard/trades/${trade.id}`}>
              <div className="group cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:shadow-md hover:bg-white hover:border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(trade.status)}
                      <h3 className="font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                        {trade.item}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Trading with {trade.with}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-medium ${getStatusColor(trade.status)}`}
                    >
                      {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <span>
                        {formatDistanceToNow(new Date(trade.created_at), { addSuffix: true })}
                      </span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}