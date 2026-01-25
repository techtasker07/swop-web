"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  TrendingUpIcon,
  StarIcon,
  TrophyIcon
} from "@heroicons/react/24/outline"
import type { Profile } from "@/lib/types/database"

interface ProfileStatsProps {
  profile: Profile | null
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  const stats = [
    {
      label: 'Barter Score',
      value: (profile?.barter_score || 0).toString(),
      icon: TrendingUpIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Average Rating',
      value: (profile?.average_rating || 0).toFixed(1),
      icon: StarIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Successful Trades',
      value: (profile?.successful_trades || 0).toString(),
      icon: TrophyIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}