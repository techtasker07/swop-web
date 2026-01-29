"use client"

import { useState, useEffect } from "react"
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
  XMarkIcon,
  PlusIcon
} from "@heroicons/react/24/outline"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { hasBusinessProfile } from "@/lib/supabase/database"
import Image from "next/image"
import { X, Package, Wrench, Building2, User, ArrowLeft, ArrowRight } from "lucide-react"

const listingSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  category: z.string().min(1, "Category is required"),
  type: z.enum(["item", "service"]),
  market_type: z.enum(["p2p", "b2b"]),
  condition: z.string().optional(),
  price: z.number().min(0, "Price must be positive").optional(),
  location: z.string().min(1, "Location is required"),
  tags: z.array(z.string()).optional(),
  preferred_items: z.array(z.string()).optional(),
})

type ListingFormData = z.infer<typeof listingSchema>

const physicalCategories = [
  "Electronics", "Clothing", "Books", "Sports", "Home & Garden", 
  "Vehicles", "Tools", "Music", "Toys & Games", "Art & Crafts", "Other"
]

const serviceCategories = [
  "Home Services", "Professional Services", "Creative Services", 
  "Tutoring & Education", "Health & Wellness", "Tech Support", 
  "Transportation", "Event Services", "Pet Services", "Beauty Services",
  "Food Services", "Construction & Trades", "Marketing & Advertising",
  "Writing & Translation", "Other Services"
]

const b2bServiceCategories = [
  "Professional Services", "Technology Services", "Marketing & Advertising",
  "Construction & Trades", "Business Equipment", "Logistics & Transportation",
  "Financial Services", "Manufacturing & Production", "Training & Education",
  "Health & Safety", "Consulting Services", "Legal Services"
]

const conditions = [
  "New", "Like New", "Good", "Fair", "Poor"
]

export function CreateListingForm() {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [preferredItemInput, setPreferredItemInput] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [hasBusinessAccess, setHasBusinessAccess] = useState(false)

  const steps = [
    { title: "Type", icon: Package },
    { title: "Photos", icon: PhotoIcon },
    { title: "Details", icon: Wrench },
    { title: "Value", icon: PlusIcon },
    { title: "Trade", icon: ArrowRight }
  ]

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
      market_type: "p2p",
      price: 0,
      tags: [],
      preferred_items: [],
    }
  })

  const watchedType = watch("type")
  const watchedMarketType = watch("market_type")
  const watchedTags = watch("tags") || []
  const watchedPreferredItems = watch("preferred_items") || []

  // Check business access on component mount
  useEffect(() => {
    const checkBusinessAccess = async () => {
      if (user) {
        const hasAccess = await hasBusinessProfile(user.id)
        setHasBusinessAccess(hasAccess)
      }
    }
    checkBusinessAccess()
  }, [user])

  const getAvailableCategories = () => {
    if (watchedType === "item") {
      return physicalCategories
    } else if (watchedMarketType === "b2b") {
      return b2bServiceCategories
    } else {
      return serviceCategories
    }
  }

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

      // Check if user has business access for B2B listings
      if (data.market_type === "b2b" && !hasBusinessAccess) {
        toast.error("Business profile required for B2B listings")
        return
      }

      // Upload images
      let imageUrls: string[] = []
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages(selectedImages)
      }

      // Create listing with market type metadata
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
          metadata: {
            market_type: data.market_type,
            listing_type_label: data.type === "item" ? "Physical Item" : "Service",
          }
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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const renderTypeStep = () => (
    <div className="space-y-8">
      {/* Header with enhanced styling */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-600 rounded-full mb-4">
          <PlusIcon className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          Create Your Listing
        </h2>
        <p className="text-gray-600 text-lg">Let's start by choosing your marketplace</p>
      </div>

      {/* Market Type Selection with enhanced styling */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Choose Your Marketplace</h3>
          <p className="text-gray-600">Select where you want to list your offering</p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => setValue("market_type", "p2p")}
            className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
              watchedMarketType === "p2p"
                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl shadow-blue-200/50"
                : "border-gray-200 hover:border-blue-300 hover:shadow-lg bg-white"
            }`}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className={`p-4 rounded-full transition-all duration-300 ${
                watchedMarketType === "p2p" 
                  ? "bg-blue-500 shadow-lg shadow-blue-200" 
                  : "bg-gray-100 group-hover:bg-blue-100"
              }`}>
                <User className={`h-10 w-10 transition-colors duration-300 ${
                  watchedMarketType === "p2p" ? "text-white" : "text-gray-600 group-hover:text-blue-600"
                }`} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-xl text-gray-900 mb-1">P2P Marketplace</h3>
                <p className="text-gray-600 text-sm">Person-to-person trading</p>
                <p className="text-xs text-gray-500 mt-2">Perfect for personal items and casual services</p>
              </div>
              {watchedMarketType === "p2p" && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              if (hasBusinessAccess) {
                setValue("market_type", "b2b")
              } else {
                toast.error("Business profile required for B2B listings")
              }
            }}
            className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
              watchedMarketType === "b2b"
                ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-xl shadow-green-200/50"
                : hasBusinessAccess
                ? "border-gray-200 hover:border-green-300 hover:shadow-lg bg-white"
                : "border-gray-200 opacity-50 cursor-not-allowed bg-gray-50"
            }`}
            disabled={!hasBusinessAccess}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className={`p-4 rounded-full transition-all duration-300 ${
                watchedMarketType === "b2b" 
                  ? "bg-green-500 shadow-lg shadow-green-200" 
                  : hasBusinessAccess 
                  ? "bg-gray-100 group-hover:bg-green-100" 
                  : "bg-gray-100"
              }`}>
                <Building2 className={`h-10 w-10 transition-colors duration-300 ${
                  watchedMarketType === "b2b" 
                    ? "text-white" 
                    : hasBusinessAccess 
                    ? "text-gray-600 group-hover:text-green-600" 
                    : "text-gray-400"
                }`} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-xl text-gray-900 mb-1">B2B Marketplace</h3>
                <p className="text-gray-600 text-sm">Business-to-business services</p>
                <p className="text-xs text-gray-500 mt-2">Professional services and business solutions</p>
                {!hasBusinessAccess && (
                  <Badge variant="outline" className="mt-3 text-xs border-blue-200 text-blue-600">
                    Business Profile Required
                  </Badge>
                )}
              </div>
              {watchedMarketType === "b2b" && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Animated Item Type Selection - Only shows when market type is selected */}
      <div className={`transition-all duration-700 ease-out ${
        watchedMarketType 
          ? "opacity-100 transform translate-y-0 max-h-96" 
          : "opacity-0 transform translate-y-8 max-h-0 overflow-hidden"
      }`}>
        {watchedMarketType && (
          <div className="space-y-6 pt-8 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">What Are You Offering?</h3>
              <p className="text-gray-600">Choose the type of listing you want to create</p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => {
                  setValue("type", "item")
                  setValue("category", physicalCategories[0])
                }}
                className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  watchedType === "item"
                    ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-xl shadow-green-200/50"
                    : "border-gray-200 hover:border-green-300 hover:shadow-lg bg-white"
                }`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className={`p-5 rounded-full transition-all duration-300 ${
                    watchedType === "item" 
                      ? "bg-green-500 shadow-lg shadow-green-200" 
                      : "bg-gray-100 group-hover:bg-green-100"
                  }`}>
                    <Package className={`h-12 w-12 transition-colors duration-300 ${
                      watchedType === "item" ? "text-white" : "text-gray-600 group-hover:text-green-600"
                    }`} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-xl text-gray-900 mb-1">Physical Item</h3>
                    <p className="text-gray-600 text-sm">Tangible goods and products</p>
                    <p className="text-xs text-gray-500 mt-2">Electronics, books, clothing, and more</p>
                  </div>
                  {watchedType === "item" && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setValue("type", "service")
                  const categories = watchedMarketType === "b2b" ? b2bServiceCategories : serviceCategories
                  setValue("category", categories[0])
                }}
                className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  watchedType === "service"
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl shadow-blue-200/50"
                    : "border-gray-200 hover:border-blue-300 hover:shadow-lg bg-white"
                }`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className={`p-5 rounded-full transition-all duration-300 ${
                    watchedType === "service" 
                      ? "bg-blue-500 shadow-lg shadow-blue-200" 
                      : "bg-gray-100 group-hover:bg-blue-100"
                  }`}>
                    <Wrench className={`h-12 w-12 transition-colors duration-300 ${
                      watchedType === "service" ? "text-white" : "text-gray-600 group-hover:text-blue-600"
                    }`} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-xl text-gray-900 mb-1">Service</h3>
                    <p className="text-gray-600 text-sm">Skills and professional services</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {watchedMarketType === "b2b" ? "Professional business services" : "Personal skills and expertise"}
                    </p>
                  </div>
                  {watchedType === "service" && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderPhotosStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Photos</h2>
        <p className="text-gray-600">Upload up to 5 images. First image will be the primary image.</p>
      </div>

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
              <X className="h-4 w-4" />
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
    </div>
  )

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Tell us about your {watchedType === "item" ? "item" : "service"}</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            {...register("title")}
            placeholder={watchedType === "item" ? "e.g., iPhone 13 Pro Max" : "e.g., Professional Web Development"}
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
                {getAvailableCategories().map((category) => (
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
        </div>
      </div>
    </div>
  )

  const renderValueStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Value & Location</h2>
        <p className="text-gray-600">Set your pricing and location details</p>
      </div>

      <div className="space-y-4">
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
      </div>
    </div>
  )

  const renderTradeStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tags & Preferences</h2>
        <p className="text-gray-600">Help others find your listing and specify what you're looking for</p>
      </div>

      <div className="space-y-4">
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
                  <X className="h-3 w-3" />
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
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Enhanced Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            
            return (
              <button
                key={step.title}
                type="button"
                onClick={() => handleStepClick(index)}
                className={`flex flex-col items-center space-y-3 p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-lg shadow-blue-200/50"
                    : isCompleted
                    ? "bg-gradient-to-br from-green-50 to-green-100 text-green-600 shadow-lg shadow-green-200/50"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className={`p-3 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-blue-500 shadow-lg shadow-blue-200"
                    : isCompleted
                    ? "bg-green-500 shadow-lg shadow-green-200"
                    : "bg-gray-100"
                }`}>
                  <Icon className={`h-6 w-6 transition-colors duration-300 ${
                    isActive || isCompleted ? "text-white" : "text-gray-500"
                  }`} />
                </div>
                <span className="text-sm font-semibold">{step.title}</span>
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-10">
            <div className="transition-all duration-500 ease-out">
              {currentStep === 0 && renderTypeStep()}
              {currentStep === 1 && renderPhotosStep()}
              {currentStep === 2 && renderDetailsStep()}
              {currentStep === 3 && renderValueStep()}
              {currentStep === 4 && renderTradeStep()}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Navigation */}
        <div className="flex justify-between bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 0 ? () => router.back() : handlePrevious}
            disabled={isLoading}
            className="px-6 py-3 rounded-xl border-2 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? "Cancel" : "Previous"}
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button 
              type="button" 
              onClick={handleNext} 
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              disabled={isLoading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  Create Listing
                  <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}