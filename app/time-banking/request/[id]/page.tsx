"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Clock, MapPin, User, Loader2, Send, AlertCircle } from "lucide-react"
import { timeBankingService, type TimeBankingRequest } from "@/lib/services/time-banking-service"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"

export default function RequestDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const requestId = parseInt(params.id as string, 10)

  const [request, setRequest] = useState<TimeBankingRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOfferDialog, setShowOfferDialog] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)

      const requestData = await timeBankingService.getRequestDetails(requestId)
      setRequest(requestData)
    } catch (error) {
      console.error("Error loading request:", error)
      toast.error("Failed to load request details")
    } finally {
      setLoading(false)
    }
  }

  const handleOfferHelp = async () => {
    if (!user) {
      toast.error("You must be logged in to offer help")
      router.push(`/auth/login?redirect=/time-banking/request/${requestId}`)
      return
    }

    if (!request) return

    // Check if user is the requester
    if (request.requester_id === user.id) {
      toast.error("You cannot offer help on your own request")
      return
    }

    // Check if request is still open
    if (request.status !== "open" || request.provider_id) {
      toast.error("This request is no longer available")
      setShowOfferDialog(false)
      return
    }

    setIsSubmitting(true)
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single()

      const providerName = profile?.display_name || user.email || "Helper"

      // Accept the request
      const updatedRequest = await timeBankingService.acceptRequest(
        requestId,
        user.id,
        providerName,
        message.trim() || undefined
      )

      // Create conversation between requester and provider
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      const participants = [updatedRequest.requester_id, user.id]

      const { data: conversation } = await supabase
        .from("conversations")
        .insert({
          participants,
          created_by: user.id,
          subject: `Time Banking Help: ${updatedRequest.title}`,
        })
        .select()
        .single()

      toast.success("You've offered to help! A chat has been created.")
      setShowOfferDialog(false)
      setRequest(updatedRequest)
    } catch (error: any) {
      console.error("Error offering help:", error)
      toast.error(error?.message || "Failed to offer help")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#32cd32]"></div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
            <Link href="/time-banking" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Time Banking
            </Link>
            <Card className="bg-red-50 border border-red-200">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">Request Not Found</h3>
                <p className="text-red-700 mb-6">This request may have been deleted or is no longer available</p>
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <Link href="/time-banking">Return to Time Banking</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const isRequester = user?.id === request.requester_id
  const isProvider = user?.id === request.provider_id
  const isOpen = request.status === "open" && !request.provider_id

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

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Banner */}
              <div className={`rounded-lg p-4 ${
                request.status === "open"
                  ? "bg-blue-50 border border-blue-200"
                  : request.status === "accepted"
                  ? "bg-green-50 border border-green-200"
                  : request.status === "completed"
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-gray-50 border border-gray-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-semibold ${
                      request.status === "open"
                        ? "text-blue-900"
                        : request.status === "accepted"
                        ? "text-green-900"
                        : request.status === "completed"
                        ? "text-emerald-900"
                        : "text-gray-900"
                    }`}>
                      {request.status === "open" && "🔍 Looking for helpers"}
                      {request.status === "accepted" && "✓ Helper accepted"}
                      {request.status === "completed" && "✅ Completed"}
                      {request.status === "cancelled" && "✕ Cancelled"}
                    </p>
                  </div>
                  <Badge variant={request.status === "open" ? "default" : "secondary"} className="text-xs">
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Request Details Card */}
              <Card>
                <CardHeader>
                  <div className="space-y-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{request.title}</h1>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-[#32cd32]/10 text-[#32cd32] border-[#32cd32]/30">
                        <Clock className="h-3 w-3 mr-1" />
                        {request.hours_requested} hour{request.hours_requested !== 1 ? "s" : ""}
                      </Badge>
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />
                        {request.location || "Not specified"}
                      </Badge>
                      <Badge variant="outline">{request.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
                  </div>

                  {/* Posted By */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Posted by</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#32cd32] to-[#073232] flex items-center justify-center text-white font-semibold">
                        {(request.requester?.display_name || request.requester_name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{request.requester?.display_name || request.requester_name || "Unknown"}</p>
                        <p className="text-sm text-gray-600">Requester</p>
                      </div>
                    </div>
                  </div>

                  {/* Provider Info (if accepted) */}
                  {request.provider_id && (
                    <div className="border-t pt-6 bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Accepted by</h3>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#28a428] to-[#073232] flex items-center justify-center text-white font-semibold">
                          {(request.provider?.display_name || request.provider_name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{request.provider?.display_name || request.provider_name || "Unknown"}</p>
                          <p className="text-sm text-gray-600">Helper</p>
                        </div>
                      </div>
                      {request.provider_message && (
                        <div className="mt-3 p-3 bg-white rounded border border-green-200">
                          <p className="text-sm text-gray-700">{request.provider_message}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Offer Help Button */}
              {!isRequester && isOpen && (
                <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full h-12 rounded-lg bg-gradient-to-r from-[#32cd32] to-[#28a428] hover:from-[#28a428] hover:to-[#32cd32] text-white font-semibold text-lg">
                      <Send className="h-5 w-5 mr-2" />
                      Offer Help
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Offer Help</DialogTitle>
                      <DialogDescription>
                        Let {request.requester?.display_name || request.requester_name || "the requester"} know you're interested in helping
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="offer-message">Message (optional)</Label>
                        <Textarea
                          id="offer-message"
                          placeholder="Tell them a bit about yourself or when you're available..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={4}
                          className="rounded-lg resize-none"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-900">
                          Once they accept your help, you'll both get {request.hours_requested} hour{request.hours_requested !== 1 ? "s" : ""} of time credit when the task is completed.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowOfferDialog(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 bg-[#32cd32] hover:bg-[#28a428] text-white"
                          onClick={handleOfferHelp}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Offering...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Offer Help
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Info Cards */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Created</p>
                    <p className="text-sm text-gray-700">
                      {new Date(request.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  {request.completed_at && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Completed</p>
                      <p className="text-sm text-gray-700">
                        {new Date(request.completed_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Messages */}
              {isRequester && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-blue-900">
                      {isOpen
                        ? "Your request is open. Others can see it and offer to help."
                        : request.status === "accepted"
                        ? "Someone has accepted your request. Check your messages!"
                        : "Your request has been completed."}
                    </p>
                  </CardContent>
                </Card>
              )}

              {isProvider && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-green-900">
                      You're helping with this request. Check your messages with the requester for more details.
                    </p>
                  </CardContent>
                </Card>
              )}

              {!isRequester && !isOpen && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">
                      {request.status === "accepted"
                        ? "This request has been accepted by someone else."
                        : "This request is no longer available."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
