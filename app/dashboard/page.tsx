import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Package, 
  Eye, 
  MessageSquare, 
  PlusCircle, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Clock, 
  Star,
  BarChart3,
  Activity,
  Coins,
  Timer,
  Award,
  Building,
  HandHeart,
  Shield,
  FileText,
  Sparkles
} from "lucide-react"
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
      {/* Header */}
      <div className="mb-1">
        <h1 className="text-xl font-bold text-blue-800">
          Welcome back, {displayName}!
        </h1>
        <p className="text-gray-600 text-sm mt-2">Here's your trading overview for today</p>
      </div>

      {/* Unified Dashboard Presentation */}
      <div className="grid gap-8">
        {/* Main Stats Dashboard */}
        <Card className="bg-white shadow-xl border-0 overflow-hidden">
          <div className="bg-blue-600 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Trading Dashboard</h2>
            <p className="text-blue-100">Your complete trading overview at a glance</p>
          </div>
          
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Active Listings */}
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <Link href="/dashboard/listings" className="text-blue-600 hover:text-blue-800">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-blue-800">{dashboardStats.active_listings}</p>
                  <p className="text-sm font-medium text-blue-700">Active Listings</p>
                  <p className="text-xs text-blue-600">of {dashboardStats.total_listings} total</p>
                </div>
              </div>

              {/* Pending Trades */}
              <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <Link href="/dashboard/trades" className="text-green-600 hover:text-green-800">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-green-800">{dashboardStats.pending_trades}</p>
                  <p className="text-sm font-medium text-green-700">Pending Trades</p>
                  <p className="text-xs text-green-600">{dashboardStats.accepted_trades} accepted</p>
                </div>
              </div>

              {/* Time Balance */}
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Timer className="w-6 h-6 text-white" />
                  </div>
                  <Link href="/dashboard/time-banking" className="text-blue-600 hover:text-blue-800">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-blue-800">{dashboardStats.time_balance}h</p>
                  <p className="text-sm font-medium text-blue-700">Time Balance</p>
                  <p className="text-xs text-blue-600">Available to trade</p>
                </div>
              </div>

              {/* Barter Score */}
              <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <Link href="/dashboard/profile" className="text-green-600 hover:text-green-800">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-green-800">{dashboardStats.barter_score}</p>
                  <p className="text-sm font-medium text-green-700">Barter Score</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-green-600 fill-current" />
                    <p className="text-xs text-green-600">{dashboardStats.average_rating.toFixed(1)} rating</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{dashboardStats.coin_balance}</p>
                <p className="text-sm text-gray-600">Trade Coins</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{dashboardStats.total_ratings}</p>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{((dashboardStats.active_listings / Math.max(dashboardStats.total_listings, 1)) * 100).toFixed(0)}%</p>
                <p className="text-sm text-gray-600">Active Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Listings */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-blue-50 border-b border-gray-200">
              <CardTitle className="text-gray-800 flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>Recent Listings</span>
              </CardTitle>
              <CardDescription>Your most recently created listings</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {recentListings && recentListings.length > 0 ? (
                <div className="space-y-4">
                  {recentListings.map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="min-w-0 flex-1">
                        <Link 
                          href={`/listings/${listing.id}`} 
                          className="font-medium text-gray-800 hover:text-blue-600 transition-colors"
                        >
                          {listing.title}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(listing.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        listing.is_available 
                          ? "bg-green-100 text-green-800 border border-green-200" 
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}>
                        {listing.is_available ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">You haven't created any listings yet</p>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/dashboard/listings/new">Create Your First Listing</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-green-50 border-b border-gray-200">
              <CardTitle className="text-gray-800 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                <span>Getting Started</span>
              </CardTitle>
              <CardDescription>Tips to help you start trading successfully</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Complete your profile</p>
                    <p className="text-sm text-gray-600 mt-1">Add a profile photo and bio to build trust with other traders.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500 text-sm font-bold text-white">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Create quality listings</p>
                    <p className="text-sm text-gray-600 mt-1">Good photos and detailed descriptions attract more trades.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Respond quickly</p>
                    <p className="text-sm text-gray-600 mt-1">Fast responses lead to successful trades and better ratings.</p>
                  </div>
                </div>
                <Button variant="outline" asChild className="w-full mt-6 border-gray-200 hover:bg-gray-50">
                  <Link href="/how-it-works" className="flex items-center justify-center space-x-2">
                    <span>Learn More</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trades */}
        {formattedTrades.length > 0 && (
          <RecentTrades trades={formattedTrades} />
        )}

        {/* Smart Matches */}
        {smartMatches && smartMatches.length > 0 && (
          <SmartMatches 
            matches={smartMatches.map(match => ({
              ...match,
              seller: Array.isArray(match.seller) ? match.seller[0] : match.seller
            }))} 
            userLocation={userLocation} 
          />
        )}
      </div>
    </div>
  )
}
