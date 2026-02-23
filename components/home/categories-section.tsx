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
    color: "bg-[#073232]/10 text-[#073232] border-[#073232]/30",
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
    color: "bg-[#32cd32]/10 text-[#32cd32] border-[#32cd32]/30",
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
    color: "bg-[#073232]/10 text-[#073232] border-[#073232]/30",
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
    color: "bg-[#32cd32]/10 text-[#32cd32] border-[#32cd32]/30",
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
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="mx-auto max-w-4xl text-center mb-8 sm:mb-12 md:mb-16">
          <Badge variant="outline" className="mb-2 sm:mb-3 md:mb-4 bg-[#32cd32]/10 text-[#32cd32] border-[#32cd32]/30 text-xs sm:text-sm">
            Popular Categories
          </Badge>
          <h2 className="mb-2 sm:mb-3 md:mb-4 text-xl sm:text-2xl md:text-3xl font-bold text-foreground lg:text-4xl px-4">
            Find What You're Looking For
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-4">
            Browse thousands of items across popular categories. From electronics to services, 
            find exactly what you need or discover something new.
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6 sm:mb-8 md:mb-12">
          {categoryConfig.map((category) => {
            const IconComponent = category.icon
            const count = getCategoryCount(category.dbName)
            const isTrending = count > 0 // Simple trending logic - has items
            
            return (
              <Link key={category.name} href={`/browse?category=${encodeURIComponent(category.dbName)}`}>
                <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-gray-200">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4">
                      <div className={`flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-md sm:rounded-lg ${category.color} shadow-sm group-hover:shadow-md transition-shadow`}>
                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                      </div>
                      {isTrending && count > 5 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-[10px] sm:text-xs hidden sm:flex">
                          <TrendingUp className="mr-0.5 sm:mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Hot
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="mb-1 sm:mb-1.5 md:mb-2 text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {category.name}
                    </h3>
                    
                    <p className="mb-2 sm:mb-2.5 md:mb-3 text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {category.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground">
                        {loading ? "..." : `${formatCount(count)} items`}
                      </span>
                      <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline" className="bg-white hover:bg-gray-50 border-gray-300 shadow-sm text-sm sm:text-base w-full sm:w-auto">
            <Link href="/categories">
              View All Categories
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
