"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { 
  PaperAirplaneIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface ConversationViewProps {
  conversation: any
  currentUser: any
  participant: any
}

export function ConversationView({ conversation, currentUser, participant }: ConversationViewProps) {
  const [messages, setMessages] = useState(conversation.messages || [])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    scrollToBottom()
    markMessagesAsRead()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const markMessagesAsRead = async () => {
    const unreadMessages = messages.filter(msg => 
      !msg.is_read && msg.sender_id !== currentUser.id
    )

    if (unreadMessages.length > 0) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", unreadMessages.map(msg => msg.id))
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return

    setIsLoading(true)

    try {
      const { data: message, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversation.id,
          sender_id: currentUser.id,
          content: newMessage.trim(),
          message_type: "text",
        })
        .select(`
          *,
          sender:profiles!sender_id(display_name, avatar_url)
        `)
        .single()

      if (error) throw error

      setMessages(prev => [...prev, message])
      setNewMessage("")

      // Update conversation last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversation.id)

    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={participant?.avatar_url} />
            <AvatarFallback>
              {participant?.display_name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-medium text-foreground flex items-center space-x-2">
              <span>{participant?.display_name || "Unknown User"}</span>
              {participant?.verification_status === 'verified' && (
                <ShieldCheckIcon className="h-4 w-4 text-blue-500" />
              )}
            </h2>
            {conversation.listing && (
              <p className="text-sm text-muted-foreground">
                About: {conversation.listing.title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: any) => {
          const isOwn = message.sender_id === currentUser.id
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                <Card className={`${
                  isOwn 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <CardContent className="p-3">
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {!isOwn && (
                <Avatar className="h-8 w-8 order-1 mr-2">
                  <AvatarImage src={participant?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {participant?.display_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !newMessage.trim()}>
            <PaperAirplaneIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}