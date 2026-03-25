"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { serviceCoinService } from "@/lib/services/service-coin-service"
import type { ServiceCoinPricing, ServiceCoinBalance } from "@/lib/types/database"
import { formatNaira } from "@/lib/utils/currency"
import { toast } from "sonner"
import { Loader2, AlertCircle } from "lucide-react"

interface SellServiceCoinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coin: ServiceCoinPricing
  userId: string
}

export function SellServiceCoinDialog({ open, onOpenChange, coin, userId }: SellServiceCoinDialogProps) {
  const [hours, setHours] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [balance, setBalance] = useState<ServiceCoinBalance | null>(null)

  useEffect(() => {
    if (open) {
      serviceCoinService.getUserBalance(userId).then(setBalance).catch(console.error)
    }
  }, [open, userId])

  const subtotal = coin.base_price_per_hour * hours
  const total = subtotal - coin.trade_fee
  const serviceCoins = hours * 100

  const availableBalance = balance
    ? coin.coin_type === "BSC" ? balance.bsc_balance
    : coin.coin_type === "SSC" ? balance.ssc_balance
    : balance.gsc_balance
    : 0

  const maxHours = Math.floor(availableBalance / 100)
  const hasInsufficientBalance = serviceCoins > availableBalance

  const handleSell = async () => {
    if (hasInsufficientBalance) {
      toast.error(`Insufficient ${coin.coin_type} balance`)
      return
    }
    setIsLoading(true)
    try {
      const orderId = await serviceCoinService.createSellOrder(userId, coin.coin_type, hours)
      await serviceCoinService.completeSellOrder(orderId)
      toast.success(`Successfully sold ${serviceCoins} ${coin.coin_type} Service Coins!`)
      onOpenChange(false)
      window.location.reload()
    } catch (error) {
      console.error("Error selling Service Coins:", error)
      toast.error("Failed to sell Service Coins. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sell {coin.coin_name}</DialogTitle>
          <DialogDescription>Convert your Service Coins back to cash</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {balance && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Available: <strong>{availableBalance.toLocaleString()} {coin.coin_type}</strong>
                {maxHours > 0 && ` (${maxHours} hours)`}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Label>Select Hours (1–{Math.min(10, maxHours) || 1})</Label>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={() => setHours(Math.max(1, hours - 1))} disabled={hours <= 1}>-</Button>
              <Slider
                value={[hours]}
                onValueChange={(v) => setHours(v[0])}
                min={1}
                max={Math.max(1, Math.min(10, maxHours))}
                step={1}
                className="flex-1"
                disabled={maxHours === 0}
              />
              <Button variant="outline" size="icon" onClick={() => setHours(Math.min(Math.min(10, maxHours), hours + 1))} disabled={hours >= Math.min(10, maxHours)}>+</Button>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold">{hours}</span>
              <span className="text-muted-foreground ml-2">Hours</span>
            </div>
          </div>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per Hour</span>
                <span>{formatNaira(coin.base_price_per_hour)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hours</span>
                <span>{hours}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#073232]">
                <span>Service Fee</span>
                <span>-{formatNaira(coin.trade_fee)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>You Receive</span>
                <span>{formatNaira(total)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-[#073232]">
                <span>Service Coins</span>
                <span>{serviceCoins.toLocaleString()} SC</span>
              </div>
            </CardContent>
          </Card>

          <Alert className="bg-[#32cd32]/10 border-[#32cd32]/30">
            <AlertCircle className="h-4 w-4 text-[#32cd32]" />
            <AlertDescription className="text-xs text-[#073232]">
              Funds will be transferred to your Opay account within 24–48 hours
            </AlertDescription>
          </Alert>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="flex-1">Cancel</Button>
            <Button onClick={handleSell} disabled={isLoading || hasInsufficientBalance || maxHours === 0} className="flex-1 bg-[#073232] hover:bg-[#073232]/90">
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : "Confirm Sale"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
