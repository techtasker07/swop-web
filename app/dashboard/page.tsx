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
import { BlogHighlights } from "@/components/dashboard/blog-highlights"

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

  const { data: latestBlogPosts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image, created_at")
    .eq("is_published", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(3)

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
    <div className="space-y-6 sm:space-y-8">
      {/* Header - Responsive */}
      <div className="mb-1">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#073232]">
          Welcome back, {displayName}!
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2">Here's your trading overview for today</p>
      </div>

      <BlogHighlights posts={latestBlogPosts || []} />

      {/* Unified Dashboard Presentation */}
      <div className="grid gap-4 sm:gap-6 md:gap-8">
        {/* Main Stats Dashboard - Enhanced responsive */}
        <Card className="bg-white shadow-xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#073232] to-[#0a4a4a] p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Trading Dashboard</h2>
            <p className="text-white/80 text-xs sm:text-sm md:text-base">Your complete trading overview at a glance</p>
          </div>
          
          <CardContent className="p-4 sm:p-6 md:p-8">
            {/* Unified Stats Grid - All 7 stats in one grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-6">
              {/* Active Listings */}
              <div className="bg-[#32cd32]/10 p-4 sm:p-5 rounded-xl border border-[#32cd32]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#32cd32] rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Link href="/dashboard/listings" className="text-[#32cd32] hover:text-[#28a428]">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl sm:text-3xl font-bold text-[#073232]">{dashboardStats.active_listings}</p>
                  <p className="text-xs sm:text-sm font-medium text-[#073232]/80">Active Listings</p>
                  <p className="text-[10px] sm:text-xs text-[#073232]/60">of {dashboardStats.total_listings} total</p>
                </div>
              </div>

              {/* Pending Trades */}
              <div className="bg-[#32cd32]/10 p-4 sm:p-5 rounded-xl border border-[#32cd32]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#32cd32] rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Link href="/dashboard/trades" className="text-[#32cd32] hover:text-[#28a428]">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl sm:text-3xl font-bold text-[#073232]">{dashboardStats.pending_trades}</p>
                  <p className="text-xs sm:text-sm font-medium text-[#073232]/80">Pending Trades</p>
                  <p className="text-[10px] sm:text-xs text-[#073232]/60">{dashboardStats.accepted_trades} accepted</p>
                </div>
              </div>

              {/* Time Balance */}
              <div className="bg-[#073232]/10 p-4 sm:p-5 rounded-xl border border-[#073232]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#073232] rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Link href="/dashboard/time-banking" className="text-[#073232] hover:text-[#073232]/80">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl sm:text-3xl font-bold text-[#073232]">{dashboardStats.time_balance}h</p>
                  <p className="text-xs sm:text-sm font-medium text-[#073232]/80">Time Balance</p>
                  <p className="text-[10px] sm:text-xs text-[#073232]/60">Available to trade</p>
                </div>
              </div>

              {/* Barter Score */}
              <div className="bg-[#32cd32]/10 p-4 sm:p-5 rounded-xl border border-[#32cd32]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#32cd32] rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Link href="/dashboard/profile" className="text-[#32cd32] hover:text-[#28a428]">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl sm:text-3xl font-bold text-[#073232]">{dashboardStats.barter_score}</p>
                  <p className="text-xs sm:text-sm font-medium text-[#073232]/80">Barter Score</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-[#32cd32] fill-current" />
                    <p className="text-[10px] sm:text-xs text-[#073232]/60">{dashboardStats.average_rating.toFixed(1)} rating</p>
                  </div>
                </div>
              </div>

              {/* Trade Coins */}
              <div className="bg-[#32cd32]/10 p-4 sm:p-5 rounded-xl border border-[#32cd32]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#32cd32] rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Link href="/dashboard/trade-coins" className="text-[#32cd32] hover:text-[#28a428]">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl sm:text-3xl font-bold text-[#073232]">{dashboardStats.coin_balance}</p>
                  <p className="text-xs sm:text-sm font-medium text-[#073232]/80">Trade Coins</p>
                  <p className="text-[10px] sm:text-xs text-[#073232]/60">Available balance</p>
                </div>
              </div>

              {/* Total Reviews */}
              <div className="bg-[#32cd32]/10 p-4 sm:p-5 rounded-xl border border-[#32cd32]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#32cd32] rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Link href="/dashboard/profile" className="text-[#32cd32] hover:text-[#28a428]">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl sm:text-3xl font-bold text-[#073232]">{dashboardStats.total_ratings}</p>
                  <p className="text-xs sm:text-sm font-medium text-[#073232]/80">Total Reviews</p>
                  <p className="text-[10px] sm:text-xs text-[#073232]/60">Community feedback</p>
                </div>
              </div>

              {/* Active Rate */}
              <div className="bg-[#073232]/10 p-4 sm:p-5 rounded-xl border border-[#073232]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#073232] rounded-lg sm:rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Link href="/dashboard/listings" className="text-[#073232] hover:text-[#073232]/80">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl sm:text-3xl font-bold text-[#073232]">{((dashboardStats.active_listings / Math.max(dashboardStats.total_listings, 1)) * 100).toFixed(0)}%</p>
                  <p className="text-xs sm:text-sm font-medium text-[#073232]/80">Active Rate</p>
                  <p className="text-[10px] sm:text-xs text-[#073232]/60">Listing activity</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Grid - Responsive */}
        <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2">
          {/* Recent Listings */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-[#32cd32]/10 border-b border-gray-200 p-4 sm:p-6">
              <CardTitle className="text-gray-800 flex items-center space-x-2 text-base sm:text-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#32cd32]" />
                <span>Recent Listings</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Your most recently created listings</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {recentListings && recentListings.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentListings.map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="min-w-0 flex-1">
                        <Link 
                          href={`/listings/${listing.id}`} 
                          className="font-medium text-gray-800 hover:text-[#32cd32] transition-colors text-sm sm:text-base line-clamp-1"
                        >
                          {listing.title}
                        </Link>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                          {new Date(listing.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ml-2 ${
                        listing.is_available 
                          ? "bg-[#32cd32]/10 text-[#32cd32] border border-[#32cd32]/30" 
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}>
                        {listing.is_available ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 sm:py-12 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">You haven't created any listings yet</p>
                  <Button asChild className="bg-[#32cd32] hover:bg-[#28a428] text-sm sm:text-base">
                    <Link href="/dashboard/listings/new">Create Your First Listing</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-[#32cd32]/10 border-b border-gray-200 p-4 sm:p-6">
              <CardTitle className="text-gray-800 flex items-center space-x-2 text-base sm:text-lg">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#32cd32]" />
                <span>Getting Started</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Tips to help you start trading successfully</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-[#32cd32] text-xs sm:text-sm font-bold text-white">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Complete your profile</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Add a profile photo and bio to build trust with other traders.</p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-[#32cd32] text-xs sm:text-sm font-bold text-white">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Create quality listings</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Good photos and detailed descriptions attract more trades.</p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-[#073232] text-xs sm:text-sm font-bold text-white">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Respond quickly</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Fast responses lead to successful trades and better ratings.</p>
                  </div>
                </div>
                <Button variant="outline" asChild className="w-full mt-4 sm:mt-6 border-gray-200 hover:bg-gray-50 text-sm sm:text-base">
                  <Link href="/how-it-works" className="flex items-center justify-center space-x-2">
                    <span>Learn More</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
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
