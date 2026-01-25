"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MapPinIcon, 
  PencilIcon,
  StarIcon
} from "@heroicons/react/24/outline"
import { EditProfileDialog } from "./edit-profile-dialog"
import type { Profile } from "@/lib/types/database"
import type { User } from "@supabase/supabase-js"

interface ProfileHeaderProps {
  profile: Profile | null
  user: User
}

export function ProfileHeader({ profile, user }: ProfileHeaderProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const displayName = profile?.display_name || user?.user_metadata?.display_name || "User"
  const username = profile?.username || ""
  const bio = profile?.bio || "Passionate about sustainable living and community sharing. Love trading electronics and books!"
  const location = profile?.location?.state || profile?.location?.city || "Location not set"
  const avatarUrl = profile?.avatar_url || profile?.profile_image_url

  const interests = ["Electronics", "Books", "Sports"] // Mock data - could be from profile

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
                {username && (
                  <p className="text-muted-foreground">@{username}</p>
                )}
                
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">
                      {(profile?.average_rating || 0).toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({profile?.total_ratings || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">{bio}</p>

              {/* Interests */}
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>

              {/* Edit Button */}
              <Button 
                onClick={() => setEditDialogOpen(true)}
                className="w-full sm:w-auto"
                variant="outline"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        profile={profile}
        user={user}
      />
    </>
  )
}