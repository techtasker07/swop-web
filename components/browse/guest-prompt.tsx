"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Heart, MessageCircle, ShieldCheck, ShoppingBag, Sparkles, Users, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const benefits = [
  { icon: Heart, label: "Save favourites" },
  { icon: MessageCircle, label: "Chat with sellers" },
  { icon: ShoppingBag, label: "Post your items" },
]

export function GuestPrompt() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(Boolean(user))
      setIsLoading(false)
      if (!user && !localStorage.getItem("guest-prompt-dismissed")) setIsVisible(true)
    }
    void checkAuthStatus()
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem("guest-prompt-dismissed", "true")
  }

  if (isLoading || !isVisible || isLoggedIn || isDismissed) return null

  return (
    <Card className="relative mb-8 overflow-hidden border border-[#073232]/15 bg-white shadow-sm">
      <div className="h-1 bg-[#32cd32]" />
      <Button variant="ghost" size="icon" className="absolute right-3 top-4 h-8 w-8 rounded-full text-[#073232]/55 hover:bg-[#073232]/5 hover:text-[#073232]" onClick={handleDismiss} aria-label="Dismiss welcome message">
        <X className="h-4 w-4" />
      </Button>
      <CardContent className="p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#073232] text-[#32cd32] shadow-lg shadow-[#073232]/15">
            <Sparkles className="h-8 w-8" />
          </div>

          <div className="min-w-0">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0a4a4a]">Swopify marketplace</p>
            <h3 className="text-2xl font-bold tracking-tight text-[#073232] sm:text-3xl">Trade more easily with an account.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">You’re browsing as a guest. Create an account to save discoveries, speak with sellers, and start exchanging confidently with your community.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {benefits.map(({ icon: Icon, label }) => <span key={label} className="inline-flex items-center gap-2 rounded-full border border-[#073232]/10 bg-[#073232]/[0.03] px-3 py-1.5 text-xs font-semibold text-[#073232]"><Icon className="h-3.5 w-3.5 text-[#0a4a4a]" />{label}</span>)}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-[#073232] text-white shadow-md shadow-[#073232]/15 hover:bg-[#0a4a4a]"><Link href="/auth/sign-up">Create free account <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button variant="outline" asChild className="border-[#073232]/20 bg-white text-[#073232] hover:bg-[#073232]/5"><Link href="/auth/login">Sign in to your account</Link></Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-[#073232]/10 pt-5 sm:grid-cols-3 lg:w-56 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <Metric icon={Users} value="10K+" label="Active users" />
            <Metric icon={ShieldCheck} value="99.9%" label="Safe trades" />
            <Metric icon={ShoppingBag} value="50K+" label="Items traded" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Metric({ icon: Icon, value, label }: { icon: typeof Users; value: string; label: string }) {
  return <div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#32cd32]/15 text-[#073232]"><Icon className="h-4 w-4" /></div><div><p className="text-base font-bold leading-none text-[#073232]">{value}</p><p className="mt-1 text-[11px] font-medium text-slate-500">{label}</p></div></div>
}
