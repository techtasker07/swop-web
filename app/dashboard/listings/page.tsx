import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusIcon, EyeIcon, HeartIcon } from "@heroicons/react/24/outline"
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
          <p className="text-muted-foreground">
            Manage your items and services available for trade
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/listings/new">
            <PlusIcon className="h-4 w-4 mr-2" />
            New Listing
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{listings?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Total Listings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{activeListings.length}</div>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{inactiveListings.length}</div>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Listings */}
      {activeListings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Active Listings</span>
              <Badge variant="secondary">{activeListings.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inactive Listings */}
      {inactiveListings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Inactive Listings</span>
              <Badge variant="outline">{inactiveListings.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inactiveListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!listings || listings.length === 0) && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <PlusIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first listing to start trading with the community
            </p>
            <Button asChild>
              <Link href="/dashboard/listings/new">Create Your First Listing</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ListingCard({ listing }: { listing: any }) {
  const primaryImage = listing.listing_images?.find((img: any) => img.is_primary) || listing.listing_images?.[0]

  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md">
        <div className="aspect-square relative mb-3 overflow-hidden rounded-md bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={listing.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-muted-foreground">No image</div>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary">
              {listing.title}
            </h3>
            <Badge variant={listing.is_available ? "default" : "secondary"} className="ml-2 text-xs">
              {listing.is_available ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          {listing.price > 0 && (
            <p className="text-sm font-semibold text-emerald-600">
              {formatNaira(listing.price)}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <EyeIcon className="h-3 w-3" />
                <span>{listing.view_count || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <HeartIcon className="h-3 w-3" />
                <span>{listing._count?.favorites || 0}</span>
              </div>
            </div>
            <span>
              {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}