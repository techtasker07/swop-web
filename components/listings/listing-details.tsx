"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  ClockIcon,
  EyeIcon,
  StarIcon,
  ShieldCheckIcon,
  TagIcon
} from "@heroicons/react/24/outline"
import { ProposeTradeDialog } from "@/components/trades/propose-trade-dialog"
import { formatCurrency } from "@/lib/utils/currency"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Listing, Profile } from "@/lib/types/database"

interface ListingDetailsProps {
  listing: Listing & {
    seller: Profile
    listing_images: Array<{
      url: string
      is_primary: boolean
      sort_order: number
      alt_text?: string
    }>
    _count: { favorites: number }
  }
  user: any
  initialAction?: string
}

export function ListingDetails({ listing, user, initialAction }: ListingDetailsProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState(listing._count?.favorites || 0)
  const [showTradeDialog, setShowTradeDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()
  const images = listing.listing_images?.length > 0 
    ? listing.listing_images.sort((a, b) => a.sort_order - b.sort_order)
    : listing.images?.map((url, index) => ({ url, is_primary: index === 0, sort_order: index })) || []

  useEffect(() => {
    if (user) {
      checkFavoriteStatus()
    }
    
    // Handle initial action from URL
    if (initialAction === 'propose-trade' && user && user.id !== listing.seller_id) {
      setShowTradeDialog(true)
    }
  }, [user, listing.id, initialAction])

  const checkFavoriteStatus = async () => {
    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listing.id)
        .single()
      
      setIsFavorited(!!data)
    } catch (error) {
      // Not favorited
    }
  }

  const handleFavoriteClick = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites')
      return
    }

    setIsLoading(true)
    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listing.id)
        
        setIsFavorited(false)
        setFavoriteCount(prev => Math.max(0, prev - 1))
        toast.success('Removed from favorites')
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: listing.id
          })
        
        setIsFavorited(true)
        setFavoriteCount(prev => prev + 1)
        toast.success('Added to favorites')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProposeTradeClick = () => {
    if (!user) {
      toast.error('Please sign in to propose trades')
      return
    }
    
    if (user.id === listing.seller_id) {
      toast.error("You cannot propose a trade with yourself!")
      return
    }
    
    setShowTradeDialog(true)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: listing.description,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard')
      } catch (error) {
        toast.error('Failed to copy link')
      }
    }
  }

  const isOwner = user?.id === listing.seller_id

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/browse">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Listings
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImageIndex]?.url || "/placeholder.jpg"}
                  alt={images[selectedImageIndex]?.alt_text || listing.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                      <TagIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square relative overflow-hidden rounded-md border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${listing.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{listing.title}</h1>
                  <div className="flex items-center space-x-4 text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <EyeIcon className="h-4 w-4" />
                      <span>{listing.view_count || 0} views</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFavoriteClick}
                    disabled={isLoading}
                  >
                    <HeartIcon 
                      className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                    {favoriteCount}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <ShareIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{listing.category}</Badge>
                <Badge variant="outline">{listing.type}</Badge>
                {listing.condition && (
                  <Badge variant="outline">{listing.condition}</Badge>
                )}
                {listing.is_featured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Price */}
              {listing.price > 0 && (
                <div className="mb-4">
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(listing.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">Estimated value</p>
                </div>
              )}
            </div>

            {/* Seller Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={listing.seller.avatar_url || undefined} />
                    <AvatarFallback>
                      {listing.seller.display_name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-foreground">
                        {listing.seller.display_name}
                      </h3>
                      {listing.seller.verification_status === 'verified' && (
                        <ShieldCheckIcon className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {listing.seller.average_rating > 0 && (
                        <div className="flex items-center space-x-1">
                          <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{listing.seller.average_rating.toFixed(1)}</span>
                          <span>({listing.seller.total_ratings} reviews)</span>
                        </div>
                      )}
                      <span>{listing.seller.successful_trades} trades</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/users/${listing.seller.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {!isOwner && (
              <div className="flex space-x-3">
                <Button 
                  onClick={handleProposeTradeClick}
                  className="flex-1"
                  size="lg"
                >
                  <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
                  Propose Trade
                </Button>
              </div>
            )}

            {isOwner && (
              <div className="flex space-x-3">
                <Button variant="outline" asChild className="flex-1">
                  <Link href={`/dashboard/listings/${listing.id}/edit`}>
                    Edit Listing
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/listings">
                    Manage Listings
                  </Link>
                </Button>
              </div>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </CardContent>
            </Card>

            {/* Preferred Items */}
            {listing.preferred_items && listing.preferred_items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Looking for in return</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {listing.preferred_items.map((item, index) => (
                      <Badge key={index} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {listing.tags && listing.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Trade Proposal Dialog */}
      <ProposeTradeDialog
        open={showTradeDialog}
        onOpenChange={setShowTradeDialog}
        targetListing={listing}
        user={user}
      />
    </div>
  )
}