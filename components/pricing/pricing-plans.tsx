"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, ShieldCheck, Sparkles } from "lucide-react"
import { formatNaira } from "@/lib/utils/currency"
import { allPlans, swopifyPricingService, type SwopifyPlan } from "@/lib/services/swopify-pricing-service"
import { createFlutterwavePayment, verifyFlutterwavePayment } from "@/lib/services/flutterwave-service"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export function PricingPlans() {
  const { user, profile } = useAuth()
  const searchParams = useSearchParams()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  useEffect(() => {
    const reference = searchParams.get("payment_reference")
    if (!reference || !user) return
    const verify = async () => {
      try {
        const result = await verifyFlutterwavePayment(reference)
        const planId = result.data?.meta?.plan_id || result.data?.meta?.planId
        if (planId) await swopifyPricingService.activateSubscription({ userId: user.id, planId, paymentReference: reference })
        toast.success("Subscription payment verified")
      } catch (error: any) {
        toast.error(error?.message || "Could not verify payment")
      }
    }
    verify()
  }, [searchParams, user])

  const subscribe = async (plan: SwopifyPlan) => {
    if (!user) {
      window.location.href = "/auth/login?redirect=/pricing"
      return
    }
    if (plan.monthlyPrice === 0) {
      toast.success("Free plan is active for P2P users by default")
      return
    }
    if (plan.monthlyPrice < 0) {
      window.location.href = "/contact"
      return
    }

    setLoadingPlan(plan.id)
    try {
      const payment = await createFlutterwavePayment({
        amount: plan.monthlyPrice,
        email: user.email || "customer@swopify.app",
        name: profile?.display_name || user.email || "Swopify user",
        phone: profile?.phone_number || undefined,
        description: `${plan.name} Swopify subscription`,
        metadata: { kind: "subscription", plan_id: plan.id, audience: plan.audience, user_id: user.id },
        redirectPath: "/pricing",
      })
      window.location.href = payment.checkout_url
    } catch (error: any) {
      toast.error(error?.message || "Could not initialize payment")
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 rounded-[2rem] bg-[#073232] p-7 text-white shadow-xl">
        <Badge className="mb-4 rounded-full bg-[#32cd32] text-[#073232]">Swopify Pricing</Badge>
        <h1 className="text-4xl font-bold">Choose the plan that fits your flow</h1>
        <p className="mt-3 max-w-3xl text-white/75">The web app now uses the same P2P and B2B plans, listing limits, proposal allowances, photo limits, and payment flow as the mobile app.</p>
      </div>

      <PlanSection title="P2P Plans" audience="p2p" plans={allPlans.filter((plan) => plan.audience === "p2p")} loadingPlan={loadingPlan} onSubscribe={subscribe} />
      <PlanSection title="B2B Plans" audience="b2b" plans={allPlans.filter((plan) => plan.audience === "b2b")} loadingPlan={loadingPlan} onSubscribe={subscribe} />
    </div>
  )
}

function PlanSection({ title, audience, plans, loadingPlan, onSubscribe }: { title: string; audience: string; plans: SwopifyPlan[]; loadingPlan: string | null; onSubscribe: (plan: SwopifyPlan) => void }) {
  return (
    <section className="mb-12 space-y-5">
      <div className="flex items-center gap-3"><div className="rounded-full bg-[#32cd32]/15 p-3 text-[#073232]"><Crown className="h-5 w-5" /></div><h2 className="text-2xl font-bold text-[#073232]">{title}</h2></div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => <PlanCard key={plan.id} plan={plan} loading={loadingPlan === plan.id} onSubscribe={() => onSubscribe(plan)} />)}
      </div>
    </section>
  )
}

function PlanCard({ plan, loading, onSubscribe }: { plan: SwopifyPlan; loading: boolean; onSubscribe: () => void }) {
  const features = [
    `${plan.listItemsPerMonth ?? "Unlimited"} listings per month`,
    `${plan.tradeProposalsPerMonth ?? "Unlimited"} proposals per month`,
    `${plan.photosPerListing} photos per listing`,
    `${plan.featuredListingsPerMonth ?? "Unlimited"} featured listings`,
    `${plan.transactionFeePercent}% transaction fee`,
    `${plan.support} support`,
    plan.escrowEnabled ? "Escrow enabled" : "Basic swaps",
    plan.staffAccounts ? `${plan.staffAccounts} staff account(s)` : null,
    plan.bulkUpload ? `Bulk upload: ${plan.bulkUpload}` : null,
  ].filter(Boolean) as string[]

  return (
    <Card className="rounded-[2rem] border-gray-200 shadow-lg transition hover:shadow-xl">
      <CardContent className="flex h-full flex-col p-6">
        <div className="mb-5 flex items-start justify-between gap-3"><div><Badge className="mb-3 rounded-full bg-gray-200 text-[#073232]">{plan.audience.toUpperCase()}</Badge><h3 className="text-xl font-bold text-[#073232]">{plan.name}</h3></div><Sparkles className="h-6 w-6 text-[#32cd32]" /></div>
        <div className="mb-5 text-3xl font-bold text-[#073232]">{plan.monthlyPrice < 0 ? "Custom" : plan.monthlyPrice === 0 ? "Free" : `${formatNaira(plan.monthlyPrice)}/mo`}</div>
        <ul className="mb-6 flex-1 space-y-3">{features.map((feature) => <li key={feature} className="flex gap-2 text-sm text-gray-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#32cd32]" />{feature}</li>)}</ul>
        <Button onClick={onSubscribe} disabled={loading} className="rounded-full bg-[#073232] hover:bg-[#0a4a4a]"><ShieldCheck className="mr-2 h-4 w-4" />{loading ? "Processing..." : plan.monthlyPrice < 0 ? "Contact Sales" : plan.monthlyPrice === 0 ? "Use Free" : "Subscribe"}</Button>
      </CardContent>
    </Card>
  )
}
