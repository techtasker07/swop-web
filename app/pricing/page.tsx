import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PricingPlans } from "@/components/pricing/pricing-plans"

export const metadata = {
  title: "Choose Your Plan - Swopify",
  description: "Select the perfect plan for your trading needs. Start with Freemium or upgrade to Premium for unlimited trades.",
}

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PricingPlans />
      </main>
      <Footer />
    </div>
  )
}
