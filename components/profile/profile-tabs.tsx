"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  TrophyIcon,
  StarIcon
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
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="achievements">Achievements</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
      </TabsList>

      <TabsContent value="achievements" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border ${
                    achievement.earned
                      ? 'bg-card border-border'
                      : 'bg-muted/50 border-muted'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      achievement.earned 
                        ? 'bg-yellow-100 text-yellow-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <TrophyIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-sm ${
                        achievement.earned ? 'text-muted-foreground' : 'text-muted-foreground/60'
                      }`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Earned
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

      <TabsContent value="reviews" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {ratings.length > 0 ? (
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <div key={rating.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={rating.rater.avatar_url} />
                        <AvatarFallback>
                          {rating.rater.display_name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">
                            {rating.rater.display_name}
                          </h4>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < rating.rating
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          {rating.comment}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <StarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No reviews yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stats" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Trading Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="font-medium text-foreground mb-3">Trading Activity</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Successful Trades</span>
                    <span className="font-medium">{profile?.successful_trades || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Rating</span>
                    <span className="font-medium">{(profile?.average_rating || 0).toFixed(1)}/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Reviews</span>
                    <span className="font-medium">{profile?.total_ratings || 0}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-3">Account Status</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Barter Score</span>
                    <span className="font-medium">{profile?.barter_score || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Credits</span>
                    <span className="font-medium">{profile?.time_credits || 0}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trade Coins</span>
                    <span className="font-medium">{profile?.gift_cards || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">KYC Status</span>
                    <Badge variant={profile?.kyc_verified ? "default" : "secondary"}>
                      {profile?.kyc_verified ? "Verified" : "Unverified"}
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