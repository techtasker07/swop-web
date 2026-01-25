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

  // Use placeholder listings if no real listings exist or there's an error
  const displayListings = (listings?.length && !error) ? listings : getPlaceholderListings(category, type)

  // Filter placeholder listings based on search and other criteria
  let filteredListings = displayListings
  
  if (search) {
    filteredListings = displayListings.filter(listing => 
      listing.title.toLowerCase().includes(search.toLowerCase()) ||
      listing.description.toLowerCase().includes(search.toLowerCase())
    )
  }

  if (condition && filteredListings.length > 0) {
    filteredListings = filteredListings.filter(listing => 
      listing.condition?.toLowerCase().replace(' ', '_') === condition
    )
  }

  if (location && filteredListings.length > 0) {
    filteredListings = filteredListings.filter(listing => 
      listing.location?.toLowerCase().includes(location.toLowerCase())
    )
  }

  if (priceMin || priceMax) {
    filteredListings = filteredListings.filter(listing => {
      const price = listing.price || 0
      const min = priceMin ? parseInt(priceMin) : 0
      const max = priceMax ? parseInt(priceMax) : Infinity
      return price >= min && price <= max
    })
  }

  if (filteredListings.length === 0) {
    return (
      <div className="space-y-6">
        <ListingsHeader count={0} />
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ListingsHeader count={filteredListings.length} />
      <ListingsGrid listings={filteredListings} />
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

function getPlaceholderListings(category?: string, type?: string) {
  const allListings = [
    {
      id: 1,
      seller_id: "placeholder-1",
      title: "iPhone 14 Pro Max",
      description: "Excellent condition iPhone 14 Pro Max, 256GB. Comes with original box, charger, and screen protector already applied.",
      category: "Electronics & Tech",
      subcategory: "Mobile Phones",
      type: "item",
      condition: "Like New",
      price: 450000,
      location: "Victoria Island, Lagos",
      images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80"],
      tags: ["iphone", "smartphone", "apple"],
      preferred_items: ["MacBook", "iPad", "Camera"],
      is_available: true,
      is_featured: true,
      view_count: 156,
      favorite_count: 23,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      seller: {
        id: "placeholder-1",
        display_name: "Adebayo Tech",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
        verification_status: "verified",
        average_rating: 4.8,
        total_ratings: 24
      },
      listing_images: [
        { url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80", is_primary: true, sort_order: 0 }
      ],
      _count: { favorites: 23 }
    },
    {
      id: 2,
      seller_id: "placeholder-2",
      title: "Modern Sofa Set",
      description: "Beautiful 3-seater sofa with matching armchair. Barely used, moving sale. Very comfortable and stylish.",
      category: "Furniture & Home",
      subcategory: "Living Room",
      type: "item",
      condition: "Good",
      price: 180000,
      location: "Ikeja, Lagos",
      images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80"],
      tags: ["sofa", "furniture", "living room"],
      preferred_items: ["Dining table", "Wardrobe", "TV stand"],
      is_available: true,
      is_featured: false,
      view_count: 89,
      favorite_count: 12,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 7200000).toISOString(),
      seller: {
        id: "placeholder-2",
        display_name: "Funmi Home",
        avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&q=80",
        verification_status: "verified",
        average_rating: 4.9,
        total_ratings: 18
      },
      listing_images: [
        { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80", is_primary: true, sort_order: 0 }
      ],
      _count: { favorites: 12 }
    },
    {
      id: 3,
      seller_id: "placeholder-3",
      title: "Web Development Services",
      description: "Professional web development services. I create modern, responsive websites using React, Next.js, and Node.js.",
      category: "Services",
      subcategory: "Technology",
      type: "service",
      condition: null,
      price: 75000,
      location: "Abuja, FCT",
      images: ["https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80"],
      tags: ["web development", "react", "nextjs"],
      preferred_items: ["Laptop", "Monitor", "Design services"],
      is_available: true,
      is_featured: true,
      view_count: 234,
      favorite_count: 45,
      created_at: new Date(Date.now() - 14400000).toISOString(),
      updated_at: new Date(Date.now() - 14400000).toISOString(),
      seller: {
        id: "placeholder-3",
        display_name: "CodeCraft NG",
        avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
        verification_status: "verified",
        average_rating: 5.0,
        total_ratings: 32
      },
      listing_images: [
        { url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80", is_primary: true, sort_order: 0 }
      ],
      _count: { favorites: 45 }
    },
    {
      id: 4,
      seller_id: "placeholder-4",
      title: "Canon EOS R5 Camera",
      description: "Professional mirrorless camera with 45MP sensor. Includes 24-70mm lens, extra batteries, and camera bag.",
      category: "Electronics & Tech",
      subcategory: "Cameras",
      type: "item",
      condition: "Good",
      price: 850000,
      location: "Port Harcourt, Rivers",
      images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80"],
      tags: ["camera", "canon", "photography"],
      preferred_items: ["Drone", "Laptop", "Lens"],
      is_available: true,
      is_featured: false,
      view_count: 67,
      favorite_count: 18,
      created_at: new Date(Date.now() - 28800000).toISOString(),
      updated_at: new Date(Date.now() - 28800000).toISOString(),
      seller: {
        id: "placeholder-4",
        display_name: "PhotoPro Studios",
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
        verification_status: "verified",
        average_rating: 4.7,
        total_ratings: 15
      },
      listing_images: [
        { url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80", is_primary: true, sort_order: 0 }
      ],
      _count: { favorites: 18 }
    },
    {
      id: 5,
      seller_id: "placeholder-5",
      title: "Designer Handbag Collection",
      description: "Authentic designer handbags in excellent condition. Includes dust bags and authenticity cards.",
      category: "Fashion & Clothing",
      subcategory: "Accessories",
      type: "item",
      condition: "Like New",
      price: 95000,
      location: "Lekki, Lagos",
      images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80"],
      tags: ["handbag", "designer", "fashion"],
      preferred_items: ["Shoes", "Jewelry", "Perfume"],
      is_available: true,
      is_featured: false,
      view_count: 123,
      favorite_count: 31,
      created_at: new Date(Date.now() - 43200000).toISOString(),
      updated_at: new Date(Date.now() - 43200000).toISOString(),
      seller: {
        id: "placeholder-5",
        display_name: "Luxury Lagos",
        avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
        verification_status: "verified",
        average_rating: 4.6,
        total_ratings: 28
      },
      listing_images: [
        { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80", is_primary: true, sort_order: 0 }
      ],
      _count: { favorites: 31 }
    },
    {
      id: 6,
      seller_id: "placeholder-6",
      title: "Mountain Bike - Trek",
      description: "Trek mountain bike, 21-speed. Recently serviced with new tires and brake pads. Perfect for trails and city riding.",
      category: "Sports & Recreation",
      subcategory: "Bicycles",
      type: "item",
      condition: "Good",
      price: 125000,
      location: "Kaduna, Kaduna",
      images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80"],
      tags: ["bicycle", "mountain bike", "trek"],
      preferred_items: ["Motorcycle", "Gym equipment", "Sports gear"],
      is_available: true,
      is_featured: false,
      view_count: 45,
      favorite_count: 8,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      seller: {
        id: "placeholder-6",
        display_name: "Adventure Gear",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
        verification_status: "unverified",
        average_rating: 4.3,
        total_ratings: 7
      },
      listing_images: [
        { url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80", is_primary: true, sort_order: 0 }
      ],
      _count: { favorites: 8 }
    }
  ]

  let filtered = allListings

  if (category) {
    filtered = filtered.filter(listing => 
      listing.category.toLowerCase().includes(category.toLowerCase())
    )
  }

  if (type) {
    filtered = filtered.filter(listing => listing.type === type)
  }

  return filtered
}
