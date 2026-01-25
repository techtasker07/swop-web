"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline"
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
        return <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
      case 'accepted':
        return <CheckCircleIcon className="h-4 w-4 text-blue-600" />
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-orange-600" />
      case 'rejected':
        return <XCircleIcon className="h-4 w-4 text-red-600" />
      default:
        return <ExclamationCircleIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Trades</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/trades" className="flex items-center space-x-1">
              <span>View All</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trades.slice(0, 5).map((trade) => (
            <Link key={trade.id} href={`/dashboard/trades/${trade.id}`}>
              <div className="group cursor-pointer rounded-lg border border-border bg-card p-3 transition-all hover:shadow-sm hover:border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(trade.status)}
                      <h3 className="font-medium text-sm text-foreground truncate group-hover:text-primary">
                        {trade.item}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      with {trade.with}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(trade.status)}`}
                    >
                      {trade.status}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(trade.created_at), { addSuffix: true })}
                      </span>
                      <ArrowRightIcon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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