"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, ImagePlus, X, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const categories = [
  { id: "electronics", name: "Electronics" },
  { id: "furniture", name: "Furniture" },
  { id: "clothing", name: "Clothing" },
  { id: "services", name: "Services" },
  { id: "vehicles", name: "Vehicles" },
  { id: "books", name: "Books" },
  { id: "sports", name: "Sports" },
  { id: "other", name: "Other" },
]

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [lookingFor, setLookingFor] = useState("")
  const [category, setCategory] = useState("")
  const [isAvailable, setIsAvailable] = useState(true)
  const [location, setLocation] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageInput, setImageInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  
  const supabase = createClient()

  useEffect(() => {
    if (!id) return

    const loadListing = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          console.log("No user found, redirecting to login")
          router.push("/auth/login")
          return
        }

        setUser(authUser)

        console.log("Fetching listing with id:", id, "for user:", authUser.id)

        const { data: listing, error: fetchError } = await supabase
          .from("listings")
          .select("*")
          .eq("id", parseInt(id))
          .eq("seller_id", authUser.id)
          .single()

        console.log("Fetch result:", { listing, fetchError })

        if (fetchError) {
          console.error("Database error:", fetchError)
          setError(`Could not load listing: ${fetchError.message}`)
          return
        }

        if (!listing) {
          console.error("No listing found")
          setError("Listing not found. Make sure you own this listing.")
          return
        }

        console.log("Listing loaded successfully:", listing)

        setTitle(listing.title || "")
        setDescription(listing.description || "")
        setLookingFor(listing.looking_for || "")
        setCategory(listing.category_id ? listing.category_id.toString() : "")
        setIsAvailable(listing.is_available ?? true)
        setLocation(listing.location || "")
        setImageUrls(listing.images || [])
        setLoading(false)
      } catch (err) {
        console.error("Exception in loadListing:", err)
        setError(`An unexpected error occurred: ${err}`)
      }
    }

    loadListing()
  }, [id, supabase, router])

  const handleAddImage = () => {
    if (imageInput && imageUrls.length < 5) {
      setImageUrls([...imageUrls, imageInput])
      setImageInput("")
    }
  }

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Convert category slug to ID or use directly if it's already an ID
      let categoryId = category ? parseInt(category) : null

      const { error: updateError } = await supabase
        .from("listings")
        .update({
          title,
          description,
          looking_for: lookingFor || null,
          category_id: categoryId,
          is_available: isAvailable,
          location: location || null,
          images: imageUrls.length > 0 ? imageUrls : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", parseInt(id))

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }

      router.push("/dashboard/listings")
      router.refresh()
    } catch (err) {
      setError(`Error saving listing: ${err}`)
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const { error: deleteError } = await supabase
        .from("listings")
        .delete()
        .eq("id", parseInt(id))

      if (deleteError) {
        setError(deleteError.message)
        setDeleting(false)
        return
      }

      router.push("/dashboard/listings")
      router.refresh()
    } catch (err) {
      setError(`Error deleting listing: ${err}`)
      setDeleting(false)
    }
  }

  if (loading && !error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading listing...</p>
        </div>
      </div>
    )
  }

  if (error && loading) {
    return (
      <div className="space-y-4 max-w-md mx-auto py-16">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error Loading Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800 mb-4">{error}</p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/listings">Back to My Listings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/listings">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to listings</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Edit Listing</h1>
          <p className="text-muted-foreground">Update your listing details.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Listing</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this listing? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
            <CardDescription>
              Update the information about your trade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What are you offering?"
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item or service in detail..."
                  rows={4}
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lookingFor">What are you looking for?</Label>
                <Textarea
                  id="lookingFor"
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                  placeholder="Describe what you'd like to trade for..."
                  rows={2}
                  disabled={saving}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory} required disabled={saving}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State"
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="available">Availability</Label>
                  <div className="flex items-center space-x-2 border border-gray-300 rounded-md p-2.5">
                    <input
                      id="available"
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      disabled={saving}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="available" className="mb-0 cursor-pointer">
                      {isAvailable ? "Active" : "Inactive"}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Images (up to 5)</Label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="Paste image URL"
                    disabled={saving || imageUrls.length >= 5}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddImage}
                    disabled={!imageInput || imageUrls.length >= 5}
                  >
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </div>
                {imageUrls.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={url || "/placeholder.svg"} 
                          alt={`Preview ${index + 1}`}
                          className="h-20 w-20 rounded-lg border border-border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button type="button" variant="outline" asChild disabled={saving}>
                  <Link href="/dashboard/listings">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
