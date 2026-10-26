"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Coins } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TransactionHistoryDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const transactionId = params.id as string
  const supabase = createClient()
  
  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && transactionId) {
      fetchTransactionDetails()
    }
  }, [user, transactionId])

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from("trade_coin_transactions")
        .select("*")
        .eq("id", transactionId)
        .eq("user_id", user?.id)
        .single()

      if (fetchError) throw fetchError
      if (!data) throw new Error("Transaction not found")

      setTransaction(data)
    } catch (err) {
      console.error("Error fetching transaction details:", err)
      setError("Failed to load transaction details")
    } finally {
      setLoading(false)
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "earned":
        return "bg-green-100 text-green-800"
      case "spent":
        return "bg-red-100 text-red-800"
      case "purchased":
        return "bg-blue-100 text-blue-800"
      case "sold":
        return "bg-purple-100 text-purple-800"
      case "transfer_in":
        return "bg-cyan-100 text-cyan-800"
      case "transfer_out":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
      case "transfer_in":
        return <TrendingUp className="h-6 w-6 text-green-600" />
      case "spent":
      case "transfer_out":
        return <TrendingDown className="h-6 w-6 text-red-600" />
      default:
        return <Coins className="h-6 w-6 text-gray-600" />
    }
  }

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

  const getTransactionLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      earned: "Coins Earned",
      spent: "Coins Spent",
      purchased: "Coins Purchased",
      sold: "Coins Sold",
      transfer_in: "Coins Received",
      transfer_out: "Coins Sent",
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading transaction details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto max-w-2xl px-4 py-8">
            <Card className="border-red-200 bg-red-50 rounded-[1.75rem]">
              <CardContent className="p-6 text-center">
                <p className="text-red-800 mb-4">{error || "Transaction not found"}</p>
                <Button asChild className="rounded-full">
                  <Link href="/dashboard/history?tab=transactions">Back to Transactions</Link>
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
        <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard/history?tab=transactions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Transactions
            </Link>
          </Button>

          {/* Header */}
          <div className="rounded-[2rem] bg-gradient-to-r from-[#073232] to-[#0a4a4a] p-6 text-white shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Transaction Details</h1>
                <p className="text-white/75 capitalize">{getTransactionLabel(transaction.transaction_type)}</p>
              </div>
              <Badge className={`rounded-full capitalize text-lg px-4 py-2 ${getTransactionTypeColor(transaction.transaction_type)}`}>
                {transaction.transaction_type.replace("_", " ")}
              </Badge>
            </div>
          </div>

          {/* Main Details */}
          <Card className="rounded-[1.75rem] shadow-md">
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount */}
              <div className="p-6 bg-gradient-to-br from-[#073232]/10 to-[#32cd32]/10 rounded-xl border-2 border-[#32cd32]/20">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Amount</p>
                    <p className="text-4xl font-bold text-[#32cd32]">
                      {transaction.transaction_type === "spent" || transaction.transaction_type === "transfer_out" ? "-" : "+"}
                      {transaction.amount}
                    </p>
                    <p className="text-lg text-muted-foreground mt-2">{transaction.coin_type || "Trade Coins"}</p>
                  </div>
                  <div className={`p-4 rounded-full ${
                    transaction.transaction_type === "earned" || transaction.transaction_type === "transfer_in"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}>
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                </div>
              </div>

              {/* Description */}
              {transaction.description && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Description</p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-border">
                    <p className="text-foreground">{transaction.description}</p>
                  </div>
                </div>
              )}

              {/* Naira Value (if available) */}
              {transaction.naira_value && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Equivalent Value</p>
                  <p className="text-2xl font-bold text-foreground">₦{transaction.naira_value}</p>
                </div>
              )}

              {/* Metadata */}
              {transaction.metadata && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Additional Details</p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-border">
                    <pre className="text-xs text-foreground overflow-auto">
                      {JSON.stringify(transaction.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-3 pt-4 border-t">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Timeline</p>
                <div className="flex items-start gap-4">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Transaction Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Information */}
          {transaction.related_request_id && (
            <Card className="rounded-[1.75rem] shadow-md">
              <CardHeader>
                <CardTitle>Related Request</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This transaction is related to request ID: {transaction.related_request_id}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button asChild className="rounded-full flex-1 sm:flex-none">
              <Link href="/dashboard/history?tab=transactions">Back to Transactions</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
