"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { verifyFlutterwavePayment } from "@/lib/services/flutterwave-service"
import { tradeCoinService } from "@/lib/services/trade-coin-service"
import { serviceCoinService } from "@/lib/services/service-coin-service"

export function CoinPaymentReturnHandler({ reference, expectedKind }: { reference?: string; expectedKind: "trade_coin" | "service_coin" }) {
  useEffect(() => {
    if (!reference) return
    const complete = async () => {
      try {
        const result = await verifyFlutterwavePayment(reference)
        const meta = result.data?.meta || {}
        if (meta.kind !== expectedKind || !meta.order_id) return
        if (expectedKind === "trade_coin") await tradeCoinService.completeBuyOrder(meta.order_id, reference)
        else await serviceCoinService.completeBuyOrder(meta.order_id, reference)
        toast.success("Payment verified and wallet updated")
        window.history.replaceState({}, "", window.location.pathname)
        window.location.reload()
      } catch (error: any) {
        toast.error(error?.message || "Could not verify payment")
      }
    }
    complete()
  }, [reference, expectedKind])

  return null
}
