import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatNaira } from "@/lib/utils/currency"
import { Building2, MapPin, ShieldCheck } from "lucide-react"

export default async function B2BListingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: listing } = await supabase.from("listings").select("*, seller:profiles!seller_id(*), listing_images(url, is_primary, sort_order)").eq("id", Number(id)).single()
  if (!listing) return <div>Listing not found</div>
  const image = listing.listing_images?.find((item: any) => item.is_primary)?.url || listing.listing_images?.[0]?.url || listing.images?.[0]

  return <div className="min-h-screen bg-gray-50"><Header /><main className="mx-auto max-w-6xl space-y-6 px-4 py-8"><div className="rounded-[2rem] bg-[#073232] p-6 text-white"><Badge className="mb-3 rounded-full bg-[#32cd32] text-[#073232]">B2B Listing</Badge><h1 className="text-3xl font-bold">{listing.title}</h1><p className="mt-2 text-white/75">{listing.seller?.business_name || listing.seller?.display_name}</p></div><div className="grid gap-6 lg:grid-cols-[1fr_360px]"><Card className="overflow-hidden rounded-[2rem] shadow-lg"><div className="relative h-80 bg-gray-200">{image ? <Image src={image} alt={listing.title} fill className="object-cover" /> : <Building2 className="m-auto h-20 w-20 text-gray-400" />}</div><CardContent className="space-y-4 p-6"><h2 className="text-xl font-bold text-[#073232]">Details</h2><p className="text-gray-700">{listing.description}</p><div className="flex items-center gap-2 text-gray-600"><MapPin className="h-4 w-4" />{listing.location}</div></CardContent></Card><Card className="rounded-[2rem] shadow-lg"><CardContent className="space-y-4 p-6"><div className="rounded-[1.5rem] bg-[#32cd32]/15 p-4 text-[#073232]"><ShieldCheck className="mb-2 h-6 w-6" /><div className="font-bold">Verified business trade</div></div><div className="text-2xl font-bold text-[#073232]">{listing.price > 0 ? formatNaira(listing.price) : "Contact for pricing"}</div><Button asChild className="w-full rounded-full bg-[#073232]"><Link href={`/business-profile/${listing.seller_id}`}>View business profile</Link></Button><Button asChild className="w-full rounded-full bg-[#32cd32] text-[#073232]"><Link href="/messages/new">Contact business</Link></Button></CardContent></Card></div></main><Footer /></div>
}
