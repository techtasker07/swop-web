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

const categories = [
  {
    name: "Electronics & Tech",
    icon: Smartphone,
    count: "2,340",
    trending: true,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Phones, laptops, gadgets",
    slug: "electronics"
  },
  {
    name: "Fashion & Apparel",
    icon: Shirt,
    count: "1,890",
    trending: false,
    color: "bg-green-100 text-green-700 border-green-200",
    description: "Clothing, shoes, accessories",
    slug: "clothing"
  },
  {
    name: "Home & Garden",
    icon: Home,
    count: "1,567",
    trending: true,
    color: "bg-green-100 text-green-700 border-green-200",
    description: "Furniture, decor, tools",
    slug: "furniture"
  },
  {
    name: "Books & Media",
    icon: Book,
    count: "1,234",
    trending: false,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Books, movies, music",
    slug: "books"
  },
  {
    name: "Sports & Outdoors",
    icon: Dumbbell,
    count: "987",
    trending: true,
    color: "bg-green-100 text-green-700 border-green-200",
    description: "Equipment, gear, fitness",
    slug: "sports"
  },
  {
    name: "Automotive",
    icon: Car,
    count: "756",
    trending: false,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Cars, parts, accessories",
    slug: "vehicles"
  },
  {
    name: "Tools & Hardware",
    icon: Wrench,
    count: "654",
    trending: false,
    color: "bg-gray-100 text-gray-700 border-gray-200",
    description: "Hand tools, power tools",
    slug: "tools"
  },
  {
    name: "Professional Services",
    icon: Briefcase,
    count: "890",
    trending: true,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Skills, consulting, tutoring",
    slug: "services"
  }
]

export function CategoriesSection() {
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
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Link key={category.name} href={`/browse?category=${category.slug}`}>
                <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${category.color} shadow-sm group-hover:shadow-md transition-shadow`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      {category.trending && (
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
                        {category.count} items
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
