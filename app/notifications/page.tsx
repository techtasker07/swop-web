import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: notifications } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50)

  return (
    <div className="min-h-screen bg-gray-50"><Header /><main className="mx-auto max-w-4xl space-y-5 px-4 py-8">
      <div className="rounded-[2rem] bg-[#073232] p-6 text-white"><Badge className="mb-3 rounded-full bg-[#32cd32] text-[#073232]">Inbox</Badge><h1 className="text-3xl font-bold">Notifications</h1></div>
      {(notifications || []).map((item: any) => <Card key={item.id} className="rounded-[1.5rem]"><CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><div className="rounded-full bg-[#32cd32]/15 p-3 text-[#073232]"><Bell className="h-5 w-5" /></div><div><h2 className="font-semibold text-[#073232]">{item.title}</h2><p className="text-sm text-gray-600">{item.message}</p></div></div><Button asChild className="rounded-full bg-[#073232]"><Link href={`/notification-details/${item.id}`}>Open</Link></Button></CardContent></Card>)}
      {(!notifications || notifications.length === 0) && <Card className="rounded-[2rem]"><CardContent className="p-10 text-center text-gray-600">No notifications yet.</CardContent></Card>}
    </main><Footer /></div>
  )
}
