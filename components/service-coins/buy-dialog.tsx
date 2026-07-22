"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { serviceCoinService } from "@/lib/services/service-coin-service"
import { createFlutterwavePayment } from "@/lib/services/flutterwave-service"
import { createClient } from "@/lib/supabase/client"
import type { ServiceCoinPricing } from "@/lib/types/database"
import { formatNaira } from "@/lib/utils/currency"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface BuyServiceCoinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coin: ServiceCoinPricing
  userId: string
}

export function BuyServiceCoinDialog({ open, onOpenChange, coin, userId }: BuyServiceCoinDialogProps) {
  const [hours, setHours] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const subtotal = coin.base_price_per_hour * hours
  const total = subtotal + coin.trade_fee
  const serviceCoins = hours * 100

  const handleBuy = async () => {
    setIsLoading(true)
    try {
      const orderId = await serviceCoinService.createBuyOrder(userId, coin.coin_type, hours)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const payment = await createFlutterwavePayment({
        amount: total,
        email: user?.email || "customer@swopify.app",
        name: user?.user_metadata?.display_name || user?.email || "Swopify user",
        description: `Buy ${coin.coin_name}`,
        metadata: { kind: "service_coin", order_id: orderId, coin_type: coin.coin_type, hours, user_id: userId },
        redirectPath: "/service-coins" as any,
      } as any)
      toast.success("Payment initialized. Complete checkout to receive service coins.")
      window.location.href = payment.checkout_url
    } catch (error) {
      console.error("Error buying Service Coins:", error)
      toast.error("Failed to purchase Service Coins. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Buy {coin.coin_name}</DialogTitle>
          <DialogDescription>Select the number of hours you want to purchase</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label>Select Hours (1–10)</Label>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={() => setHours(Math.max(1, hours - 1))} disabled={hours <= 1}>-</Button>
              <Slider value={[hours]} onValueChange={(v) => setHours(v[0])} min={1} max={10} step={1} className="flex-1" />
              <Button variant="outline" size="icon" onClick={() => setHours(Math.min(10, hours + 1))} disabled={hours >= 10}>+</Button>
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
              <div className="flex justify-between text-sm text-amber-600">
                <span>Service Fee</span>
                <span>+{formatNaira(coin.trade_fee)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatNaira(total)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-[#073232]">
                <span>Service Coins</span>
                <span>{serviceCoins.toLocaleString()} SC</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="flex-1">Cancel</Button>
            <Button onClick={handleBuy} disabled={isLoading} className="flex-1 bg-[#073232] hover:bg-[#073232]/90">
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : "Confirm Purchase"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

