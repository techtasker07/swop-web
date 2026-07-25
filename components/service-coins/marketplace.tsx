"use client"

import { type ReactNode, useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { serviceCoinService } from "@/lib/services/service-coin-service"
import { coinPaymentPricingService, COIN_NAIRA_VALUE, type CoinPaymentQuote } from "@/lib/services/coin-payment-pricing-service"
import { createFlutterwavePayment } from "@/lib/services/flutterwave-service"
import { createClient } from "@/lib/supabase/client"
import { formatNaira } from "@/lib/utils/currency"
import { toast } from "sonner"
import { Banknote, Clock3, Loader2, Send, ShieldCheck, Wrench } from "lucide-react"

interface ServiceCoinMarketplaceProps {
  userId: string
}

export function ServiceCoinMarketplace({ userId }: ServiceCoinMarketplaceProps) {
  const [hours, setHours] = useState(1)
  const [sellHours, setSellHours] = useState(1)
  const [buyQuote, setBuyQuote] = useState<CoinPaymentQuote | null>(null)
  const [payoutQuote, setPayoutQuote] = useState<CoinPaymentQuote | null>(null)
  const [balance, setBalance] = useState(0)
  const [accountName, setAccountName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [bankName, setBankName] = useState("")
  const [isPaying, setIsPaying] = useState(false)
  const [isSelling, setIsSelling] = useState(false)

  const buyAmount = useMemo(() => Math.max(1, hours) * COIN_NAIRA_VALUE, [hours])
  const sellAmount = useMemo(() => Math.max(1, sellHours) * COIN_NAIRA_VALUE, [sellHours])

  useEffect(() => {
    serviceCoinService
      .getUserBalance(userId)
      .then((data) => setBalance((data.bsc_balance || 0) + (data.ssc_balance || 0) + (data.gsc_balance || 0)))
      .catch(console.error)
  }, [userId])

  useEffect(() => {
    let active = true
    coinPaymentPricingService.quotePurchase(userId, buyAmount).then((quote) => { if (active) setBuyQuote(quote) }).catch(console.error)
    return () => { active = false }
  }, [userId, buyAmount])

  useEffect(() => {
    let active = true
    coinPaymentPricingService.quotePayout(userId, sellAmount).then((quote) => { if (active) setPayoutQuote(quote) }).catch(console.error)
    return () => { active = false }
  }, [userId, sellAmount])

  const maxSellHours = Math.max(0, Math.floor(balance))
  const hasEnoughBalance = sellHours <= maxSellHours

  const handleBuy = async () => {
    if (!buyQuote) return
    setIsPaying(true)
    try {
      const orderId = await serviceCoinService.createValueBuyOrder({
        userId,
        hours,
        coins: buyQuote.coins,
        baseAmount: buyQuote.baseAmount,
        serviceFee: buyQuote.serviceFee,
        flutterwaveCharge: buyQuote.flutterwaveCharge,
        flutterwaveVat: buyQuote.flutterwaveVat,
        totalPayable: buyQuote.totalPayable,
      })
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const payment = await createFlutterwavePayment({
        amount: buyQuote.totalPayable,
        email: user?.email || "customer@swopify.app",
        name: user?.user_metadata?.display_name || user?.email || "Swopify user",
        description: `Buy ${hours} Service Coin hour${hours === 1 ? "" : "s"}`,
        metadata: {
          kind: "service_coin",
          order_id: orderId,
          coin_type: "SC",
          hours,
          coins: buyQuote.coins,
          base_amount: buyQuote.baseAmount,
          user_id: userId,
        },
        redirectPath: "/service-coins" as any,
      } as any)
      window.location.href = payment.checkout_url
    } catch (error: any) {
      toast.error(error?.message || "Could not initialize Service Coin payment")
    } finally {
      setIsPaying(false)
    }
  }

  const handleSell = async () => {
    if (!payoutQuote) return
    if (!accountName.trim() || !accountNumber.trim() || !bankName.trim()) {
      toast.error("Enter payout account name, account number, and bank.")
      return
    }
    if (!hasEnoughBalance) {
      toast.error("Insufficient Service Coin balance")
      return
    }

    setIsSelling(true)
    let orderId: string | null = null
    try {
      orderId = await serviceCoinService.createPayoutOrder({
        userId,
        hours: sellHours,
        coins: payoutQuote.coins,
        baseAmount: payoutQuote.baseAmount,
        serviceFee: payoutQuote.serviceFee,
        flutterwaveCharge: payoutQuote.flutterwaveCharge,
        netPayout: payoutQuote.netPayout,
        payoutDetails: { account_name: accountName.trim(), account_number: accountNumber.trim(), bank_name: bankName.trim() },
      })
      const payout = await serviceCoinService.requestFlutterwavePayout({
        orderId,
        amount: payoutQuote.netPayout,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        bankName: bankName.trim(),
      })
      await serviceCoinService.markPayoutProcessing(orderId, payout.reference)
      toast.success("Payout request sent to Flutterwave")
      window.location.reload()
    } catch (error: any) {
      const message = error?.message || "Could not request payout"
      if (orderId && message.toLowerCase().includes("ip whitelist")) {
        await serviceCoinService.markPayoutProcessing(orderId, "pending_flutterwave_ip_whitelist").catch(console.error)
        toast.warning("Payout was queued. Enable Flutterwave IP whitelisting for the deployed server, then process it from operations.")
        window.location.reload()
        return
      }
      if (orderId) await serviceCoinService.cancelPayoutOrder(orderId).catch(console.error)
      toast.error(message)
    } finally {
      setIsSelling(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-[#32cd32]/50 bg-[#073232] p-5 text-white shadow-xl shadow-[#073232]/10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-[1.25rem] bg-[#32cd32] p-3 text-[#073232]"><Wrench className="h-6 w-6" /></div>
            <div>
              <h2 className="text-2xl font-bold">Service Coin Wallet</h2>
              <p className="mt-1 text-sm text-white/70">1 hour = 1 SC = {formatNaira(COIN_NAIRA_VALUE)}. SC is sellable after deductions.</p>
            </div>
          </div>
          <Badge className="w-fit rounded-full bg-white text-[#073232]">Available {balance.toLocaleString()} SC</Badge>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric label="Service Coin" value={`${balance.toLocaleString()} SC`} />
          <Metric label="Wallet Value" value={formatNaira(balance * COIN_NAIRA_VALUE)} />
          <Metric label="Earned Hours" value={`${balance.toLocaleString()} hrs`} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-[2rem] border-gray-200 bg-white shadow-lg">
          <CardContent className="space-y-4 p-5">
            <PanelTitle icon={<Clock3 className="h-5 w-5" />} title="Buy Service Coin" body="Purchase service hours through Flutterwave checkout." />
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#073232]">Hours to buy</label>
              <Input type="number" min={1} step={1} value={hours} onChange={(event) => setHours(Math.max(1, Number(event.target.value) || 1))} className="h-12 rounded-full px-5 font-semibold" />
            </div>
            <QuoteBox quote={buyQuote} mode="buy" />
            <Button onClick={handleBuy} disabled={!buyQuote || isPaying} className="h-12 w-full rounded-full bg-[#32cd32] font-bold text-[#073232] hover:bg-[#28b928]">
              {isPaying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opening checkout...</> : <><Banknote className="mr-2 h-5 w-5" />Pay {buyQuote ? formatNaira(buyQuote.totalPayable) : ""}</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-gray-200 bg-white shadow-lg">
          <CardContent className="space-y-4 p-5">
            <PanelTitle icon={<Send className="h-5 w-5" />} title="Sell Service Coin" body="Enter the bank account where Flutterwave should send your payout." />
            <div className="grid gap-3">
              <Input value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder="Account name" className="h-12 rounded-full px-5" />
              <Input value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} placeholder="Account number" className="h-12 rounded-full px-5" />
              <Input value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder="Bank name" className="h-12 rounded-full px-5" />
              <Input type="number" min={1} max={Math.max(1, maxSellHours)} step={1} value={sellHours} onChange={(event) => setSellHours(Math.max(1, Number(event.target.value) || 1))} className="h-12 rounded-full px-5 font-semibold" />
            </div>
            {!hasEnoughBalance && <p className="text-sm font-semibold text-[#073232]">You only have {maxSellHours.toLocaleString()} SC available.</p>}
            <QuoteBox quote={payoutQuote} mode="payout" />
            <div className="rounded-[1.5rem] bg-[#073232] p-4 text-sm text-white">
              <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-[#32cd32]" /><span>Swopify deducts your plan fee and Flutterwave 0.2% transfer charge before sending the payout.</span></div>
            </div>
            <Button onClick={handleSell} disabled={!payoutQuote || isSelling || !hasEnoughBalance} className="h-12 w-full rounded-full bg-[#073232] font-bold text-white hover:bg-[#0b4444]">
              {isSelling ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Requesting payout...</> : <>Request {payoutQuote ? formatNaira(payoutQuote.netPayout) : ""} payout</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[1.5rem] border border-[#32cd32]/40 bg-[#001f1f]/50 p-4"><p className="text-xs font-semibold uppercase text-white/60">{label}</p><p className="mt-2 text-xl font-bold">{value}</p></div>
}

function PanelTitle({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return <div className="flex items-start gap-3"><div className="rounded-[1.25rem] bg-[#32cd32] p-3 text-[#073232]">{icon}</div><div><h3 className="text-xl font-bold text-[#073232]">{title}</h3><p className="text-sm text-[#073232]/70">{body}</p></div></div>
}

function QuoteBox({ quote, mode }: { quote: CoinPaymentQuote | null; mode: "buy" | "payout" }) {
  if (!quote) return <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-4 text-sm text-[#073232]">Calculating...</div>
  return (
    <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-4 text-sm text-[#073232]">
      <div className="space-y-2">
        <Row label="Service Coin value" value={formatNaira(quote.baseAmount)} />
        <Row label={`Swopify ${quote.plan.name} fee (${quote.serviceFeePercent}%)`} value={`${mode === "buy" ? "+" : "-"}${formatNaira(quote.serviceFee)}`} />
        <Row label={mode === "buy" ? "Flutterwave charge (2%)" : "Flutterwave transfer charge (0.2%)"} value={`${mode === "buy" ? "+" : "-"}${formatNaira(quote.flutterwaveCharge)}`} />
        {mode === "buy" && <Row label="VAT on Flutterwave charge (7%)" value={`+${formatNaira(quote.flutterwaveVat)}`} />}
        <div className="border-t border-gray-200 pt-3"><Row label={mode === "buy" ? "Total before payment" : "Estimated payout"} value={formatNaira(mode === "buy" ? quote.totalPayable : quote.netPayout)} strong /></div>
        <div className="border-t border-gray-200 pt-3"><Row label={mode === "buy" ? "Coins to receive" : "Coins to sell"} value={`${quote.coins.toLocaleString()} SC`} strong /></div>
      </div>
    </div>
  )
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex items-center justify-between gap-4 ${strong ? "text-base font-bold" : ""}`}><span>{label}</span><span className="text-right">{value}</span></div>
}