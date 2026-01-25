import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { 
  UserPlusIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  HeartIcon,
  GlobeAltIcon,
  SparklesIcon
} from "@heroicons/react/24/outline"

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
      icon: UserPlusIcon,
      color: "bg-blue-100 text-blue-600",
      tips: ["Use a clear profile photo", "Write a friendly bio", "Verify your phone number"]
    },
    {
      step: 2,
      title: "Browse & Search",
      description: "Explore thousands of items and services. Use filters to find exactly what you need or discover something new.",
      icon: MagnifyingGlassIcon,
      color: "bg-green-100 text-green-600",
      tips: ["Use specific keywords", "Set location filters", "Check item conditions"]
    },
    {
      step: 3,
      title: "Connect & Negotiate",
      description: "Message sellers, ask questions, and propose trades. Our secure messaging system keeps your conversations safe.",
      icon: ChatBubbleLeftRightIcon,
      color: "bg-blue-100 text-blue-600",
      tips: ["Be polite and clear", "Ask about condition", "Suggest fair trades"]
    },
    {
      step: 4,
      title: "Make the Trade",
      description: "Agree on terms, meet in a safe location, and complete your trade. Both parties confirm the successful exchange.",
      icon: ArrowPathIcon,
      color: "bg-green-100 text-green-600",
      tips: ["Meet in public places", "Inspect items carefully", "Confirm trade completion"]
    }
  ]

  const benefits = [
    {
      title: "Sustainable Living",
      description: "Reduce waste by giving items a second life instead of throwing them away.",
      icon: HeartIcon,
      color: "text-green-600"
    },
    {
      title: "Save Money",
      description: "Get what you need without spending cash. Trade items you no longer use.",
      icon: SparklesIcon,
      color: "text-blue-600"
    },
    {
      title: "Build Community",
      description: "Connect with neighbors and build relationships through meaningful exchanges.",
      icon: GlobeAltIcon,
      color: "text-blue-600"
    },
    {
      title: "Safe & Secure",
      description: "Verified users, secure messaging, and community guidelines keep you protected.",
      icon: ShieldCheckIcon,
      color: "text-green-600"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
            Simple & Secure
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            How Swopify Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Trading has never been easier. Follow these simple steps to start exchanging 
            items and services with your community today.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            <Link href="/auth/sign-up">
              Get Started Free
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Start Trading in 4 Easy Steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform makes it simple to find, connect, and trade with people in your community.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <Card key={step.step} className="relative overflow-hidden border-gray-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        Step {step.step}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Pro Tips:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {step.tips.map((tip, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {tip}
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

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Swopify?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users who are already enjoying the benefits of community trading.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Icon className={`h-8 w-8 ${benefit.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Your Safety is Our Priority
              </h2>
              <p className="text-lg text-muted-foreground">
                We've built multiple layers of protection to ensure safe and secure trading.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <Card className="border-gray-200">
                <CardContent className="p-6 text-center">
                  <ShieldCheckIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Verified Users</h3>
                  <p className="text-muted-foreground text-sm">
                    All users go through identity verification to ensure authentic profiles.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-6 text-center">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Secure Messaging</h3>
                  <p className="text-muted-foreground text-sm">
                    All communications are encrypted and monitored for safety.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-6 text-center">
                  <HeartIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Community Guidelines</h3>
                  <p className="text-muted-foreground text-sm">
                    Clear rules and active moderation keep our community safe and friendly.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our growing community of traders and discover the joy of sustainable exchange.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Link href="/auth/sign-up">
                Create Free Account
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white hover:bg-gray-50 border-gray-300">
              <Link href="/browse">
                Browse Listings
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}