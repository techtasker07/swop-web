"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Plus, Users, TrendingUp, Heart } from "lucide-react"
import { timeBankingService, type TimeBankingRequest } from "@/lib/services/time-banking-service"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function TimeBankingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState({ total_balance: 0, earned_hours: 0, spent_hours: 0 })
  const [availableRequests, setAvailableRequests] = useState<TimeBankingRequest[]>([])
  const [myRequests, setMyRequests] = useState<TimeBankingRequest[]>([])
  const [acceptedRequests, setAcceptedRequests] = useState<TimeBankingRequest[]>([])
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login?redirect=/time-banking')
      return
    }

    setUser(user)
    await loadData(user.id)
  }

  const loadData = async (userId: string) => {
    try {
      setLoading(true)
      
      const [balanceData, available, myReqs, accepted] = await Promise.all([
        timeBankingService.getUserBalance(userId),
        timeBankingService.getAvailableRequests(userId),
        timeBankingService.getRequests({ userId, isRequester: true }),
        timeBankingService.getRequests({ userId, isProvider: true, status: 'accepted' })
      ])

      setBalance(balanceData)
      setAvailableRequests(available)
      setMyRequests(myReqs.filter(r => r.status !== 'completed'))
      setAcceptedRequests(accepted)
    } catch (error) {
      console.error('Error loading time banking data:', error)
    } finally {
      setLoading(false)
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#073232]/5 via-[#32cd32]/5 to-[#073232]/5 py-6 sm:py-8 md:py-12">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            <div className="text-center mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                Time Banking
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
                Exchange time and skills with your community. One hour of help equals one hour of credit.
              </p>
            </div>

            {/* Balance Card - More compact on mobile */}
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-[#073232] to-[#0a4a4a] text-white shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center mb-4 sm:mb-6">
                  <div className="flex items-baseline justify-center gap-2 mb-1 sm:mb-2">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold">{balance.total_balance}</span>
                    <span className="text-base sm:text-lg md:text-xl">hours</span>
                  </div>
                  <p className="text-white/80 text-sm sm:text-base">Available Time Credits</p>
                  <p className="text-xs sm:text-sm text-white/60 mt-1">1 hour = 1 hour of community help</p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white/10 rounded-lg p-3 sm:p-4 text-center">
                    <p className="text-white/80 text-xs sm:text-sm mb-1">Earned</p>
                    <p className="text-xl sm:text-2xl font-bold">{balance.earned_hours}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 sm:p-4 text-center">
                    <p className="text-white/80 text-xs sm:text-sm mb-1">Spent</p>
                    <p className="text-xl sm:text-2xl font-bold">{balance.spent_hours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
          {/* Create Request Button - Full width on mobile */}
          <div className="mb-4 sm:mb-6 flex justify-end">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-[#32cd32] to-[#28a428] hover:from-[#28a428] hover:to-[#32cd32] text-white w-full sm:w-auto shadow-md"
              onClick={() => router.push('/time-banking/create')}
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Request Help
            </Button>
          </div>

          {/* Tabs - Responsive */}
          <Tabs defaultValue="available" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
              <TabsTrigger value="available" className="text-xs sm:text-sm data-[state=active]:bg-[#073232] data-[state=active]:text-white">
                <span className="hidden sm:inline">Available</span>
                <span className="sm:hidden">Open</span>
                <span className="ml-1">({availableRequests.length})</span>
              </TabsTrigger>
              <TabsTrigger value="my-requests" className="text-xs sm:text-sm data-[state=active]:bg-[#073232] data-[state=active]:text-white">
                <span className="hidden sm:inline">My Requests</span>
                <span className="sm:hidden">Mine</span>
                <span className="ml-1">({myRequests.length})</span>
              </TabsTrigger>
              <TabsTrigger value="accepted" className="text-xs sm:text-sm data-[state=active]:bg-[#073232] data-[state=active]:text-white">
                <span className="hidden sm:inline">Accepted</span>
                <span className="sm:hidden">Active</span>
                <span className="ml-1">({acceptedRequests.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* Available Requests - More compact on mobile */}
            <TabsContent value="available" className="space-y-3 sm:space-y-4">
              {availableRequests.length === 0 ? (
                <Card className="bg-white">
                  <CardContent className="p-8 sm:p-12 text-center">
                    <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">No Available Requests</h3>
                    <p className="text-sm sm:text-base text-gray-600">Check back later for opportunities to help your community</p>
                  </CardContent>
                </Card>
              ) : (
                availableRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow bg-white">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 line-clamp-2">{request.title}</h3>
                          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{request.description}</p>
                          <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="truncate max-w-[150px]">{request.requester?.display_name || request.requester_name}</span>
                            </span>
                            {request.location && (
                              <span className="truncate">📍 {request.location}</span>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-[#32cd32]/10 text-[#32cd32] border-[#32cd32]/30 flex-shrink-0 text-xs sm:text-sm">
                          {request.hours_requested}h
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
                        <Badge variant="outline" className="text-xs w-fit">{request.category}</Badge>
                        <Button 
                          className="bg-gradient-to-r from-[#073232] to-[#0a4a4a] hover:from-[#084040] hover:to-[#073232] w-full sm:w-auto text-sm"
                          onClick={() => router.push(`/time-banking/request/${request.id}`)}
                        >
                          Offer Help
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* My Requests - More compact on mobile */}
            <TabsContent value="my-requests" className="space-y-3 sm:space-y-4">
              {myRequests.length === 0 ? (
                <Card className="bg-white">
                  <CardContent className="p-8 sm:p-12 text-center">
                    <Clock className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">No Requests Yet</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">Create your first request to get help from the community</p>
                    <Button 
                      className="bg-gradient-to-r from-[#32cd32] to-[#28a428] hover:from-[#28a428] hover:to-[#32cd32] w-full sm:w-auto"
                      onClick={() => router.push('/time-banking/create')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Request
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myRequests.map((request) => (
                  <Card key={request.id} className="bg-white">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 line-clamp-2">{request.title}</h3>
                          {request.provider_name && (
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">
                              Provider: {request.provider_name}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                          <Badge className="bg-[#32cd32]/10 text-[#32cd32] text-xs">
                            {request.hours_requested}h
                          </Badge>
                          <Badge variant={request.status === 'accepted' ? 'default' : 'secondary'} className="text-xs">
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        className="w-full sm:w-auto text-sm"
                        onClick={() => router.push(`/time-banking/request/${request.id}`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Accepted Requests - More compact on mobile */}
            <TabsContent value="accepted" className="space-y-3 sm:space-y-4">
              {acceptedRequests.length === 0 ? (
                <Card className="bg-white">
                  <CardContent className="p-8 sm:p-12 text-center">
                    <Heart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">No Accepted Requests</h3>
                    <p className="text-sm sm:text-base text-gray-600">Browse available requests to start helping others</p>
                  </CardContent>
                </Card>
              ) : (
                acceptedRequests.map((request) => (
                  <Card key={request.id} className="border-[#32cd32]/30 bg-white">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 line-clamp-2">{request.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">
                            Requester: {request.requester?.display_name || request.requester_name}
                          </p>
                        </div>
                        <Badge className="bg-[#32cd32]/10 text-[#32cd32] flex-shrink-0 text-xs sm:text-sm">
                          {request.hours_requested}h
                        </Badge>
                      </div>
                      <Button 
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 w-full sm:w-auto text-sm"
                        onClick={() => router.push(`/time-banking/request/${request.id}`)}
                      >
                        Complete Request
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
