"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Building2, IdCard, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { verificationService } from "@/lib/services/verification-service"
import { useAuth } from "@/hooks/use-auth"

export function VerificationClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()
  const initialMode = searchParams.get("type") === "business" || profile?.user_type === "business" ? "business" : "personal"
  const [mode, setMode] = useState<"personal" | "business">(initialMode)
  const [method, setMethod] = useState<"bvn" | "nin" | "cac">(initialMode === "business" ? "cac" : "bvn")
  const [value, setValue] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [businessName, setBusinessName] = useState(profile?.business_name || "")
  const [isLoading, setIsLoading] = useState(false)

  const statusText = useMemo(() => {
    if (profile?.business_verified || (profile?.user_type === "business" && profile?.verification_status === "verified")) return "CAC verified"
    if (profile?.bvn_verified) return "BVN and NIN verified"
    if (profile?.nin_verified) return "NIN verified"
    return "Verification required"
  }, [profile])

  const submit = async () => {
    if (!user) {
      router.push("/auth/login?redirect=/verification")
      return
    }

    setIsLoading(true)
    try {
      const result = method === "bvn"
        ? await verificationService.verifyBVN(value, { firstName, lastName, phoneNumber })
        : method === "nin"
          ? await verificationService.verifyNIN(value, { firstName, lastName, phoneNumber })
          : await verificationService.verifyCAC(value, { businessName })

      if (!result.success) throw new Error(result.error)
      toast.success(result.message)
      router.push(mode === "business" ? "/b2b" : "/dashboard")
      router.refresh()
    } catch (error: any) {
      toast.error(error?.message || "Verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-[2rem] bg-[#073232] p-6 text-white shadow-xl sm:p-8">
          <Badge className="mb-4 rounded-full bg-[#32cd32] text-[#073232]">{statusText}</Badge>
          <h1 className="text-3xl font-bold">Secure your Swopify account</h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Public users must verify BVN or NIN before adding listings or making swaps. BVN verification automatically verifies NIN. Business users verify CAC for B2B access.
          </p>
        </div>

        <Card className="mt-6 rounded-[2rem] border-gray-200 shadow-lg">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => { setMode("personal"); setMethod("bvn"); setValue("") }} className={`rounded-[1.5rem] border p-5 text-left transition ${mode === "personal" ? "border-[#32cd32] bg-[#32cd32]/10" : "border-gray-200 bg-white"}`}>
                <IdCard className="mb-3 h-7 w-7 text-[#073232]" />
                <div className="font-semibold text-[#073232]">Public user</div>
                <p className="text-sm text-gray-600">Verify BVN or NIN.</p>
              </button>
              <button type="button" onClick={() => { setMode("business"); setMethod("cac"); setValue("") }} className={`rounded-[1.5rem] border p-5 text-left transition ${mode === "business" ? "border-[#32cd32] bg-[#32cd32]/10" : "border-gray-200 bg-white"}`}>
                <Building2 className="mb-3 h-7 w-7 text-[#073232]" />
                <div className="font-semibold text-[#073232]">Business entity</div>
                <p className="text-sm text-gray-600">Verify CAC for B2B.</p>
              </button>
            </div>

            {mode === "personal" ? (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button type="button" onClick={() => setMethod("bvn")} className={method === "bvn" ? "rounded-full bg-[#073232]" : "rounded-full bg-gray-200 text-[#073232] hover:bg-gray-300"}>BVN</Button>
                  <Button type="button" onClick={() => setMethod("nin")} className={method === "nin" ? "rounded-full bg-[#073232]" : "rounded-full bg-gray-200 text-[#073232] hover:bg-gray-300"}>NIN</Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>First name</Label><Input className="mt-1 rounded-full" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
                  <div><Label>Last name</Label><Input className="mt-1 rounded-full" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
                </div>
                <div><Label>Phone number</Label><Input className="mt-1 rounded-full" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+234..." /></div>
                <div><Label>{method.toUpperCase()} number</Label><Input className="mt-1 rounded-full" value={value} onChange={(e) => setValue(e.target.value)} maxLength={11} placeholder="11 digits" /></div>
              </div>
            ) : (
              <div className="space-y-5">
                <div><Label>Business name</Label><Input className="mt-1 rounded-full" value={businessName} onChange={(e) => setBusinessName(e.target.value)} /></div>
                <div><Label>CAC number</Label><Input className="mt-1 rounded-full" value={value} onChange={(e) => setValue(e.target.value)} placeholder="RC1234567" /></div>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => router.back()}>Skip for now</Button>
              <Button onClick={submit} disabled={isLoading || !value.trim()} className="rounded-full bg-[#32cd32] px-8 text-[#073232] hover:bg-[#28a428]">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Verify now
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

