"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ListingCard } from "@/components/listing-card"
import { ArrowRight, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function FeaturedListings() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      const supabase = createClient()
      
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            seller:profiles!seller_id(id, display_name, avatar_url, average_rating, verification_status),
            listing_images(url, is_primary, sort_order)
          `)
          .eq('is_available', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(8)

        if (error) throw error

        setListings(data || [])
      } catch (error) {
        console.error('Error fetching featured listings:', error)
        setListings([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedListings()
  }, [])

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="mb-6 sm:mb-8 md:mb-12 flex flex-col items-start justify-between gap-3 sm:gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="mb-1 sm:mb-2 text-lg sm:text-xl font-bold text-foreground md:text-2xl">
              Latest Listings
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Discover amazing items and services available for trade right now.
            </p>
          </div>
          <Button variant="outline" asChild className="gap-2 bg-white hover:bg-gray-50 border-gray-200 text-sm sm:text-base w-full sm:w-auto">
            <Link href="/browse">
              View All
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-md sm:rounded-lg mb-2 sm:mb-3" />
                <div className="h-3 sm:h-4 bg-gray-200 rounded mb-1.5 sm:mb-2" />
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-3/4 mb-1.5 sm:mb-2" />
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="mb-3 sm:mb-4 text-gray-400">
              <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 mx-auto" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-1 sm:mb-2">No listings yet</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4 px-4">Be the first to post a listing in your community!</p>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm sm:text-base">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}