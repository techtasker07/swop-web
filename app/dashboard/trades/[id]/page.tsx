import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TradeActionPanel } from "@/components/trades/trade-action-panel"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { formatNaira } from "@/lib/utils/currency"

export default async function TradeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Please log in to view trade details.</div>

  // target_listing_id is stored inside metadata in the shared trade schema.
  const { data: trade } = await supabase
    .from("trades")
    .select("*, proposer:profiles!proposer_id(id, display_name, email), receiver:profiles!receiver_id(id, display_name, email)")
    .eq("id", id)
    .maybeSingle()

  if (!trade || (trade.proposer_id !== user.id && trade.receiver_id !== user.id)) {
    return <div className="flex min-h-screen flex-col"><Header /><main className="flex flex-1 flex-col items-center justify-center gap-4 p-8"><h1 className="text-2xl font-bold text-[#073232]">Trade not found</h1><p className="text-gray-600">This trade may have been removed or is not available to your account.</p><Button asChild className="bg-[#073232]"><Link href="/dashboard/history?tab=trades">Back to trade history</Link></Button></main><Footer /></div>
  }

  const listingId = trade.metadata?.target_listing_id
  const { data: listing } = listingId
    ? await supabase.from("listings").select("id, title, description, category, type, condition, price, location, images, preferred_items").eq("id", Number(listingId)).maybeSingle()
    : { data: null }
  const offeredItems = Array.isArray(trade.proposer_items) ? trade.proposer_items : []

  return <div className="flex min-h-screen flex-col bg-gray-50">
    <Header />
    <main className="flex-1 px-4 py-8"><div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-[2rem] bg-[#073232] p-6 text-white shadow-xl"><Badge className="mb-3 rounded-full bg-[#32cd32] capitalize text-[#073232]">{trade.status}</Badge><h1 className="text-3xl font-bold">Trade details</h1><p className="mt-2 text-white/75">{listing?.title || trade.metadata?.target_listing_title || "Swap proposal"}</p></div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {listing && <Card className="rounded-[2rem] shadow-lg"><CardContent className="p-5 sm:p-6"><h2 className="mb-4 text-xl font-bold text-[#073232]">Requested listing</h2><Link href={`/listings/${listing.id}`} className="flex flex-col gap-4 sm:flex-row">{listing.images?.[0] && <Image src={listing.images[0]} alt={listing.title} width={192} height={144} className="h-36 w-full rounded-xl object-cover sm:w-48" />}<div><h3 className="text-lg font-semibold text-[#073232]">{listing.title}</h3><p className="mt-1 text-sm text-gray-600">{listing.description}</p><p className="mt-2 text-sm text-gray-500">{listing.location} · {listing.category}{listing.condition ? ` · ${listing.condition}` : ""}</p><p className="mt-2 font-semibold text-[#073232]">Reference value: {formatNaira(listing.price || 0)}</p></div></Link></CardContent></Card>}
          <Card className="rounded-[2rem] shadow-lg"><CardContent className="space-y-5 p-5 sm:p-6">
            <section><h2 className="text-xl font-bold text-[#073232]">Offer message</h2><p className="mt-2 whitespace-pre-wrap text-gray-700">{trade.message || "No message supplied."}</p></section>
            <div className="grid gap-3 sm:grid-cols-2"><Info label="Proposer" value={trade.proposer?.display_name || trade.proposer?.email || "Unknown"} /><Info label="Receiver" value={trade.receiver?.display_name || trade.receiver?.email || "Unknown"} /><Info label="Estimated value" value={formatNaira(trade.metadata?.estimated_value || 0)} /><Info label="Meeting location" value={trade.meeting_location || "To be agreed"} />{trade.meeting_time && <Info label="Meeting time" value={new Date(trade.meeting_time).toLocaleString("en-NG")} />}{trade.completion_code && <Info label="Completion code" value={trade.completion_code} />}</div>
            {offeredItems.length > 0 && <section><h2 className="mb-3 text-lg font-bold text-[#073232]">Items offered</h2><div className="grid gap-3 sm:grid-cols-2">{offeredItems.map((item: any, index: number) => <div key={`${item.listing_id || item.type || item.title}-${index}`} className="rounded-2xl bg-gray-100 p-4"><h3 className="font-semibold text-[#073232]">{item.title || "Trade item"}</h3>{item.description && <p className="mt-1 text-sm text-gray-600">{item.description}</p>}{item.estimated_value != null && <p className="mt-2 text-sm font-medium text-[#073232]">Estimated value: {formatNaira(item.estimated_value)}</p>}{item.amount != null && <p className="mt-2 text-sm text-gray-600">Amount: {item.amount}</p>}</div>)}</div></section>}
            <Button asChild variant="outline" className="rounded-full"><Link href="/messages">Continue in messages</Link></Button>
          </CardContent></Card>
        </div>
        <TradeActionPanel tradeId={trade.id} status={trade.status} />
      </div>
    </div></main>
    <Footer />
  </div>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-gray-100 p-4"><div className="text-xs font-semibold uppercase text-gray-500">{label}</div><div className="mt-1 font-semibold text-[#073232]">{value}</div></div>
}
