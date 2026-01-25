"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  PlusIcon,
  MessageCircleIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline"
import { formatDistanceToNow } from "date-fns"
import { ConversationView } from "./conversation-view"

interface MessagesLayoutProps {
  conversations: any[]
  participants: any[]
  currentUser: any
}

export function MessagesLayout({ conversations, participants, currentUser }: MessagesLayoutProps) {
  const [selectedConversation, setSelectedConversation] = useState<any>(null)

  const getParticipant = (conversation: any) => {
    const otherParticipantId = conversation.participants.find((id: string) => id !== currentUser.id)
    return participants.find(p => p.id === otherParticipantId)
  }

  const getLastMessage = (conversation: any) => {
    return conversation.messages?.[conversation.messages.length - 1]
  }

  const getUnreadCount = (conversation: any) => {
    return conversation.messages?.filter((msg: any) => 
      !msg.is_read && msg.sender_id !== currentUser.id
    ).length || 0
  }

  if (selectedConversation) {
    return (
      <div className="h-screen flex flex-col">
        <div className="border-b border-border p-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedConversation(null)}
            className="mb-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
        </div>
        <ConversationView 
          conversation={selectedConversation}
          currentUser={currentUser}
          participant={getParticipant(selectedConversation)}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <Button asChild>
          <Link href="/messages/new">
            <PlusIcon className="h-4 w-4 mr-2" />
            New Message
          </Link>
        </Button>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No messages yet</h3>
            <p className="text-muted-foreground mb-6">
              Start a conversation by messaging someone about their listing
            </p>
            <Button asChild>
              <Link href="/browse">Browse Listings</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => {
            const participant = getParticipant(conversation)
            const lastMessage = getLastMessage(conversation)
            const unreadCount = getUnreadCount(conversation)

            return (
              <Card 
                key={conversation.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedConversation(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={participant?.avatar_url} />
                      <AvatarFallback>
                        {participant?.display_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-foreground truncate">
                          {participant?.display_name || "Unknown User"}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <Badge variant="default" className="text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                          {lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {conversation.listing && (
                        <p className="text-sm text-muted-foreground mb-1">
                          About: {conversation.listing.title}
                        </p>
                      )}
                      
                      {lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage.sender_id === currentUser.id ? "You: " : ""}
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}