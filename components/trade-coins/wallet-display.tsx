"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { tradeCoinService } from "@/lib/services/trade-coin-service"
import type { TradeCoinBalance } from "@/lib/types/database"
import { Loader2 } from "lucide-react"

interface WalletDisplayProps {
  userId: string
  compact?: boolean
}

export function WalletDisplay({ userId, compact = false }: WalletDisplayProps) {
  const [balance, setBalance] = useState<TradeCoinBalance | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBalance()
  }, [userId])

  const loadBalance = async () => {
    try {
      const data = await tradeCoinService.getUserBalance(userId)
      setBalance(data)
    } catch (error) {
      console.error("Error loading Trade Coin balance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!balance) return null

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <CoinBadge amount={balance.total_balance} />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Trade Coin Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
          <span className="text-sm font-medium">Total Balance</span>
          <span className="text-2xl font-bold">{balance.total_balance.toLocaleString()} TC</span>
        </div>
      </CardContent>
    </Card>
  )
}

interface CoinBadgeProps {
  amount: number
}

function CoinBadge({ amount }: CoinBadgeProps) {
  return (
    <Badge variant="outline" className="bg-[#073232]/10 text-[#073232] border-[#073232]/30 font-semibold">
      TC: {amount.toLocaleString()}
    </Badge>
  )
}
