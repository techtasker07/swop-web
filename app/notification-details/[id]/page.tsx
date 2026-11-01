import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatNaira } from "@/lib/utils/currency"

export default async function NotificationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div className="p-8">Please log in to view this notification.</div>

  const notificationId = Number(id)
  const { data: notification } = await supabase.from("notifications").select("*").eq("id", notificationId).eq("user_id", user.id).maybeSingle()
  if (!notification) return <div className="p-8">Notification not found.</div>
  if (!notification.is_read) await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId).eq("user_id", user.id)

  const metadata = notification.metadata || notification.data || {}
  const isTradeNotification = ["trade_request", "trade_proposal", "trade_accepted", "trade_completed"].includes(notification.type)
  const tradeId = metadata.trade_id || (isTradeNotification ? notification.reference_id : null)
  let trade: any = null
  let listing: any = null

  if (tradeId) {
    const { data } = await supabase.from("trades").select("*, proposer:profiles!proposer_id(id, display_name, email), receiver:profiles!receiver_id(id, display_name, email)").eq("id", tradeId).maybeSingle()
    if (data && (data.proposer_id === user.id || data.receiver_id === user.id)) {
      trade = data
      const listingId = data.metadata?.target_listing_id || metadata.listing_id
      if (listingId) {
        const { data: listingData } = await supabase.from("listings").select("id, title, description, category, type, condition, price, location, images, preferred_items, seller_id").eq("id", Number(listingId)).maybeSingle()
        listing = listingData
      }
    }
  } else if (metadata.listing_id) {
    const { data } = await supabase.from("listings").select("id, title, description, category, type, condition, price, location, images, preferred_items, seller_id").eq("id", Number(metadata.listing_id)).maybeSingle()
    listing = data
  }

  const actionHref = trade
    ? `/dashboard/trades/${trade.id}`
    : notification.action_url || (listing ? `/listings/${listing.id}` : "/notifications")
  const offeredItems = Array.isArray(trade?.proposer_items) ? trade.proposer_items : []

  return <div className="flex min-h-screen flex-col bg-gray-50"><Header /><main className="flex-1 px-4 py-8"><div className="mx-auto max-w-3xl"><Card className="rounded-[2rem] shadow-lg"><CardContent className="space-y-6 p-6 sm:p-8">
    <Badge className="rounded-full bg-[#32cd32] text-[#073232]">{notification.type.replaceAll("_", " ")}</Badge>
    <div><h1 className="text-3xl font-bold text-[#073232]">{notification.title}</h1><p className="mt-2 text-gray-700">{notification.message}</p><p className="mt-2 text-xs text-gray-500">{new Date(notification.created_at).toLocaleString("en-NG")}</p></div>

    {trade && <section className="space-y-4 rounded-2xl border border-[#073232]/10 bg-[#f7faf9] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-bold text-[#073232]">Trade proposal details</h2><Badge variant="outline" className="capitalize">{trade.status}</Badge></div>
      <div className="grid gap-3 sm:grid-cols-2"><Detail label="Proposed by" value={trade.proposer?.display_name || trade.proposer?.email || "Swopify member"} /><Detail label="Trade with" value={trade.receiver?.display_name || trade.receiver?.email || "Swopify member"} /><Detail label="Estimated value" value={formatNaira(trade.estimated_value || trade.metadata?.estimated_value || 0)} /><Detail label="Meeting location" value={trade.meeting_location || "To be agreed"} /></div>
      {listing && <Link href={`/listings/${listing.id}`} className="flex gap-4 rounded-xl border border-[#073232]/10 bg-white p-3 transition hover:border-[#073232]/30">
        {listing.images?.[0] && <Image src={listing.images[0]} alt={listing.title} width={96} height={96} className="h-24 w-24 shrink-0 rounded-lg object-cover" />}
        <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide text-[#0a4a4a]">Requested listing</p><h3 className="mt-1 font-semibold text-[#073232]">{listing.title}</h3><p className="mt-1 line-clamp-2 text-sm text-gray-600">{listing.description}</p><p className="mt-1 text-xs text-gray-500">{listing.location} · {listing.category}</p></div>
      </Link>}
      {trade.message && <div><h3 className="text-sm font-semibold text-[#073232]">Message from proposer</h3><p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{trade.message}</p></div>}
      {offeredItems.length > 0 && <div><h3 className="mb-2 text-sm font-semibold text-[#073232]">Offered in exchange</h3><div className="grid gap-2 sm:grid-cols-2">{offeredItems.map((item: any, index: number) => <div key={`${item.listing_id || item.type || item.title}-${index}`} className="rounded-xl bg-white p-3"><p className="font-semibold text-[#073232]">{item.title || "Trade item"}</p>{item.description && <p className="mt-1 text-sm text-gray-600">{item.description}</p>}{item.estimated_value != null && <p className="mt-1 text-xs text-gray-500">Estimated value: {formatNaira(item.estimated_value)}</p>}{item.amount != null && <p className="mt-1 text-xs text-gray-500">Amount: {item.amount}</p>}</div>)}</div></div>}
      {trade.rejection_reason && <Detail label="Reason" value={trade.rejection_reason} />}
    </section>}

    {!trade && listing && <Link href={`/listings/${listing.id}`} className="flex gap-4 rounded-xl border border-[#073232]/10 bg-[#f7faf9] p-4">
      {listing.images?.[0] && <Image src={listing.images[0]} alt={listing.title} width={112} height={112} className="h-28 w-28 shrink-0 rounded-lg object-cover" />}
      <div><p className="text-xs font-bold uppercase tracking-wide text-[#0a4a4a]">Related listing</p><h2 className="mt-1 font-semibold text-[#073232]">{listing.title}</h2><p className="mt-1 text-sm text-gray-600">{listing.description}</p><p className="mt-1 text-xs text-gray-500">{listing.location} · {listing.category}</p></div>
    </Link>}

    <div className="flex flex-wrap gap-3"><Button asChild className="rounded-full bg-[#073232]"><Link href={actionHref}>{trade ? "Open trade" : "Follow up"}</Link></Button><Button asChild variant="outline" className="rounded-full"><Link href="/notifications">Back to notifications</Link></Button></div>
  </CardContent></Card></div></main><Footer /></div>
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white p-3"><p className="text-xs font-semibold uppercase text-gray-500">{label}</p><p className="mt-1 font-medium text-[#073232]">{value}</p></div>
}
