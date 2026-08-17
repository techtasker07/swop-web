"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { serviceCoinService } from "@/lib/services/service-coin-service"
import type { ServiceCoinBalance } from "@/lib/types/database"
import { Loader2 } from "lucide-react"

interface ServiceCoinWalletProps {
  userId: string
  compact?: boolean
}

export function ServiceCoinWallet({ userId, compact = false }: ServiceCoinWalletProps) {
  const [balance, setBalance] = useState<ServiceCoinBalance | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    serviceCoinService
      .getUserBalance(userId)
      .then(setBalance)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!balance) return null

  const total = (balance.bsc_balance + balance.ssc_balance + balance.gsc_balance) || 0

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <CoinBadge amount={total} />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Service Coin Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
          <span className="text-sm font-medium">Total Balance</span>
          <span className="text-2xl font-bold">{total.toLocaleString()} SC</span>
        </div>
      </CardContent>
    </Card>
  )
}

function CoinBadge({ amount }: { amount: number }) {
  return (
    <Badge variant="outline" className="bg-[#073232]/10 text-[#073232] border-[#073232]/30 font-semibold">
      SC: {amount.toLocaleString()}
    </Badge>
  )
}
