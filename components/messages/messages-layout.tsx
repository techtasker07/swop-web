"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ConversationView } from "./conversation-view"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, MessageCircle, MessageSquarePlus, Search, ShieldCheck } from "lucide-react"

type MessagesLayoutProps = { conversations: any[]; participants: any[]; currentUser: any }
type ConversationGroup = { participantId: string; participant: any; conversations: any[]; primary: any; messages: any[]; unread: number; lastMessage: any }

export function MessagesLayout({ conversations: initialConversations, participants: initialParticipants, currentUser }: MessagesLayoutProps) {
  const router = useRouter()
  const [conversations, setConversations] = useState(initialConversations)
  const [participants, setParticipants] = useState(initialParticipants)
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const loadConversations = useCallback(async () => {
    setIsLoading(true); setError(null)
    const { data: conversationData, error: conversationError } = await supabase.from("conversations").select("*, listing:listings(*)").contains("participants", [currentUser.id]).eq("is_active", true).order("last_message_time", { ascending: false })
    if (conversationError) { setError("We couldn’t load your conversations. Please refresh and try again."); setIsLoading(false); return }
    const nextConversations = conversationData || []
    const participantIds = [...new Set(nextConversations.flatMap((conversation: any) => (conversation.participants || []).filter((id: string) => id !== currentUser.id)))]
    const [messagesResult, profilesResult] = await Promise.all([
      nextConversations.length ? supabase.from("messages").select("id, conversation_id, content, sender_id, created_at, is_read").in("conversation_id", nextConversations.map((conversation: any) => conversation.id)).order("created_at", { ascending: true }) : Promise.resolve({ data: [], error: null }),
      participantIds.length ? supabase.from("profiles").select("id, display_name, avatar_url, verification_status").in("id", participantIds) : Promise.resolve({ data: [], error: null }),
    ])
    if (messagesResult.error || profilesResult.error) setError("Some conversation details could not be loaded. Please refresh and try again.")
    const byConversation = (messagesResult.data || []).reduce((result: Record<string, any[]>, message: any) => { (result[message.conversation_id] ||= []).push(message); return result }, {})
    setConversations(nextConversations.map((conversation: any) => ({ ...conversation, messages: byConversation[conversation.id] || [] })))
    setParticipants(profilesResult.data || []); setIsLoading(false)
  }, [currentUser.id, supabase])

  useEffect(() => { void loadConversations() }, [loadConversations])
  useEffect(() => { const channel = supabase.channel(`desktop-conversations-${currentUser.id}`).on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => void loadConversations()).subscribe(); return () => { void supabase.removeChannel(channel) } }, [currentUser.id, loadConversations, supabase])

  const groups = useMemo<ConversationGroup[]>(() => {
    const profileMap = new Map<string, any>(participants.map((person: any): [string, any] => [person.id, person]))
    const map = new Map<string, ConversationGroup>()
    for (const conversation of conversations) {
      const participantId = (conversation.participants || []).find((id: string) => id !== currentUser.id)
      if (!participantId) continue
      const group: ConversationGroup = map.get(participantId) || { participantId, participant: profileMap.get(participantId), conversations: [], primary: conversation, messages: [], unread: 0, lastMessage: null }
      group.conversations.push(conversation); group.messages.push(...(conversation.messages || [])); group.unread += (conversation.messages || []).filter((message: any) => !message.is_read && message.sender_id !== currentUser.id).length
      map.set(participantId, group)
    }
    return [...map.values()].map((group) => { group.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); group.lastMessage = group.messages.at(-1); group.primary = [...group.conversations].sort((a, b) => new Date(b.last_message_time || b.last_message_at || 0).getTime() - new Date(a.last_message_time || a.last_message_at || 0).getTime())[0]; return group }).sort((a, b) => new Date(b.lastMessage?.created_at || b.primary?.last_message_time || 0).getTime() - new Date(a.lastMessage?.created_at || a.primary?.last_message_time || 0).getTime())
  }, [conversations, currentUser.id, participants])

  useEffect(() => { if (!selectedParticipantId && groups[0]) setSelectedParticipantId(groups[0].participantId); else if (selectedParticipantId && !groups.some((group) => group.participantId === selectedParticipantId)) setSelectedParticipantId(groups[0]?.participantId ?? null) }, [groups, selectedParticipantId])
  const selectedGroup = groups.find((group) => group.participantId === selectedParticipantId) || null
  const visibleGroups = groups.filter((group) => !query || group.participant?.display_name?.toLowerCase().includes(query.toLowerCase()) || group.conversations.some((conversation) => conversation.listing?.title?.toLowerCase().includes(query.toLowerCase())))

  return <><Header /><main className="min-h-[calc(100vh-4rem)] bg-[#f5f8f7] px-4 py-5 lg:px-8 lg:py-8"><div className="mx-auto max-w-7xl"><div className="mb-5 flex items-end justify-between gap-4"><div><Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-3 mb-2 text-[#073232] hover:bg-[#073232]/5"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0a4a4a]">Swopify connect</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-[#073232]">Messages</h1><p className="mt-1 text-sm text-slate-500">One continuous history for every person you trade with.</p></div><Button asChild className="bg-[#073232] text-white shadow-md shadow-[#073232]/15 hover:bg-[#0a4a4a]"><Link href="/messages/new"><MessageSquarePlus className="mr-2 h-4 w-4" />New message</Link></Button></div><section className="overflow-hidden rounded-2xl border border-[#073232]/10 bg-white shadow-[0_18px_55px_rgba(7,50,50,0.08)] lg:grid lg:h-[calc(100vh-13.5rem)] lg:grid-cols-[22rem_minmax(0,1fr)]"><aside className={`border-b border-[#073232]/10 lg:flex lg:min-h-0 lg:flex-col lg:border-b-0 lg:border-r ${selectedGroup ? "hidden lg:flex" : "flex"}`}><div className="border-b border-[#073232]/10 p-4"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people or listings" className="h-10 w-full rounded-xl border border-[#073232]/10 bg-[#f7faf9] pl-9 pr-3 text-sm outline-none transition focus:border-[#0a4a4a] focus:ring-2 focus:ring-[#32cd32]/20" /></div></div><div className="min-h-0 flex-1 overflow-y-auto p-2">{isLoading ? <ConversationSkeleton /> : error ? <div className="p-4 text-sm text-red-700">{error}</div> : visibleGroups.length === 0 ? <EmptyInbox compact /> : visibleGroups.map((group) => <ConversationRow key={group.participantId} group={group} currentUser={currentUser} selected={group.participantId === selectedParticipantId} onSelect={() => setSelectedParticipantId(group.participantId)} />)}</div></aside><div className={`${selectedGroup ? "flex" : "hidden"} min-h-0 flex-col lg:flex`}>{selectedGroup ? <><div className="border-b border-[#073232]/10 p-3 lg:hidden"><Button variant="ghost" onClick={() => setSelectedParticipantId(null)} className="text-[#073232]"><ArrowLeft className="mr-2 h-4 w-4" />All messages</Button></div><ConversationView conversation={selectedGroup.primary} conversationIds={selectedGroup.conversations.map((conversation) => conversation.id)} initialMessages={selectedGroup.messages} currentUser={currentUser} participant={selectedGroup.participant} onMessageSent={loadConversations} /></> : <EmptyInbox />}</div></section></div></main></>
}

function ConversationRow({ group, currentUser, selected, onSelect }: { group: ConversationGroup; currentUser: any; selected: boolean; onSelect: () => void }) { const { participant, lastMessage, unread, conversations } = group; return <button type="button" onClick={onSelect} className={`mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${selected ? "bg-[#073232] text-white shadow-md" : "hover:bg-[#073232]/5"}`}><Avatar className="h-10 w-10 shrink-0 border border-white/20"><AvatarImage src={participant?.avatar_url} /><AvatarFallback className={selected ? "bg-white/15 text-white" : "bg-[#32cd32]/15 text-[#073232]"}>{participant?.display_name?.[0]?.toUpperCase() || "U"}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-bold">{participant?.display_name || "Swopify member"}</p>{participant?.verification_status === "verified" && <ShieldCheck className={`h-3.5 w-3.5 ${selected ? "text-[#32cd32]" : "text-[#0a4a4a]"}`} />}<span className={`ml-auto shrink-0 text-[10px] ${selected ? "text-white/60" : "text-slate-400"}`}>{lastMessage ? formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: false }) : ""}</span></div><p className={`mt-1 truncate text-xs ${selected ? "text-white/70" : "text-slate-500"}`}>{lastMessage ? `${lastMessage.sender_id === currentUser.id ? "You: " : ""}${lastMessage.content}` : "Start the conversation"}</p>{conversations.length > 1 && <p className={`mt-1 text-[10px] ${selected ? "text-white/50" : "text-[#0a4a4a]"}`}>{conversations.length} linked conversations</p>}</div>{unread > 0 && <Badge className="h-5 min-w-5 justify-center rounded-full bg-[#32cd32] px-1 text-[10px] text-[#073232]">{unread}</Badge>}</button> }
function EmptyInbox({ compact = false }: { compact?: boolean }) { return <div className={`flex flex-1 flex-col items-center justify-center p-8 text-center ${compact ? "min-h-64" : "min-h-[28rem]"}`}><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#32cd32]/15 text-[#073232]"><MessageCircle className="h-7 w-7" /></div><h2 className="font-bold text-[#073232]">No conversations yet</h2><p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">Find something interesting in the marketplace and start a conversation with its owner.</p><Button asChild variant="outline" className="mt-5 border-[#073232]/20 text-[#073232] hover:bg-[#073232]/5"><Link href="/browse">Browse marketplace</Link></Button></div> }
function ConversationSkeleton() { return <div className="space-y-2 p-2">{[1, 2, 3, 4].map((item) => <div key={item} className="flex animate-pulse gap-3 rounded-xl p-3"><div className="h-10 w-10 rounded-full bg-slate-100" /><div className="flex-1 space-y-2"><div className="h-3 w-1/2 rounded bg-slate-100" /><div className="h-3 rounded bg-slate-100" /></div></div>)}</div> }
