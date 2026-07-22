import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TradeActionPanel } from "@/components/trades/trade-action-panel"
import { formatNaira } from "@/lib/utils/currency"

export default async function TradeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: trade } = await supabase
    .from("trades")
    .select("*, proposer:profiles!proposer_id(*), receiver:profiles!receiver_id(*), target_listing:listings!target_listing_id(*, listing_images(url, is_primary, sort_order))")
    .eq("id", id)
    .single()

  if (!trade) return <div>Trade not found</div>

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-[#073232] p-6 text-white shadow-xl">
        <Badge className="mb-3 rounded-full bg-[#32cd32] text-[#073232]">{trade.status}</Badge>
        <h1 className="text-3xl font-bold">Trade details</h1>
        <p className="mt-2 text-white/75">{trade.target_listing?.title || "Swap proposal"}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="rounded-[2rem] shadow-lg">
          <CardContent className="space-y-5 p-6">
            <div><h2 className="text-xl font-bold text-[#073232]">Offer message</h2><p className="mt-2 text-gray-700">{trade.message || "No message supplied."}</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Proposer" value={trade.proposer?.display_name || trade.proposer?.email || "Unknown"} />
              <Info label="Receiver" value={trade.receiver?.display_name || trade.receiver?.email || "Unknown"} />
              <Info label="Estimated value" value={formatNaira(trade.estimated_value || 0)} />
              <Info label="Completion code" value={trade.completion_code || "Not set"} />
            </div>
            <pre className="overflow-auto rounded-[1.5rem] bg-gray-100 p-4 text-xs text-[#073232]">{JSON.stringify(trade.proposer_items || [], null, 2)}</pre>
            <Button asChild variant="outline" className="rounded-full"><Link href="/messages">Continue in messages</Link></Button>
          </CardContent>
        </Card>
        <TradeActionPanel tradeId={trade.id} status={trade.status} />
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[1.5rem] bg-gray-100 p-4"><div className="text-xs font-semibold uppercase text-gray-500">{label}</div><div className="mt-1 font-semibold text-[#073232]">{value}</div></div>
}
