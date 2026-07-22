import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ServiceCoinMarketplace } from "@/components/service-coins/marketplace"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CoinPaymentReturnHandler } from "@/components/trade-coins/payment-return-handler"

export const metadata = {
  title: "Service Coin Marketplace | Swopify",
  description: "Buy and sell Service Coins to pay for service listings on Swopify",
}

export default async function ServiceCoinPage({ searchParams }: { searchParams: Promise<{ payment_reference?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/service-coins")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#073232] mb-2">Service Coin Marketplace</h1>
              <p className="text-gray-600">
                Buy and sell Service Coins to pay for service listings when direct swaps aren&apos;t possible
              </p>
            </div>
            {<CoinPaymentReturnHandler reference={(await searchParams).payment_reference} expectedKind="service_coin" />}
            <ServiceCoinMarketplace userId={user.id} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

