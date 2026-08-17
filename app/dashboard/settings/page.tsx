"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, ShieldCheck, ShieldAlert, CheckCircle2, Circle, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types/database"

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      const { data: profileData } = await supabase
        .from("profiles")
        .select("bvn_verified, nin_verified, business_verified, verification_status, user_type")
        .eq("id", user.id)
        .maybeSingle()

      setProfile(profileData as Profile | null)
      setLoading(false)
    }

    loadUser()
  }, [supabase, router])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." })
      return
    }

    setSaving(true)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setMessage({ type: "error", text: error.message })
    } else {
      setMessage({ type: "success", text: "Password updated successfully!" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }

    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  // Derived verification state
  const bvnVerified = profile?.bvn_verified === true
  const ninVerified = profile?.nin_verified === true
  const businessVerified = profile?.business_verified === true
  const isBusinessUser = profile?.user_type === "business"
  const anyVerified = bvnVerified || ninVerified || businessVerified

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#32cd32]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#073232]">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6">

        {/* ── Identity Verification Card ── */}
        <Card className={`border-2 ${anyVerified ? "border-[#32cd32]/40 bg-[#32cd32]/5" : "border-orange-300 bg-orange-50"}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[#073232]">
              {anyVerified
                ? <ShieldCheck className="h-5 w-5 text-[#32cd32]" />
                : <ShieldAlert className="h-5 w-5 text-orange-500" />
              }
              Identity Verification
            </CardTitle>
            <CardDescription className={anyVerified ? "text-[#073232]/70" : "text-orange-700"}>
              {anyVerified
                ? "Your account is verified. You can create listings and make swaps."
                : "Verification is required before you can create listings or make any swaps."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              <VerifBadge label="BVN" verified={bvnVerified} />
              <VerifBadge label="NIN" verified={ninVerified} />
              <VerifBadge label="CAC" verified={businessVerified} />
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {isBusinessUser
                  ? "Business accounts verify via CAC."
                  : "Personal accounts verify via BVN or NIN. BVN verification also verifies NIN automatically."
                }
              </p>
              <Button
                asChild
                size="sm"
                className={anyVerified
                  ? "shrink-0 bg-[#073232] text-white hover:bg-[#073232]/90"
                  : "shrink-0 bg-orange-500 text-white hover:bg-orange-600"
                }
              >
                <Link href={isBusinessUser ? "/verification?type=business" : "/verification?type=personal"}>
                  {anyVerified ? "Manage" : "Verify now"}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and email address.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={user?.email || ""} disabled />
              <p className="text-xs text-muted-foreground">
                Contact support to change your email address.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {message && (
                <div className={`rounded-lg p-3 text-sm ${
                  message.type === "success"
                    ? "bg-[#32cd32]/10 text-[#073232]"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {message.text}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <Button type="submit" disabled={saving} className="bg-[#073232] text-white hover:bg-[#073232]/90">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible and destructive actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Sign out of all devices</p>
                <p className="text-sm text-muted-foreground">This will sign you out of your current session.</p>
              </div>
              <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

// Small helper — not exported, file-scoped
function VerifBadge({ label, verified }: { label: string; verified: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
      verified
        ? "border-[#32cd32]/50 bg-[#32cd32]/10 text-[#073232]"
        : "border-gray-200 bg-white text-gray-400"
    }`}>
      {verified
        ? <CheckCircle2 className="h-3 w-3 text-[#32cd32]" />
        : <Circle className="h-3 w-3 text-gray-300" />
      }
      {label}
    </span>
  )
}
