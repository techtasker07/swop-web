import { createClient } from "@/lib/supabase/client"
import type { ServiceCoinPricing, ServiceCoinBalance, ServiceCoinOrder } from "@/lib/types/database"

export class ServiceCoinService {
  private supabase = createClient()

  async getPricing(): Promise<ServiceCoinPricing[]> {
    const { data, error } = await this.supabase.rpc("get_service_coin_pricing")
    if (error) throw error
    return (data as ServiceCoinPricing[]) || []
  }

  async getUserBalance(userId: string): Promise<ServiceCoinBalance> {
    const { data, error } = await this.supabase.rpc("get_user_service_coin_balance", {
      user_id_param: userId,
    })
    if (error) throw error
    const row = Array.isArray(data) ? data[0] : data
    return {
      bsc_balance: row?.bsc_balance ?? 0,
      ssc_balance: row?.ssc_balance ?? 0,
      gsc_balance: row?.gsc_balance ?? 0,
    }
  }

  async createBuyOrder(userId: string, coinType: "BSC" | "SSC" | "GSC", hours: number): Promise<string> {
    const { data, error } = await this.supabase.rpc("create_service_coin_buy_order", {
      user_id_param: userId,
      coin_type_param: coinType,
      hours_param: hours,
    })
    if (error) throw error
    return data as string
  }


  async createValueBuyOrder({
    userId,
    hours,
    coins,
    baseAmount,
    serviceFee,
    flutterwaveCharge,
    flutterwaveVat,
    totalPayable,
    paymentMethod = "flutterwave",
  }: {
    userId: string
    hours: number
    coins: number
    baseAmount: number
    serviceFee: number
    flutterwaveCharge: number
    flutterwaveVat: number
    totalPayable: number
    paymentMethod?: string
  }): Promise<string> {
    const { data, error } = await this.supabase.rpc("create_service_coin_value_buy_order", {
      user_id_param: userId,
      hours_param: hours,
      coins_param: coins,
      base_amount_param: baseAmount,
      service_fee_param: serviceFee,
      flutterwave_charge_param: flutterwaveCharge,
      flutterwave_vat_param: flutterwaveVat,
      total_payable_param: totalPayable,
      payment_method_param: paymentMethod,
    })

    if (error) throw error
    return data as string
  }

  async createPayoutOrder({
    userId,
    hours,
    coins,
    baseAmount,
    serviceFee,
    flutterwaveCharge,
    netPayout,
    payoutDetails,
  }: {
    userId: string
    hours: number
    coins: number
    baseAmount: number
    serviceFee: number
    flutterwaveCharge: number
    netPayout: number
    payoutDetails: Record<string, string | number | null>
  }): Promise<string> {
    const { data, error } = await this.supabase.rpc("create_service_coin_payout_order", {
      user_id_param: userId,
      hours_param: hours,
      coins_param: coins,
      base_amount_param: baseAmount,
      service_fee_param: serviceFee,
      flutterwave_charge_param: flutterwaveCharge,
      net_payout_param: netPayout,
      payout_details_param: payoutDetails,
    })

    if (error) throw error
    return data as string
  }

  async requestFlutterwavePayout({
    orderId,
    amount,
    accountNumber,
    accountName,
    bankName,
  }: {
    orderId: string
    amount: number
    accountNumber: string
    accountName: string
    bankName: string
  }) {
    const response = await fetch("/api/flutterwave/service-payout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        amount,
        account_number: accountNumber,
        account_name: accountName,
        bank_name: bankName,
      }),
    })
    const data = await response.json()
    if (!response.ok || !data.success) throw new Error(data.error || "Payout request failed")
    return data
  }

  async markPayoutProcessing(orderId: string, transferReference?: string): Promise<void> {
    const { error } = await this.supabase.rpc("mark_service_coin_payout_processing", {
      order_id_param: orderId,
      transfer_reference_param: transferReference ?? "payout_processing",
    })
    if (error) throw error
  }

  async completeBuyOrder(orderId: string, paymentReference?: string): Promise<void> {
    const { error } = await this.supabase.rpc("complete_service_coin_buy_order", {
      order_id_param: orderId,
      payment_reference_param: paymentReference ?? null,
    })
    if (error) throw error
  }

  async createSellOrder(userId: string, coinType: "BSC" | "SSC" | "GSC", hours: number): Promise<string> {
    const { data, error } = await this.supabase.rpc("create_service_coin_sell_order", {
      user_id_param: userId,
      coin_type_param: coinType,
      hours_param: hours,
    })
    if (error) throw error
    return data as string
  }

  async completeSellOrder(orderId: string, paymentReference?: string): Promise<void> {
    const { error } = await this.supabase.rpc("complete_service_coin_sell_order", {
      order_id_param: orderId,
      payment_reference_param: paymentReference ?? "payout_pending",
    })
    if (error) throw error
  }


  async cancelPayoutOrder(orderId: string): Promise<void> {
    const { error } = await this.supabase.rpc("cancel_service_coin_payout_order", {
      order_id_param: orderId,
    })
    if (error) console.error("Could not cancel payout order", error)
  }

  calculateTotal(basePrice: number, hours: number, tradeFee: number, type: "buy" | "sell"): number {
    const subtotal = basePrice * hours
    return type === "buy" ? subtotal + tradeFee : subtotal - tradeFee
  }

  getCoinColor(coinType: "BSC" | "SSC" | "GSC"): string {
    switch (coinType) {
      case "BSC": return "text-amber-700"
      case "SSC": return "text-gray-600"
      case "GSC": return "text-yellow-600"
    }
  }

  getCoinBgColor(coinType: "BSC" | "SSC" | "GSC"): string {
    switch (coinType) {
      case "BSC": return "bg-amber-50 border-amber-200"
      case "SSC": return "bg-gray-50 border-gray-200"
      case "GSC": return "bg-yellow-50 border-yellow-200"
    }
  }
}

export const serviceCoinService = new ServiceCoinService()
