"use client"

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, MessageCircle, Star, ArrowUpDown, ArrowRightLeft, Verified, Crown, Eye, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatNaira } from "@/lib/utils/currency"
import type { Listing, Profile } from "@/lib/types/database"

interface ListingCardProps {
  listing: Listing & {
    seller?: Profile
    listing_images?: { url: string; is_primary: boolean; sort_order: number }[]
    _count?: { favorites: number }
  }
}

export function ListingCard({ listing }: ListingCardProps) {
  const [favoriteCount] = useState(listing._count?.favorites || 0)
  const [user, setUser] = useState<any>(null)

  const timeAgo = getTimeAgo(new Date(listing.created_at))
  
  // Get primary image or first image
  const primaryImage = listing.listing_images?.find(img => img.is_primary)?.url || 
                      listing.listing_images?.[0]?.url || 
                      listing.images?.[0] || 
                      "/placeholder.jpg"

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    checkUser()
  }, [listing.id])

  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      const shouldLogin = window.confirm('Please sign in to message sellers. Would you like to sign in now?')
      if (shouldLogin) {
        window.location.href = '/auth/login'
      }
      return
    }
    
    // Check if user is trying to message themselves
    if (user.id === listing.seller_id) {
      alert("You cannot message yourself!")
      return
    }
    
    window.location.href = `/messages/new?listing=${listing.id}&seller=${listing.seller_id}`
  }

  const handleProposeTradeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      const shouldLogin = window.confirm('Please sign in to propose trades. Would you like to sign in now?')
      if (shouldLogin) {
        window.location.href = '/auth/login'
      }
      return
    }
    
    // Check if user is trying to trade with themselves
    if (user.id === listing.seller_id) {
      alert("You cannot propose a trade with yourself!")
      return
    }
    
    // Navigate to listing details page
    window.location.href = `/listings/${listing.id}?action=propose-trade`
  }

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="group relative h-64 sm:h-72 md:h-80 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 bg-white border-0 shadow-md sm:shadow-lg">
        {/* Main Image Background */}
        <div className="absolute inset-0">
          <Image
            src={primaryImage}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          {/* Gradient Overlays - Stronger on mobile for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent sm:from-black/80 sm:via-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Top Row - Category & Condition - Smaller on mobile */}
        <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 right-2 sm:right-3 md:right-4 flex items-start justify-between z-10">
          <Badge 
            variant="secondary" 
            className="bg-white/95 backdrop-blur-md text-[10px] sm:text-xs font-semibold shadow-md sm:shadow-lg border-0 text-gray-800 px-1.5 py-0.5 sm:px-2 sm:py-1"
          >
            {listing.category}
          </Badge>
          
          <div className="flex gap-1 sm:gap-2">
            {listing.is_featured && (
              <Badge 
                className="bg-gradient-to-r from-blue-400 to-blue-500 text-white text-[10px] sm:text-xs font-semibold shadow-md sm:shadow-lg border-0 animate-pulse px-1.5 py-0.5 sm:px-2 sm:py-1"
              >
                <Crown className="mr-0.5 sm:mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline">Featured</span>
              </Badge>
            )}
            {listing.condition && (
              <Badge 
                className={`text-[10px] sm:text-xs font-semibold shadow-md sm:shadow-lg border-0 px-1.5 py-0.5 sm:px-2 sm:py-1 ${
                  listing.condition === 'Brand New' || listing.condition === 'Like New'
                    ? "bg-green-500 text-white" 
                    : listing.condition === 'Good'
                    ? "bg-[#32cd32] text-white"
                    : listing.condition === 'Fair'
                    ? "bg-[#32cd32]/70 text-white"
                    : "bg-gray-500 text-white"
                }`}
              >
                {listing.condition}
              </Badge>
            )}
          </div>
        </div>

        {/* Seller Avatar - Hidden on mobile, shown on hover on desktop */}
        {listing.seller && (
          <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 z-20 transform translate-x-16 sm:translate-x-12 group-hover:translate-x-0 transition-transform duration-500 delay-100 hidden sm:block">
            <div className="relative">
              {listing.seller.avatar_url || listing.seller.profile_image_url ? (
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full overflow-hidden shadow-lg sm:shadow-xl border border-white/50 sm:border-2">
                  <Image
                    src={listing.seller.avatar_url || listing.seller.profile_image_url || "/placeholder-user.jpg"}
                    alt={listing.seller.display_name || "User"}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg sm:shadow-xl border border-white/50 sm:border-2">
                  {listing.seller.display_name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              {listing.seller.verification_status === 'verified' && (
                <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-[#32cd32] rounded-full p-0.5 sm:p-1">
                  <Verified className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content - Bottom Overlay - More compact on mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 z-10">
          {/* Title - Smaller on mobile */}
          <h3 className="text-white text-sm sm:text-base md:text-lg font-bold mb-1 sm:mb-1.5 md:mb-2 line-clamp-2 leading-tight drop-shadow-lg">
            {listing.title}
          </h3>
          
          {/* Location - Smaller on mobile */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-2 sm:mb-2.5 md:mb-3">
            <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-white/90 flex-shrink-0" />
            <span className="text-white/90 text-xs sm:text-sm font-medium drop-shadow truncate">
              {listing.location || "Location not set"}
            </span>
          </div>

          {/* Stats Row - More compact on mobile */}
          <div className="flex items-center justify-between text-white/80 text-[10px] sm:text-xs mb-2 sm:mb-2.5 md:mb-3">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              {favoriteCount > 0 && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <MessageCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#32cd32]" />
                  <span>{favoriteCount}</span>
                </div>
              )}
              {listing.view_count > 0 && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#32cd32]" />
                  <span>{listing.view_count}</span>
                </div>
              )}
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-400" />
                <span>{timeAgo}</span>
              </div>
            </div>
            
            {listing.seller && listing.seller.average_rating && listing.seller.average_rating > 0 && (
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-400 font-medium">
                  {listing.seller.average_rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons - Simplified on mobile */}
          <div className="flex gap-1.5 sm:gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-white/95 backdrop-blur-md text-gray-800 hover:bg-white border-0 shadow-md sm:shadow-lg font-semibold text-xs sm:text-sm h-7 sm:h-8 md:h-9 px-2 sm:px-3"
              onClick={handleProposeTradeClick}
            >
              <ArrowRightLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1 sm:mr-1.5 md:mr-2" />
              <span className="hidden sm:inline">Propose Trade</span>
              <span className="sm:hidden">Trade</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full bg-white/95 backdrop-blur-md p-0 hover:bg-white border-0 shadow-md sm:shadow-lg flex-shrink-0"
              onClick={handleMessageClick}
            >
              <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Hover Details Panel - Hidden on mobile, shown on hover on desktop */}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/90 to-transparent p-2 sm:p-3 md:p-4 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20 hidden sm:block">
          {/* Estimated Value */}
          <div className="flex items-center mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
              <span className="text-white font-bold text-base sm:text-lg">
                {formatNaira(listing.price)}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/90 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3 leading-relaxed">
            {listing.description}
          </p>

          {/* Preferred Items */}
          {listing.preferred_items && listing.preferred_items.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-md sm:rounded-lg p-2 sm:p-3 border border-white/20">
              <p className="text-white/80 text-[10px] sm:text-xs font-semibold mb-0.5 sm:mb-1">Looking for:</p>
              <p className="text-white text-xs sm:text-sm line-clamp-1">
                {listing.preferred_items.slice(0, 3).join(", ")}
                {listing.preferred_items.length > 3 && ` +${listing.preferred_items.length - 3} more`}
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return "Just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}