"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { tradeCoinService } from "@/lib/services/trade-coin-service"
import { coinPaymentPricingService, COIN_NAIRA_VALUE, type CoinPaymentQuote } from "@/lib/services/coin-payment-pricing-service"
import { createFlutterwavePayment } from "@/lib/services/flutterwave-service"
import { createClient } from "@/lib/supabase/client"
import { formatNaira } from "@/lib/utils/currency"
import { toast } from "sonner"
import { Banknote, Loader2, ShieldCheck, ShoppingCart, WalletCards } from "lucide-react"

interface TradeCoinMarketplaceProps {
  userId: string
}

export function TradeCoinMarketplace({ userId }: TradeCoinMarketplaceProps) {
  const [amount, setAmount] = useState(COIN_NAIRA_VALUE)
  const [quote, setQuote] = useState<CoinPaymentQuote | null>(null)
  const [balance, setBalance] = useState(0)
  const [isQuoting, setIsQuoting] = useState(true)
  const [isPaying, setIsPaying] = useState(false)

  useEffect(() => {
    tradeCoinService.getUserBalance(userId).then((data) => setBalance(data.total_balance || 0)).catch(console.error)
  }, [userId])

  useEffect(() => {
    let active = true
    setIsQuoting(true)
    coinPaymentPricingService
      .quotePurchase(userId, amount)
      .then((nextQuote) => { if (active) setQuote(nextQuote) })
      .catch((error) => toast.error(error?.message || "Could not calculate Trade Coin pricing"))
      .finally(() => { if (active) setIsQuoting(false) })
    return () => { active = false }
  }, [userId, amount])

  const value = useMemo(() => balance * COIN_NAIRA_VALUE, [balance])

  const handlePay = async () => {
    if (!quote) return
    setIsPaying(true)
    try {
      const orderId = await tradeCoinService.createValueBuyOrder({
        userId,
        coins: quote.coins,
        baseAmount: quote.baseAmount,
        serviceFee: quote.serviceFee,
        flutterwaveCharge: quote.flutterwaveCharge,
        flutterwaveVat: quote.flutterwaveVat,
        totalPayable: quote.totalPayable,
      })
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const payment = await createFlutterwavePayment({
        amount: quote.totalPayable,
        email: user?.email || "customer@swopify.app",
        name: user?.user_metadata?.display_name || user?.email || "Swopify user",
        description: `Buy ${quote.coins} Trade Coin${quote.coins === 1 ? "" : "s"}`,
        metadata: {
          kind: "trade_coin",
          order_id: orderId,
          coin_type: "TC",
          coins: quote.coins,
          base_amount: quote.baseAmount,
          user_id: userId,
        },
        redirectPath: "/trade-coins" as any,
      } as any)
      window.location.href = payment.checkout_url
    } catch (error: any) {
      toast.error(error?.message || "Could not initialize Trade Coin payment")
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-[#32cd32]/50 bg-[#073232] p-5 text-white shadow-xl shadow-[#073232]/10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-[1.25rem] bg-[#32cd32] p-3 text-[#073232]"><WalletCards className="h-6 w-6" /></div>
            <div>
              <h2 className="text-2xl font-bold">Trade Coin Wallet</h2>
              <p className="mt-1 text-sm text-white/70">Buy, hold, and use TC for swaps. Trade Coin is buy-only.</p>
            </div>
          </div>
          <Badge className="w-fit rounded-full bg-white text-[#073232]">1 TC = {formatNaira(COIN_NAIRA_VALUE)}</Badge>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[#32cd32]/40 bg-[#001f1f]/50 p-4">
            <p className="text-xs font-semibold uppercase text-white/60">Total Balance</p>
            <p className="mt-2 text-3xl font-bold">{balance.toLocaleString()} <span className="text-base text-[#32cd32]">TC</span></p>
          </div>
          <div className="rounded-[1.5rem] border border-[#32cd32]/40 bg-[#001f1f]/50 p-4">
            <p className="text-xs font-semibold uppercase text-white/60">Wallet Value</p>
            <p className="mt-2 text-3xl font-bold">{formatNaira(value)}</p>
          </div>
        </div>
      </section>

      <Card className="rounded-[2rem] border-gray-200 bg-white shadow-lg">
        <CardContent className="space-y-5 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-[1.25rem] bg-[#32cd32] p-3 text-[#073232]"><ShoppingCart className="h-5 w-5" /></div>
            <div>
              <h3 className="text-xl font-bold text-[#073232]">Buy Trade Coin</h3>
              <p className="text-sm text-[#073232]/70">Minimum purchase is {formatNaira(COIN_NAIRA_VALUE)}. Fees follow your active {quote?.audience.toUpperCase() || "P2P"} plan.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#073232]">Amount in Naira</label>
            <Input
              type="number"
              min={COIN_NAIRA_VALUE}
              step={COIN_NAIRA_VALUE}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value) || COIN_NAIRA_VALUE)}
              className="h-12 rounded-full border-gray-300 px-5 text-base font-semibold text-[#073232]"
            />
          </div>

          <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-4 text-sm text-[#073232]">
            {isQuoting || !quote ? <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Calculating...</div> : (
              <div className="space-y-2">
                <Row label="Trade Coin value" value={formatNaira(quote.baseAmount)} />
                <Row label={`Swopify ${quote.plan.name} fee (${quote.serviceFeePercent}%)`} value={`+${formatNaira(quote.serviceFee)}`} />
                <Row label="Flutterwave charge (2%)" value={`+${formatNaira(quote.flutterwaveCharge)}`} />
                <Row label="VAT on Flutterwave charge (7%)" value={`+${formatNaira(quote.flutterwaveVat)}`} />
                <div className="border-t border-gray-200 pt-3"><Row label="Total before payment" value={formatNaira(quote.totalPayable)} strong /></div>
                <div className="border-t border-gray-200 pt-3"><Row label="Coins to receive" value={`${quote.coins.toLocaleString()} TC`} strong /></div>
              </div>
            )}
          </div>

          <div className="rounded-[1.5rem] bg-[#073232] p-4 text-sm text-white">
            <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-[#32cd32]" /><span>Flutterwave checkout collects payment securely, then Swopify verifies the transaction and credits your wallet.</span></div>
          </div>

          <Button onClick={handlePay} disabled={!quote || isPaying || isQuoting} className="h-12 w-full rounded-full bg-[#32cd32] text-base font-bold text-[#073232] hover:bg-[#28b928]">
            {isPaying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opening checkout...</> : <><Banknote className="mr-2 h-5 w-5" />Pay {quote ? formatNaira(quote.totalPayable) : ""}</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex items-center justify-between gap-4 ${strong ? "text-base font-bold" : ""}`}><span>{label}</span><span className="text-right">{value}</span></div>
}