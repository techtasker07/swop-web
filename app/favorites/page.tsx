import { createClient } from "@/lib/supabase/server"
import { FavoritesList } from "@/components/favorites/favorites-list"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Favorites | Swopify",
  description: "View your saved listings and favorite items.",
}

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's favorites
  const { data: favorites } = await supabase
    .from("favorites")
    .select(`
      *,
      listing:listings(
        *,
        seller:profiles!seller_id(id, display_name, avatar_url, average_rating, verification_status),
        listing_images(url, is_primary, sort_order),
        _count:favorites(count)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
        <p className="text-muted-foreground">
          Items and services you've saved for later
        </p>
      </div>

      <FavoritesList favorites={favorites || []} />
    </div>
  )
}