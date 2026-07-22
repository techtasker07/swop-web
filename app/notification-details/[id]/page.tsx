import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function NotificationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: notification } = await supabase.from("notifications").select("*").eq("id", Number(id)).single()
  if (notification) await supabase.from("notifications").update({ is_read: true }).eq("id", Number(id))
  if (!notification) return <div>Notification not found</div>
  const data = notification.data || notification.metadata || {}
  const actionHref = notification.action_url || (data.trade_id ? `/dashboard/trades/${data.trade_id}` : data.listing_id ? `/listings/${data.listing_id}` : "/notifications")

  return <div className="min-h-screen bg-gray-50"><Header /><main className="mx-auto max-w-3xl px-4 py-8"><Card className="rounded-[2rem] shadow-lg"><CardContent className="space-y-5 p-7"><Badge className="rounded-full bg-[#32cd32] text-[#073232]">{notification.type}</Badge><h1 className="text-3xl font-bold text-[#073232]">{notification.title}</h1><p className="text-gray-700">{notification.message}</p><div className="flex gap-3"><Button asChild className="rounded-full bg-[#073232]"><Link href={actionHref}>Follow up</Link></Button><Button asChild variant="outline" className="rounded-full"><Link href="/notifications">Back</Link></Button></div></CardContent></Card></main><Footer /></div>
}
