import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TradeCoinMarketplace } from "@/components/trade-coins/marketplace"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Trade Coin Marketplace | Swopify",
  description: "Buy and sell Trade Coins to facilitate trades on Swopify",
}

export default async function TradeCoinPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/trade-coins")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#073232] mb-2">Trade Coin Marketplace</h1>
              <p className="text-gray-600">
                Buy and sell Trade Coins to facilitate trades when direct swaps aren't possible
              </p>
            </div>

            <TradeCoinMarketplace userId={user.id} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
