"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Smartphone, 
  Shirt, 
  BookOpen, 
  Dumbbell, 
  Home, 
  Car, 
  Wrench, 
  Music, 
  Gamepad2, 
  Palette,
  Briefcase,
  MoreHorizontal,
  Hammer,
  GraduationCap,
  Heart,
  Monitor,
  Truck,
  Calendar,
  PawPrint,
  Scissors,
  ChefHat,
  Building,
  PenTool,
  Globe
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

const categoryIcons = {
  'Electronics': Smartphone,
  'Clothing': Shirt,
  'Books': BookOpen,
  'Sports': Dumbbell,
  'Home & Garden': Home,
  'Vehicles': Car,
  'Tools': Wrench,
  'Music': Music,
  'Toys & Games': Gamepad2,
  'Art & Crafts': Palette,
  'Other': MoreHorizontal,
  'Home Services': Hammer,
  'Professional Services': Briefcase,
  'Creative Services': Palette,
  'Tutoring & Education': GraduationCap,
  'Health & Wellness': Heart,
  'Tech Support': Monitor,
  'Transportation': Truck,
  'Event Services': Calendar,
  'Pet Services': PawPrint,
  'Beauty Services': Scissors,
  'Food Services': ChefHat,
  'Construction & Trades': Building,
  'Marketing & Advertising': Globe,
  'Writing & Translation': PenTool,
  'Other Services': MoreHorizontal,
}

const physicalCategories = [
  { name: 'Electronics', description: 'Phones, laptops, gadgets, and electronic devices' },
  { name: 'Clothing', description: 'Fashion, accessories, shoes, and apparel' },
  { name: 'Books', description: 'Textbooks, novels, magazines, and educational materials' },
  { name: 'Sports', description: 'Sports equipment, fitness gear, and outdoor activities' },
  { name: 'Home & Garden', description: 'Furniture, home decor, gardening tools, and appliances' },
  { name: 'Vehicles', description: 'Cars, motorcycles, bicycles, and automotive parts' },
  { name: 'Tools', description: 'Hand tools, power tools, and workshop equipment' },
  { name: 'Music', description: 'Instruments, audio equipment, and music accessories' },
  { name: 'Toys & Games', description: 'Toys, board games, video games, and collectibles' },
  { name: 'Art & Crafts', description: 'Art supplies, handmade items, and craft materials' },
  { name: 'Other', description: 'Miscellaneous items not fitting other categories' },
]

const serviceCategories = [
  { name: 'Home Services', description: 'Cleaning, repairs, maintenance, and home improvement' },
  { name: 'Professional Services', description: 'Legal, accounting, consulting, and business services' },
  { name: 'Creative Services', description: 'Design, photography, video, and artistic services' },
  { name: 'Tutoring & Education', description: 'Teaching, tutoring, and educational services' },
  { name: 'Health & Wellness', description: 'Fitness training, therapy, and wellness services' },
  { name: 'Tech Support', description: 'IT support, web development, and technical services' },
  { name: 'Transportation', description: 'Moving, delivery, and transportation services' },
  { name: 'Event Services', description: 'Event planning, catering, and entertainment services' },
  { name: 'Pet Services', description: 'Pet sitting, grooming, and veterinary services' },
  { name: 'Beauty Services', description: 'Hair, makeup, skincare, and beauty treatments' },
  { name: 'Food Services', description: 'Cooking, meal prep, and culinary services' },
  { name: 'Construction & Trades', description: 'Building, plumbing, electrical, and trade services' },
  { name: 'Marketing & Advertising', description: 'Marketing, social media, and advertising services' },
  { name: 'Writing & Translation', description: 'Content writing, editing, and translation services' },
  { name: 'Other Services', description: 'Miscellaneous services not fitting other categories' },
]

interface CategoryCount {
  category: string
  count: number
}

export function CategoriesGrid() {
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([])
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

        const categoryCountsArray = Object.entries(counts).map(([category, count]) => ({
          category,
          count
        }))

        setCategoryCounts(categoryCountsArray)
      } catch (error) {
        console.error('Error fetching category counts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryCounts()
  }, [])

  const getCategoryCount = (categoryName: string) => {
    const found = categoryCounts.find(c => c.category === categoryName)
    return found?.count || 0
  }

  const CategoryCard = ({ category, type }: { category: { name: string; description: string }, type: 'item' | 'service' }) => {
    const Icon = categoryIcons[category.name as keyof typeof categoryIcons] || MoreHorizontal
    const count = getCategoryCount(category.name)
    
    return (
      <Link href={`/browse?category=${encodeURIComponent(category.name)}&type=${type}`}>
        <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-green-100 group-hover:from-blue-200 group-hover:to-green-200 transition-colors">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  {!loading && (
                    <Badge variant="secondary" className="ml-2">
                      {count}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <div className="space-y-12">
      {/* Physical Items */}
      <section>
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-foreground">Physical Items</h2>
          <p className="text-muted-foreground">
            Trade tangible items like electronics, clothing, books, and more.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {physicalCategories.map((category) => (
            <CategoryCard key={category.name} category={category} type="item" />
          ))}
        </div>
      </section>

      {/* Services */}
      <section>
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-foreground">Services</h2>
          <p className="text-muted-foreground">
            Exchange skills and services with others in your community.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {serviceCategories.map((category) => (
            <CategoryCard key={category.name} category={category} type="service" />
          ))}
        </div>
      </section>
    </div>
  )
}