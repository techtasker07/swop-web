import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Heart, Package } from "lucide-react"
import { formatNaira } from "@/lib/utils/currency"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"

export const metadata = {
  title: "My Listings | Swopify",
  description: "Manage your listings on Swopify.",
}

export default async function MyListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user's listings
  const { data: listings } = await supabase
    .from("listings")
    .select(`
      *,
      listing_images(url, is_primary, sort_order),
      _count:favorites(count)
    `)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  const activeListings = listings?.filter(listing => listing.is_available) || []
  const inactiveListings = listings?.filter(listing => !listing.is_available) || []

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#073232]">My Listings</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Manage your items and services available for trade
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-[#073232] to-[#0a4a4a] hover:from-[#084040] hover:to-[#073232] w-full sm:w-auto">
          <Link href="/dashboard/listings/new">
            <Plus className="h-4 w-4 mr-2" />
            New Listing
          </Link>
        </Button>
      </div>

      {/* Stats - Enhanced responsive */}
      <div className="grid gap-3 sm:gap-4 grid-cols-3">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#073232]/10 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#073232]" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#073232]">{listings?.length || 0}</div>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">Total Listings</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#32cd32]/10 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#32cd32]" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#32cd32]">{activeListings.length}</div>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-600" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-600">{inactiveListings.length}</div>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">Inactive</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Listings - Enhanced responsive */}
      {activeListings.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-[#32cd32]/10 border-b border-gray-200 p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <span className="text-[#073232]">Active Listings</span>
              <Badge className="bg-[#32cd32] text-white hover:bg-[#28a428]">{activeListings.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {activeListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inactive Listings - Enhanced responsive */}
      {inactiveListings.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <span className="text-[#073232]">Inactive Listings</span>
              <Badge variant="outline" className="border-gray-300">{inactiveListings.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {inactiveListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State - Enhanced responsive */}
      {(!listings || listings.length === 0) && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 sm:py-16 text-center px-4">
            <div className="mx-auto mb-4 sm:mb-6 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-[#32cd32]/10 flex items-center justify-center">
              <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-[#32cd32]" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-[#073232] mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base max-w-md mx-auto">
              Create your first listing to start trading with the community
            </p>
            <Button asChild className="bg-gradient-to-r from-[#073232] to-[#0a4a4a] hover:from-[#084040] hover:to-[#073232] w-full sm:w-auto">
              <Link href="/dashboard/listings/new">Create Your First Listing</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ListingCard({ listing }: { listing: any }) {
  // Get primary image with proper fallback logic (consistent with main ListingCard)
  const primaryImage = listing.listing_images?.find((img: any) => img.is_primary)?.url || 
                      listing.listing_images?.[0]?.url || 
                      listing.images?.[0] || 
                      null

  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="group cursor-pointer rounded-lg border border-gray-200 bg-card p-3 sm:p-4 transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
        <div className="aspect-square relative mb-3 overflow-hidden rounded-md bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={listing.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-12 w-12 text-gray-300" />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm sm:text-base text-foreground line-clamp-2 group-hover:text-[#32cd32] transition-colors">
              {listing.title}
            </h3>
            <Badge 
              className={`ml-2 text-[10px] sm:text-xs whitespace-nowrap ${
                listing.is_available 
                  ? "bg-[#32cd32] text-white hover:bg-[#28a428]" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {listing.is_available ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          {listing.price > 0 && (
            <p className="text-sm sm:text-base font-semibold text-[#32cd32]">
              {formatNaira(listing.price)}
            </p>
          )}
          
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{listing.view_count || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{listing._count?.favorites || 0}</span>
              </div>
            </div>
            <span className="hidden sm:inline">
              {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}