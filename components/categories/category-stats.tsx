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
    <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "..." : stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}