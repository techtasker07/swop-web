"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Image from "next/image"

interface NewMessageFormProps {
  currentUser: any
  initialListing?: any
  initialRecipient?: any
}

export function NewMessageForm({ currentUser, initialListing, initialRecipient }: NewMessageFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const recipient = initialRecipient || initialListing?.seller

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) {
      toast.error("Please enter a message")
      return
    }

    if (!recipient) {
      toast.error("No recipient selected")
      return
    }

    setIsLoading(true)

    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .contains("participants", [currentUser.id, recipient.id])
        .eq("listing_id", initialListing?.id || null)
        .single()

      let conversationId = existingConversation?.id

      if (!conversationId) {
        // Create new conversation
        const { data: newConversation, error: conversationError } = await supabase
          .from("conversations")
          .insert({
            participants: [currentUser.id, recipient.id],
            listing_id: initialListing?.id || null,
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (conversationError) throw conversationError
        conversationId = newConversation.id
      }

      // Send message
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: message.trim(),
          message_type: "text",
        })

      if (messageError) throw messageError

      // Update conversation last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId)

      toast.success("Message sent successfully!")
      router.push("/messages")
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Recipient Info */}
      {recipient && (
        <Card>
          <CardHeader>
            <CardTitle>To:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={recipient.avatar_url} />
                <AvatarFallback>
                  {recipient.display_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-foreground">{recipient.display_name}</h3>
                {recipient.verification_status === 'verified' && (
                  <p className="text-sm text-blue-600">Verified User</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Listing Context */}
      {initialListing && (
        <Card>
          <CardHeader>
            <CardTitle>About:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted">
                {initialListing.images?.[0] ? (
                  <Image
                    src={initialListing.images[0]}
                    alt={initialListing.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-muted-foreground text-xs">No image</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-foreground">{initialListing.title}</h3>
                <p className="text-sm text-muted-foreground">{initialListing.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message */}
      <Card>
        <CardHeader>
          <CardTitle>Message</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              initialListing 
                ? `Hi! I'm interested in your ${initialListing.title}...`
                : "Type your message here..."
            }
            rows={6}
            required
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !message.trim()}>
          {isLoading ? "Sending..." : "Send Message"}
        </Button>
      </div>
    </form>
  )
}