import { createClient } from "@/lib/supabase/client"

export interface SwopifyPlan {
  id: string
  audience: "p2p" | "b2b"
  name: string
  monthlyPrice: number
  listItemsPerMonth: number | null
  tradeProposalsPerMonth: number | null
  photosPerListing: number
  featuredListingsPerMonth: number | null
  searchBoost: string
  verificationBadge: string
  transactionFeePercent: number
  escrowEnabled: boolean
  staffAccounts?: number | null
  bulkUpload?: string
  deliveryDiscount: string
  support: string
  sla?: string
  dedicatedAccountManager?: boolean
}

export interface PricingAllowance {
  allowed: boolean
  message: string
  plan?: SwopifyPlan | null
}

export const p2pPlans: SwopifyPlan[] = [
  { id: "p2p_free", audience: "p2p", name: "Free", monthlyPrice: 0, listItemsPerMonth: 5, tradeProposalsPerMonth: 10, photosPerListing: 3, featuredListingsPerMonth: 0, searchBoost: "No boost", verificationBadge: "Phone", transactionFeePercent: 3, escrowEnabled: false, deliveryDiscount: "0%", support: "72 hrs" },
  { id: "p2p_basic", audience: "p2p", name: "Basic", monthlyPrice: 1200, listItemsPerMonth: 30, tradeProposalsPerMonth: 60, photosPerListing: 6, featuredListingsPerMonth: 1, searchBoost: "+1", verificationBadge: "Phone + Email", transactionFeePercent: 2, escrowEnabled: false, deliveryDiscount: "5%", support: "48 hrs" },
  { id: "p2p_pro", audience: "p2p", name: "Pro", monthlyPrice: 4000, listItemsPerMonth: 100, tradeProposalsPerMonth: null, photosPerListing: 12, featuredListingsPerMonth: 5, searchBoost: "+3", verificationBadge: "+ID", transactionFeePercent: 1, escrowEnabled: true, deliveryDiscount: "10%", support: "24 hrs" },
  { id: "p2p_premium", audience: "p2p", name: "Premium", monthlyPrice: 12000, listItemsPerMonth: null, tradeProposalsPerMonth: null, photosPerListing: 20, featuredListingsPerMonth: 20, searchBoost: "+5", verificationBadge: "+BVN + Address", transactionFeePercent: 0.5, escrowEnabled: true, deliveryDiscount: "20%", support: "12 hrs" },
]

export const b2bPlans: SwopifyPlan[] = [
  { id: "b2b_small_business", audience: "b2b", name: "Small Business", monthlyPrice: 25000, listItemsPerMonth: 500, tradeProposalsPerMonth: null, photosPerListing: 20, featuredListingsPerMonth: 10, searchBoost: "+3", verificationBadge: "Verified Business", transactionFeePercent: 1, escrowEnabled: true, staffAccounts: 1, bulkUpload: "No", deliveryDiscount: "15%", support: "Standard" },
  { id: "b2b_growing_business", audience: "b2b", name: "Growing Business", monthlyPrice: 75000, listItemsPerMonth: 2000, tradeProposalsPerMonth: null, photosPerListing: 20, featuredListingsPerMonth: 50, searchBoost: "+5", verificationBadge: "Verified Business", transactionFeePercent: 0.5, escrowEnabled: true, staffAccounts: 5, bulkUpload: "CSV", deliveryDiscount: "20%", support: "Priority" },
  { id: "b2b_enterprise", audience: "b2b", name: "Enterprise", monthlyPrice: 250000, listItemsPerMonth: 10000, tradeProposalsPerMonth: null, photosPerListing: 20, featuredListingsPerMonth: 200, searchBoost: "+8", verificationBadge: "Verified Business", transactionFeePercent: 0.25, escrowEnabled: true, staffAccounts: 20, bulkUpload: "API", deliveryDiscount: "30%", support: "Dedicated", sla: "99.9%", dedicatedAccountManager: true },
  { id: "b2b_corporate", audience: "b2b", name: "Corporate", monthlyPrice: -1, listItemsPerMonth: null, tradeProposalsPerMonth: null, photosPerListing: 20, featuredListingsPerMonth: null, searchBoost: "Featured", verificationBadge: "Trusted Partner", transactionFeePercent: 0, escrowEnabled: true, bulkUpload: "Full", deliveryDiscount: "Custom", support: "Dedicated", sla: "99.99%", dedicatedAccountManager: true },
]

export const allPlans = [...p2pPlans, ...b2bPlans]

export class SwopifyPricingService {
  private supabase = createClient()

  planById(id: string) {
    return allPlans.find((plan) => plan.id === id) || null
  }

  async getActivePlan(userId: string, audience: "p2p" | "b2b") {
    try {
      const { data, error } = await this.supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("audience", audience)
        .eq("status", "active")
        .order("current_period_end", { ascending: false })

      if (error) throw error
      const now = Date.now()
      const row = (data || []).find((subscription: any) => !subscription.current_period_end || new Date(subscription.current_period_end).getTime() > now)
      return row ? this.planById(row.plan_id) : audience === "p2p" ? p2pPlans[0] : null
    } catch {
      return audience === "p2p" ? p2pPlans[0] : null
    }
  }

  async checkListingAllowance({ userId, isBusiness, photoCount }: { userId: string; isBusiness: boolean; photoCount: number }): Promise<PricingAllowance> {
    const audience = isBusiness ? "b2b" : "p2p"
    const plan = await this.getActivePlan(userId, audience)
    if (!plan) return { allowed: false, message: "Please choose a B2B plan before creating business listings." }
    if (photoCount > plan.photosPerListing) return { allowed: false, plan, message: `${plan.name} allows up to ${plan.photosPerListing} photos per listing.` }

    if (plan.listItemsPerMonth === null) return { allowed: true, message: "Allowed", plan }
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const { data } = await this.supabase
      .from("listings")
      .select("id, metadata")
      .eq("seller_id", userId)
      .gte("created_at", monthStart)

    const count = (data || []).filter((row: any) => (row.metadata?.market_type === "b2b") === isBusiness).length
    if (count >= plan.listItemsPerMonth) return { allowed: false, plan, message: `You have reached the ${plan.name} limit of ${plan.listItemsPerMonth} listings this month.` }
    return { allowed: true, message: "Allowed", plan }
  }

  async checkTradeProposalAllowance(userId: string): Promise<PricingAllowance> {
    const plan = await this.getActivePlan(userId, "p2p") || p2pPlans[0]
    if (plan.tradeProposalsPerMonth === null) return { allowed: true, message: "Allowed", plan }
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const { data } = await this.supabase.from("trades").select("id").eq("proposer_id", userId).gte("created_at", monthStart)
    if ((data || []).length >= plan.tradeProposalsPerMonth) return { allowed: false, plan, message: `You have reached the ${plan.name} limit of ${plan.tradeProposalsPerMonth} trade proposals this month.` }
    return { allowed: true, message: "Allowed", plan }
  }

  async activateSubscription({ userId, planId, paymentReference }: { userId: string; planId: string; paymentReference: string }) {
    const plan = this.planById(planId)
    if (!plan || plan.monthlyPrice < 0) throw new Error("Invalid subscription plan selected.")
    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    await this.supabase.from("user_subscriptions").upsert({
      user_id: userId,
      plan_id: plan.id,
      audience: plan.audience,
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      flutterwave_reference: paymentReference,
      updated_at: now.toISOString(),
    }, { onConflict: "user_id,audience" })

    await this.supabase.from("subscription_payments").insert({
      user_id: userId,
      plan_id: plan.id,
      audience: plan.audience,
      amount: plan.monthlyPrice,
      currency: "NGN",
      flutterwave_reference: paymentReference,
      status: "successful",
      paid_at: now.toISOString(),
    })
  }
}

export const swopifyPricingService = new SwopifyPricingService()
