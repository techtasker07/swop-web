"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowTrendingUpIcon,
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
      icon: ArrowTrendingUpIcon,
      color: 'text-[#32cd32]',
      bgColor: 'bg-[#32cd32]/10',
      gradient: 'from-[#32cd32]/20 to-[#32cd32]/5',
    },
    {
      label: 'Average Rating',
      value: (profile?.average_rating || 0).toFixed(1),
      icon: StarIcon,
      color: 'text-[#32cd32]',
      bgColor: 'bg-[#32cd32]/10',
      gradient: 'from-[#32cd32]/20 to-[#32cd32]/5',
    },
    {
      label: 'Successful Trades',
      value: (profile?.successful_trades || 0).toString(),
      icon: TrophyIcon,
      color: 'text-[#073232]',
      bgColor: 'bg-[#073232]/10',
      gradient: 'from-[#073232]/20 to-[#073232]/5',
    },
  ]

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className={`border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${stat.gradient}`}>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${stat.bgColor} shadow-sm group-hover:shadow-md transition-shadow`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-0.5 sm:mb-1">{stat.label}</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}