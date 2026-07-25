"use client"

import { createClient } from "@/lib/supabase/client"
import { b2bPlans, p2pPlans, swopifyPricingService, type SwopifyPlan } from "@/lib/services/swopify-pricing-service"

export const COIN_NAIRA_VALUE = 1000
const FLUTTERWAVE_COLLECTION_PERCENT = 2
const FLUTTERWAVE_VAT_PERCENT = 7
const FLUTTERWAVE_PAYOUT_PERCENT = 0.2

export interface CoinPaymentQuote {
  audience: "p2p" | "b2b"
  plan: SwopifyPlan
  baseAmount: number
  coins: number
  serviceFeePercent: number
  serviceFee: number
  flutterwaveCharge: number
  flutterwaveVat: number
  totalPayable: number
  netPayout: number
}

function roundNaira(value: number) {
  return Math.max(0, Math.round(value))
}

function normalizeBaseAmount(amount: number) {
  const numeric = Number.isFinite(amount) ? amount : COIN_NAIRA_VALUE
  return Math.max(COIN_NAIRA_VALUE, Math.ceil(numeric / COIN_NAIRA_VALUE) * COIN_NAIRA_VALUE)
}

export class CoinPaymentPricingService {
  private supabase = createClient()

  async getUserAudience(userId: string): Promise<"p2p" | "b2b"> {
    const { data } = await this.supabase.from("profiles").select("user_type").eq("id", userId).single()
    return data?.user_type === "business" ? "b2b" : "p2p"
  }

  async getPlanForUser(userId: string) {
    const audience = await this.getUserAudience(userId)
    const plan = await swopifyPricingService.getActivePlan(userId, audience)
    return {
      audience,
      plan: plan || (audience === "b2b" ? b2bPlans[0] : p2pPlans[0]),
    }
  }

  async quotePurchase(userId: string, amount: number): Promise<CoinPaymentQuote> {
    const { audience, plan } = await this.getPlanForUser(userId)
    const baseAmount = normalizeBaseAmount(amount)
    const serviceFee = roundNaira(baseAmount * (plan.transactionFeePercent / 100))
    const flutterwaveCharge = roundNaira(baseAmount * (FLUTTERWAVE_COLLECTION_PERCENT / 100))
    const flutterwaveVat = roundNaira(flutterwaveCharge * (FLUTTERWAVE_VAT_PERCENT / 100))
    const coins = Math.floor(baseAmount / COIN_NAIRA_VALUE)

    return {
      audience,
      plan,
      baseAmount,
      coins,
      serviceFeePercent: plan.transactionFeePercent,
      serviceFee,
      flutterwaveCharge,
      flutterwaveVat,
      totalPayable: baseAmount + serviceFee + flutterwaveCharge + flutterwaveVat,
      netPayout: 0,
    }
  }

  async quotePayout(userId: string, amount: number): Promise<CoinPaymentQuote> {
    const { audience, plan } = await this.getPlanForUser(userId)
    const baseAmount = normalizeBaseAmount(amount)
    const serviceFee = roundNaira(baseAmount * (plan.transactionFeePercent / 100))
    const flutterwaveCharge = roundNaira(baseAmount * (FLUTTERWAVE_PAYOUT_PERCENT / 100))
    const coins = Math.floor(baseAmount / COIN_NAIRA_VALUE)

    return {
      audience,
      plan,
      baseAmount,
      coins,
      serviceFeePercent: plan.transactionFeePercent,
      serviceFee,
      flutterwaveCharge,
      flutterwaveVat: 0,
      totalPayable: 0,
      netPayout: Math.max(0, baseAmount - serviceFee - flutterwaveCharge),
    }
  }
}

export const coinPaymentPricingService = new CoinPaymentPricingService()
