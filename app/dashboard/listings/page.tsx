import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Heart, Package, Edit2, Layers } from "lucide-react"
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
    <div className="space-y-8">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#073232] via-[#0a4a4a] to-[#073232] p-8 sm:p-12 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#32cd32]/5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#32cd32]/5 rounded-full -ml-36 -mb-36"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#32cd32]/20 rounded-xl flex items-center justify-center">
                <Layers className="h-6 w-6 text-[#32cd32]" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">My Listings</h1>
                <p className="text-white/70 text-sm mt-1">Manage and monitor your trade items</p>
              </div>
            </div>
          </div>
          <Button asChild className="bg-[#32cd32] hover:bg-[#28a428] text-[#073232] font-semibold h-12 px-6 shadow-lg hover:shadow-xl transition-all duration-300 sm:w-auto w-full">
            <Link href="/dashboard/listings/new">
              <Plus className="h-5 w-5 mr-2" />
              Create Listing
            </Link>
          </Button>
        </div>
      </div>

      {/* Active Listings Section */}
      {activeListings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-[#32cd32] to-transparent rounded"></div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#32cd32]/5 rounded-full border border-[#32cd32]/20">
              <div className="w-3 h-3 bg-[#32cd32] rounded-full"></div>
              <span className="font-semibold text-[#073232]">Active</span>
              <Badge className="bg-[#32cd32] text-white hover:bg-[#28a428] ml-1">{activeListings.length}</Badge>
            </div>
            <div className="flex-1 h-0.5 bg-gradient-to-l from-[#32cd32] to-transparent rounded"></div>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} isActive={true} />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Listings Section */}
      {inactiveListings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-gray-300 to-transparent rounded"></div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-200">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="font-semibold text-gray-700">Inactive</span>
              <Badge variant="outline" className="border-gray-300 text-gray-600 ml-1">{inactiveListings.length}</Badge>
            </div>
            <div className="flex-1 h-0.5 bg-gradient-to-l from-gray-300 to-transparent rounded"></div>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {inactiveListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} isActive={false} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!listings || listings.length === 0) && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 px-6 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#32cd32]/5 rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10 space-y-4">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#32cd32]/10">
              <Package className="h-10 w-10 text-[#32cd32]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#073232] mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Start by creating your first listing to begin trading with the community
              </p>
            </div>
            <Button asChild className="bg-gradient-to-r from-[#073232] to-[#0a4a4a] hover:from-[#084040] hover:to-[#073232] h-11 px-8">
              <Link href="/dashboard/listings/new">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Listing
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ListingCard({ listing, isActive }: { listing: any; isActive: boolean }) {
  // Get primary image with proper fallback logic
  const primaryImage = listing.listing_images?.find((img: any) => img.is_primary)?.url || 
                      listing.listing_images?.[0]?.url || 
                      listing.images?.[0] || 
                      null

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col h-full">
      {/* Image Section */}
      <Link href={`/listings/${listing.id}`}>
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-12 w-12 text-gray-300" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Status Badge - Top Right */}
          <div className="absolute top-3 right-3 z-10">
            <Badge 
              className={`backdrop-blur-sm ${
                isActive 
                  ? "bg-[#32cd32]/90 text-white shadow-lg" 
                  : "bg-gray-600/90 text-white shadow-lg"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </Link>
      
      {/* Content Section */}
      <div className="p-4 sm:p-5 space-y-3 flex flex-col flex-1">
        {/* Title */}
        <Link href={`/listings/${listing.id}`}>
          <h3 className="font-semibold text-sm sm:text-base text-[#073232] line-clamp-2 group-hover:text-[#32cd32] transition-colors cursor-pointer">
            {listing.title}
          </h3>
        </Link>
        
        {/* Price */}
        {listing.price > 0 && (
          <p className="text-base sm:text-lg font-bold text-[#32cd32]">
            {formatNaira(listing.price)}
          </p>
        )}
        
        {/* Stats */}
        <div className="flex gap-4 text-[10px] sm:text-xs text-gray-500 py-2 border-t border-b border-gray-100">
          <div className="flex items-center gap-1 hover:text-[#073232] transition-colors cursor-default">
            <Eye className="h-3.5 w-3.5" />
            <span className="font-medium">{listing.view_count || 0}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-[#32cd32] transition-colors cursor-default">
            <Heart className="h-3.5 w-3.5" />
            <span className="font-medium">{listing._count?.favorites || 0}</span>
          </div>
          <div className="ml-auto text-gray-400 text-[9px]">
            {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
          </div>
        </div>

        {/* Edit Button */}
        <Button 
          asChild
          className="w-full bg-[#073232] hover:bg-[#0a4a4a] text-white font-medium h-10 rounded-lg transition-all duration-300 group-hover:shadow-md mt-auto"
          size="sm"
        >
          <Link href={`/dashboard/listings/${listing.id}/edit`}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Listing
          </Link>
        </Button>
      </div>
    </div>
  )
}