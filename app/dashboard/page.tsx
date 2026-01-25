import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Eye, MessageSquare, PlusCircle, ArrowRight } from "lucide-react"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { SmartMatches } from "@/components/dashboard/smart-matches"
import { RecentTrades } from "@/components/dashboard/recent-trades"

export const metadata = {
  title: "Dashboard | Swopify",
  description: "Manage your listings and trades on Swopify.",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Fetch user's listings count
  const { count: listingsCount } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", user.id)

  // Fetch active listings count
  const { count: activeCount } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", user.id)
    .eq("is_available", true)

  // Fetch trades count (when trades table is implemented)
  const pendingTrades = 0
  const acceptedTrades = 0

  // Fetch recent listings
  const { data: recentListings } = await supabase
    .from("listings")
    .select("id, title, is_available, created_at")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch smart matches based on user location
  const { data: smartMatches } = await supabase
    .from("listings")
    .select(`
      id, title, price, location, images,
      seller:profiles!seller_id(display_name, avatar_url),
      view_count, favorite_count
    `)
    .neq("seller_id", user.id)
    .eq("is_available", true)
    .limit(6)

  // Fetch recent trades (when trades table is implemented)
  let recentTrades: any[] = []
  try {
    const { data } = await supabase
      .from("trades")
      .select(`
        id, status, created_at,
        listing:listings!target_listing_id(title),
        other_user:profiles!receiver_id(display_name)
      `)
      .or(`proposer_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(5)
    
    recentTrades = data || []
  } catch (error) {
    // Trades table might not exist yet
    console.log("Trades table not available yet")
    recentTrades = []
  }

  const displayName = profile?.display_name || user?.user_metadata?.display_name || "there"
  const userLocation = profile?.location?.state || profile?.location?.city || null

  const dashboardStats = {
    active_listings: activeCount || 0,
    total_listings: listingsCount || 0,
    pending_trades: pendingTrades,
    accepted_trades: acceptedTrades,
    time_balance: profile?.time_credits || 0,
    coin_balance: profile?.gift_cards || 0,
    barter_score: profile?.barter_score || 0,
    average_rating: profile?.average_rating || 0,
    total_ratings: profile?.total_ratings || 0,
  }

  // Format trades data for the component
  const formattedTrades = recentTrades.map((trade: any) => ({
    id: trade.id,
    item: trade.listing?.title || "Unknown Item",
    with: trade.other_user?.display_name || "Unknown User",
    status: trade.status,
    created_at: trade.created_at
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {displayName}!</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening today</p>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats stats={dashboardStats} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Trades */}
      {formattedTrades.length > 0 && (
        <RecentTrades trades={formattedTrades} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Listings</CardTitle>
            <CardDescription>Your most recently created listings.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentListings && recentListings.length > 0 ? (
              <div className="space-y-4">
                {recentListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <Link 
                        href={`/listings/${listing.id}`} 
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {listing.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      listing.is_available 
                        ? "bg-accent/20 text-accent-foreground" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {listing.is_available ? 'active' : 'inactive'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-4 text-muted-foreground">You haven&apos;t created any listings yet.</p>
                <Button asChild>
                  <Link href="/dashboard/listings/new">Create Your First Listing</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Tips to help you start trading successfully.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  1
                </div>
                <div>
                  <p className="font-medium text-foreground">Complete your profile</p>
                  <p className="text-sm text-muted-foreground">Add a profile photo and bio to build trust.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  2
                </div>
                <div>
                  <p className="font-medium text-foreground">Create quality listings</p>
                  <p className="text-sm text-muted-foreground">Good photos and descriptions get more trades.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  3
                </div>
                <div>
                  <p className="font-medium text-foreground">Respond quickly</p>
                  <p className="text-sm text-muted-foreground">Fast responses lead to successful trades.</p>
                </div>
              </div>
              <Button variant="outline" asChild className="mt-4 w-full gap-2 bg-transparent">
                <Link href="/how-it-works">
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
