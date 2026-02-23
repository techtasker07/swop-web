"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { tradeCoinService } from "@/lib/services/trade-coin-service"
import type { TradeCoinPricing } from "@/lib/types/database"
import { formatNaira } from "@/lib/utils/currency"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface BuyTradeCoinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coin: TradeCoinPricing
  userId: string
}

export function BuyTradeCoinDialog({ open, onOpenChange, coin, userId }: BuyTradeCoinDialogProps) {
  const [hours, setHours] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const subtotal = coin.base_price_per_hour * hours
  const total = subtotal + coin.trade_fee
  const tradeCoins = hours * 100

  const handleBuy = async () => {
    setIsLoading(true)

    try {
      // Create buy order
      const order = await tradeCoinService.createBuyOrder(userId, coin.coin_type as 'STC' | 'DTC' | 'GTC', hours)

      // In a real implementation, you would integrate with Opay payment here
      // For now, we'll simulate a successful payment
      const paymentReference = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Complete the order
      await tradeCoinService.completeBuyOrder(order.id, paymentReference)

      toast.success(`Successfully purchased ${tradeCoins} ${coin.coin_type} Trade Coins!`)
      onOpenChange(false)

      // Reload the page to update balance
      window.location.reload()
    } catch (error) {
      console.error("Error buying Trade Coins:", error)
      toast.error("Failed to purchase Trade Coins. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Buy {coin.coin_name}</DialogTitle>
          <DialogDescription>
            Select the number of hours you want to purchase
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hours Selector */}
          <div className="space-y-4">
            <Label>Select Hours (1-10)</Label>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setHours(Math.max(1, hours - 1))}
                disabled={hours <= 1}
              >
                -
              </Button>
              <Slider
                value={[hours]}
                onValueChange={(value) => setHours(value[0])}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setHours(Math.min(10, hours + 1))}
                disabled={hours >= 10}
              >
                +
              </Button>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold">{hours}</span>
              <span className="text-muted-foreground ml-2">Hours</span>
            </div>
          </div>

          {/* Order Summary */}
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
              <div className="flex justify-between text-sm text-[#32cd32]">
                <span>Trade Fee</span>
                <span>+{formatNaira(coin.trade_fee)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatNaira(total)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-primary">
                <span>Trade Coins</span>
                <span>{tradeCoins.toLocaleString()} TC</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBuy}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Purchase'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
