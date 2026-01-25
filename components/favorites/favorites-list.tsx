"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ListingCard } from "@/components/listing-card"
import { HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface FavoritesListProps {
  favorites: Array<{
    id: string
    created_at: string
    listing: any
  }>
}

export function FavoritesList({ favorites: initialFavorites }: FavoritesListProps) {
  const [favorites, setFavorites] = useState(initialFavorites)
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())
  const supabase = createClient()

  const handleRemoveFavorite = async (favoriteId: string) => {
    setRemovingIds(prev => new Set(prev).add(favoriteId))

    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", favoriteId)

      if (error) throw error

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId))
      toast.success("Removed from favorites")
    } catch (error) {
      console.error("Error removing favorite:", error)
      toast.error("Failed to remove from favorites")
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(favoriteId)
        return newSet
      })
    }
  }

  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <HeartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No favorites yet</h3>
          <p className="text-muted-foreground mb-6">
            Start browsing and save items you're interested in
          </p>
          <Button asChild>
            <Link href="/browse">
              <ShoppingBagIcon className="h-4 w-4 mr-2" />
              Browse Listings
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {favorites.map((favorite) => (
          <div key={favorite.id} className="relative group">
            <ListingCard listing={favorite.listing} />
            
            {/* Remove Button */}
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={() => handleRemoveFavorite(favorite.id)}
              disabled={removingIds.has(favorite.id)}
            >
              {removingIds.has(favorite.id) ? "Removing..." : "Remove"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}