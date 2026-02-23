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
        <CoinBadge label="STC" amount={balance.stc_balance} color="gray" />
        <CoinBadge label="DTC" amount={balance.dtc_balance} color="blue" />
        <CoinBadge label="GTC" amount={balance.gtc_balance} color="amber" />
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

        <div className="grid grid-cols-3 gap-3">
          <CoinCard
            label="Silver"
            code="STC"
            amount={balance.stc_balance}
            color="gray"
          />
          <CoinCard
            label="Diamond"
            code="DTC"
            amount={balance.dtc_balance}
            color="blue"
          />
          <CoinCard
            label="Gold"
            code="GTC"
            amount={balance.gtc_balance}
            color="amber"
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface CoinBadgeProps {
  label: string
  amount: number
  color: 'gray' | 'blue' | 'amber'
}

function CoinBadge({ label, amount, color }: CoinBadgeProps) {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700 border-gray-300',
    blue: 'bg-[#073232]/10 text-[#073232] border-[#073232]/30',
    amber: 'bg-[#32cd32]/10 text-[#32cd32] border-[#32cd32]/30',
  }

  return (
    <Badge variant="outline" className={`${colorClasses[color]} font-semibold`}>
      {label}: {amount.toLocaleString()}
    </Badge>
  )
}

interface CoinCardProps {
  label: string
  code: string
  amount: number
  color: 'gray' | 'blue' | 'amber'
}

function CoinCard({ label, code, amount, color }: CoinCardProps) {
  const colorClasses = {
    gray: 'bg-gray-50 border-gray-200',
    blue: 'bg-[#073232]/5 border-[#073232]/20',
    amber: 'bg-[#32cd32]/5 border-[#32cd32]/20',
  }

  const textColorClasses = {
    gray: 'text-gray-700',
    blue: 'text-[#073232]',
    amber: 'text-[#32cd32]',
  }

  return (
    <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      <div className={`text-lg font-bold ${textColorClasses[color]}`}>
        {amount.toLocaleString()}
      </div>
      <div className="text-xs text-muted-foreground">{code}</div>
    </div>
  )
}
