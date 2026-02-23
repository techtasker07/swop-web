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
import { FilterToggleButton } from "@/components/browse/filter-toggle-button"

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
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 md:py-8">
          {/* Page Header - More compact on mobile */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
                  Browse Marketplace
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                  Discover items and services available for trade
                </p>
              </div>
              
              {/* Filter Button - Mobile & Tablet */}
              <div className="lg:hidden flex-shrink-0">
                <FilterToggleButton activeFilters={activeFilters} />
              </div>

              {/* Quick Actions - Desktop only */}
              <div className="hidden lg:flex items-center gap-3">
                <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Advanced
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-[#073232] to-[#0a4a4a] hover:from-[#084040] hover:to-[#073232]">
                  <Search className="h-4 w-4 mr-2" />
                  Save Search
                </Button>
              </div>
            </div>

            {/* Active Filters Summary - More compact on mobile */}
            {activeFilters > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Filters:</span>
                <Badge variant="secondary" className="bg-[#32cd32]/10 text-[#32cd32] text-xs">
                  {activeFilters} active
                </Badge>
                {params.search && (
                  <Badge variant="outline" className="text-xs max-w-[150px] truncate">
                    "{params.search}"
                  </Badge>
                )}
                {params.category && (
                  <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                    {params.category}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Guest Prompt */}
          <GuestPrompt />

          {/* Main Content - Responsive layout */}
          <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
            {/* Sidebar Filters - Hidden on mobile by default, toggled by button */}
            <aside id="mobile-filters" className="space-y-4 sm:space-y-6 hidden lg:block">
              <div className="sticky top-20 sm:top-24">
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

          {/* Call to Action - More compact on mobile */}
          <div className="mt-8 sm:mt-12 md:mt-16">
            <div className="bg-gradient-to-br from-[#073232]/5 via-[#32cd32]/5 to-[#073232]/5 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 border border-[#073232]/10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 sm:mb-3 md:mb-4 text-center">
                Can't find what you're looking for?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6 max-w-2xl mx-auto text-center">
                Post your own listing and let others know what you're offering or what you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-[#073232] to-[#0a4a4a] hover:from-[#084040] hover:to-[#073232] w-full sm:w-auto">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Post a Listing
                </Button>
                <Button variant="outline" size="lg" className="bg-white hover:bg-gray-50 w-full sm:w-auto">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Create Alert
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 sm:h-8 w-32 sm:w-48" />
        <div className="hidden sm:flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      
      {/* Grid Skeleton - Responsive */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2 sm:space-y-3">
            <Skeleton className="aspect-[4/3] w-full rounded-md sm:rounded-lg" />
            <Skeleton className="h-4 sm:h-6 w-3/4" />
            <Skeleton className="h-3 sm:h-4 w-full" />
            <Skeleton className="h-3 sm:h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
