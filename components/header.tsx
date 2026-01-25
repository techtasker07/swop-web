"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, Heart, MessageCircle, User as UserIcon, Search, ShoppingBag } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Get unread message count
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false)
          .neq('sender_id', user.id)
        
        setUnreadCount(count || 0)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setUnreadCount(0)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-700 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-white/10 p-1">
            <Image
              src="/swopify.png"
              alt="Swopify Logo"
              fill
              className="object-contain rounded-md"
              priority
            />
          </div>
          <span className="text-xl font-bold text-white">
            Swopify
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search for items, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 bg-white/90 backdrop-blur-sm border-white/20 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-white/50"
            />
          </div>
        </form>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/browse" className="text-sm font-medium text-white/90 transition-colors hover:text-white">
            Browse
          </Link>
          <Link href="/categories" className="text-sm font-medium text-white/90 transition-colors hover:text-white">
            Categories
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium text-white/90 transition-colors hover:text-white">
            How It Works
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="relative text-white hover:bg-white/20">
                <Link href="/favorites">
                  <Heart className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="relative text-white hover:bg-white/20">
                <Link href="/messages">
                  <MessageCircle className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/20">
                <Link href="/dashboard">
                  <UserIcon className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-white text-blue-600 hover:bg-white/90 shadow-md">
                <Link href="/dashboard/listings/new">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Post Listing
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-white hover:bg-white/20">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-white text-blue-600 hover:bg-white/90 shadow-md">
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden text-white hover:bg-white/20 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-blue-500/30 bg-blue-600 px-4 py-4 md:hidden">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for items, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 bg-white/90 backdrop-blur-sm border-white/20 text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </form>

          <nav className="flex flex-col gap-4">
            <Link href="/browse" className="text-sm font-medium text-white/90 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Browse Listings
            </Link>
            <Link href="/categories" className="text-sm font-medium text-white/90 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Categories
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-white/90 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
              How It Works
            </Link>
            
            {user && (
              <>
                <Link href="/favorites" className="text-sm font-medium text-white/90 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Favorites
                </Link>
                <Link href="/messages" className="text-sm font-medium text-white/90 hover:text-white transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  Messages
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Link>
              </>
            )}
            
            <div className="flex flex-col gap-2 pt-2">
              {user ? (
                <>
                  <Button variant="ghost" asChild className="justify-start text-white hover:bg-white/20">
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  </Button>
                  <Button asChild className="bg-white text-blue-600 hover:bg-white/90">
                    <Link href="/dashboard/listings/new" onClick={() => setMobileMenuOpen(false)}>Post a Listing</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="justify-start text-white hover:bg-white/20">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button asChild className="bg-white text-blue-600 hover:bg-white/90">
                    <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
