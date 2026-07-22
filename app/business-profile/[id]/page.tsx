import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, ShieldCheck } from "lucide-react"

export default async function BusinessProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: business } = await supabase.from("profiles").select("*").eq("id", id).eq("user_type", "business").single()
  const { data: listings } = await supabase.from("listings").select("*, listing_images(url, is_primary, sort_order)").eq("seller_id", id).eq("is_available", true).order("created_at", { ascending: false })
  if (!business) return <div>Business not found</div>

  return <div className="min-h-screen bg-gray-50"><Header /><main className="mx-auto max-w-6xl space-y-6 px-4 py-8"><div className="rounded-[2rem] bg-[#073232] p-6 text-white"><Badge className="mb-3 rounded-full bg-[#32cd32] text-[#073232]"><ShieldCheck className="mr-1 h-3 w-3" />Verified Business</Badge><h1 className="text-3xl font-bold">{business.business_name || business.display_name}</h1><p className="mt-2 text-white/75">{business.business_type}</p></div><Card className="rounded-[2rem] shadow-lg"><CardContent className="p-6"><p className="text-gray-700">{business.business_description || business.bio || "No business description supplied."}</p></CardContent></Card><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(listings || []).map((listing: any) => { const image = listing.listing_images?.[0]?.url || listing.images?.[0]; return <Link key={listing.id} href={`/b2b-listing-details/${listing.id}`} className="rounded-[1.5rem] bg-white p-4 shadow-md transition hover:shadow-lg"><div className="relative mb-3 h-40 overflow-hidden rounded-[1.25rem] bg-gray-100">{image ? <Image src={image} alt={listing.title} fill className="object-cover" /> : <Building2 className="m-auto h-12 w-12 text-gray-400" />}</div><h2 className="font-semibold text-[#073232]">{listing.title}</h2><p className="line-clamp-2 text-sm text-gray-600">{listing.description}</p></Link> })}</div><Button asChild variant="outline" className="rounded-full"><Link href="/b2b">Back to B2B</Link></Button></main><Footer /></div>
}
