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
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, Users, Shield, Zap, Heart, MessageCircle, ShoppingBag, CheckCircle, Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { guestStorage } from "@/lib/auth/guest-storage"

export function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showGuestData, setShowGuestData] = useState(false)
  
  // Field-specific errors
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [displayNameError, setDisplayNameError] = useState("")
  
  const { signUp, hasGuestData, guestAnalytics } = useAuth()
  const router = useRouter()

  // Check for guest data on component mount
  useEffect(() => {
    if (hasGuestData()) {
      setShowGuestData(true)
    }
  }, [hasGuestData])

  // Validation functions
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

  const validateDisplayName = (name: string) => {
    if (!name) {
      setDisplayNameError("Display name is required")
      return false
    }
    if (name.length < 2) {
      setDisplayNameError("Display name must be at least 2 characters")
      return false
    }
    if (name.length > 50) {
      setDisplayNameError("Display name must be less than 50 characters")
      return false
    }
    setDisplayNameError("")
    return true
  }

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Password is required")
      return false
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return false
    }
    if (password.length > 128) {
      setPasswordError("Password must be less than 128 characters")
      return false
    }
    setPasswordError("")
    return true
  }

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password")
      return false
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match")
      return false
    }
    setConfirmPasswordError("")
    return true
  }

  // Input handlers with real-time validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (emailError && value) {
      validateEmail(value)
    }
  }

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDisplayName(value)
    if (displayNameError && value) {
      validateDisplayName(value)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (passwordError && value) {
      validatePassword(value)
    }
    // Also revalidate confirm password if it exists
    if (confirmPassword && confirmPasswordError) {
      validateConfirmPassword(confirmPassword, value)
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    if (confirmPasswordError && value) {
      validateConfirmPassword(value, password)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const isDisplayNameValid = validateDisplayName(displayName)
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, password)
    
    if (!isDisplayNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return
    }
    
    if (!acceptTerms) {
      setError("Please accept the terms and conditions")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { data, error: authError } = await signUp(email, password, {
        display_name: displayName
      })

      if (authError) {
        const errorMessage = typeof authError === 'string' 
          ? authError 
          : (authError as any)?.message || "Failed to create account. Please try again."
        setError(errorMessage)
        return
      }

      if (data?.user) {
        // Show success message and redirect
        router.push("/auth/verify-email?email=" + encodeURIComponent(email))
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
        {/* Left side - Benefits */}
        <div className="space-y-8">
          <div>
            <Badge variant="outline" className="mb-4 bg-white text-green-600 border-green-300 hover:bg-green-50 transition-colors">
              Join the Community
            </Badge>
            <h1 className="text-4xl font-bold text-green-900 mb-4">
              Start Trading Today
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Join thousands of people who are already trading items and services in their communities. 
              It's free, secure, and takes less than 2 minutes.
            </p>
          </div>

          {/* Guest Data Preview */}
          {showGuestData && (
            <Card className="border-green-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">
                      We'll save your browsing data!
                    </h3>
                    <div className="space-y-1 text-sm text-green-700">
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
                    <p className="text-xs text-green-600 mt-2 font-medium">
                      All your activity will be synced to your new account automatically.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-white hover:bg-green-50 transition-colors border border-green-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 shadow-sm">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Save Favorites</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Keep track of items you're interested in and get notified of price changes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-white hover:bg-blue-50 transition-colors border border-blue-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 shadow-sm">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Chat with Sellers</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Message sellers directly to negotiate trades and arrange meetups.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-white hover:bg-green-50 transition-colors border border-green-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 shadow-sm">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Post Your Items</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  List your items for trade and connect with interested buyers.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center p-3 rounded-lg bg-white border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">10K+</div>
              <div className="text-xs text-muted-foreground font-medium">Active Users</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white border border-green-200">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-xs text-muted-foreground font-medium">Safe Trades</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">50K+</div>
              <div className="text-xs text-muted-foreground font-medium">Items Traded</div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div>
          <Card className="shadow-lg border border-green-200 bg-white">
            <CardHeader className="text-center pb-6 space-y-2">
              <CardTitle className="text-2xl font-bold text-green-900">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Join the community and start trading today
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
                  <Label htmlFor="displayName" className="text-sm font-medium text-gray-700">
                    Display Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="How others will see you"
                      value={displayName}
                      onChange={handleDisplayNameChange}
                      required
                      className={`h-12 pl-10 border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                        displayNameError 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                      }`}
                      aria-describedby={displayNameError ? "displayName-error" : undefined}
                    />
                  </div>
                  {displayNameError && (
                    <p id="displayName-error" className="text-sm text-red-600 mt-1 animate-in slide-in-from-top-1 duration-200">
                      {displayNameError}
                    </p>
                  )}
                </div>

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
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      required
                      className={`h-12 pl-10 pr-10 border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                        confirmPasswordError 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                      }`}
                      aria-describedby={confirmPasswordError ? "confirmPassword-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p id="confirmPassword-error" className="text-sm text-red-600 mt-1 animate-in slide-in-from-top-1 duration-200">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg bg-white border border-gray-200">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed text-gray-700">
                    I agree to the{" "}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link 
                  href="/auth/login" 
                  className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}