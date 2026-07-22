"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { CheckCircle, Flag, KeyRound, XCircle } from "lucide-react"

export function TradeActionPanel({ tradeId, status }: { tradeId: string; status: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [completionCode, setCompletionCode] = useState("")
  const [report, setReport] = useState("")
  const [loading, setLoading] = useState(false)

  const updateStatus = async (nextStatus: string) => {
    setLoading(true)
    const updates: Record<string, any> = { status: nextStatus }
    if (nextStatus === "completed") updates.completed_at = new Date().toISOString()
    const { error } = await supabase.from("trades").update(updates).eq("id", tradeId)
    setLoading(false)
    if (error) toast.error(error.message)
    else {
      toast.success(`Trade ${nextStatus}`)
      router.refresh()
    }
  }

  const saveCompletionCode = async () => {
    if (!completionCode.trim()) return
    setLoading(true)
    const { error } = await supabase.from("trades").update({ completion_code: completionCode.trim(), status: "accepted" }).eq("id", tradeId)
    setLoading(false)
    if (error) toast.error(error.message)
    else {
      toast.success("Completion code saved")
      router.refresh()
    }
  }

  const submitReport = async () => {
    if (!report.trim()) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from("trade_reports").insert({ trade_id: tradeId, reporter_id: user?.id, reason: "web_report", details: report, status: "open" })
    setLoading(false)
    if (error) toast.error(error.message)
    else {
      toast.success("Report submitted")
      setReport("")
    }
  }

  return (
    <div className="space-y-4 rounded-[2rem] bg-white p-5 shadow-lg">
      <div className="grid gap-3 sm:grid-cols-3">
        <Button disabled={loading || status === "accepted"} onClick={() => updateStatus("accepted")} className="rounded-full bg-[#073232]"><CheckCircle className="mr-2 h-4 w-4" />Accept</Button>
        <Button disabled={loading || status === "rejected"} onClick={() => updateStatus("rejected")} variant="outline" className="rounded-full"><XCircle className="mr-2 h-4 w-4" />Reject</Button>
        <Button disabled={loading || status === "completed"} onClick={() => updateStatus("completed")} className="rounded-full bg-[#32cd32] text-[#073232]"><CheckCircle className="mr-2 h-4 w-4" />Complete</Button>
      </div>
      <div className="flex gap-2">
        <Input className="rounded-full" value={completionCode} onChange={(e) => setCompletionCode(e.target.value)} placeholder="Set or enter completion code" />
        <Button disabled={loading} onClick={saveCompletionCode} className="rounded-full bg-[#073232]"><KeyRound className="h-4 w-4" /></Button>
      </div>
      <div className="space-y-2">
        <Textarea className="rounded-[1.5rem]" value={report} onChange={(e) => setReport(e.target.value)} placeholder="Report an issue with this trade" />
        <Button disabled={loading || !report.trim()} onClick={submitReport} variant="outline" className="rounded-full"><Flag className="mr-2 h-4 w-4" />Submit report</Button>
      </div>
    </div>
  )
}
