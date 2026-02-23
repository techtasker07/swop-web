"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  TrophyIcon,
  StarIcon,
  SparklesIcon
} from "@heroicons/react/24/outline"
import { formatDistanceToNow } from "date-fns"
import type { Profile } from "@/lib/types/database"

interface Achievement {
  id: number
  name: string
  description: string
  earned: boolean
}

interface Rating {
  id: string
  rating: number
  comment: string
  created_at: string
  rater: {
    display_name: string
    avatar_url?: string
  }
}

interface ProfileTabsProps {
  achievements: Achievement[]
  ratings: Rating[]
  profile: Profile | null
}

export function ProfileTabs({ achievements, ratings, profile }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="achievements" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
        <TabsTrigger value="achievements" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
          <TrophyIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Achievements</span>
          <span className="sm:hidden">Awards</span>
        </TabsTrigger>
        <TabsTrigger value="reviews" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
          <StarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Reviews
        </TabsTrigger>
        <TabsTrigger value="stats" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
          <SparklesIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Stats
        </TabsTrigger>
      </TabsList>

      <TabsContent value="achievements" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
        <Card className="border-gray-200 shadow-md">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
              <TrophyIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#32cd32]" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 sm:p-4 rounded-lg border transition-all duration-300 ${
                    achievement.earned
                      ? 'bg-gradient-to-br from-[#32cd32]/10 to-[#32cd32]/5 border-[#32cd32]/30 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                      : 'bg-muted/30 border-muted'
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg shadow-sm ${
                      achievement.earned 
                        ? 'bg-[#32cd32]/20 text-[#32cd32]' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <TrophyIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm sm:text-base font-semibold mb-0.5 sm:mb-1 ${
                        achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-xs sm:text-sm leading-relaxed ${
                        achievement.earned ? 'text-muted-foreground' : 'text-muted-foreground/60'
                      }`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && (
                        <Badge variant="secondary" className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs bg-[#32cd32] text-white hover:bg-[#28a428]">
                          ✓ Earned
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reviews" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
        <Card className="border-gray-200 shadow-md">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
              <StarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#32cd32]" />
              Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ratings.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {ratings.map((rating) => (
                  <div key={rating.id} className="p-3 sm:p-4 rounded-lg border bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-[#32cd32]/20">
                        <AvatarImage src={rating.rater.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-[#32cd32] to-[#28a428] text-white text-xs sm:text-sm">
                          {rating.rater.display_name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-2">
                          <h4 className="text-sm sm:text-base font-semibold text-foreground truncate">
                            {rating.rater.display_name}
                          </h4>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                  i < rating.rating
                                    ? 'text-[#32cd32] fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 leading-relaxed">
                          {rating.comment}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground/80">
                          {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="bg-gray-100 rounded-full p-4 sm:p-6 w-fit mx-auto mb-3 sm:mb-4">
                  <StarIcon className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">No reviews yet</p>
                <p className="text-xs sm:text-sm text-muted-foreground/60 mt-1">Complete trades to receive reviews</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stats" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
        <Card className="border-gray-200 shadow-md">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#32cd32]" />
              Trading Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <div className="bg-gradient-to-br from-[#32cd32]/5 to-transparent p-3 sm:p-4 rounded-lg border border-[#32cd32]/20">
                <h4 className="text-sm sm:text-base font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#32cd32]" />
                  Trading Activity
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Successful Trades</span>
                    <span className="text-sm sm:text-base font-bold text-[#32cd32]">{profile?.successful_trades || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Average Rating</span>
                    <span className="text-sm sm:text-base font-bold text-[#32cd32]">{(profile?.average_rating || 0).toFixed(1)}/5.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Total Reviews</span>
                    <span className="text-sm sm:text-base font-bold text-foreground">{profile?.total_ratings || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-[#073232]/5 to-transparent p-3 sm:p-4 rounded-lg border border-[#073232]/20">
                <h4 className="text-sm sm:text-base font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#073232]" />
                  Account Status
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Barter Score</span>
                    <span className="text-sm sm:text-base font-bold text-[#073232]">{profile?.barter_score || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Time Credits</span>
                    <span className="text-sm sm:text-base font-bold text-[#073232]">{profile?.time_credits || 0}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Trade Coins</span>
                    <span className="text-sm sm:text-base font-bold text-foreground">{profile?.gift_cards || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">KYC Status</span>
                    <Badge variant={profile?.kyc_verified ? "default" : "secondary"} className={`text-[10px] sm:text-xs ${profile?.kyc_verified ? 'bg-[#32cd32] hover:bg-[#28a428]' : ''}`}>
                      {profile?.kyc_verified ? "✓ Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}