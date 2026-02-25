"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Download, UserPlus, Users, Zap, Shield, TrendingUp } from "lucide-react"
import { formatNaira } from "@/lib/utils/currency"

export function PricingPlans() {
  const [selectedPlan, setSelectedPlan] = useState<"freemium" | "premium" | null>(null)

  const plans = [
    {
      id: "freemium",
      name: "Freemium",
      price: 0,
      period: "Forever Free",
      description: "Perfect for casual traders getting started",
      badge: "Most Popular",
      badgeColor: "bg-[#32cd32]",
      features: [
        { text: "2 trades per month", icon: TrendingUp },
        { text: "5 Trade Coins for downloading app", icon: Download },
        { text: "5 Trade Coins for signing up", icon: UserPlus },
        { text: "5 Trade Coins per referral", icon: Users },
        { text: "Basic listing features", icon: Check },
        { text: "Community support", icon: Shield },
        { text: "Safe zone access", icon: Shield },
      ],
      cta: "Start Free",
      highlight: false,
    },
    {
      id: "premium",
      name: "Premium",
      price: 5000,
      period: "per year",
      description: "For serious traders who want unlimited access",
      badge: "Best Value",
      badgeColor: "bg-[#073232]",
      features: [
        { text: "Unlimited trades per month", icon: Zap },
        { text: "50 Trade Coins for downloading app", icon: Download },
        { text: "50 Trade Coins for signing up", icon: UserPlus },
        { text: "50 Trade Coins per referral", icon: Users },
        { text: "Priority listing placement", icon: Sparkles },
        { text: "Advanced analytics", icon: TrendingUp },
        { text: "Priority customer support", icon: Shield },
        { text: "Exclusive premium badge", icon: Sparkles },
        { text: "Early access to new features", icon: Zap },
      ],
      cta: "Go Premium",
      highlight: true,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <Badge variant="outline" className="mb-4 bg-white text-[#073232] border-[#073232]">
          Choose Your Plan
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
          Start Trading Today
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Select the plan that fits your trading needs. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative transition-all duration-300 ${
              plan.highlight
                ? "border-2 border-[#073232] shadow-2xl scale-105"
                : "border border-gray-200 shadow-lg hover:shadow-xl"
            } ${
              selectedPlan === plan.id ? "ring-4 ring-[#073232]/20" : ""
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className={`${plan.badgeColor} text-white px-4 py-1 shadow-lg`}>
                  {plan.badge}
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pt-8 pb-6">
              <CardTitle className="text-2xl font-bold text-black mb-2">
                {plan.name}
              </CardTitle>
              <CardDescription className="text-gray-700 mb-4">
                {plan.description}
              </CardDescription>
              <div className="mt-4">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-black">
                    {plan.price === 0 ? "Free" : formatNaira(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-700 text-sm">/{plan.period}</span>
                  )}
                </div>
                {plan.price === 0 && (
                  <p className="text-sm text-gray-700 mt-1">{plan.period}</p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features List */}
              <ul className="space-y-3">
                {plan.features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <li key={index} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        plan.highlight ? "bg-[#073232]" : "bg-[#32cd32]"
                      }`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-black text-sm">{feature.text}</span>
                    </li>
                  )
                })}
              </ul>

              {/* CTA Button */}
              <Button
                onClick={() => setSelectedPlan(plan.id as "freemium" | "premium")}
                className={`w-full h-12 font-semibold transition-all duration-200 ${
                  plan.highlight
                    ? "bg-[#073232] hover:bg-[#0a4a4a] text-white shadow-lg"
                    : "bg-white hover:bg-gray-50 text-[#073232] border-2 border-[#073232]"
                }`}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="text-center space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-[#073232] hover:bg-[#0a4a4a] text-white px-8 h-12 shadow-lg"
          >
            <Link href="/auth/sign-up">
              Sign Up Now
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-2 border-[#073232] text-[#073232] hover:bg-[#073232] hover:text-white px-8 h-12"
          >
            <Link href="/auth/login">
              Already have an account? Login
            </Link>
          </Button>
        </div>
        <p className="text-sm text-gray-700">
          No credit card required for Freemium plan
        </p>
      </div>

      {/* FAQ Section */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-black text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-black">What are Trade Coins?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Trade Coins are our platform currency that you can earn through various activities 
                and use for premium features, boosting listings, or trade with other users.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-black">Can I upgrade from Freemium to Premium?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Yes! You can upgrade to Premium at any time from your account settings. 
                Your existing Trade Coins and data will be preserved.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-black">What happens after 2 trades on Freemium?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                After completing 2 trades in a month, you'll need to wait until the next month 
                or upgrade to Premium for unlimited trades. You can still browse and favorite items.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-black">How do referrals work?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Share your unique referral link with friends. When they sign up and complete their 
                first trade, you'll receive Trade Coins (5 for Freemium, 50 for Premium).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
