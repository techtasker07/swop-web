"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { hasBusinessProfile } from "@/lib/supabase/database"
import { requireBusinessVerification, requirePersonalVerification } from "@/lib/utils/verification-guard"
import { swopifyPricingService } from "@/lib/services/swopify-pricing-service"
import { toast } from "sonner"
import { Building2, ImagePlus, Package, Plus, ShieldCheck, Sparkles, Trash2, User, Wrench, X, ArrowRightLeft } from "lucide-react"

const listingSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  category: z.string().min(1, "Category is required"),
  type: z.enum(["item", "service"]),
  market_type: z.enum(["p2p", "b2b"]),
  condition: z.string().optional(),
  price: z.number().min(0).optional(),
  location: z.string().min(1, "Location is required"),
  tags: z.array(z.string()).optional(),
  preferred_items: z.array(z.string()).optional(),
})

type ListingFormData = z.infer<typeof listingSchema>

const physicalCategories = ["Electronics", "Clothing", "Books", "Sports", "Home & Garden", "Vehicles", "Tools", "Music", "Toys & Games", "Art & Crafts", "Other"]
const serviceCategories = ["Home Services", "Professional Services", "Creative Services", "Tutoring & Education", "Health & Wellness", "Tech Support", "Transportation", "Event Services", "Pet Services", "Beauty Services", "Food Services", "Construction & Trades", "Marketing & Advertising", "Writing & Translation", "Other Services"]
const b2bServiceCategories = ["Professional Services", "Technology Services", "Marketing & Advertising", "Construction & Trades", "Business Equipment", "Office Equipment", "Logistics & Transportation", "Financial Services", "Manufacturing & Production", "Training & Education", "Health & Safety", "Consulting Services", "Legal Services"]
const conditions = ["New", "Like New", "Good", "Fair", "Poor"]

export function CreateListingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [preferredItemInput, setPreferredItemInput] = useState("")
  const [selectionDone, setSelectionDone] = useState(false)
  const [hasBusinessAccess, setHasBusinessAccess] = useState(false)
  const [openToAllOffers, setOpenToAllOffers] = useState(false)
  const [acceptTradeCoins, setAcceptTradeCoins] = useState(true)
  const [acceptTimeCredits, setAcceptTimeCredits] = useState(true)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      type: "item",
      market_type: searchParams.get("type") === "business" ? "b2b" : "p2p",
      price: 0,
      tags: [],
      preferred_items: [],
      category: physicalCategories[0],
    },
  })

  const watchedType = watch("type")
  const watchedMarketType = watch("market_type")
  const watchedTags = watch("tags") || []
  const watchedPreferredItems = watch("preferred_items") || []

  useEffect(() => {
    const checkBusinessAccess = async () => {
      if (user) setHasBusinessAccess(await hasBusinessProfile(user.id))
    }
    checkBusinessAccess()
  }, [user])

  const categories = useMemo(() => {
    if (watchedType === "item") return physicalCategories
    return watchedMarketType === "b2b" ? b2bServiceCategories : serviceCategories
  }, [watchedMarketType, watchedType])

  const chooseListingPath = async (market: "p2p" | "b2b", type: "item" | "service") => {
    if (market === "b2b" && !hasBusinessAccess) {
      toast.error("Create a business profile before adding B2B listings.")
      router.push("/b2b/create-profile")
      return
    }
    setValue("market_type", market)
    setValue("type", type)
    setValue("category", type === "item" ? physicalCategories[0] : market === "b2b" ? b2bServiceCategories[0] : serviceCategories[0])
    setSelectionDone(true)
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length + selectedImages.length > 20) {
      toast.error("Maximum 20 images allowed")
      return
    }
    setSelectedImages((prev) => [...prev, ...files])
    files.forEach((file) => setPreviewUrls((prev) => [...prev, URL.createObjectURL(file)]))
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const addTag = () => {
    const value = tagInput.trim()
    if (value && !watchedTags.includes(value)) setValue("tags", [...watchedTags, value])
    setTagInput("")
  }

  const addPreferredItem = () => {
    const value = preferredItemInput.trim()
    if (value && !watchedPreferredItems.includes(value)) setValue("preferred_items", [...watchedPreferredItems, value])
    setPreferredItemInput("")
  }

  const uploadImages = async () => {
const urls = await Promise.all(selectedImages.map(async (file, index) => {
      const fileExt = file.name.split(".").pop()
      const filePath = `${user?.id ?? "anonymous"}/listings/${Date.now()}-${index}.${fileExt}`
      const { error } = await supabase.storage.from("listing-images").upload(filePath, file)
      if (error) throw error
      return supabase.storage.from("listing-images").getPublicUrl(filePath).data.publicUrl
    }))
    return urls
  }

  const onSubmit = async (data: ListingFormData) => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      if (data.market_type === "b2b") await requireBusinessVerification()
      else await requirePersonalVerification()

      const allowance = await swopifyPricingService.checkListingAllowance({ userId: user.id, isBusiness: data.market_type === "b2b", photoCount: selectedImages.length })
      if (!allowance.allowed) throw new Error(allowance.message)

      const imageUrls = selectedImages.length > 0 ? await uploadImages() : []
      const { data: listing, error } = await supabase.from("listings").insert({
        seller_id: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        condition: data.condition,
        price: data.price || 0,
        location: data.location,
        images: imageUrls,
        tags: data.tags || [],
        preferred_items: data.preferred_items || [],
        is_available: true,
        metadata: { market_type: data.market_type, listing_type_label: data.type === "item" ? "Physical Item" : "Service", plan_id: allowance.plan?.id, open_to_all_offers: openToAllOffers, accept_trade_coins: acceptTradeCoins, accept_time_credits: acceptTimeCredits },
      }).select().single()
      if (error) throw error

      if (imageUrls.length > 0) {
        const imageRecords = imageUrls.map((url, index) => ({ listing_id: listing.id, url, is_primary: index === 0, sort_order: index }))
        const { error: imagesError } = await supabase.from("listing_images").insert(imageRecords)
        if (imagesError) throw imagesError
      }

      toast.success("Listing created successfully")
      router.push("/dashboard/listings")
    } catch (error: any) {
      const message = error?.message || "Failed to create listing. Please try again."
      toast.error(message)
      if (message.toLowerCase().includes("verify")) {
        const type = watchedMarketType === "b2b" ? "business" : "personal"
        router.push(`/verification?type=${type}&redirect=${encodeURIComponent("/dashboard/listings/new")}`)
      }
      if (message.toLowerCase().includes("plan") || message.toLowerCase().includes("limit")) router.push("/pricing")
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectionDone) {
    return (
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <div className="mb-6 rounded-[2rem] bg-[#073232] p-6 text-white shadow-xl sm:p-8">
          <Badge className="mb-4 rounded-full bg-[#32cd32] text-[#073232]">Listing Studio</Badge>
          <h1 className="text-3xl font-bold">Choose a market and listing type</h1>
          <p className="mt-2 text-white/75">Pick Physical or Service inside P2P or B2B. The next screen combines photos, details, and trade preferences.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <MarketCard title="P2P Marketplace" icon={<User className="h-7 w-7" />} description="For public users trading items and services." onItem={() => chooseListingPath("p2p", "item")} onService={() => chooseListingPath("p2p", "service")} />
          <MarketCard title="B2B Marketplace" icon={<Building2 className="h-7 w-7" />} description="For verified business entities with CAC." onItem={() => chooseListingPath("b2b", "item")} onService={() => chooseListingPath("b2b", "service")} disabled={!hasBusinessAccess} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between rounded-[2rem] bg-[#073232] p-5 text-white shadow-xl">
        <div>
          <Badge className="mb-2 rounded-full bg-[#32cd32] text-[#073232]">{watchedMarketType.toUpperCase()} / {watchedType === "item" ? "Physical" : "Service"}</Badge>
          <h1 className="text-2xl font-bold">Listing details</h1>
        </div>
        <Button type="button" onClick={() => setSelectionDone(false)} variant="outline" className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20">Change</Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="rounded-[2rem] shadow-lg">
          <CardContent className="space-y-8 p-5 sm:p-8">
            <section>
              <div className="mb-4 flex items-center gap-3"><ImagePlus className="h-5 w-5 text-[#073232]" /><h2 className="font-semibold text-[#073232]">Photos</h2></div>
              <div className="grid gap-3 sm:grid-cols-4">
                {previewUrls.map((url, index) => (
                  <div key={url} className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-gray-100">
                    <Image src={url} alt="Listing preview" fill className="object-cover" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute right-2 top-2 rounded-full bg-[#073232] p-2 text-white"><X className="h-4 w-4" /></button>
                  </div>
                ))}
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-gray-300 bg-gray-50 text-[#073232] hover:border-[#32cd32]">
                  <ImagePlus className="mb-2 h-7 w-7" />
                  <span className="text-sm font-medium">Add photos</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </section>

            <section className="grid gap-5 sm:grid-cols-2">
              <Field label="Title" error={errors.title?.message}><Input className="rounded-full" {...register("title")} placeholder="Listing title" /></Field>
              <Field label="Category" error={errors.category?.message}><Select onValueChange={(value) => setValue("category", value)} defaultValue={categories[0]}><SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select></Field>
              {watchedType === "item" && <Field label="Condition"><Select onValueChange={(value) => setValue("condition", value)}><SelectTrigger className="rounded-full"><SelectValue placeholder="Select condition" /></SelectTrigger><SelectContent>{conditions.map((condition) => <SelectItem key={condition} value={condition}>{condition}</SelectItem>)}</SelectContent></Select></Field>}
              <Field label="Estimated value"><Input className="rounded-full" type="number" min="0" {...register("price", { valueAsNumber: true })} placeholder="0" /></Field>
              <Field label="Location" error={errors.location?.message}><Input className="rounded-full" {...register("location")} placeholder="Lagos, Nigeria" /></Field>
              <div className="sm:col-span-2"><Field label="Description" error={errors.description?.message}><Textarea className="min-h-32 rounded-[1.5rem]" {...register("description")} placeholder="Describe the item or service clearly..." /></Field></div>
            </section>

            <section className="grid gap-5 sm:grid-cols-2">
              <TokenEditor label="Tags" value={tagInput} setValue={setTagInput} items={watchedTags} addItem={addTag} removeItem={(tag) => setValue("tags", watchedTags.filter((item) => item !== tag))} placeholder="Add tag" />
              <TokenEditor label="Preferred trades" value={preferredItemInput} setValue={setPreferredItemInput} items={watchedPreferredItems} addItem={addPreferredItem} removeItem={(item) => setValue("preferred_items", watchedPreferredItems.filter((entry) => entry !== item))} placeholder="What do you want in return?" />
            </section>

            <section>
              <div className="mb-4 flex items-center gap-3"><ArrowRightLeft className="h-5 w-5 text-[#073232]" /><h2 className="font-semibold text-[#073232]">Trade rules</h2></div>
              <div className="space-y-3 rounded-[1.5rem] border border-gray-200 p-5">
                <ToggleRow label="Open to all trade offers" hint="Allow anyone to propose any trade for this listing." checked={openToAllOffers} onChange={setOpenToAllOffers} />
                <ToggleRow label="Accept Trade Coins as payment" hint="Let buyers pay using Trade Coins." checked={acceptTradeCoins} onChange={setAcceptTradeCoins} />
                {watchedType === "service" && <ToggleRow label="Accept Time Credits as payment" hint="Let buyers pay using Time Credits." checked={acceptTimeCredits} onChange={setAcceptTimeCredits} />}
              </div>
            </section>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-full">Cancel</Button>
          <Button type="submit" disabled={isLoading} className="rounded-full bg-[#32cd32] px-8 text-[#073232] hover:bg-[#28a428]"><ShieldCheck className="mr-2 h-4 w-4" />{isLoading ? "Creating..." : "Create Listing"}</Button>
        </div>
      </form>
    </div>
  )
}

function MarketCard({ title, icon, description, onItem, onService, disabled }: { title: string; icon: React.ReactNode; description: string; onItem: () => void; onService: () => void; disabled?: boolean }) {
  return (
    <Card className={`rounded-[2rem] shadow-lg ${disabled ? "opacity-70" : ""}`}>
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start gap-4"><div className="rounded-[1.3rem] bg-[#32cd32]/15 p-4 text-[#073232]">{icon}</div><div><h2 className="text-xl font-bold text-[#073232]">{title}</h2><p className="text-sm text-gray-600">{description}</p></div></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button type="button" disabled={disabled} onClick={onItem} className="h-16 rounded-[1.5rem] bg-[#073232]"><Package className="mr-2 h-5 w-5" />Physical</Button>
          <Button type="button" disabled={disabled} onClick={onService} className="h-16 rounded-[1.5rem] bg-[#32cd32] text-[#073232] hover:bg-[#28a428]"><Wrench className="mr-2 h-5 w-5" />Service</Button>
        </div>
        {disabled && <p className="text-sm text-[#073232]">Create and verify your business profile to unlock B2B listing.</p>}
      </CardContent>
    </Card>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-sm text-red-600">{error}</p>}</div>
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label className="font-medium text-[#073232]">{label}</Label>
        <p className="text-sm text-gray-500">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-[#32cd32]" : "bg-gray-300"}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  )
}

function TokenEditor({ label, value, setValue, items, addItem, removeItem, placeholder }: { label: string; value: string; setValue: (value: string) => void; items: string[]; addItem: () => void; removeItem: (value: string) => void; placeholder: string }) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex gap-2"><Input className="rounded-full" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addItem() } }} placeholder={placeholder} /><Button type="button" onClick={addItem} className="rounded-full bg-[#073232]"><Plus className="h-4 w-4" /></Button></div>
      <div className="flex flex-wrap gap-2">{items.map((item) => <Badge key={item} className="rounded-full bg-gray-200 px-3 py-1 text-[#073232] hover:bg-gray-300">{item}<button type="button" onClick={() => removeItem(item)} className="ml-2"><Trash2 className="h-3 w-3" /></button></Badge>)}</div>
    </div>
  )
}
