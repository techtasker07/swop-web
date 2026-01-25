"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  PhotoIcon, 
  XIcon,
  PlusIcon
} from "@heroicons/react/24/outline"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Image from "next/image"

const listingSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  category: z.string().min(1, "Category is required"),
  type: z.enum(["item", "service"]),
  condition: z.string().optional(),
  price: z.number().min(0, "Price must be positive").optional(),
  location: z.string().min(1, "Location is required"),
  tags: z.array(z.string()).optional(),
  preferred_items: z.array(z.string()).optional(),
})

type ListingFormData = z.infer<typeof listingSchema>

const categories = [
  "Electronics", "Clothing", "Books", "Sports", "Home & Garden", 
  "Vehicles", "Tools", "Music", "Toys & Games", "Art & Crafts", 
  "Services", "Other"
]

const conditions = [
  "New", "Like New", "Good", "Fair", "Poor"
]

export function CreateListingForm() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [preferredItemInput, setPreferredItemInput] = useState("")

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      type: "item",
      price: 0,
      tags: [],
      preferred_items: [],
    }
  })

  const watchedType = watch("type")
  const watchedTags = watch("tags") || []
  const watchedPreferredItems = watch("preferred_items") || []

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + selectedImages.length > 5) {
      toast.error("Maximum 5 images allowed")
      return
    }

    setSelectedImages(prev => [...prev, ...files])
    
    files.forEach(file => {
      const url = URL.createObjectURL(file)
      setPreviewUrls(prev => [...prev, url])
    })
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue("tags", [...watchedTags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setValue("tags", watchedTags.filter(t => t !== tag))
  }

  const addPreferredItem = () => {
    if (preferredItemInput.trim() && !watchedPreferredItems.includes(preferredItemInput.trim())) {
      setValue("preferred_items", [...watchedPreferredItems, preferredItemInput.trim()])
      setPreferredItemInput("")
    }
  }

  const removePreferredItem = (item: string) => {
    setValue("preferred_items", watchedPreferredItems.filter(i => i !== item))
  }

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${index}.${fileExt}`
      const filePath = `listings/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('listings')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('listings')
        .getPublicUrl(filePath)

      return data.publicUrl
    })

    return Promise.all(uploadPromises)
  }

  const onSubmit = async (data: ListingFormData) => {
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Upload images
      let imageUrls: string[] = []
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages(selectedImages)
      }

      // Create listing
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert({
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
        })
        .select()
        .single()

      if (listingError) throw listingError

      // Create listing images records
      if (imageUrls.length > 0) {
        const imageRecords = imageUrls.map((url, index) => ({
          listing_id: listing.id,
          url,
          is_primary: index === 0,
          sort_order: index,
        }))

        const { error: imagesError } = await supabase
          .from("listing_images")
          .insert(imageRecords)

        if (imagesError) throw imagesError
      }

      toast.success("Listing created successfully!")
      router.push("/dashboard/listings")
    } catch (error) {
      console.error("Error creating listing:", error)
      toast.error("Failed to create listing. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="What are you offering?"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your item or service in detail..."
              rows={4}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="type">Type *</Label>
              <Select onValueChange={(value: "item" | "service") => setValue("type", value)} defaultValue="item">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="item">Item</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {watchedType === "item" && (
              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select onValueChange={(value) => setValue("condition", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="price">Estimated Value (₦)</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { valueAsNumber: true })}
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional reference price for fair trades
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              {...register("location")}
              placeholder="e.g. Lagos, Nigeria"
              className={errors.location ? "border-red-500" : ""}
            />
            {errors.location && (
              <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <Badge className="absolute bottom-2 left-2 text-xs">Primary</Badge>
                  )}
                </div>
              ))}
              
              {selectedImages.length < 5 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
                  <PhotoIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload up to 5 images. First image will be the primary image.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tags and Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Tags & Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tags</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>What would you like in return?</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={preferredItemInput}
                onChange={(e) => setPreferredItemInput(e.target.value)}
                placeholder="e.g. iPhone, Books, Services"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPreferredItem())}
              />
              <Button type="button" onClick={addPreferredItem} variant="outline" size="sm">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedPreferredItems.map((item) => (
                <Badge key={item} variant="outline" className="text-xs">
                  {item}
                  <button
                    type="button"
                    onClick={() => removePreferredItem(item)}
                    className="ml-1 hover:text-red-500"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Listing"}
        </Button>
      </div>
    </form>
  )
}