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
  const bio = profile?.bio || "No bio added yet."
  const location = profile?.location?.state || profile?.location?.city || "Location not set"
  const avatarUrl = profile?.avatar_url || profile?.profile_image_url

  // Get interests from profile metadata or tags
  const interests: string[] = profile?.metadata?.interests || []

  return (
    <>
      <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="relative">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 ring-4 ring-[#32cd32]/20 shadow-lg">
                  <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                  <AvatarFallback className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-br from-[#32cd32] to-[#28a428] text-white">
                    {displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-[#32cd32] border-4 border-white shadow-md" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-3 sm:space-y-4 text-center sm:text-left">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{displayName}</h1>
                {username && (
                  <p className="text-sm sm:text-base text-muted-foreground">@{username}</p>
                )}
                
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 mt-2 sm:mt-3">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#073232]" />
                    <span className="text-xs sm:text-sm text-muted-foreground">{location}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-[#32cd32]/10 px-2 sm:px-3 py-1 rounded-full">
                    <StarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#32cd32] fill-current" />
                    <span className="text-xs sm:text-sm font-semibold text-[#32cd32]">
                      {(profile?.average_rating || 0).toFixed(1)}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      ({profile?.total_ratings || 0})
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-none">{bio}</p>

              {/* Interests */}
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start">
                  {interests.slice(0, 5).map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-[10px] sm:text-xs bg-[#073232]/10 text-[#073232] border-[#073232]/20 hover:bg-[#073232]/20 transition-colors">
                      {interest}
                    </Badge>
                  ))}
                  {interests.length > 5 && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs bg-gray-100 text-gray-600">
                      +{interests.length - 5}
                    </Badge>
                  )}
                </div>
              )}

              {/* Edit Button */}
              <Button 
                onClick={() => setEditDialogOpen(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-[#32cd32] to-[#28a428] hover:from-[#28a428] hover:to-[#32cd32] text-white shadow-md hover:shadow-lg transition-all duration-300"
                size="sm"
              >
                <PencilIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
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