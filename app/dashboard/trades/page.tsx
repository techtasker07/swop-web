import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft } from "lucide-react"

export default async function TradesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: trades } = await supabase
    .from("trades")
    .select("*, proposer:profiles!proposer_id(display_name, avatar_url), receiver:profiles!receiver_id(display_name, avatar_url), target_listing:listings!target_listing_id(title, price)")
    .or(`proposer_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-[#073232] p-6 text-white shadow-xl">
        <Badge className="mb-3 rounded-full bg-[#32cd32] text-[#073232]">Swap Operations</Badge>
        <h1 className="text-3xl font-bold">Trades</h1>
        <p className="mt-2 text-white/75">Track proposals, completion codes, reports, and accepted swaps.</p>
      </div>
      <div className="grid gap-4">
        {(trades || []).map((trade: any) => (
          <Card key={trade.id} className="rounded-[1.75rem] shadow-md">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-[1.25rem] bg-[#32cd32]/15 p-3 text-[#073232]"><ArrowRightLeft className="h-6 w-6" /></div>
                <div>
                  <h2 className="font-semibold text-[#073232]">{trade.target_listing?.title || "Trade proposal"}</h2>
                  <p className="text-sm text-gray-600">{trade.proposer?.display_name || "Proposer"} to {trade.receiver?.display_name || "Receiver"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="rounded-full bg-gray-200 text-[#073232]">{trade.status}</Badge>
                <Button asChild className="rounded-full bg-[#073232]"><Link href={`/dashboard/trades/${trade.id}`}>Open</Link></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!trades || trades.length === 0) && <Card className="rounded-[2rem]"><CardContent className="p-10 text-center text-gray-600">No trades yet.</CardContent></Card>}
      </div>
    </div>
  )
}
