"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Clock, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function HistoryPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("trades")
  const [trades, setTrades] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingTradeId, setCancellingTradeId] = useState<string | null>(null)

  // Set initial tab from URL params
  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam === "trades" || tabParam === "transactions") {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    if (!user) {
      console.log("No user found, skipping fetch")
      return
    }
    
    console.log("Starting data fetch for user:", user.id)
    setLoading(true)
    
    try {
      // Step 1: Fetch all trades with basic info (no joins first)
      console.log(`Step 1: Querying trades for user ${user.id}...`)
      const { data: basicTrades, error: basicTradesError } = await supabase
        .from("trades")
        .select("id, status, created_at, proposer_id, receiver_id, message, metadata")
        .or(`proposer_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })

      if (basicTradesError) {
        console.error("Error fetching basic trades:", basicTradesError)
        toast.error(`Failed to load trades: ${basicTradesError.message}`)
      } else {
        console.log(`Step 1 Success: Fetched ${basicTrades?.length || 0} basic trades`, basicTrades)
        
        // Step 2: If we got trades, now fetch with joins
        if (basicTrades && basicTrades.length > 0) {
          const { data: tradesWithJoins, error: joinsError } = await supabase
            .from("trades")
            .select(`
              id,
              status,
              created_at,
              updated_at,
              message,
              proposer_id,
              receiver_id,
              metadata,
              proposer:profiles!proposer_id(display_name, avatar_url),
              receiver:profiles!receiver_id(display_name, avatar_url)
            `)
            .or(`proposer_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order("created_at", { ascending: false })

          if (joinsError) {
            console.error("Error fetching trades with joins:", joinsError)
            // Fall back to basic trades without joins
            setTrades(basicTrades)
          } else {
            console.log(`Step 2 Success: Fetched ${tradesWithJoins?.length || 0} trades with joins`, tradesWithJoins)
            
            // Step 3: Fetch listings info from metadata
            const tradesWithListings = tradesWithJoins?.map((trade: any) => {
              const listingId = trade.metadata?.target_listing_id
              return {
                ...trade,
                target_listing: listingId ? { title: trade.metadata?.target_listing_title, price: null } : null
              }
            }) || []
            
            console.log(`Step 3 Success: Enhanced trades with metadata listings`, tradesWithListings)
            setTrades(tradesWithListings)
          }
        } else {
          console.log("No trades found for this user")
          setTrades([])
        }
      }

      // Fetch transactions (Trade Coin transactions)
      console.log(`Querying transactions for user ${user.id}...`)
      const { data: tradeCoins, error: transError } = await supabase
        .from("trade_coin_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (transError) {
        console.error("Error fetching transactions:", transError)
        toast.error(`Failed to load transactions: ${transError.message}`)
      } else {
        console.log(`Successfully fetched ${tradeCoins?.length || 0} transactions`, tradeCoins)
        setTransactions(tradeCoins || [])
      }
    } catch (error) {
      console.error("Error fetching history data:", error)
      toast.error("An unexpected error occurred while loading history")
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "spent":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleCancelTrade = async (tradeId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!window.confirm("Are you sure you want to cancel this trade? This action cannot be undone.")) {
      return
    }

    setCancellingTradeId(tradeId)
    try {
      const { error: deleteError } = await supabase
        .from("trades")
        .delete()
        .eq("id", tradeId)

      if (deleteError) throw deleteError

      toast.success("Trade deleted successfully")
      
      // Remove from the trades list
      setTrades(trades.filter(t => t.id !== tradeId))
    } catch (err: any) {
      console.error("Error deleting trade:", err)
      toast.error(err?.message || "Failed to delete trade")
    } finally {
      setCancellingTradeId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[2rem] bg-gradient-to-r from-[#073232] to-[#0a4a4a] p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">History</h1>
        <p className="text-white/75">Track your transactions and trades</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trades" className="gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Trades
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <Clock className="h-4 w-4" />
            Transactions
          </TabsTrigger>
        </TabsList>

        {/* Trades Tab */}
        <TabsContent value="trades" className="space-y-4">
          {loading ? (
            <Card className="rounded-[1.75rem]">
              <CardContent className="p-10 text-center text-gray-600">
                Loading trades...
              </CardContent>
            </Card>
          ) : trades.length === 0 ? (
            <Card className="rounded-[1.75rem]">
              <CardContent className="p-10 text-center text-gray-600">
                <p className="mb-4">No trades yet.</p>
                <Button asChild className="bg-[#073232] rounded-full">
                  <Link href="/browse">Browse Listings</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {trades.map((trade) => (
                <Link key={trade.id} href={`/dashboard/history/trades/${trade.id}`}>
                  <Card className="rounded-[1.75rem] shadow-md hover:shadow-lg transition-all cursor-pointer hover:border-[#32cd32]/50">
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="rounded-[1.25rem] bg-[#32cd32]/15 p-3 text-[#073232]">
                          <ArrowRightLeft className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#073232]">
                            {trade.target_listing?.title || trade.metadata?.target_listing_title || "Trade proposal"}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {trade.proposer?.display_name === user?.user_metadata?.display_name || trade.proposer_id === user?.id
                              ? `You proposed to ${trade.receiver?.display_name || "Receiver"}`
                              : `${trade.proposer?.display_name || "Proposer"} proposed to you`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(trade.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap justify-end">
                        <Badge className={`rounded-full capitalize ${getStatusColor(trade.status)}`}>
                          {trade.status}
                        </Badge>
                        {trade.status === "pending" && (
                          <Button 
                            onClick={(e) => handleCancelTrade(trade.id, e)}
                            disabled={cancellingTradeId === trade.id}
                            className="rounded-full bg-red-600 hover:bg-red-700" 
                            size="sm"
                          >
                            {cancellingTradeId === trade.id ? "..." : "Delete"}
                          </Button>
                        )}
                        <Button asChild className="rounded-full bg-[#073232]" size="sm" onClick={(e) => e.preventDefault()}>
                          <span>View</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {loading ? (
            <Card className="rounded-[1.75rem]">
              <CardContent className="p-10 text-center text-gray-600">
                Loading transactions...
              </CardContent>
            </Card>
          ) : transactions.length === 0 ? (
            <Card className="rounded-[1.75rem]">
              <CardContent className="p-10 text-center text-gray-600">
                <p>No transactions yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {transactions.map((transaction, index) => (
                <Link key={index} href={`/dashboard/history/transactions/${transaction.id}`}>
                  <Card className="rounded-[1.75rem] shadow-md hover:shadow-lg transition-all cursor-pointer hover:border-[#32cd32]/50">
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`rounded-[1.25rem] p-3 ${
                          transaction.transaction_type === "earned"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}>
                          {getTransactionIcon(transaction.transaction_type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#073232] capitalize">
                            {transaction.transaction_type.replace("_", " ")} {transaction.coin_type || "Trade Coins"}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {transaction.description || "Trade coin transaction"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`text-right ${
                          transaction.transaction_type === "earned"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                          <p className="font-semibold text-lg">
                            {transaction.transaction_type === "earned" ? "+" : "-"}
                            {transaction.amount} {transaction.coin_type || "TC"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
