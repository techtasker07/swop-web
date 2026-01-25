import { createClient } from "@/lib/supabase/server"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileStats } from "@/components/profile/profile-stats"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Profile | Swopify",
  description: "Manage your Swopify profile and view your trading activity.",
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Fetch user's ratings/reviews
  const { data: ratings } = await supabase
    .from("ratings")
    .select(`
      *,
      rater:profiles!rater_id(display_name, avatar_url)
    `)
    .eq("ratee_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Fetch user's achievements (mock data for now)
  const achievements = [
    { id: 1, name: 'First Trade', description: 'Complete your first trade', earned: true },
    { id: 2, name: 'Trusted Trader', description: '10 successful trades', earned: profile?.successful_trades >= 10 },
    { id: 3, name: 'Community Helper', description: '50 time bank hours', earned: (profile?.time_credits || 0) >= 50 },
    { id: 4, name: 'Top Rated', description: 'Maintain 4.5+ rating', earned: (profile?.average_rating || 0) >= 4.5 },
    { id: 5, name: 'Master Barterer', description: '100 successful trades', earned: (profile?.successful_trades || 0) >= 100 },
    { id: 6, name: 'Coin Collector', description: 'Earn 1000 trade coins', earned: (profile?.gift_cards || 0) >= 1000 },
  ]

  return (
    <div className="space-y-8">
      <ProfileHeader profile={profile} user={user} />
      <ProfileStats profile={profile} />
      <ProfileTabs 
        achievements={achievements}
        ratings={ratings || []}
        profile={profile}
      />
    </div>
  )
}