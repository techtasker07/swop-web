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
            listing_images(url, is_primary, sort_order),
            _count:favorites(count)
          `)
          .eq('is_available', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(8)

        if (error) throw error

        setListings(data || [])
      } catch (error) {
        console.error('Error fetching featured listings:', error)
        // Set placeholder listings on error
        setListings(getPlaceholderListings())
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedListings()
  }, [])

  const displayListings = listings.length > 0 ? listings : getPlaceholderListings()

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
              Latest Listings
            </h2>
            <p className="text-muted-foreground">
              Discover amazing items and services available for trade right now.
            </p>
          </div>
          <Button variant="outline" asChild className="gap-2 bg-white hover:bg-gray-50 border-gray-200">
            <Link href="/browse">
              View All Listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {!loading && displayListings.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4 text-gray-400">
              <Sparkles className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-4">Be the first to post a listing in your community!</p>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

function getPlaceholderListings() {
  return [
    {
      id: 1,
      seller_id: "placeholder-1",
      title: "Vintage Record Player",
      description: "Beautiful vintage turntable in excellent working condition. Perfect for vinyl enthusiasts looking to enjoy their collection.",
      category: "Electronics",
      subcategory: "Audio Equipment",
      type: "item",
      condition: "Good",
      price: 45000,
      location: "Lagos, Nigeria",
      images: ["/placeholder.jpg"],
      tags: ["vintage", "music", "turntable"],
      preferred_items: ["Guitar", "Music equipment", "Amplifier"],
      interest: ["music", "audio"],
      preferred_swap_district: null,
      is_available: true,
      is_featured: true,
      view_count: 45,
      favorite_count: 8,
      trade_count: 0,
      coordinates: null,
      time_period: null,
      duration_hours: null,
      availability_schedule: null,
      metadata: null,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      seller: {
        id: "placeholder-1",
        email: "user1@example.com",
        display_name: "Alex Johnson",
        username: "alexj",
        bio: "Music lover and vintage collector",
        profile_image_url: null,
        avatar_url: "/placeholder-user.jpg",
        phone_number: null,
        location: null,
        user_type: "personal",
        kyc_verified: true,
        barter_score: 4.8,
        gift_cards: 0,
        time_credits: 10,
        is_premium: false,
        premium_expires_at: null,
        average_rating: 4.8,
        total_ratings: 12,
        successful_trades: 8,
        business_name: null,
        business_type: null,
        business_description: null,
        business_logo_url: null,
        business_banner_url: null,
        business_website: null,
        business_phone: null,
        year_established: null,
        verification_status: "verified",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      listing_images: [
        { url: "/placeholder.jpg", is_primary: true, sort_order: 0 }
      ],
      _count: { favorites: 8 }
    },
    {
      id: 2,
      seller_id: "placeholder-2",
      title: "Professional Camera Kit",
      description: "Canon DSLR with multiple lenses and accessories. Great for photography beginners or hobbyists.",
      category: "Electronics",
      subcategory: "Cameras",
      type: "item",
      condition: "Like New",
      price: 120000,
      location: "Abuja, Nigeria",
      images: ["/placeholder.jpg"],
      tags: ["camera", "photography", "canon"],
      preferred_items: ["Laptop", "Tablet", "Drone"],
      interest: ["photography", "tech"],
      preferred_swap_district: null,
      is_available: true,
      is_featured: false,
      view_count: 67,
      favorite_count: 15,
      trade_count: 2,
      coordinates: null,
      time_period: null,
      duration_hours: null,
      availability_schedule: null,
      metadata: null,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 7200000).toISOString(),
      seller: {
        id: "placeholder-2",
        email: "user2@example.com",
        display_name: "Sarah Chen",
        username: "sarahc",
        bio: "Photography enthusiast",
        profile_image_url: null,
        avatar_url: "/placeholder-user.jpg",
        phone_number: null,
        location: null,
        user_type: "personal",
        kyc_verified: true,
        barter_score: 4.9,
        gift_cards: 5,
        time_credits: 25,
        is_premium: true,
        premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        average_rating: 4.9,
        total_ratings: 18,
        successful_trades: 15,
        business_name: null,
        business_type: null,
        business_description: null,
        business_logo_url: null,
        business_banner_url: null,
        business_website: null,
        business_phone: null,
        year_established: null,
        verification_status: "verified",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      listing_images: [
        { url: "/placeholder.jpg", is_primary: true, sort_order: 0 }
      ],
      _count: { favorites: 15 }
    },
    {
      id: 3,
      seller_id: "placeholder-3",
      title: "Gaming Setup Bundle",
      description: "Complete gaming setup including monitor, keyboard, mouse, and headset. Perfect for gamers looking to upgrade.",
      category: "Electronics",
      subcategory: "Gaming",
      type: "item",
      condition: "Good",
      price: 85000,
      location: "Port Harcourt, Nigeria",
      images: ["/placeholder.jpg"],
      tags: ["gaming", "computer", "setup"],
      preferred_items: ["Smartphone", "Tablet", "Console"],
      interest: ["gaming", "tech"],
      preferred_swap_district: null,
      is_available: true,
      is_featured: false,
      view_count: 32,
      favorite_count: 6,
      trade_count: 1,
      coordinates: null,
      time_period: null,
      duration_hours: null,
      availability_schedule: null,
      metadata: null,
      created_at: new Date(Date.now() - 10800000).toISOString(),
      updated_at: new Date(Date.now() - 10800000).toISOString(),
      seller: {
        id: "placeholder-3",
        email: "user3@example.com",
        display_name: "Mike Johnson",
        username: "mikej",
        bio: "Tech enthusiast and gamer",
        profile_image_url: null,
        avatar_url: "/placeholder-user.jpg",
        phone_number: null,
        location: null,
        user_type: "personal",
        kyc_verified: true,
        barter_score: 4.6,
        gift_cards: 2,
        time_credits: 15,
        is_premium: false,
        premium_expires_at: null,
        average_rating: 4.6,
        total_ratings: 8,
        successful_trades: 5,
        business_name: null,
        business_type: null,
        business_description: null,
        business_logo_url: null,
        business_banner_url: null,
        business_website: null,
        business_phone: null,
        year_established: null,
        verification_status: "verified",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      listing_images: [
        { url: "/placeholder.jpg", is_primary: true, sort_order: 0 }
      ],
      _count: { favorites: 6 }
    },
    {
      id: 4,
      seller_id: "placeholder-4",
      title: "Designer Furniture Set",
      description: "Modern living room furniture set including sofa, coffee table, and side tables. Excellent condition.",
      category: "Home & Garden",
      subcategory: "Furniture",
      type: "item",
      condition: "Like New",
      price: 200000,
      location: "Ibadan, Nigeria",
      images: ["/placeholder.jpg"],
      tags: ["furniture", "modern", "living room"],
      preferred_items: ["Electronics", "Art", "Books"],
      interest: ["home", "design"],
      preferred_swap_district: null,
      is_available: true,
      is_featured: true,
      view_count: 89,
      favorite_count: 12,
      trade_count: 3,
      coordinates: null,
      time_period: null,
      duration_hours: null,
      availability_schedule: null,
      metadata: null,
      created_at: new Date(Date.now() - 14400000).toISOString(),
      updated_at: new Date(Date.now() - 14400000).toISOString(),
      seller: {
        id: "placeholder-4",
        email: "user4@example.com",
        display_name: "Emma Wilson",
        username: "emmaw",
        bio: "Interior design lover",
        profile_image_url: null,
        avatar_url: "/placeholder-user.jpg",
        phone_number: null,
        location: null,
        user_type: "personal",
        kyc_verified: true,
        barter_score: 4.7,
        gift_cards: 8,
        time_credits: 20,
        is_premium: true,
        premium_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        average_rating: 4.7,
        total_ratings: 15,
        successful_trades: 12,
        business_name: null,
        business_type: null,
        business_description: null,
        business_logo_url: null,
        business_banner_url: null,
        business_website: null,
        business_phone: null,
        year_established: null,
        verification_status: "verified",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      listing_images: [
        { url: "/placeholder.jpg", is_primary: true, sort_order: 0 }
      ],
      _count: { favorites: 12 }
    }
  ]
}