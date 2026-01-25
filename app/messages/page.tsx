import { createClient } from "@/lib/supabase/server"
import { MessagesLayout } from "@/components/messages/messages-layout"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Messages | Swopify",
  description: "Manage your conversations and trade discussions.",
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's conversations
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      *,
      listing:listings(*),
      messages(
        id, content, sender_id, created_at, is_read,
        sender:profiles!sender_id(display_name, avatar_url)
      )
    `)
    .contains("participants", [user.id])
    .order("last_message_at", { ascending: false })

  // Get other participants' profiles
  const participantIds = conversations?.flatMap(conv => 
    conv.participants.filter((id: string) => id !== user.id)
  ) || []

  const { data: participants } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, verification_status")
    .in("id", participantIds)

  return (
    <MessagesLayout 
      conversations={conversations || []}
      participants={participants || []}
      currentUser={user}
    />
  )
}