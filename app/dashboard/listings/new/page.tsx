import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { hasPersonalVerification, hasBusinessVerification, verificationPathFor } from "@/lib/utils/verification-guard"
import { CreateListingForm } from "@/components/listings/create-listing-form"

export const metadata = {
  title: "Create Listing | Swopify",
  description: "Create a new listing to trade your items or services.",
}

export default async function NewListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/listings/new")
  }

  // Fetch just the columns needed for the verification check.
  const { data: profile } = await supabase
    .from("profiles")
    .select("bvn_verified, nin_verified, business_verified, verification_status, user_type")
    .eq("id", user.id)
    .maybeSingle()

  const isVerified =
    hasPersonalVerification(profile) || hasBusinessVerification(profile)

  if (!isVerified) {
    // Redirect to the correct verification flow with a return URL so the user
    // lands back here after completing verification.
    const path = verificationPathFor(profile)
    redirect(`${path}&redirect=/dashboard/listings/new`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#073232]">Create New Listing</h1>
        <p className="text-muted-foreground">
          List an item or service you&apos;d like to trade with the community
        </p>
      </div>

      <CreateListingForm />
    </div>
  )
}
