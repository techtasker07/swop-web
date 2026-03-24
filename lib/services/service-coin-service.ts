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
