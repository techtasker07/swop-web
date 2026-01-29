"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getB2BListings, hasBusinessProfile } from "@/lib/supabase/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Search, Filter, Plus, CheckCircle, Star, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Listing, Profile, ListingImage } from "@/lib/types/database"
import { formatNaira } from "@/lib/utils/currency"
import { HeaderNoB2B } from "@/components/header-no-b2b"

interface B2BListing extends Listing {
  seller: Profile
  listing_images: ListingImage[]
}

export default function B2BMarketplacePage() {
  const { user, profile, isLoading: authLoading } = useAuth()
  const [listings, setListings] = useState<B2BListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasBusinessAccess, setHasBusinessAccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const categories = [
    "all",
    "Professional Services",
    "Technology Services", 
    "Marketing & Advertising",
    "Construction & Trades",
    "Business Equipment",
    "Logistics & Transportation",
    "Financial Services",
    "Manufacturing & Production",
    "Training & Education",
    "Health & Safety"
  ]

  useEffect(() => {
    const checkBusinessAccess = async () => {
      if (user) {
        const hasAccess = await hasBusinessProfile(user.id)
        setHasBusinessAccess(hasAccess)
      }
      setIsLoading(false)
    }

    if (!authLoading) {
      checkBusinessAccess()
    }
  }, [user, authLoading])

  useEffect(() => {
    const loadListings = async () => {
      // Only load B2B listings if user has business access
      if (!hasBusinessAccess) {
        setListings([])
        return
      }

      // For business users, load their own B2B listings
      try {
        const data = await getB2BListings({
          category: selectedCategory,
          search: searchQuery,
          sort: sortBy
        })
        setListings(data)
      } catch (error) {
        console.error('Error loading B2B listings:', error)
        setListings([])
      }
    }

    if (!authLoading) {
      loadListings()
    }
  }, [authLoading, hasBusinessAccess, selectedCategory, searchQuery, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled by useEffect
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderNoB2B />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderNoB2B />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md mx-auto text-center p-8">
            <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-6">
              Please sign in to access the B2B marketplace and connect with businesses.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!hasBusinessAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderNoB2B />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <Building2 className="h-20 w-20 text-blue-600 mx-auto mb-6" />
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full p-2">
                <Star className="h-4 w-4 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to B2B Marketplace
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with businesses, access professional services, and unlock exclusive B2B trading opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Professional Network
                  </h3>
                  <p className="text-gray-600">
                    Access verified businesses and professional service providers in your area.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Verified Businesses
                  </h3>
                  <p className="text-gray-600">
                    All business profiles are verified to ensure trust and reliability.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Premium Services
                  </h3>
                  <p className="text-gray-600">
                    Access high-quality professional services and business solutions.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Plus className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    List Your Services
                  </h3>
                  <p className="text-gray-600">
                    Create a business profile and start offering your professional services.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Link href="/b2b/create-profile">
                <Building2 className="h-5 w-5 mr-2" />
                Create Business Profile
              </Link>
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Already have a business profile? Contact support to verify your account.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderNoB2B />
      
      {/* B2B Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">B2B Marketplace</h1>
                <p className="text-blue-100">Professional services and business solutions</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-yellow-400 text-yellow-900 font-semibold">
              <Star className="h-4 w-4 mr-1" />
              PRO
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Listings Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {listings.length} business {listings.length === 1 ? 'listing' : 'listings'} available
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard/listings/new?type=business">
              <Plus className="h-4 w-4 mr-2" />
              List Service
            </Link>
          </Button>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No B2B Listings Yet</h3>
            <p className="text-gray-600 mb-6">
              Be the first to list your business services in the B2B marketplace.
            </p>
            <Button asChild>
              <Link href="/dashboard/listings/new?type=business">
                <Plus className="h-4 w-4 mr-2" />
                Create B2B Listing
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <B2BListingCard key={listing.id} listing={listing} isPreview={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function B2BListingCard({ listing, isPreview = false }: { listing: B2BListing; isPreview?: boolean }) {
  // Get primary image with proper fallback logic (same as main ListingCard)
  const primaryImage = listing.listing_images?.find(img => img.is_primary)?.url || 
                      listing.listing_images?.[0]?.url || 
                      listing.images?.[0] || 
                      null
  const isVerified = listing.seller.verification_status === 'verified'

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${isPreview ? 'opacity-90' : ''}`}>
      <div className="relative">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={listing.title}
            width={400}
            height={200}
            className="w-full h-48 object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <Building2 className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className="bg-blue-600 text-white">B2B</Badge>
        </div>
        {isPreview && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              Preview Mode
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {/* Business Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            {listing.seller.logo_url ? (
              <Image
                src={listing.seller.logo_url}
                alt={listing.seller.business_name || 'Business'}
                width={40}
                height={40}
                className="rounded-lg object-cover"
              />
            ) : listing.seller.avatar_url ? (
              <Image
                src={listing.seller.avatar_url}
                alt={listing.seller.business_name || 'Business'}
                width={40}
                height={40}
                className="rounded-lg object-cover"
              />
            ) : (
              <Building2 className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900 text-sm">
                {listing.seller.business_name || listing.seller.display_name}
              </h4>
              {isVerified && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
            <p className="text-xs text-gray-500">
              {listing.seller.business_type || 'Business'}
            </p>
          </div>
        </div>

        {/* Listing Content */}
        <Link href={`/listings/${listing.id}`} className="block">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-blue-600 transition-colors">
            {listing.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {listing.description}
          </p>
        </Link>

        {/* Listing Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            {listing.location}
          </div>
          {listing.seller.average_rating > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
              {listing.seller.average_rating.toFixed(1)} rating
            </div>
          )}
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          {listing.price > 0 ? (
            <div className="text-lg font-bold text-green-600">
              {formatNaira(listing.price)}
            </div>
          ) : (
            <div className="text-sm text-gray-500">Contact for pricing</div>
          )}
          {isPreview ? (
            <Button size="sm" disabled className="opacity-50">
              Business Access Required
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link href={`/listings/${listing.id}`}>
                View Details
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}