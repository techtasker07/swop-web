"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ServiceCoinWallet } from "./wallet-display"
import { BuyServiceCoinDialog } from "./buy-dialog"
import { SellServiceCoinDialog } from "./sell-dialog"
import { serviceCoinService } from "@/lib/services/service-coin-service"
import type { ServiceCoinPricing } from "@/lib/types/database"
import { formatNaira } from "@/lib/utils/currency"
import { Loader2, ShoppingCart, Banknote, Info, Wrench, Settings2, Star } from "lucide-react"

interface ServiceCoinMarketplaceProps {
  userId: string
}

export function ServiceCoinMarketplace({ userId }: ServiceCoinMarketplaceProps) {
  const [pricing, setPricing] = useState<ServiceCoinPricing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCoin, setSelectedCoin] = useState<ServiceCoinPricing | null>(null)
  const [dialogType, setDialogType] = useState<"buy" | "sell" | null>(null)

  useEffect(() => {
    serviceCoinService
      .getPricing()
      .then(setPricing)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const handleAction = (coin: ServiceCoinPricing, type: "buy" | "sell") => {
    setSelectedCoin(coin)
    setDialogType(type)
  }

  const handleClose = () => {
    setSelectedCoin(null)
    setDialogType(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ServiceCoinWallet userId={userId} />

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">About Service Coins</p>
              <p className="text-xs text-blue-800">
                Service Coins are used to pay for service listings on Swopify.
                BSC (Bronze) — entry-level · SSC (Silver) — mid-tier · GSC (Gold) — premium.
                1 hour = 100 Service Coins. A service fee applies to all transactions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy Service Coins
          </TabsTrigger>
          <TabsTrigger value="sell">
            <Banknote className="h-4 w-4 mr-2" />
            Sell Service Coins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {pricing.map((coin) => (
              <ServiceCoinCard key={coin.coin_type} coin={coin} action="buy" onAction={() => handleAction(coin, "buy")} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sell" className="mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {pricing.map((coin) => (
              <ServiceCoinCard key={coin.coin_type} coin={coin} action="sell" onAction={() => handleAction(coin, "sell")} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedCoin && dialogType === "buy" && (
        <BuyServiceCoinDialog open onOpenChange={handleClose} coin={selectedCoin} userId={userId} />
      )}
      {selectedCoin && dialogType === "sell" && (
        <SellServiceCoinDialog open onOpenChange={handleClose} coin={selectedCoin} userId={userId} />
      )}
    </div>
  )
}

const coinMeta = {
  BSC: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", btn: "bg-amber-700 hover:bg-amber-800", icon: Wrench, text: "text-amber-700" },
  SSC: { bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-100 text-gray-700", btn: "bg-gray-600 hover:bg-gray-700", icon: Settings2, text: "text-gray-700" },
  GSC: { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700", btn: "bg-yellow-600 hover:bg-yellow-700", icon: Star, text: "text-yellow-700" },
}

function ServiceCoinCard({ coin, action, onAction }: { coin: ServiceCoinPricing; action: "buy" | "sell"; onAction: () => void }) {
  const meta = coinMeta[coin.coin_type]
  const Icon = meta.icon

  return (
    <Card className={`${meta.bg} ${meta.border}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${meta.text}`} />
            <CardTitle className={`text-base ${meta.text}`}>{coin.coin_name}</CardTitle>
          </div>
          <Badge className={meta.badge}>{coin.coin_type}</Badge>
        </div>
        <CardDescription className="text-xs">{coin.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">1 Hour (100 SC)</span>
            <span className="font-semibold">{formatNaira(coin.base_price_per_hour)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Service Fee</span>
            <span>{formatNaira(coin.trade_fee)}</span>
          </div>
        </div>
        <Button onClick={onAction} className={`w-full text-white ${meta.btn}`}>
          {action === "buy" ? "Buy Now" : "Sell Now"}
        </Button>
      </CardContent>
    </Card>
  )
}
