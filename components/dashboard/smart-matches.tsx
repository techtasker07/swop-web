"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPinIcon,
  EyeIcon,
  HeartIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline"
import { Package, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatNaira } from "@/lib/utils/currency"

interface SmartMatchesProps {
  matches: Array<{
    id: number
    title: string
    price: number
    location: string
    images: string[]
    seller: {
      display_name: string
      avatar_url?: string
    }
    view_count: number
    favorite_count: number
  }>
  userLocation?: string
  isLoading?: boolean
}

export function SmartMatches({ matches, userLocation, isLoading }: SmartMatchesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <span>Smart Matches</span>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading matches...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userLocation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Smart Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <MapPinIcon className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-foreground">
                Enable location to see smart matches
              </p>
              <p className="text-xs text-muted-foreground">
                We'll show you relevant items and services in your area
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/profile">Enable Location</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Smart Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <EyeIcon className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-foreground">
                No matches found in {userLocation} yet
              </p>
              <p className="text-xs text-muted-foreground">
                Create a listing or browse available items to get better matches
              </p>
            </div>
            <div className="flex space-x-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/listings/new">Create Listing</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/browse">Browse Items</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="bg-blue-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span>Smart Matches</span>
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
            <Link href="/browse" className="flex items-center space-x-1">
              <span>View All</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {userLocation && (
          <p className="text-sm text-gray-600 mt-2">
            Based on your location: {userLocation}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {matches.slice(0, 6).map((match) => (
            <Link key={match.id} href={`/listings/${match.id}`}>
              <div className="group cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:shadow-lg hover:bg-white hover:border-blue-200">
                <div className="aspect-square relative mb-4 overflow-hidden rounded-xl bg-gray-100">
                  {match.images.length > 0 ? (
                    <Image
                      src={match.images[0]}
                      alt={match.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {match.title}
                  </h3>
                  
                  {match.price > 0 && (
                    <p className="text-lg font-bold text-green-600">
                      {formatNaira(match.price)}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4" />
                    <span className="truncate">{match.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3 text-gray-500">
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>{match.view_count}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <HeartIcon className="h-4 w-4" />
                        <span>{match.favorite_count}</span>
                      </div>
                    </div>
                    <span className="text-gray-600 font-medium truncate">{match.seller.display_name}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}