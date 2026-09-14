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

  // Fetch trades count for this user
  let pendingTrades = 0
  let acceptedTrades = 0
  try {
    const { data: tradesData } = await supabase
      .from('trades')
      .select('id, status')
      .or(`proposer_id.eq.${user.id},receiver_id.eq.${user.id}`)
    
    if (tradesData) {
      pendingTrades = tradesData.filter(t => t.status === 'pending').length
      acceptedTrades = tradesData.filter(t => t.status === 'accepted').length
    }
  } catch (error) {
    console.log('Trades table not available yet')
  }

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

  // Fetch time balance using service
  let timeBalance = profile?.time_credits || 0
  try {
    const { TimeBankingService } = await import("@/lib/services/time-banking-service")
    const timeBankingService = new TimeBankingService()
    const timeBankingBalance = await timeBankingService.getUserBalance(user.id)
    timeBalance = timeBankingBalance.total_balance
  } catch (error) {
    console.log("Time banking service error, using profile value:", error)
  }

  // Fetch trade coin balance using service
  let coinBalance = profile?.trade_coin_balance || profile?.gift_cards || 0
  try {
    const { TradeCoinService } = await import("@/lib/services/trade-coin-service")
    const tradeCoinService = new TradeCoinService()
    const tradeCoinBalance = await tradeCoinService.getUserBalance(user.id)
    coinBalance = tradeCoinBalance.total_balance
  } catch (error) {
    console.log("Trade coin service error, using profile value:", error)
  }

  const dashboardStats = {
    active_listings: activeCount || 0,
    total_listings: listingsCount || 0,
    pending_trades: pendingTrades,
    accepted_trades: acceptedTrades,
    time_balance: timeBalance,
    coin_balance: coinBalance,
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
            {/* Refined Stats Grid - 5 essential stats with sophisticated design */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {/* Active Listings Card */}
              <Link href="/dashboard/listings" className="group">
                <div className="h-full bg-gradient-to-br from-[#32cd32]/5 to-[#32cd32]/10 p-4 sm:p-5 rounded-2xl border border-[#32cd32]/20 hover:border-[#32cd32]/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#32cd32] to-[#28a428] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#32cd32] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-2xl sm:text-3xl font-bold text-[#073232]">{dashboardStats.active_listings}</p>
                    <p className="text-xs sm:text-sm font-semibold text-[#073232]/80">Active Listings</p>
                    <div className="mt-2 pt-2 border-t border-[#32cd32]/20">
                      <p className="text-[10px] sm:text-xs text-[#073232]/60">of {dashboardStats.total_listings} total</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 bg-[#32cd32]/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#32cd32] to-[#28a428]" 
                      style={{ width: `${Math.min((dashboardStats.active_listings / Math.max(dashboardStats.total_listings, 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </Link>

              {/* Pending Trades Card */}
              <Link href="/dashboard/trades" className="group">
                <div className="h-full bg-gradient-to-br from-[#32cd32]/5 to-[#32cd32]/10 p-4 sm:p-5 rounded-2xl border border-[#32cd32]/20 hover:border-[#32cd32]/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#32cd32] to-[#28a428] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#32cd32] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-2xl sm:text-3xl font-bold text-[#073232]">{dashboardStats.pending_trades}</p>
                    <p className="text-xs sm:text-sm font-semibold text-[#073232]/80">Pending Trades</p>
                    <div className="mt-2 pt-2 border-t border-[#32cd32]/20">
                      <p className="text-[10px] sm:text-xs text-[#073232]/60">{dashboardStats.accepted_trades} accepted</p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Time Balance Card - LIVE DATA */}
              <Link href="/dashboard/time-banking" className="group">
                <div className="h-full bg-gradient-to-br from-[#073232]/5 to-[#073232]/10 p-4 sm:p-5 rounded-2xl border border-[#073232]/20 hover:border-[#073232]/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#073232] to-[#0a4a4a] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#073232] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl sm:text-3xl font-bold text-[#073232]">{dashboardStats.time_balance}</p>
                      <p className="text-sm sm:text-base font-semibold text-[#073232]/60">hours</p>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[#073232]/80">Time Balance</p>
                    <div className="mt-2 pt-2 border-t border-[#073232]/20">
                      <p className="text-[10px] sm:text-xs text-[#073232]/60">Available to trade</p>
                    </div>
                  </div>
                  {/* Status indicator */}
                  <div className="mt-3 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#32cd32] animate-pulse" />
                    <p className="text-[10px] sm:text-xs text-[#073232]/60">Live balance</p>
                  </div>
                </div>
              </Link>

              {/* Trade Coins Card - LIVE DATA */}
              <Link href="/dashboard/trade-coins" className="group">
                <div className="h-full bg-gradient-to-br from-[#32cd32]/5 to-[#32cd32]/10 p-4 sm:p-5 rounded-2xl border border-[#32cd32]/20 hover:border-[#32cd32]/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#32cd32] to-[#28a428] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#32cd32] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl sm:text-3xl font-bold text-[#073232]">{dashboardStats.coin_balance}</p>
                      <p className="text-xs sm:text-base font-semibold text-[#073232]/60">coins</p>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[#073232]/80">Trade Coins</p>
                    <div className="mt-2 pt-2 border-t border-[#32cd32]/20">
                      <p className="text-[10px] sm:text-xs text-[#073232]/60">Available balance</p>
                    </div>
                  </div>
                  {/* Status indicator */}
                  <div className="mt-3 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#32cd32] animate-pulse" />
                    <p className="text-[10px] sm:text-xs text-[#073232]/60">Live balance</p>
                  </div>
                </div>
              </Link>

              {/* Rating Card */}
              <Link href="/dashboard/profile" className="group">
                <div className="h-full bg-gradient-to-br from-[#073232]/5 to-[#073232]/10 p-4 sm:p-5 rounded-2xl border border-[#073232]/20 hover:border-[#073232]/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#073232] to-[#0a4a4a] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-current" />
                    </div>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#073232] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-2xl sm:text-3xl font-bold text-[#073232]">{dashboardStats.average_rating.toFixed(1)}</p>
                    <p className="text-xs sm:text-sm font-semibold text-[#073232]/80">Average Rating</p>
                    <div className="mt-2 pt-2 border-t border-[#073232]/20">
                      <p className="text-[10px] sm:text-xs text-[#073232]/60">{dashboardStats.total_ratings} reviews</p>
                    </div>
                  </div>
                  {/* Star rating visual */}
                  <div className="mt-3 flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(dashboardStats.average_rating) ? 'text-[#32cd32] fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </Link>
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