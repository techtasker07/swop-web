"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArchiveBoxIcon, 
  EyeIcon, 
  ArrowPathIcon, 
  HandThumbUpIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  TrendingUpIcon,
  StarIcon
} from "@heroicons/react/24/outline"
import Link from "next/link"

interface DashboardStatsProps {
  stats: {
    active_listings: number
    total_listings: number
    pending_trades: number
    accepted_trades: number
    time_balance: number
    coin_balance: number
    barter_score: number
    average_rating: number
    total_ratings: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      label: 'Active Listings',
      value: stats.active_listings.toString(),
      icon: ArchiveBoxIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      route: '/dashboard/listings',
    },
    {
      label: 'Available Listings',
      value: stats.total_listings.toString(),
      icon: EyeIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      route: '/browse',
    },
    {
      label: 'Pending Trades',
      value: stats.pending_trades.toString(),
      icon: ArrowPathIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      route: '/dashboard/trades?tab=pending',
    },
    {
      label: 'Accepted Trades',
      value: stats.accepted_trades.toString(),
      icon: HandThumbUpIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      route: '/dashboard/trades?tab=accepted',
    },
    {
      label: 'Time Balance',
      value: `${stats.time_balance}h`,
      icon: ClockIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      route: '/dashboard/time-banking',
    },
    {
      label: 'Trade Coin',
      value: stats.coin_balance.toString(),
      icon: CurrencyDollarIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      route: '/dashboard/gift-cards',
    },
  ]

  const profileStats = [
    {
      label: 'Score',
      value: stats.barter_score.toString(),
      icon: TrendingUpIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Rating',
      value: stats.average_rating.toFixed(1),
      icon: StarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Reviews',
      value: stats.total_ratings.toString(),
      icon: StarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.route}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-foreground">
                          {stat.value}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Profile Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {profileStats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}