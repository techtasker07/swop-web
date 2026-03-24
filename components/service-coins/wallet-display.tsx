"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <CoinBadge label="BSC" amount={balance.bsc_balance} colorClass="bg-amber-100 text-amber-700 border-amber-300" />
        <CoinBadge label="SSC" amount={balance.ssc_balance} colorClass="bg-gray-100 text-gray-700 border-gray-300" />
        <CoinBadge label="GSC" amount={balance.gsc_balance} colorClass="bg-yellow-100 text-yellow-700 border-yellow-300" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Service Coin Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <CoinCard label="Bronze" code="BSC" amount={balance.bsc_balance} colorClass="bg-amber-50 border-amber-200 text-amber-700" />
          <CoinCard label="Silver" code="SSC" amount={balance.ssc_balance} colorClass="bg-gray-50 border-gray-200 text-gray-700" />
          <CoinCard label="Gold" code="GSC" amount={balance.gsc_balance} colorClass="bg-yellow-50 border-yellow-200 text-yellow-700" />
        </div>
      </CardContent>
    </Card>
  )
}

function CoinBadge({ label, amount, colorClass }: { label: string; amount: number; colorClass: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${colorClass}`}>
      {label}: {amount.toLocaleString()}
    </span>
  )
}

function CoinCard({ label, code, amount, colorClass }: { label: string; code: string; amount: number; colorClass: string }) {
  return (
    <div className={`p-3 rounded-lg border ${colorClass}`}>
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-bold">{amount.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground">{code}</div>
    </div>
  )
}
