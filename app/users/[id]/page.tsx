import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ShieldCheck, MessageCircle, Star, Package, MapPin, TrendingUp, Award, Clock, Eye } from "lucide-react"

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // Fetch user profile
  const { data: user } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()
  
  // Fetch user's active listings
  const { data: listings } = await supabase
    .from("listings")
    .select("*, listing_images(url, is_primary, sort_order)")
    .eq("seller_id", id)
    .eq("is_available", true)
    .order("created_at", { ascending: false })

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 mx-auto max-w-6xl px-4 py-8">
          <div className="text-center py-12">
            <div className="mb-4 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-[#073232]/5 flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">User not found</h1>
            <p className="text-gray-600 mb-6 text-sm">This user profile doesn't exist or has been removed.</p>
            <Button asChild className="bg-[#073232] hover:bg-[#0a4a4a] rounded-lg px-6">
              <Link href="/browse">Back to Browse</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const isVerified = user.verification_status === "verified"
  const trustScore = Math.min(100, Math.round(((user.successful_trades || 0) * 10 + (user.average_rating || 0) * 15)))
  
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6">
          {/* Profile Header Card */}
          <div className="rounded-xl bg-gradient-to-br from-[#073232] to-[#0a4a4a] shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-3 border-white/20 shadow-md">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-[#32cd32]/30 text-white text-2xl font-bold">
                        {user.display_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-[#32cd32] rounded-full p-1 shadow-md border-2 border-white">
                        <ShieldCheck className="h-4 w-4 text-[#073232]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="mb-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-white">
                      {user.display_name || "User"}
                    </h1>
                    {isVerified && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-[#32cd32] text-[#073232] rounded-full text-xs px-2 py-0.5">
                          <ShieldCheck className="h-3 w-3 mr-0.5" />
                          Verified
                        </Badge>
                      </div>
                    )}
                  </div>

                  {user.bio && (
                    <p className="text-white/80 text-sm mb-3 line-clamp-2">
                      {user.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="text-white/60 text-xs font-medium">Trades</p>
                      <p className="text-lg font-bold text-[#32cd32]">{user.successful_trades || 0}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs font-medium">Rating</p>
                      <p className="text-lg font-bold text-[#32cd32]">
                        {user.average_rating ? user.average_rating.toFixed(1) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs font-medium">Reviews</p>
                      <p className="text-lg font-bold text-[#32cd32]">{user.total_ratings || 0}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs font-medium">Trust</p>
                      <p className="text-lg font-bold text-[#32cd32]">{trustScore}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          {user.bio && (
            <div className="mb-6">
              <Card className="rounded-xl shadow-sm border border-gray-200 bg-white">
                <CardContent className="p-4">
                  <h2 className="text-lg font-bold text-[#073232] mb-2">About</h2>
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{user.bio}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Active Listings Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-[#073232]" />
              <h2 className="text-lg font-bold text-[#073232]">
                Active Listings
              </h2>
              <span className="text-xs text-gray-500 ml-auto">({listings?.length || 0})</span>
            </div>

            {listings && listings.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing: any) => {
                  const image = listing.listing_images?.find((img: any) => img.is_primary)?.url || 
                                listing.listing_images?.[0]?.url || 
                                listing.images?.[0]
                  
                  return (
                    <Link
                      key={listing.id}
                      href={`/listings/${listing.id}`}
                      className="group"
                    >
                      <div className="h-full rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-[#32cd32]/50">
                        {/* Listing Image */}
                        <div className="relative h-32 bg-gray-100 overflow-hidden">
                          {image ? (
                            <Image 
                              src={image} 
                              alt={listing.title} 
                              fill 
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="h-8 w-8 text-gray-300" />
                            </div>
                          )}
                          
                          {/* Category Badge */}
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-[#073232] text-[#32cd32] rounded text-xs">
                              {listing.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Listing Info */}
                        <div className="p-3">
                          <h3 className="font-semibold text-[#073232] group-hover:text-[#32cd32] transition line-clamp-2 text-sm mb-1">
                            {listing.title}
                          </h3>
                          <p className="line-clamp-1 text-xs text-gray-600 mb-2">
                            {listing.description}
                          </p>

                          {/* Meta Info */}
                          <div className="flex flex-col gap-1 mb-2 text-xs text-gray-500">
                            {listing.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{listing.location}</span>
                              </div>
                            )}
                            {listing.view_count > 0 && (
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{listing.view_count} views</span>
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            {listing.price > 0 && (
                              <p className="font-bold text-[#32cd32] text-sm">
                                ₦{(listing.price || 0).toLocaleString()}
                              </p>
                            )}
                            <span className="text-xs text-gray-400 group-hover:text-[#32cd32] transition ml-auto">
                              View →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <Card className="rounded-xl shadow-sm border border-gray-200 bg-gray-50">
                <CardContent className="p-8 text-center">
                  <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No active listings</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1 bg-[#073232] hover:bg-[#0a4a4a] rounded-lg h-10 text-sm font-semibold">
              <Link href={`/messages/new?seller=${id}`}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 rounded-lg h-10 text-sm font-semibold border-[#073232] hover:bg-gray-50">
              <Link href="/browse">
                Back to Browse
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
