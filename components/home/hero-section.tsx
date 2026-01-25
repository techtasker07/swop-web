"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Search, Users, Shield, Zap, TrendingUp, Globe, Clock } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl text-center">
          {/* Trust Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50/80 backdrop-blur-sm px-4 py-2 text-sm text-green-700 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <Shield className="h-4 w-4" />
            Trusted by 10,000+ traders worldwide
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Trade Smarter,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Live Better
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground md:text-xl leading-relaxed">
            Join the modern marketplace where your unused items become valuable trades. 
            Connect with your community, swap what you have for what you need, and discover the joy of sustainable living.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mx-auto mb-12 max-w-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for electronics, furniture, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-24 h-14 text-base bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full px-6"
              >
                Search
              </Button>
            </div>
          </form>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center mb-16">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg rounded-full px-8 py-4 text-lg">
              <Link href="/browse">
                <Globe className="mr-2 h-5 w-5" />
                Explore Marketplace
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white shadow-lg rounded-full px-8 py-4 text-lg">
              <Link href="/how-it-works">
                <Clock className="mr-2 h-5 w-5" />
                How It Works
              </Link>
            </Button>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:grid-cols-4">
            <div className="flex flex-col items-center group">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-foreground">10K+</div>
              <div className="text-sm text-muted-foreground font-medium">Active Traders</div>
              <div className="text-xs text-green-600 font-medium mt-1">+15% this month</div>
            </div>
            <div className="flex flex-col items-center group">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-foreground">99.9%</div>
              <div className="text-sm text-muted-foreground font-medium">Safe Trades</div>
              <div className="text-xs text-green-600 font-medium mt-1">Verified secure</div>
            </div>
            <div className="flex flex-col items-center group">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-foreground">50K+</div>
              <div className="text-sm text-muted-foreground font-medium">Items Traded</div>
              <div className="text-xs text-green-600 font-medium mt-1">₦300M+ value</div>
            </div>
            <div className="flex flex-col items-center group sm:col-span-3 lg:col-span-1">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-foreground">4.9★</div>
              <div className="text-sm text-muted-foreground font-medium">User Rating</div>
              <div className="text-xs text-green-600 font-medium mt-1">2,500+ reviews</div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Secure Transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>Community Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-500" />
              <span>Global Reach</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl animate-pulse" />
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-2xl animate-pulse delay-1000" />
        <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-blue-400/10 to-cyan-400/10 blur-2xl animate-pulse delay-2000" />
        <div className="absolute right-1/3 top-1/3 h-32 w-32 rounded-full bg-gradient-to-r from-green-400/10 to-blue-400/10 blur-xl animate-pulse delay-3000" />
      </div>
    </section>
  )
}
