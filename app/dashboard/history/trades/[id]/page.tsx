"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRightLeft, Calendar, User, DollarSign, AlertCircle, Loader } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"

export default function TradeHistoryDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const tradeId = params.id as string
  const supabase = createClient()
  const { toast } = useToast()
  
  const [trade, setTrade] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (user && tradeId) {
      fetchTradeDetails()
    }
  }, [user, tradeId])

  const fetchTradeDetails = async () => {
    try {
      setLoading(true)
      
      console.log(`Fetching trade ${tradeId} for user ${user?.id}`)
      
      // Try with minimal selection first to debug
      const { data: basicData, error: basicError } = await supabase
        .from("trades")
        .select("id, status, proposer_id, receiver_id")
        .eq("id", tradeId)
        .single()

      if (basicError) {
        console.error("Basic query error:", basicError)
        throw basicError
      }

      console.log("Basic data fetched:", basicData)

      // Verify user is part of this trade
      if (basicData.proposer_id !== user?.id && basicData.receiver_id !== user?.id) {
        console.warn(`User ${user?.id} not authorized to view trade ${tradeId}`)
        setError("You don't have permission to view this trade")
        return
      }

      // Now fetch full details with wildcard
      const { data, error: fullError } = await supabase
        .from("trades")
        .select(`
          *,
          proposer:profiles!proposer_id(id, display_name, avatar_url, email, verification_status),
          receiver:profiles!receiver_id(id, display_name, avatar_url, email, verification_status)
        `)
        .eq("id", tradeId)
        .single()

      if (fullError) {
        console.error("Full query error:", fullError)
        throw fullError
      }

      console.log("Trade details fetched successfully:", data)
      setTrade(data)
    } catch (err: any) {
      console.error("Error fetching trade details:", err)
      setError(err?.message || "Failed to load trade details")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isProposer = trade?.proposer_id === user?.id

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleCancelTrade = async () => {
    if (!window.confirm("Are you sure you want to delete this trade? This action cannot be undone.")) {
      return
    }

    setCancelling(true)
    try {
      // Delete the trade record
      const { error: deleteError } = await supabase
        .from("trades")
        .delete()
        .eq("id", tradeId)

      if (deleteError) throw deleteError

      toast.success("Trade deleted successfully")
      
      // Redirect to history page after a short delay
      setTimeout(() => {
        window.location.href = "/dashboard/history"
      }, 1000)
    } catch (err: any) {
      console.error("Error deleting trade:", err)
      toast.error(err?.message || "Failed to delete trade")
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading trade details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !trade) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto max-w-2xl px-4 py-8">
            <Card className="border-red-200 bg-red-50 rounded-[1.75rem]">
              <CardContent className="p-6 text-center">
                <p className="text-red-800 mb-4">{error || "Trade not found"}</p>
                <Button asChild className="rounded-full">
                  <Link href="/dashboard/history">Back to History</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard/history">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Link>
          </Button>

          {/* Header */}
          <div className="rounded-[2rem] bg-gradient-to-r from-[#073232] to-[#0a4a4a] p-6 text-white shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Trade Details</h1>
                <p className="text-white/75">{trade.metadata?.target_listing_title || "Trade proposal"}</p>
              </div>
              <Badge className={`rounded-full capitalize text-lg px-4 py-2 ${getStatusColor(trade.status)}`}>
                {trade.status}
              </Badge>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Trade Information */}
            <Card className="rounded-[1.75rem] shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Trade Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Listing</p>
                  <p className="text-lg font-semibold text-foreground">{trade.metadata?.target_listing_title || "Unknown listing"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Estimated Value</p>
                  <p className="text-xl font-bold text-[#32cd32]">₦{trade.metadata?.estimated_value || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Trade Involves Coins</p>
                  <p className="font-medium text-foreground">{trade.metadata?.involves_trade_coins ? "Yes" : "No"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Trade Participants */}
            <Card className="rounded-[1.75rem] shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Trade Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    {isProposer ? "You (Proposer)" : "Proposer"}
                  </p>
                  <p className="font-semibold text-foreground">{trade.proposer?.display_name || trade.proposer?.email || "Unknown"}</p>
                  {trade.proposer?.verification_status === "verified" && (
                    <p className="text-sm text-[#32cd32] mt-1">✓ Verified User</p>
                  )}
                </div>

                <div className="flex justify-center">
                  <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    {!isProposer ? "You (Receiver)" : "Receiver"}
                  </p>
                  <p className="font-semibold text-foreground">{trade.receiver?.display_name || trade.receiver?.email || "Unknown"}</p>
                  {trade.receiver?.verification_status === "verified" && (
                    <p className="text-sm text-[#32cd32] mt-1">✓ Verified User</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trade Details */}
          <Card className="rounded-[1.75rem] shadow-md">
            <CardHeader>
              <CardTitle>Trade Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Message */}
              {trade.message && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Message</p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-border">
                    <p className="text-foreground">{trade.message}</p>
                  </div>
                </div>
              )}

              {/* Proposer Items */}
              {trade.proposer_items && trade.proposer_items.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    {isProposer ? "Your Offer" : "Their Offer"}
                  </p>
                  <div className="space-y-3">
                    {trade.proposer_items.map((item: any, index: number) => (
                      <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="font-semibold text-foreground">{item.title}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                        {(item.estimated_value || item.amount) && (
                          <p className="text-sm text-blue-600 mt-2 font-medium">
                            {item.type === "cash" ? `₦${item.amount}` : item.type === "trade_coin" ? `${item.amount} ${item.coin_type}` : `₦${item.estimated_value}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Receiver Items (if any) */}
              {trade.receiver_items && trade.receiver_items.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    {!isProposer ? "Your Offer" : "Their Offer"}
                  </p>
                  <div className="space-y-3">
                    {trade.receiver_items.map((item: any, index: number) => (
                      <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="font-semibold text-foreground">{item.title}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                        {(item.estimated_value || item.amount) && (
                          <p className="text-sm text-green-600 mt-2 font-medium">
                            {item.type === "cash" ? `₦${item.amount}` : item.type === "trade_coin" ? `${item.amount} ${item.coin_type}` : `₦${item.estimated_value}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-3 pt-4 border-t">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Timeline</p>
                <div className="flex items-start gap-4">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Proposed</p>
                    <p className="text-sm text-muted-foreground">{formatDate(trade.created_at)}</p>
                  </div>
                </div>
                {trade.updated_at && trade.updated_at !== trade.created_at && (
                  <div className="flex items-start gap-4">
                    <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-foreground">Last Updated</p>
                      <p className="text-sm text-muted-foreground">{formatDate(trade.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Completion Details (if completed) */}
          {trade.status === "completed" && trade.metadata?.completion_code && (
            <Card className="rounded-[1.75rem] shadow-md border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Trade Completed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trade.metadata?.completion_code && (
                  <div>
                    <p className="text-xs font-semibold text-green-700 uppercase mb-1">Completion Code</p>
                    <p className="font-mono text-lg font-bold text-green-900">{trade.metadata.completion_code}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {trade.status === "pending" && (
              <Button 
                onClick={handleCancelTrade}
                disabled={cancelling}
                className="rounded-full bg-red-600 hover:bg-red-700 flex-1 sm:flex-none"
              >
                {cancelling ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Trade"
                )}
              </Button>
            )}
            <Button asChild className="rounded-full flex-1 sm:flex-none">
              <Link href="/messages">Continue in Messages</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full flex-1 sm:flex-none">
              <Link href="/dashboard/history">Back to History</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
