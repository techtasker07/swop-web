"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, ArrowLeft, Loader2 } from "lucide-react"
import { timeBankingService } from "@/lib/services/time-banking-service"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

const CATEGORIES = [
  "Home Maintenance",
  "Transportation",
  "Shopping & Errands",
  "Cooking & Meal Prep",
  "Childcare",
  "Elder Care",
  "Tech Support",
  "Tutoring & Learning",
  "Moving & Storage",
  "Yard Work & Gardening",
  "Pet Care",
  "Health & Wellness",
  "Other",
]

export default function CreateTimeBankingRequestPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [hoursRequested, setHoursRequested] = useState("1")
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!title.trim() || !description.trim() || !category || !hoursRequested || !location.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    const hours = parseInt(hoursRequested, 10)
    if (hours < 1 || hours > 168) {
      toast.error("Hours must be between 1 and 168")
      return
    }

    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to create a request")
        router.push("/auth/login?redirect=/time-banking/create")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single()

      const request = await timeBankingService.createRequest({
        title: title.trim(),
        description: description.trim(),
        category,
        hours_requested: hours,
        location: location.trim(),
        requester_id: user.id,
        requester_name: profile?.display_name || user.email || "User",
      })

      toast.success("Request created successfully!")
      router.push("/time-banking")
    } catch (error: any) {
      console.error("Error creating request:", error)
      toast.error(error?.message || "Failed to create request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
          {/* Back Button */}
          <Link href="/time-banking" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Time Banking
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="rounded-2xl bg-gradient-to-br from-[#32cd32]/20 to-[#073232]/20 p-4">
                <Clock className="h-8 w-8 text-[#32cd32]" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Request Help</h1>
                <p className="text-gray-600 mt-1">Post a time banking request to find community members who can help</p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="max-w-2xl">
            <Card className="shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-semibold text-gray-900">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="What help do you need? (e.g., 'Help painting my living room')"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-12 rounded-lg"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500">Be clear and specific about what you need</p>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-semibold text-gray-900">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Provide more details about the task, any requirements, preferred timing, etc."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="rounded-lg resize-none"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500">The more details, the better helpers can understand what you need</p>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-base font-semibold text-gray-900">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
                      <SelectTrigger id="category" className="h-12 rounded-lg">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-base font-semibold text-gray-900">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      placeholder="Where will the help be needed? (e.g., 'Downtown Lagos', 'Ikoyi')"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="h-12 rounded-lg"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Hours Requested */}
                  <div className="space-y-2">
                    <Label htmlFor="hours" className="text-base font-semibold text-gray-900">
                      Hours Requested <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="hours"
                        type="number"
                        min="1"
                        max="168"
                        placeholder="1"
                        value={hoursRequested}
                        onChange={(e) => setHoursRequested(e.target.value)}
                        className="h-12 rounded-lg flex-1"
                        disabled={isSubmitting}
                      />
                      <Badge className="bg-[#32cd32]/10 text-[#32cd32] text-sm px-3 py-2 border-[#32cd32]/30">
                        {hoursRequested} hour{hoursRequested !== "1" ? "s" : ""}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">1 hour of help = 1 hour credit you can use later</p>
                  </div>

                  {/* Info Box */}
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <p className="text-sm text-blue-900">
                      <strong>How it works:</strong> When someone accepts your request and completes the work, you'll both earn/use the time credits. The community helper will earn hours they can use later.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="sm:flex-1 h-12 rounded-lg"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="sm:flex-1 h-12 rounded-lg bg-gradient-to-r from-[#32cd32] to-[#28a428] hover:from-[#28a428] hover:to-[#32cd32] text-white font-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Request...
                        </>
                      ) : (
                        "Post Request"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
