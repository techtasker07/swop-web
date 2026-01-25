import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ListingDetails } from "@/components/listings/listing-details"

interface ListingPageProps {
  params: { id: string }
  searchParams: { action?: string }
}

export async function generateMetadata({ params }: ListingPageProps) {
  const supabase = await createClient()
  
  const { data: listing } = await supabase
    .from("listings")
    .select("title, description")
    .eq("id", parseInt(params.id))
    .single()

  if (!listing) {
    return {
      title: "Listing Not Found | Swopify",
    }
  }

  return {
    title: `${listing.title} | Swopify`,
    description: listing.description.slice(0, 160),
  }
}

export default async function ListingPage({ params, searchParams }: ListingPageProps) {
  const supabase = await createClient()
  
  const { data: listing, error } = await supabase
    .from("listings")
    .select(`
      *,
      seller:profiles!seller_id(*),
      listing_images(url, is_primary, sort_order, alt_text),
      _count:favorites(count)
    `)
    .eq("id", parseInt(params.id))
    .single()

  if (error || !listing) {
    notFound()
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Increment view count (only if not the owner)
  if (user && user.id !== listing.seller_id) {
    await supabase
      .from("listings")
      .update({ view_count: (listing.view_count || 0) + 1 })
      .eq("id", listing.id)
  }

  return (
    <ListingDetails 
      listing={listing} 
      user={user}
      initialAction={searchParams.action}
    />
  )
}