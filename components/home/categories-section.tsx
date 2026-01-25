"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Smartphone, 
  Shirt, 
  Book, 
  Dumbbell, 
  Home, 
  Car, 
  Wrench, 
  Music, 
  Gamepad2, 
  Palette,
  Briefcase,
  MoreHorizontal,
  ArrowRight,
  TrendingUp
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const categoryConfig = [
  {
    name: "Electronics & Tech",
    icon: Smartphone,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Phones, laptops, gadgets",
    slug: "electronics",
    dbName: "Electronics"
  },
  {
    name: "Fashion & Apparel",
    icon: Shirt,
    color: "bg-green-100 text-green-700 border-green-200",
    description: "Clothing, shoes, accessories",
    slug: "clothing",
    dbName: "Clothing"
  },
  {
    name: "Home & Garden",
    icon: Home,
    color: "bg-green-100 text-green-700 border-green-200",
    description: "Furniture, decor, tools",
    slug: "furniture",
    dbName: "Home & Garden"
  },
  {
    name: "Books & Media",
    icon: Book,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Books, movies, music",
    slug: "books",
    dbName: "Books"
  },
  {
    name: "Sports & Outdoors",
    icon: Dumbbell,
    color: "bg-green-100 text-green-700 border-green-200",
    description: "Equipment, gear, fitness",
    slug: "sports",
    dbName: "Sports"
  },
  {
    name: "Automotive",
    icon: Car,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Cars, parts, accessories",
    slug: "vehicles",
    dbName: "Vehicles"
  },
  {
    name: "Tools & Hardware",
    icon: Wrench,
    color: "bg-gray-100 text-gray-700 border-gray-200",
    description: "Hand tools, power tools",
    slug: "tools",
    dbName: "Tools"
  },
  {
    name: "Professional Services",
    icon: Briefcase,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Skills, consulting, tutoring",
    slug: "services",
    dbName: "Services"
  }
]

export function CategoriesSection() {
  const [categoryCounts, setCategoryCounts] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      const supabase = createClient()
      
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('category')
          .eq('is_available', true)

        if (error) throw error

        // Count listings per category
        const counts: { [key: string]: number } = {}
        data?.forEach(listing => {
          counts[listing.category] = (counts[listing.category] || 0) + 1
        })

        setCategoryCounts(counts)
      } catch (error) {
        console.error('Error fetching category counts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryCounts()
  }, [])

  const getCategoryCount = (dbName: string) => {
    return categoryCounts[dbName] || 0
  }

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
            Popular Categories
          </Badge>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Find What You're Looking For
          </h2>
          <p className="text-lg text-muted-foreground">
            Browse thousands of items across popular categories. From electronics to services, 
            find exactly what you need or discover something new.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
          {categoryConfig.map((category) => {
            const IconComponent = category.icon
            const count = getCategoryCount(category.dbName)
            const isTrending = count > 0 // Simple trending logic - has items
            
            return (
              <Link key={category.name} href={`/browse?category=${encodeURIComponent(category.dbName)}`}>
                <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${category.color} shadow-sm group-hover:shadow-md transition-shadow`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      {isTrending && count > 5 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          Hot
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    
                    <p className="mb-3 text-sm text-muted-foreground leading-relaxed">
                      {category.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {loading ? "..." : `${formatCount(count)} items`}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline" className="bg-white hover:bg-gray-50 border-gray-300 shadow-sm">
            <Link href="/categories">
              View All Categories
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
