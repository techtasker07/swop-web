import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/database"

export function hasPersonalVerification(profile?: Pick<Profile, "bvn_verified" | "nin_verified" | "verification_status"> | null) {
  return profile?.bvn_verified === true || profile?.nin_verified === true
}

export function hasBusinessVerification(profile?: Pick<Profile, "user_type" | "business_verified" | "verification_status"> | null) {
  return profile?.user_type === "business" && (profile?.business_verified === true || profile?.verification_status === "verified")
}

export function verificationPathFor(profile?: Pick<Profile, "user_type"> | null) {
  return profile?.user_type === "business" ? "/verification?type=business" : "/verification?type=personal"
}

export async function getCurrentVerificationState() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, profile: null, personalVerified: false, businessVerified: false }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  const typedProfile = profile as Profile | null

  return {
    user,
    profile: typedProfile,
    personalVerified: hasPersonalVerification(typedProfile),
    businessVerified: hasBusinessVerification(typedProfile),
  }
}

export async function requirePersonalVerification() {
  const state = await getCurrentVerificationState()
  if (!state.user) throw new Error("Please sign in to continue.")
  if (!state.personalVerified) throw new Error("Please verify your BVN or NIN before adding items or making transactions.")
  return state
}

export async function requireBusinessVerification() {
  const state = await getCurrentVerificationState()
  if (!state.user) throw new Error("Please sign in to continue.")
  if (!state.businessVerified) throw new Error("Please verify your CAC before using business marketplace features.")
  return state
}

export async function requireAccountVerification() {
  const state = await getCurrentVerificationState()
  if (!state.user) throw new Error("Please sign in to continue.")
  if (state.profile?.user_type === "business") {
    if (!state.businessVerified) throw new Error("Please verify your CAC before using business marketplace features.")
  } else if (!state.personalVerified) {
    throw new Error("Please verify your BVN or NIN before adding items or making transactions.")
  }
  return state
}
