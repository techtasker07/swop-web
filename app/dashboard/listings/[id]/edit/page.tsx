"use client"

import React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
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

const statusOptions = [
  { id: "active", name: "Active" },
  { id: "traded", name: "Traded" },
  { id: "inactive", name: "Inactive" },
]

interface EditListingPageProps {
  params: Promise<{ id: string }>
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const { id } = use(params)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [lookingFor, setLookingFor] = useState("")
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState("active")
  const [location, setLocation] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageInput, setImageInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadListing = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: listing } = await supabase
        .from("listings")
        .select(`
          *,
          categories (slug)
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

      if (!listing) {
        router.push("/dashboard/listings")
        return
      }

      setTitle(listing.title)
      setDescription(listing.description)
      setLookingFor(listing.looking_for || "")
      setCategory(listing.categories?.slug || "")
      setStatus(listing.status)
      setLocation(listing.location || "")
      setImageUrls(listing.images || [])
      setLoading(false)
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

    // Get category ID
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single()

    const { error: updateError } = await supabase
      .from("listings")
      .update({
        title,
        description,
        looking_for: lookingFor || null,
        category_id: categoryData?.id,
        status,
        location: location || null,
        images: imageUrls.length > 0 ? imageUrls : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push("/dashboard/listings")
    router.refresh()
  }

  const handleDelete = async () => {
    setDeleting(true)

    const { error: deleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", id)

    if (deleteError) {
      setError(deleteError.message)
      setDeleting(false)
      return
    }

    router.push("/dashboard/listings")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus} disabled={saving}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.name}
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
