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
    
    window.location.href = `/listings/${listing.id}?action=propose-trade`
  }

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="group relative h-80 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-white border-0 shadow-lg">
        {/* Main Image Background */}
        <div className="absolute inset-0">
          <Image
            src={primaryImage}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Top Row - Category & Condition */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
          <Badge 
            variant="secondary" 
            className="bg-white/95 backdrop-blur-md text-xs font-semibold shadow-lg border-0 text-gray-800"
          >
            {listing.category}
          </Badge>
          
          <div className="flex gap-2">
            {listing.is_featured && (
              <Badge 
                className="bg-gradient-to-r from-blue-400 to-blue-500 text-white text-xs font-semibold shadow-lg border-0 animate-pulse"
              >
                <Crown className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            )}
            {listing.condition && (
              <Badge 
                className={`text-xs font-semibold shadow-lg border-0 ${
                  listing.condition === 'Brand New' || listing.condition === 'Like New'
                    ? "bg-green-500 text-white" 
                    : listing.condition === 'Good'
                    ? "bg-blue-500 text-white"
                    : listing.condition === 'Fair'
                    ? "bg-blue-400 text-white"
                    : "bg-gray-500 text-white"
                }`}
              >
                {listing.condition}
              </Badge>
            )}
          </div>
        </div>

        {/* Seller Avatar - Top Right */}
        {listing.seller && (
          <div className="absolute top-4 right-4 z-20 transform translate-x-12 group-hover:translate-x-0 transition-transform duration-500 delay-100">
            <div className="relative">
              {listing.seller.avatar_url || listing.seller.profile_image_url ? (
                <div className="h-12 w-12 rounded-full overflow-hidden shadow-xl border-2 border-white/50">
                  <Image
                    src={listing.seller.avatar_url || listing.seller.profile_image_url || "/placeholder-user.jpg"}
                    alt={listing.seller.display_name || "User"}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-xl border-2 border-white/50">
                  {listing.seller.display_name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              {listing.seller.verification_status === 'verified' && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <Verified className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content - Bottom Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          {/* Title */}
          <h3 className="text-white text-lg font-bold mb-2 line-clamp-2 leading-tight drop-shadow-lg">
            {listing.title}
          </h3>
          
          {/* Location */}
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-white/90" />
            <span className="text-white/90 text-sm font-medium drop-shadow">
              {listing.location || "Location not set"}
            </span>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-white/80 text-xs mb-3">
            <div className="flex items-center gap-4">
              {favoriteCount > 0 && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3 text-blue-400" />
                  <span>{favoriteCount}</span>
                </div>
              )}
              {listing.view_count > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-blue-400" />
                  <span>{listing.view_count}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-green-400" />
                <span>{timeAgo}</span>
              </div>
            </div>
            
            {listing.seller && listing.seller.average_rating && listing.seller.average_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-400 font-medium">
                  {listing.seller.average_rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-white/95 backdrop-blur-md text-gray-800 hover:bg-white border-0 shadow-lg font-semibold"
              onClick={handleProposeTradeClick}
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Propose Trade
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-md p-0 hover:bg-white border-0 shadow-lg"
              onClick={handleMessageClick}
            >
              <MessageCircle className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Hover Details Panel */}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/90 to-transparent p-4 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
          {/* Estimated Value */}
          <div className="flex items-center mb-3">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-green-400" />
              <span className="text-white font-bold text-lg">
                {formatNaira(listing.price)}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/90 text-sm line-clamp-2 mb-3 leading-relaxed">
            {listing.description}
          </p>

          {/* Preferred Items */}
          {listing.preferred_items && listing.preferred_items.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
              <p className="text-white/80 text-xs font-semibold mb-1">Looking for:</p>
              <p className="text-white text-sm line-clamp-1">
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