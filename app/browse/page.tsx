import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BrowseFilters } from "@/components/browse/browse-filters"
import { BrowseListings } from "@/components/browse/browse-listings"
import { Skeleton } from "@/components/ui/skeleton"
import { GuestPrompt } from "@/components/browse/guest-prompt"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Grid, List, SlidersHorizontal } from "lucide-react"

export const metadata = {
  title: "Browse Listings | Swopify - Find Items & Services to Trade",
  description: "Discover thousands of items and services available for trade in Nigeria. Find electronics, furniture, fashion, services and more in your local community.",
  keywords: "trade, barter, swap, marketplace, Nigeria, Lagos, Abuja, items, services",
}

interface BrowsePageProps {
  searchParams: Promise<{ 
    category?: string
    search?: string
    sort?: string
    type?: string
    location?: string
    condition?: string
    price_min?: string
    price_max?: string
  }>
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams
  
  // Count active filters
  const activeFilters = [
    params.category,
    params.search,
    params.type,
    params.location,
    params.condition,
    params.price_min || params.price_max
  ].filter(Boolean).length

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Browse Marketplace
                </h1>
                <p className="text-muted-foreground text-lg">
                  Discover items and services available for trade in your community
                </p>
              </div>
              
              {/* Quick Actions - Desktop */}
              <div className="hidden md:flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
                <Button size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Save Search
                </Button>
              </div>
            </div>

            {/* Active Filters Summary */}
            {activeFilters > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {activeFilters} filter{activeFilters !== 1 ? 's' : ''} applied
                </Badge>
                {params.search && (
                  <Badge variant="outline">
                    Search: "{params.search}"
                  </Badge>
                )}
                {params.category && (
                  <Badge variant="outline">
                    Category: {params.category}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Guest Prompt */}
          <GuestPrompt />

          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-[300px_1fr] xl:grid-cols-[320px_1fr]">
            {/* Sidebar Filters */}
            <aside className="space-y-6">
              <div className="sticky top-24">
                <BrowseFilters 
                  selectedCategory={params.category} 
                  searchQuery={params.search}
                  sortBy={params.sort}
                  selectedType={params.type}
                  selectedLocation={params.location}
                  selectedCondition={params.condition}
                  priceMin={params.price_min}
                  priceMax={params.price_max}
                />
              </div>
            </aside>
            
            {/* Listings Content */}
            <div className="min-w-0">
              <Suspense fallback={<ListingsSkeleton />}>
                <BrowseListings 
                  category={params.category}
                  search={params.search}
                  sort={params.sort}
                  type={params.type}
                  location={params.location}
                  condition={params.condition}
                  priceMin={params.price_min}
                  priceMax={params.price_max}
                />
              </Suspense>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Can't find what you're looking for?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Post your own listing and let others know what you're offering or what you need. 
                Join thousands of traders in Nigeria's largest bartering community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Search className="h-5 w-5 mr-2" />
                  Post a Listing
                </Button>
                <Button variant="outline" size="lg">
                  <Filter className="h-5 w-5 mr-2" />
                  Create Search Alert
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function ListingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      
      {/* Grid Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/3] w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
