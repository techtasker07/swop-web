"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, Wrench, Users, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface Stats {
  totalListings: number
  totalItems: number
  totalServices: number
  totalUsers: number
}

export function CategoryStats() {
  const [stats, setStats] = useState<Stats>({
    totalListings: 0,
    totalItems: 0,
    totalServices: 0,
    totalUsers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()
      
      try {
        // Get total listings
        const { count: totalListings } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('is_available', true)

        // Get total items
        const { count: totalItems } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('is_available', true)
          .eq('type', 'item')

        // Get total services
        const { count: totalServices } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('is_available', true)
          .eq('type', 'service')

        // Get total users
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)

        setStats({
          totalListings: totalListings || 0,
          totalItems: totalItems || 0,
          totalServices: totalServices || 0,
          totalUsers: totalUsers || 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Listings",
      value: stats.totalListings,
      icon: TrendingUp,
      description: "Active listings available for trade"
    },
    {
      title: "Physical Items",
      value: stats.totalItems,
      icon: Package,
      description: "Tangible items ready to swap"
    },
    {
      title: "Services",
      value: stats.totalServices,
      icon: Wrench,
      description: "Skills and services offered"
    },
    {
      title: "Community Members",
      value: stats.totalUsers,
      icon: Users,
      description: "Active traders in our community"
    }
  ]

  return (
    <div className="mb-8 sm:mb-10 md:mb-12 grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#073232]/10 to-[#32cd32]/10">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#073232]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    {stat.title}
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    {loading ? "..." : stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}