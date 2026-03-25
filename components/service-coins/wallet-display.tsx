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

  const total = balance.bsc_balance + balance.ssc_balance + balance.gsc_balance

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <CoinBadge label="BSC" amount={balance.bsc_balance} color="dark" />
        <CoinBadge label="SSC" amount={balance.ssc_balance} color="gray" />
        <CoinBadge label="GSC" amount={balance.gsc_balance} color="green" />
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

        <div className="grid grid-cols-3 gap-3">
          <CoinCard label="Bronze" code="BSC" amount={balance.bsc_balance} color="dark" />
          <CoinCard label="Silver" code="SSC" amount={balance.ssc_balance} color="gray" />
          <CoinCard label="Gold" code="GSC" amount={balance.gsc_balance} color="green" />
        </div>
      </CardContent>
    </Card>
  )
}

type CoinColor = "dark" | "gray" | "green"

const colorMap: Record<CoinColor, { badge: string; card: string; text: string }> = {
  dark:  { badge: "bg-[#073232]/10 text-[#073232] border-[#073232]/30", card: "bg-[#073232]/5 border-[#073232]/20", text: "text-[#073232]" },
  gray:  { badge: "bg-gray-100 text-gray-700 border-gray-300",           card: "bg-gray-50 border-gray-200",           text: "text-gray-700" },
  green: { badge: "bg-[#32cd32]/10 text-[#32cd32] border-[#32cd32]/30", card: "bg-[#32cd32]/5 border-[#32cd32]/20",   text: "text-[#32cd32]" },
}

function CoinBadge({ label, amount, color }: { label: string; amount: number; color: CoinColor }) {
  return (
    <Badge variant="outline" className={`${colorMap[color].badge} font-semibold`}>
      {label}: {amount.toLocaleString()}
    </Badge>
  )
}

function CoinCard({ label, code, amount, color }: { label: string; code: string; amount: number; color: CoinColor }) {
  const c = colorMap[color]
  return (
    <div className={`p-3 rounded-lg border ${c.card}`}>
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      <div className={`text-lg font-bold ${c.text}`}>{amount.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground">{code}</div>
    </div>
  )
}
