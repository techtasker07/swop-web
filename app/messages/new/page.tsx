import { createClient } from "@/lib/supabase/server"
import { NewMessageForm } from "@/components/messages/new-message-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { redirect } from "next/navigation"

interface NewMessagePageProps {
  searchParams: { 
    listing?: string
    seller?: string
  }
}

export const metadata = {
  title: "New Message | Swopify",
  description: "Start a new conversation.",
}

export default async function NewMessagePage({ searchParams }: NewMessagePageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  let listing = null
  let seller = null

  // Fetch listing if provided
  if (searchParams.listing) {
    const { data } = await supabase
      .from("listings")
      .select(`
        *,
        seller:profiles!seller_id(*)
      `)
      .eq("id", parseInt(searchParams.listing))
      .single()
    
    listing = data
    seller = data?.seller
  } else if (searchParams.seller) {
    // Fetch seller profile if provided
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", searchParams.seller)
      .single()
    
    seller = data
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold text-foreground">New Message</h1>
          <NewMessageForm
            currentUser={user}
            initialListing={listing}
            initialRecipient={seller}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
