"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WalletDisplay } from "./wallet-display"
import { BuyTradeCoinDialog } from "./buy-dialog"
import { SellTradeCoinDialog } from "./sell-dialog"
import { tradeCoinService } from "@/lib/services/trade-coin-service"
import type { TradeCoinPricing } from "@/lib/types/database"
import { formatNaira } from "@/lib/utils/currency"
import { Loader2, ShoppingCart, Banknote, Info } from "lucide-react"

interface TradeCoinMarketplaceProps {
  userId: string
}

export function TradeCoinMarketplace({ userId }: TradeCoinMarketplaceProps) {
  const [pricing, setPricing] = useState<TradeCoinPricing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCoin, setSelectedCoin] = useState<TradeCoinPricing | null>(null)
  const [dialogType, setDialogType] = useState<'buy' | 'sell' | null>(null)

  useEffect(() => {
    loadPricing()
  }, [])

  const loadPricing = async () => {
    try {
      const data = await tradeCoinService.getPricing()
      setPricing(data)
    } catch (error) {
      console.error("Error loading pricing:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuy = (coin: TradeCoinPricing) => {
    setSelectedCoin(coin)
    setDialogType('buy')
  }

  const handleSell = (coin: TradeCoinPricing) => {
    setSelectedCoin(coin)
    setDialogType('sell')
  }

  const handleDialogClose = () => {
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
      {/* Wallet Display */}
      <WalletDisplay userId={userId} />

      {/* Info Card */}
      <Card className="bg-[#32cd32]/10 border-[#32cd32]/30">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-[#32cd32] mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#073232]">How Trade Coins Work</p>
              <p className="text-xs text-[#073232]/80">
                Trade Coins are virtual currency that facilitate trades when direct swaps aren't possible. 
                Buy Trade Coins with cash, then use them to trade for items or services. 
                1 hour = 100 Trade Coins. A ₦50 trade fee applies to all transactions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marketplace Tabs */}
      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy Trade Coins
          </TabsTrigger>
          <TabsTrigger value="sell">
            <Banknote className="h-4 w-4 mr-2" />
            Sell Trade Coins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {pricing.map((coin) => (
              <CoinCard
                key={coin.id}
                coin={coin}
                action="buy"
                onAction={() => handleBuy(coin)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {pricing.map((coin) => (
              <CoinCard
                key={coin.id}
                coin={coin}
                action="sell"
                onAction={() => handleSell(coin)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {selectedCoin && dialogType === 'buy' && (
        <BuyTradeCoinDialog
          open={true}
          onOpenChange={handleDialogClose}
          coin={selectedCoin}
          userId={userId}
        />
      )}

      {selectedCoin && dialogType === 'sell' && (
        <SellTradeCoinDialog
          open={true}
          onOpenChange={handleDialogClose}
          coin={selectedCoin}
          userId={userId}
        />
      )}
    </div>
  )
}

interface CoinCardProps {
  coin: TradeCoinPricing
  action: 'buy' | 'sell'
  onAction: () => void
}

function CoinCard({ coin, action, onAction }: CoinCardProps) {
  const colorClasses = {
    STC: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      badge: 'bg-gray-100 text-gray-700',
      button: 'bg-gray-600 hover:bg-gray-700',
    },
    DTC: {
      bg: 'bg-[#073232]/5',
      border: 'border-[#073232]/20',
      badge: 'bg-[#073232]/10 text-[#073232]',
      button: 'bg-[#073232] hover:bg-[#073232]/90',
    },
    GTC: {
      bg: 'bg-[#32cd32]/5',
      border: 'border-[#32cd32]/20',
      badge: 'bg-[#32cd32]/10 text-[#32cd32]',
      button: 'bg-[#32cd32] hover:bg-[#28a428]',
    },
  }

  const colors = colorClasses[coin.coin_type as keyof typeof colorClasses]

  return (
    <Card className={`${colors.bg} ${colors.border}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{coin.coin_name}</CardTitle>
          <Badge className={colors.badge}>{coin.coin_type}</Badge>
        </div>
        <CardDescription className="text-xs">{coin.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">1 Hour (100 TC)</span>
            <span className="font-semibold">{formatNaira(coin.base_price_per_hour)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Trade Fee</span>
            <span>{formatNaira(coin.trade_fee)}</span>
          </div>
        </div>

        <Button
          onClick={onAction}
          className={`w-full ${colors.button}`}
        >
          {action === 'buy' ? 'Buy Now' : 'Sell Now'}
        </Button>
      </CardContent>
    </Card>
  )
}
