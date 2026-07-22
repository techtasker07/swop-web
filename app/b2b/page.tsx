"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getB2BListings, hasBusinessProfile, hasBusinessVerification } from "@/lib/supabase/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Search, Filter, Plus, CheckCircle, Star, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Listing, Profile, ListingImage } from "@/lib/types/database"
import { formatNaira } from "@/lib/utils/currency"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface B2BListing extends Listing {
  seller: Profile
  listing_images: ListingImage[]
}

export default function B2BMarketplacePage() {
  const { user, profile, isLoading: authLoading } = useAuth()
  const [listings, setListings] = useState<B2BListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasBusinessAccess, setHasBusinessAccess] = useState(false)
  const [hasCACVerification, setHasCACVerification] = useState(false)
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
        const hasVerification = await hasBusinessVerification(user.id)
        setHasBusinessAccess(hasAccess)
        setHasCACVerification(hasVerification)
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
      if (!hasBusinessAccess || !hasCACVerification) {
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
  }, [authLoading, hasBusinessAccess, selectedCategory, searchQuery, sortBy, hasCACVerification])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled by useEffect
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#32cd32]"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md mx-auto text-center p-8">
            <Building2 className="h-16 w-16 text-[#32cd32] mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-6">
              Please sign in to access the B2B marketplace and connect with businesses.
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-[#073232] to-[#0a4a4a] hover:from-[#084040] hover:to-[#073232]">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!hasBusinessAccess || !hasCACVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <div className="relative inline-block">
              <Building2 className="h-16 w-16 sm:h-20 sm:w-20 text-[#32cd32] mx-auto mb-4 sm:mb-6" />
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full p-1.5 sm:p-2">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              Welcome to B2B Marketplace
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Connect with businesses, access professional services, and unlock exclusive B2B trading opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
            <Card className="p-4 sm:p-6 bg-white">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="bg-[#32cd32]/10 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#32cd32]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                    Professional Network
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Access verified businesses and professional service providers in your area.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-white">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                    Verified Businesses
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    All business profiles are verified to ensure trust and reliability.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-white">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="bg-[#073232]/10 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-[#073232]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                    Premium Services
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Access high-quality professional services and business solutions.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-white">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="bg-orange-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                    List Your Services
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Create a business profile and start offering your professional services.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center px-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-[#073232] to-[#0a4a4a] hover:from-[#084040] hover:to-[#073232] w-full sm:w-auto shadow-md">
              <Link href={hasBusinessAccess ? "/verification?type=business" : "/b2b/create-profile"}>
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {hasBusinessAccess ? "Verify CAC" : "Create Business Profile"}
              </Link>
            </Button>
            <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
              Business entities must verify CAC before exploring the B2B marketplace.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* B2B Hero Section - Updated colors and responsive */}
      <div className="bg-gradient-to-br from-[#073232]/5 via-[#32cd32]/5 to-[#073232]/5 border-b border-[#073232]/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
              <div className="bg-gradient-to-br from-[#073232]/10 to-[#32cd32]/10 p-2 sm:p-3 rounded-lg">
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-[#073232]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">B2B Marketplace</h1>
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 font-semibold shadow-md">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    PRO
                  </Badge>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">Professional services and business solutions</p>
              </div>
            </div>
            <Button asChild size="sm" className="bg-[#32cd32] hover:bg-[#28a428] text-white h-8 w-8 p-0 rounded-full flex-shrink-0">
              <Link href="/dashboard/listings/new?type=business">
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Listings Count - More compact on mobile */}
        <div className="mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            {listings.length} business {listings.length === 1 ? 'listing' : 'listings'} available
          </p>
        </div>

        {/* Listings Grid - Responsive */}
        {listings.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No B2B Listings Yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
              Be the first to list your business services in the B2B marketplace.
            </p>
            <Button asChild className="bg-gradient-to-r from-[#073232] to-[#0a4a4a] hover:from-[#084040] hover:to-[#073232] w-full sm:w-auto">
              <Link href="/dashboard/listings/new?type=business">
                <Plus className="h-4 w-4 mr-2" />
                Create B2B Listing
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {listings.map((listing) => (
              <B2BListingCard key={listing.id} listing={listing} isPreview={false} />
            ))}
          </div>
        )}
      </div>
      <Footer />
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
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white ${isPreview ? 'opacity-90' : ''}`}>
      <div className="relative">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={listing.title}
            width={400}
            height={200}
            className="w-full h-40 sm:h-48 object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-40 sm:h-48 bg-gray-200 flex items-center justify-center">
            <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <Badge className="bg-[#32cd32] text-white text-xs sm:text-sm">B2B</Badge>
        </div>
        {isPreview && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Badge variant="secondary" className="bg-white/90 text-gray-900 text-xs sm:text-sm">
              Preview Mode
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 sm:p-6">
        {/* Business Header - More compact on mobile */}
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#073232]/10 rounded-lg flex items-center justify-center flex-shrink-0">
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
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#073232]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <h4 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                {listing.seller.business_name || listing.seller.display_name}
              </h4>
              {isVerified && (
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">
              {listing.seller.business_type || 'Business'}
            </p>
          </div>
        </div>

        {/* Listing Content */}
        <Link href={`/b2b-listing-details/${listing.id}`} className="block">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 sm:mb-2 hover:text-[#073232] transition-colors line-clamp-2">
            {listing.title}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
            {listing.description}
          </p>
        </Link>

        {/* Listing Details - More compact on mobile */}
        <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>
          {listing.seller.average_rating > 0 && (
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 fill-yellow-400 text-yellow-400 flex-shrink-0" />
              {listing.seller.average_rating.toFixed(1)} rating
            </div>
          )}
        </div>

        {/* Price and Action - Stacked on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
          {listing.price > 0 ? (
            <div className="text-base sm:text-lg font-bold text-[#32cd32]">
              {formatNaira(listing.price)}
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-gray-500">Contact for pricing</div>
          )}
          {isPreview ? (
            <Button size="sm" disabled className="opacity-50 w-full sm:w-auto text-xs sm:text-sm">
              Business Access Required
            </Button>
          ) : (
            <Button size="sm" asChild className="bg-gradient-to-r from-[#073232] to-[#0a4a4a] hover:from-[#084040] hover:to-[#073232] w-full sm:w-auto text-xs sm:text-sm">
              <Link href={`/b2b-listing-details/${listing.id}`}>
                View Details
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

