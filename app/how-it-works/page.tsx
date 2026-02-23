import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { 
  UserPlus,
  Search,
  MessageSquare,
  ArrowLeftRight,
  CheckCircle,
  Shield,
  ArrowRight,
  Heart,
  Globe,
  Sparkles,
  Users,
  TrendingUp,
  Clock
} from "lucide-react"

export const metadata = {
  title: "How It Works | Swopify",
  description: "Learn how to trade, barter, and exchange items on Swopify. Simple steps to start your trading journey.",
}

export default function HowItWorksPage() {
  const steps = [
    {
      step: 1,
      title: "Sign Up & Create Profile",
      description: "Join our community by creating your free account. Add your profile details and verify your identity for secure trading.",
      icon: UserPlus,
      color: "bg-[#32cd32]/10 text-[#32cd32]",
      tips: ["Use a clear profile photo", "Write a friendly bio", "Verify your phone number"]
    },
    {
      step: 2,
      title: "Browse & Search",
      description: "Explore thousands of items and services. Use filters to find exactly what you need or discover something new.",
      icon: Search,
      color: "bg-[#32cd32]/10 text-[#32cd32]",
      tips: ["Use specific keywords", "Set location filters", "Check item conditions"]
    },
    {
      step: 3,
      title: "Connect & Negotiate",
      description: "Message sellers, ask questions, and propose trades. Our secure messaging system keeps your conversations safe.",
      icon: MessageSquare,
      color: "bg-[#073232]/10 text-[#073232]",
      tips: ["Be polite and clear", "Ask about condition", "Suggest fair trades"]
    },
    {
      step: 4,
      title: "Make the Trade",
      description: "Agree on terms, meet in a safe location, and complete your trade. Both parties confirm the successful exchange.",
      icon: ArrowLeftRight,
      color: "bg-[#32cd32]/10 text-[#32cd32]",
      tips: ["Meet in public places", "Inspect items carefully", "Confirm trade completion"]
    }
  ]

  const benefits = [
    {
      title: "Sustainable Living",
      description: "Reduce waste by giving items a second life instead of throwing them away.",
      icon: Heart,
      color: "text-[#32cd32]"
    },
    {
      title: "Save Money",
      description: "Get what you need without spending cash. Trade items you no longer use.",
      icon: Sparkles,
      color: "text-[#32cd32]"
    },
    {
      title: "Build Community",
      description: "Connect with neighbors and build relationships through meaningful exchanges.",
      icon: Globe,
      color: "text-[#073232]"
    },
    {
      title: "Safe & Secure",
      description: "Verified users, secure messaging, and community guidelines keep you protected.",
      icon: Shield,
      color: "text-[#32cd32]"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section - Enhanced with responsive design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#32cd32]/5 via-white to-[#073232]/5 py-12 sm:py-16 md:py-20 lg:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-64 w-64 sm:h-80 sm:w-80 md:h-96 md:w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#32cd32]/20 to-[#073232]/20 blur-3xl animate-pulse" />
          <div className="absolute left-1/4 top-1/4 h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 rounded-full bg-gradient-to-r from-[#073232]/10 to-[#32cd32]/10 blur-2xl animate-pulse delay-1000" />
          <div className="absolute right-1/4 bottom-1/4 h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 rounded-full bg-gradient-to-r from-[#32cd32]/10 to-[#073232]/10 blur-2xl animate-pulse delay-2000" />
        </div>

        <div className="container mx-auto px-3 sm:px-4 text-center">
          {/* Trust Badge */}
          <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full border border-[#32cd32]/30 bg-[#32cd32]/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#073232] shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#32cd32] animate-pulse" />
            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Simple & Secure Trading</span>
            <span className="sm:hidden">Secure Trading</span>
          </div>
          
          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground px-4">
            How Swopify{" "}
            <span className="bg-gradient-to-r from-[#32cd32] to-[#073232] bg-clip-text text-transparent">
              Works
            </span>
          </h1>
          <p className="mx-auto mb-6 sm:mb-8 max-w-3xl text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-4">
            Trading has never been easier. Follow these simple steps to start exchanging 
            items and services with your community today.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 md:mb-16 px-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-[#073232] to-[#0a4a4a] hover:from-[#084040] hover:to-[#073232] shadow-lg rounded-full px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto">
              <Link href="/auth/sign-up">
                <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white shadow-lg rounded-full px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto">
              <Link href="/browse">
                <Globe className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Browse Marketplace
              </Link>
            </Button>
          </div>

          {/* Enhanced Stats - Responsive grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-4 max-w-5xl mx-auto px-4">
            <div className="flex flex-col items-center group">
              <div className="mb-2 sm:mb-3 md:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-[#32cd32]/10 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-[#32cd32]" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">10K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Active Traders</div>
              <div className="text-[10px] sm:text-xs text-[#32cd32] font-medium mt-0.5 sm:mt-1">+15% this month</div>
            </div>
            <div className="flex flex-col items-center group">
              <div className="mb-2 sm:mb-3 md:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-[#32cd32]/10 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-[#32cd32]" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">99.9%</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Safe Trades</div>
              <div className="text-[10px] sm:text-xs text-[#32cd32] font-medium mt-0.5 sm:mt-1">Verified secure</div>
            </div>
            <div className="flex flex-col items-center group">
              <div className="mb-2 sm:mb-3 md:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-[#073232]/10 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-[#073232]" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">50K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Items Traded</div>
              <div className="text-[10px] sm:text-xs text-[#32cd32] font-medium mt-0.5 sm:mt-1">₦300M+ value</div>
            </div>
            <div className="flex flex-col items-center group col-span-2 lg:col-span-1">
              <div className="mb-2 sm:mb-3 md:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-[#32cd32]/10 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-[#32cd32]" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">4.9★</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">User Rating</div>
              <div className="text-[10px] sm:text-xs text-[#32cd32] font-medium mt-0.5 sm:mt-1">2,500+ reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section - Enhanced responsive design */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
              Start Trading in 4 Easy Steps
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Our platform makes it simple to find, connect, and trade with people in your community.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <Card key={step.step} className="relative overflow-hidden border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="text-center pb-3 sm:pb-4">
                    <div className={`w-12 h-12 sm:w-14 sm:w-14 md:w-16 md:h-16 rounded-full ${step.color} flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md`}>
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                    </div>
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        Step {step.step}
                      </Badge>
                    </div>
                    <CardTitle className="text-base sm:text-lg md:text-xl px-2">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <p className="text-muted-foreground mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                      {step.description}
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium text-foreground">Pro Tips:</p>
                      <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                        {step.tips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-[#32cd32] mr-2 flex-shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section - Enhanced responsive design */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
              Why Choose Swopify?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Join thousands of users who are already enjoying the benefits of community trading.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="text-center group">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                    <Icon className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${benefit.color}`} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 px-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Safety Section - Enhanced responsive design */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#32cd32]/5 via-white to-[#073232]/5">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
                Your Safety is Our Priority
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground px-4">
                We've built multiple layers of protection to ensure safe and secure trading.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-3">
              <Card className="border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 sm:p-6 text-center">
                  <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-[#32cd32] mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Verified Users</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    All users go through identity verification to ensure authentic profiles.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 sm:p-6 text-center">
                  <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-[#32cd32] mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Secure Messaging</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    All communications are encrypted and monitored for safety.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 sm:col-span-3 lg:col-span-1">
                <CardContent className="p-4 sm:p-6 text-center">
                  <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-[#073232] mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Community Guidelines</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Clear rules and active moderation keep our community safe and friendly.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 sm:mt-10 md:mt-12 flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-[#32cd32]" />
                <span>Secure Transactions</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-[#32cd32]" />
                <span>Community Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-[#073232]" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-[#32cd32]" />
                <span>Global Reach</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced responsive design */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
            Ready to Start Trading?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Join our growing community of traders and discover the joy of sustainable exchange.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-[#073232] to-[#0a4a4a] hover:from-[#084040] hover:to-[#073232] shadow-lg rounded-full px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto">
              <Link href="/auth/sign-up">
                <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white hover:bg-gray-50 border-gray-300 shadow-lg rounded-full px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto">
              <Link href="/browse">
                <Globe className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Browse Listings
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}