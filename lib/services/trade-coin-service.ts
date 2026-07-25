import { createClient } from "@/lib/supabase/client"
import type { TradeCoinPricing, TradeCoinBalance, TradeCoinOrder, TradeCoinTransaction } from "@/lib/types/database"

export class TradeCoinService {
  private supabase = createClient()

  /**
   * Get Trade Coin pricing for all coin types
   */
  async getPricing(): Promise<TradeCoinPricing[]> {
    const { data, error } = await this.supabase
      .from('trade_coin_pricing')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw error
    return data || []
  }

  /**
   * Get user's Trade Coin balance
   */
  async getUserBalance(userId: string): Promise<TradeCoinBalance> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('trade_coin_balance, trade_coin_stc, trade_coin_dtc, trade_coin_gtc')
      .eq('id', userId)
      .single()

    if (error) throw error

    return {
      total_balance: data.trade_coin_balance || 0,
      stc_balance: data.trade_coin_stc || 0,
      dtc_balance: data.trade_coin_dtc || 0,
      gtc_balance: data.trade_coin_gtc || 0,
    }
  }

  /**
   * Validate if user has sufficient Trade Coin balance
   */
  async validateBalance(userId: string, coinType: 'STC' | 'DTC' | 'GTC', amount: number): Promise<boolean> {
    const balance = await this.getUserBalance(userId)
    
    switch (coinType) {
      case 'STC':
        return balance.stc_balance >= amount
      case 'DTC':
        return balance.dtc_balance >= amount
      case 'GTC':
        return balance.gtc_balance >= amount
      default:
        return false
    }
  }

  /**
   * Calculate order total
   */
  calculateOrderTotal(basePrice: number, hours: number, tradeFee: number, orderType: 'buy' | 'sell'): number {
    const subtotal = basePrice * hours
    return orderType === 'buy' ? subtotal + tradeFee : subtotal - tradeFee
  }

  /**
   * Create a buy order
   */
  async createBuyOrder(
    userId: string,
    coinType: 'STC' | 'DTC' | 'GTC',
    hours: number,
    paymentMethod: string = 'opay'
  ): Promise<TradeCoinOrder> {
    const { data, error } = await this.supabase.rpc('create_trade_coin_buy_order', {
      p_user_id: userId,
      p_coin_type: coinType,
      p_hours: hours,
      p_payment_method: paymentMethod,
    })

    if (error) throw error
    return data
  }


  async createValueBuyOrder({
    userId,
    coins,
    baseAmount,
    serviceFee,
    flutterwaveCharge,
    flutterwaveVat,
    totalPayable,
    paymentMethod = "flutterwave",
  }: {
    userId: string
    coins: number
    baseAmount: number
    serviceFee: number
    flutterwaveCharge: number
    flutterwaveVat: number
    totalPayable: number
    paymentMethod?: string
  }): Promise<string> {
    const { data, error } = await this.supabase.rpc("create_trade_coin_value_buy_order", {
      user_id_param: userId,
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

  /**
   * Complete a buy order
   */
  async completeBuyOrder(orderId: string, paymentReference: string): Promise<void> {
    const { error } = await this.supabase.rpc('complete_trade_coin_buy_order', {
      p_order_id: orderId,
      p_payment_reference: paymentReference,
    })

    if (error) throw error
  }

  /**
   * Create a sell order
   */
  async createSellOrder(
    userId: string,
    coinType: 'STC' | 'DTC' | 'GTC',
    hours: number
  ): Promise<TradeCoinOrder> {
    const { data, error } = await this.supabase.rpc('create_trade_coin_sell_order', {
      p_user_id: userId,
      p_coin_type: coinType,
      p_hours: hours,
    })

    if (error) throw error
    return data
  }

  /**
   * Complete a sell order
   */
  async completeSellOrder(orderId: string, paymentReference: string = 'payout_pending'): Promise<void> {
    const { error } = await this.supabase.rpc('complete_trade_coin_sell_order', {
      p_order_id: orderId,
      p_payment_reference: paymentReference,
    })

    if (error) throw error
  }

  /**
   * Get user's Trade Coin orders
   */
  async getUserOrders(userId: string, limit: number = 20): Promise<TradeCoinOrder[]> {
    const { data, error } = await this.supabase
      .from('trade_coin_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  /**
   * Get user's Trade Coin transactions
   */
  async getUserTransactions(userId: string, limit: number = 50): Promise<TradeCoinTransaction[]> {
    const { data, error } = await this.supabase
      .from('trade_coin_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  /**
   * Hold Trade Coins in escrow for a trade
   */
  async holdInEscrow(
    tradeId: string,
    fromUserId: string,
    toUserId: string,
    coinType: 'STC' | 'DTC' | 'GTC',
    amount: number
  ): Promise<string> {
    const { data, error } = await this.supabase.rpc('hold_trade_coins_in_escrow', {
      p_trade_id: tradeId,
      p_from_user_id: fromUserId,
      p_to_user_id: toUserId,
      p_coin_type: coinType,
      p_amount: amount,
    })

    if (error) throw error
    return data
  }

  /**
   * Release Trade Coins from escrow (on trade completion)
   */
  async releaseFromEscrow(escrowId: string): Promise<void> {
    const { error } = await this.supabase.rpc('release_trade_coins_from_escrow', {
      p_escrow_id: escrowId,
    })

    if (error) throw error
  }

  /**
   * Refund Trade Coins from escrow (on trade rejection/cancellation)
   */
  async refundFromEscrow(escrowId: string): Promise<void> {
    const { error } = await this.supabase.rpc('refund_trade_coins_from_escrow', {
      p_escrow_id: escrowId,
    })

    if (error) throw error
  }

  /**
   * Get coin color for UI
   */
  getCoinColor(coinType: 'STC' | 'DTC' | 'GTC'): string {
    switch (coinType) {
      case 'STC':
        return 'text-gray-600'
      case 'DTC':
        return 'text-[#073232]'
      case 'GTC':
        return 'text-[#32cd32]'
      default:
        return 'text-gray-600'
    }
  }

  /**
   * Get coin background color for UI
   */
  getCoinBgColor(coinType: 'STC' | 'DTC' | 'GTC'): string {
    switch (coinType) {
      case 'STC':
        return 'bg-gray-100'
      case 'DTC':
        return 'bg-[#073232]/10'
      case 'GTC':
        return 'bg-[#32cd32]/10'
      default:
        return 'bg-gray-100'
    }
  }

  /**
   * Get coin icon name
   */
  getCoinIcon(coinType: 'STC' | 'DTC' | 'GTC'): string {
    switch (coinType) {
      case 'STC':
        return 'star'
      case 'DTC':
        return 'diamond'
      case 'GTC':
        return 'trophy'
      default:
        return 'currency-dollar'
    }
  }
}

export const tradeCoinService = new TradeCoinService()
