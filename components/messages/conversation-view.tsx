"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { Send, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export function ConversationView({ conversation, conversationIds, initialMessages, currentUser, participant, onMessageSent }: { conversation: any; conversationIds?: string[]; initialMessages?: any[]; currentUser: any; participant: any; onMessageSent?: () => void | Promise<void> }) {
  const [messages, setMessages] = useState<any[]>(initialMessages || conversation.messages || [])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const supabase = useMemo(() => createClient(), [])
  const conversationIdKey = (conversationIds?.length ? conversationIds : [conversation.id]).join(",")
  const activeConversationIds = useMemo(() => conversationIdKey.split(",").filter(Boolean), [conversationIdKey])

  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase.from("messages").select("id, conversation_id, sender_id, content, created_at, is_read").in("conversation_id", activeConversationIds).order("created_at", { ascending: true })
    if (!error) setMessages(data || [])
  }, [activeConversationIds, supabase])

  useEffect(() => { void loadMessages() }, [loadMessages])
  useEffect(() => {
    const channel = supabase.channel(`conversation-${conversationIdKey}`).on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
      const changedMessage = (payload.new as { conversation_id?: string } | null)?.conversation_id || (payload.old as { conversation_id?: string } | null)?.conversation_id
      if (changedMessage && activeConversationIds.includes(changedMessage)) void loadMessages()
    }).subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [activeConversationIds, conversationIdKey, loadMessages, supabase])
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
    const unread = messages.filter((message) => !message.is_read && message.sender_id !== currentUser.id).map((message) => message.id)
    if (!unread.length) return

    const markMessagesRead = async () => {
      const { error } = await supabase.from("messages").update({ is_read: true }).in("id", unread)
      if (error) return
      setMessages((current) => current.map((message) => unread.includes(message.id) ? { ...message, is_read: true } : message))
      await onMessageSent?.()
    }

    void markMessagesRead()
  }, [currentUser.id, messages, onMessageSent, supabase])

  const send = async (event: React.FormEvent) => {
    event.preventDefault()
    const content = newMessage.trim()
    if (!content || isSending) return
    setIsSending(true)
    const { error } = await supabase.from("messages").insert({ conversation_id: conversation.id, sender_id: currentUser.id, content, message_type: "text" })
    if (error) toast.error("Message could not be sent. Please try again.")
    else { setNewMessage(""); await supabase.from("conversations").update({ last_message_at: new Date().toISOString(), last_message_time: new Date().toISOString() }).eq("id", conversation.id); await loadMessages(); await onMessageSent?.() }
    setIsSending(false)
  }

  return <div className="flex min-h-0 flex-1 flex-col bg-[#fbfdfc]">
    <header className="flex items-center gap-3 border-b border-[#073232]/10 bg-white px-5 py-4"><Avatar className="h-10 w-10"><AvatarImage src={participant?.avatar_url} /><AvatarFallback className="bg-[#32cd32]/15 font-bold text-[#073232]">{participant?.display_name?.[0]?.toUpperCase() || "U"}</AvatarFallback></Avatar><div className="min-w-0"><div className="flex items-center gap-1.5"><h2 className="truncate font-bold text-[#073232]">{participant?.display_name || "Swopify member"}</h2>{participant?.verification_status === "verified" && <ShieldCheck className="h-4 w-4 text-[#0a4a4a]" />}</div><p className="truncate text-xs text-slate-500">{conversationIds && conversationIds.length > 1 ? `${conversationIds.length} conversations combined into one history` : conversation.listing ? `Discussing: ${conversation.listing.title}` : "Secure Swopify conversation"}</p></div></header>
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6"><div className="mx-auto max-w-3xl space-y-4">{messages.map((message) => { const own = message.sender_id === currentUser.id; return <div key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-[70%] ${own ? "rounded-br-md bg-[#073232] text-white" : "rounded-bl-md border border-[#073232]/10 bg-white text-slate-700"}`}><p className="whitespace-pre-wrap leading-6">{message.content}</p><p className={`mt-1.5 text-[10px] ${own ? "text-white/55" : "text-slate-400"}`}>{format(new Date(message.created_at), "p")}</p></div></div> })}<div ref={endRef} /></div></div>
    <div className="border-t border-[#073232]/10 bg-white p-4 sm:p-5"><form onSubmit={send} className="mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border border-[#073232]/15 bg-[#f7faf9] p-1.5 focus-within:border-[#0a4a4a] focus-within:ring-2 focus-within:ring-[#32cd32]/20"><Input value={newMessage} onChange={(event) => setNewMessage(event.target.value)} placeholder="Write a message…" disabled={isSending} className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0" /><Button type="submit" size="icon" disabled={isSending || !newMessage.trim()} className="h-10 w-10 shrink-0 rounded-xl bg-[#073232] text-white hover:bg-[#0a4a4a]"><Send className="h-4 w-4" /><span className="sr-only">Send message</span></Button></form></div>
  </div>
}
