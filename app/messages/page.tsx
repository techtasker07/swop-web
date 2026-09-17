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

  if (!user) redirect("/auth/login")

  // Match the established mobile query: active conversations, newest activity first.
  // The client layout refreshes this data after hydration and listens for new messages.
  const { data: conversations } = await supabase
    .from("conversations")
    .select("*, listing:listings(*)")
    .contains("participants", [user.id])
    .eq("is_active", true)
    .order("last_message_time", { ascending: false })

  return <MessagesLayout conversations={conversations || []} participants={[]} currentUser={user} />
}
