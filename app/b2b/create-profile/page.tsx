"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createBusinessProfile } from "@/lib/supabase/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, ArrowLeft, CheckCircle, Clock, Star } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function CreateBusinessProfilePage() {
  const { user, updateProfile } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "",
    business_description: "",
    year_established: "",
    business_website: "",
    business_phone: ""
  })

  const businessTypes = [
    "individual",
    "small_business",
    "enterprise"
  ]

  const businessTypeLabels = {
    individual: "Individual/Freelancer",
    small_business: "Small Business (1-50 employees)",
    enterprise: "Enterprise (50+ employees)"
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error("Please sign in to create a business profile")
      return
    }

    if (!formData.business_name || !formData.business_type || !formData.business_description) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      const profileData = {
        business_name: formData.business_name,
        business_type: formData.business_type,
        business_description: formData.business_description,
        year_established: formData.year_established ? parseInt(formData.year_established) : undefined,
        business_website: formData.business_website || undefined,
        business_phone: formData.business_phone || undefined
      }

      await createBusinessProfile(profileData)
      
      // Update the auth context
      await updateProfile({
        user_type: 'business',
        ...profileData
      })

      toast.success("Business profile created successfully! You will be verified within 12 hours.")
      router.push("/b2b")
    } catch (error) {
      console.error("Error creating business profile:", error)
      toast.error("Failed to create business profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to create a business profile.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/b2b">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to B2B Marketplace
            </Link>
          </Button>
          
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <Building2 className="h-16 w-16 text-blue-600 mx-auto" />
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full p-2">
                <Star className="h-4 w-4 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Create Your Business Profile
            </h1>
            <p className="text-gray-600 max-w-lg mx-auto">
              Join the professional B2B marketplace and connect with other businesses. 
              Your profile will be verified within 12 hours.
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Business Details</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm">
                2
              </div>
              <span className="ml-2 text-sm text-gray-500">Verification</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm">
                3
              </div>
              <span className="ml-2 text-sm text-gray-500">B2B Access</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Tell us about your business to create your professional profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name */}
              <div>
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleInputChange}
                  placeholder="Enter your business name"
                  required
                />
              </div>

              {/* Business Type */}
              <div>
                <Label htmlFor="business_type">Business Type *</Label>
                <select
                  id="business_type"
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select business type</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>
                      {businessTypeLabels[type as keyof typeof businessTypeLabels]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Established */}
              <div>
                <Label htmlFor="year_established">Year Established</Label>
                <Input
                  id="year_established"
                  name="year_established"
                  type="number"
                  value={formData.year_established}
                  onChange={handleInputChange}
                  placeholder="e.g., 2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              {/* Business Description */}
              <div>
                <Label htmlFor="business_description">Business Description *</Label>
                <Textarea
                  id="business_description"
                  name="business_description"
                  value={formData.business_description}
                  onChange={handleInputChange}
                  placeholder="Describe what your business does, services offered, etc."
                  rows={4}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum 20 characters required
                </p>
              </div>

              {/* Business Website */}
              <div>
                <Label htmlFor="business_website">Business Website</Label>
                <Input
                  id="business_website"
                  name="business_website"
                  type="url"
                  value={formData.business_website}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              {/* Business Phone */}
              <div>
                <Label htmlFor="business_phone">Business Phone</Label>
                <Input
                  id="business_phone"
                  name="business_phone"
                  type="tel"
                  value={formData.business_phone}
                  onChange={handleInputChange}
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>

              {/* Verification Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Verification Process</h4>
                    <p className="text-sm text-blue-700">
                      Your business profile will be automatically verified within 12 hours. 
                      Once verified, you'll have full access to the B2B marketplace and can start 
                      listing your professional services.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Business Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Verified Status</h3>
            <p className="text-sm text-gray-600">Get verified business badge</p>
          </div>
          <div className="text-center p-4">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">B2B Access</h3>
            <p className="text-sm text-gray-600">Access professional marketplace</p>
          </div>
          <div className="text-center p-4">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Premium Features</h3>
            <p className="text-sm text-gray-600">Enhanced listing visibility</p>
          </div>
        </div>
      </div>
    </div>
  )
}