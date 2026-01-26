"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, CheckCircle, Heart, MessageCircle, ShoppingBag, Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showGuestData, setShowGuestData] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  
  const { signIn, hasGuestData, guestAnalytics } = useAuth()
  const router = useRouter()

  // Check for guest data on component mount
  useEffect(() => {
    if (hasGuestData()) {
      setShowGuestData(true)
    }
  }, [hasGuestData])

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError("Email is required")
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    setEmailError("")
    return true
  }

  // Password validation
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Password is required")
      return false
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return false
    }
    setPasswordError("")
    return true
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (emailError && value) {
      validateEmail(value)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (passwordError && value) {
      validatePassword(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    
    if (!isEmailValid || !isPasswordValid) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { data, error: authError } = await signIn(email, password)

      if (authError) {
        const errorMessage = typeof authError === 'string' 
          ? authError 
          : (authError as any)?.message || "Failed to sign in. Please check your credentials."
        setError(errorMessage)
        return
      }

      if (data?.user) {
        // Redirect to dashboard or previous page
        const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/dashboard'
        router.push(redirectTo)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Left side - Welcome back */}
        <div className="space-y-8">
          <div>
            <Badge variant="outline" className="mb-4 bg-white text-blue-600 border-blue-300 hover:bg-blue-50 transition-colors">
              Welcome Back
            </Badge>
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Continue Trading
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Sign in to access your account, view your favorites, and continue trading 
              with the community.
            </p>
          </div>

          {/* Guest Data Preview */}
          {showGuestData && (
            <Card className="border-blue-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">
                      Your browsing data will be synced!
                    </h3>
                    <div className="space-y-1 text-sm text-blue-700">
                      {guestAnalytics.totalFavorites > 0 && (
                        <p className="flex items-center gap-2">
                          <Heart className="h-3 w-3 text-green-600" />
                          {guestAnalytics.totalFavorites} favorited items
                        </p>
                      )}
                      {guestAnalytics.totalSearches > 0 && (
                        <p className="flex items-center gap-2">
                          <MessageCircle className="h-3 w-3 text-blue-600" />
                          {guestAnalytics.totalSearches} recent searches
                        </p>
                      )}
                      {guestAnalytics.totalViewedListings > 0 && (
                        <p className="flex items-center gap-2">
                          <Eye className="h-3 w-3 text-green-600" />
                          {guestAnalytics.totalViewedListings} viewed listings
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      All your guest activity will be added to your account after sign in.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick benefits reminder */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">What you can do:</h3>
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-green-50 transition-colors border border-green-200">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <Heart className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700 font-medium">Access your saved favorites</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-blue-50 transition-colors border border-blue-200">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700 font-medium">Chat with sellers and buyers</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-green-50 transition-colors border border-green-200">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <ShoppingBag className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700 font-medium">Manage your listings</span>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-muted-foreground mb-4 font-medium">Trusted by the community:</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-white border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">10K+</div>
                <div className="text-xs text-muted-foreground font-medium">Active Users</div>
              </div>
              <div className="p-3 rounded-lg bg-white border border-green-200">
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <div className="text-xs text-muted-foreground font-medium">Safe Trades</div>
              </div>
              <div className="p-3 rounded-lg bg-white border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">4.9★</div>
                <div className="text-xs text-muted-foreground font-medium">User Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div>
          <Card className="shadow-lg border border-blue-200 bg-white">
            <CardHeader className="text-center pb-6 space-y-2">
              <CardTitle className="text-2xl font-bold text-blue-900">
                Sign In
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Welcome back to Swopify
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      className={`h-12 pl-10 border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                        emailError 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                      }`}
                      aria-describedby={emailError ? "email-error" : undefined}
                    />
                  </div>
                  {emailError && (
                    <p id="email-error" className="text-sm text-red-600 mt-1 animate-in slide-in-from-top-1 duration-200">
                      {emailError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      className={`h-12 pl-10 pr-10 border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                        passwordError 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                      }`}
                      aria-describedby={passwordError ? "password-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p id="password-error" className="text-sm text-red-600 mt-1 animate-in slide-in-from-top-1 duration-200">
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-muted-foreground font-medium">Or</span>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link 
                  href="/auth/sign-up" 
                  className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                >
                  Sign up for free
                </Link>
              </div>

              <div className="text-center">
                <Link 
                  href="/browse" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                >
                  Continue browsing as guest 
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}