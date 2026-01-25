"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, MessageCircle, Heart, ArrowRight, Users, Shield, Zap, ShoppingBag, Sparkles, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function GuestPrompt() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      setIsLoading(false)
      
      // Show prompt only for guests and if not dismissed
      const dismissed = localStorage.getItem('guest-prompt-dismissed')
      if (!user && !dismissed) {
        setIsVisible(true)
      }
    }

    checkAuthStatus()
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('guest-prompt-dismissed', 'true')
  }

  // Don't render anything while loading
  if (isLoading) return null

  if (!isVisible || isLoggedIn || isDismissed) {
    return null
  }

  return (
    <Card className="mb-8 border-2 border-dashed border-blue-200/60 bg-gradient-to-br from-blue-50/80 via-white to-purple-50/80 relative overflow-hidden backdrop-blur-sm">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-xl animate-pulse delay-1000" />
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="absolute right-3 top-3 h-8 w-8 p-0 hover:bg-white/80 z-10 rounded-full transition-all duration-200 hover:scale-110"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <CardContent className="p-8 relative">
        <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:items-start">
          {/* Left side - Icon and visual */}
          <div className="mb-6 lg:mb-0 lg:mr-8 flex-shrink-0">
            <div className="relative">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 lg:mx-0 shadow-xl">
                <Sparkles className="h-10 w-10 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Star className="h-3 w-3 text-white fill-current" />
              </div>
            </div>
          </div>
          
          {/* Center content */}
          <div className="flex-1 space-y-6">
            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <Badge variant="secondary" className="bg-blue-100/80 text-blue-700 border-blue-200/60 backdrop-blur-sm hover:bg-blue-200/80 transition-colors">
                <Heart className="mr-2 h-3.5 w-3.5" />
                Save Favorites
              </Badge>
              <Badge variant="secondary" className="bg-green-100/80 text-green-700 border-green-200/60 backdrop-blur-sm hover:bg-green-200/80 transition-colors">
                <MessageCircle className="mr-2 h-3.5 w-3.5" />
                Chat with Sellers
              </Badge>
              <Badge variant="secondary" className="bg-purple-100/80 text-purple-700 border-purple-200/60 backdrop-blur-sm hover:bg-purple-200/80 transition-colors">
                <ShoppingBag className="mr-2 h-3.5 w-3.5" />
                Post Your Items
              </Badge>
            </div>
            
            {/* Main heading */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-foreground leading-tight">
                🎉 Welcome to Swopify!
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Join our trading community
                </span>
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                You're browsing as a guest. Create an account to unlock all features, save favorites, 
                and start trading with our community of 10,000+ active users.
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button 
                asChild 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <Link href="/auth/sign-up">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Join Free Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                asChild 
                className="border-gray-300 hover:bg-gray-50 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200"
              >
                <Link href="/auth/login">
                  Already have an account?
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Right side - Stats */}
          <div className="mt-8 lg:mt-0 lg:ml-8 flex-shrink-0">
            <div className="grid grid-cols-3 gap-6 lg:grid-cols-1 lg:gap-4">
              <div className="flex flex-col items-center group">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100/80 backdrop-blur-sm group-hover:bg-blue-200/80 transition-colors duration-200">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-foreground">10K+</div>
                <div className="text-xs text-muted-foreground font-medium">Active Users</div>
              </div>
              <div className="flex flex-col items-center group">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100/80 backdrop-blur-sm group-hover:bg-green-200/80 transition-colors duration-200">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-xl font-bold text-foreground">99.9%</div>
                <div className="text-xs text-muted-foreground font-medium">Safe Trades</div>
              </div>
              <div className="flex flex-col items-center group">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100/80 backdrop-blur-sm group-hover:bg-purple-200/80 transition-colors duration-200">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-xl font-bold text-foreground">50K+</div>
                <div className="text-xs text-muted-foreground font-medium">Items Traded</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}