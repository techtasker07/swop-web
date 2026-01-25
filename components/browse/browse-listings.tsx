import { createClient } from "@/lib/supabase/server"
import { ListingCard } from "@/components/listing-card"
import { Package, Grid, List, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BrowseListingsProps {
  category?: string
  search?: string
  sort?: string
  type?: string
  location?: string
  condition?: string
  priceMin?: string
  priceMax?: string
}

export async function BrowseListings({ 
  category, 
  search, 
  sort, 
  type, 
  location, 
  condition, 
  priceMin, 
  priceMax 
}: BrowseListingsProps) {
  const supabase = await createClient()
  
  let query = supabase
    .from("listings")
    .select(`
      *,
      seller:profiles!seller_id(
        id,
        display_name,
        avatar_url,
        profile_image_url,
        verification_status,
        average_rating,
        total_ratings
      ),
      listing_images(url, is_primary, sort_order),
      _count:favorites(count)
    `)
    .eq("is_available", true)

  // Apply filters
  if (category) {
    query = query.eq("category", category)
  }

  if (type) {
    query = query.eq("type", type)
  }

  if (condition) {
    query = query.eq("condition", condition)
  }

  if (location) {
    query = query.ilike("location", `%${location}%`)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`)
  }

  if (priceMin) {
    query = query.gte("price", parseInt(priceMin))
  }

  if (priceMax) {
    query = query.lte("price", parseInt(priceMax))
  }

  // Apply sorting
  switch (sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true })
      break
    case "price_asc":
      query = query.order("price", { ascending: true })
      break
    case "price_desc":
      query = query.order("price", { ascending: false })
      break
    case "alpha":
      query = query.order("title", { ascending: true })
      break
    case "popular":
      query = query.order("view_count", { ascending: false })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data: listings, error } = await query.limit(24)

  if (error) {
    console.error('Error fetching listings:', error)
  }

  const displayListings = listings || []

  if (displayListings.length === 0) {
    return (
      <div className="space-y-6">
        <ListingsHeader count={0} />
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ListingsHeader count={displayListings.length} />
      <ListingsGrid listings={displayListings} />
    </div>
  )
}

function ListingsHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-foreground">
          {count} listing{count !== 1 ? "s" : ""} found
        </h2>
        {count > 0 && (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {count} results
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Grid className="h-4 w-4 mr-2" />
          Grid
        </Button>
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          <List className="h-4 w-4 mr-2" />
          List
        </Button>
      </div>
    </div>
  )
}

function ListingsGrid({ listings }: { listings: any[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
      <div className="mb-4 rounded-full bg-secondary p-4">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">No listings found</h3>
      <p className="mb-6 text-sm text-muted-foreground max-w-md">
        We couldn't find any listings matching your criteria. Try adjusting your filters or search query.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={() => window.location.href = '/browse'}>
          <Filter className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
        <Button onClick={() => window.location.href = '/listings/new'}>
          <Package className="h-4 w-4 mr-2" />
          Post a Listing
        </Button>
      </div>
    </div>
  )
}
