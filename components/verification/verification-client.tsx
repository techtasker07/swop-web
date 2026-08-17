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
import {
  ShieldCheck,
  Building2,
  IdCard,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react"
import { toast } from "sonner"
import { verificationService } from "@/lib/services/verification-service"
import { useAuth } from "@/hooks/use-auth"

// ─── types ───────────────────────────────────────────────────────────────────
type Mode   = "personal" | "business"
type Method = "bvn" | "nin" | "cac"

interface ResultBanner {
  ok: boolean
  message: string
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function validatePhone(phone: string) {
  return /^\+234\d{10}$/.test(phone.trim())
}

// Translates raw API / network error strings into plain user-facing sentences.
function friendlyError(raw: string | undefined, method: "bvn" | "nin" | "cac"): string {
  if (!raw || raw.trim() === "") {
    return "Verification could not be completed. Please try again."
  }
  const msg = raw.toLowerCase()
  const label = method === "bvn" ? "BVN" : method === "nin" ? "NIN" : "CAC"

  if (/(secret|api).*(key|credential)|could not be authorized|authorization|unauthorized|forbidden\b.*401|401\b|invalid credentials/i.test(msg)) {
    return "The verification service credentials are not set up correctly. Please contact support."
  }
  if (/endpoint.*unavailable|unavailable.*endpoint|not.*available|not.*enabled|not.*active|service.*not.*active|service.*unavailable|not.*subscrib|deactivated|inactive|requires.*subscription|subscription.*required|isn.?t active on this account|is not active on this account/i.test(msg)) {
    return `The ${label} verification service isn't active on your Dojah account. Please go to dashboard.dojah.io → Products → KYC and make sure ${label} Lookup is turned ON, or contact support to enable this service.`
  }
  if (/pending.*request|request.*pending/i.test(msg)) {
    return "A previous request is still processing. Please wait a moment and try again."
  }
  if (/not.*found|no.*record|invalid.*number|could not find|does not exist|unknown/i.test(msg)) {
    return `No record was found for the ${label} number you entered. Please double-check it and try again.`
  }
  if (/name.*match|match.*name|detail.*match|mismatch|does not match|doesn.?t match/i.test(msg)) {
    return "Your ID was found, but the name or phone number doesn't match the record. Please check your details."
  }
  if (/wallet|balance.*insufficient|insufficient.*balance|fund.*wallet|payment.*required|low.*balance/i.test(msg)) {
    return "The verification service wallet is out of funds. Please contact support to top up the Dojah wallet."
  }
  if (/too many|rate.*limit|throttl|many request/i.test(msg)) {
    return "Too many attempts. Please wait a minute and try again."
  }
  if (/network.*error|fetch.*failed|econnrefused|enotfound|timeout|socket/i.test(msg)) {
    return "Unable to reach the verification service. Please check your internet connection and try again."
  }

  // No specific rule matched. Show the original message directly so users
  // (and support) can always see the real cause. We only sanitize URLs and
  // obvious stack traces.
  const safe = raw
    .replace(/https?:\/\/[^\s]+/g, "[redacted-url]")
    .replace(/\b(sk_|pk_)[A-Za-z0-9_]{12,}/g, "[redacted-token]")
    .trim()

  // If it looks like a stack trace / technical dump, wrap it in a friendly
  // sentence. Otherwise return verbatim (capped at 320 chars to avoid UI wrap
  // issues).
  if (/stack.?trace|traceback|at (?:[A-Za-z_$][\w$]*\.){2,}/i.test(safe)) {
    return "Verification could not be completed. Please try again or contact support if this persists."
  }

  if (safe.length > 0) {
    return safe.length <= 320 ? safe : safe.slice(0, 317) + "..."
  }

  return "Verification could not be completed. Please check your details and try again."
}

// ─── component ───────────────────────────────────────────────────────────────
export function VerificationClient() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, isLoading: authLoading } = useAuth()

  // ── return destination: where to send the user after verification ──
  // Callers (create listing, propose trade, etc.) pass `redirect` so the user
  // is taken straight back to the activity they were doing before being
  // diverted to verify their identity.
  const redirectTarget = useMemo(() => {
    const raw = searchParams.get("redirect")
    if (!raw) return null
    return raw.startsWith("/") && !raw.startsWith("//") ? raw : null
  }, [searchParams])

  // ── derive initial state from URL / profile ──
  const initialMode: Mode =
    searchParams.get("type") === "business" || profile?.user_type === "business"
      ? "business"
      : "personal"

  const [mode,       setMode]       = useState<Mode>(initialMode)
  const [method,     setMethod]     = useState<Method>(initialMode === "business" ? "cac" : "bvn")
  const [value,      setValue]      = useState("")
  const [firstName,  setFirstName]  = useState("")
  const [lastName,   setLastName]   = useState("")
  const [phoneNumber,setPhoneNumber]= useState("")
  const [businessName,setBusinessName] = useState(profile?.business_name ?? "")
  const [isLoading,  setIsLoading]  = useState(false)
  const [result,     setResult]     = useState<ResultBanner | null>(null)

  // ── field-level validation errors ──
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ── derived badge text ──
  const statusText = useMemo(() => {
    if (
      profile?.business_verified ||
      (profile?.user_type === "business" && profile?.verification_status === "verified")
    ) return "CAC verified"
    if (profile?.bvn_verified) return "BVN and NIN verified"
    if (profile?.nin_verified) return "NIN verified"
    return "Verification required"
  }, [profile])

  // ── validation ──
  function validate(): boolean {
    const next: Record<string, string> = {}

    if (mode === "personal") {
      if (!firstName.trim())  next.firstName  = "First name is required"
      if (!lastName.trim())   next.lastName   = "Last name is required"
      if (!phoneNumber.trim()) {
        next.phoneNumber = "Phone number is required"
      } else if (!validatePhone(phoneNumber)) {
        next.phoneNumber = "Use the format +234XXXXXXXXXX (13 digits total)"
      }
      if (!value.trim()) {
        next.value = `${method.toUpperCase()} number is required`
      } else if (!/^\d{11}$/.test(value.trim())) {
        next.value = `${method.toUpperCase()} must be exactly 11 digits`
      }
    } else {
      if (!businessName.trim()) next.businessName = "Business name is required"
      if (!value.trim()) {
        next.value = "CAC number is required"
      } else if (!/^(RC|BN|IT|LP|LLP)?\d+$/i.test(value.trim())) {
        next.value = "Enter a valid CAC number, e.g. RC123456 or just 123456"
      }
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  // ── submit ──
  const submit = async () => {
    if (!user) {
      const redirectParam = redirectTarget ? `&redirect=${encodeURIComponent(redirectTarget)}` : ""
      router.push(`/auth/login?redirect=/verification${redirectParam}`)
      return
    }

    if (!validate()) return

    setIsLoading(true)
    setResult(null)

    try {
      const res =
        method === "bvn"
          ? await verificationService.verifyBVN(value, { firstName, lastName, phoneNumber })
          : method === "nin"
            ? await verificationService.verifyNIN(value, { firstName, lastName, phoneNumber })
            : await verificationService.verifyCAC(value, { businessName })

      if (!res.success) {
        const msg = friendlyError(res.error, method)
        setResult({ ok: false, message: msg })
        toast.error(msg)
      } else {
        const msg = "message" in res ? res.message ?? "Verified successfully!" : "Verified successfully!"
        setResult({ ok: true, message: msg })
        toast.success(msg)
        setTimeout(() => {
          if (redirectTarget) {
            router.push(redirectTarget)
          } else {
            router.push(mode === "business" ? "/b2b" : "/dashboard")
          }
          router.refresh()
        }, 1800)
      }
    } catch (error: any) {
      const msg = friendlyError(error?.message, method)
      setResult({ ok: false, message: msg })
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // ── mode switch ──
  function switchMode(next: Mode) {
    setMode(next)
    setMethod(next === "business" ? "cac" : "bvn")
    setValue("")
    setErrors({})
    setResult(null)
  }

  function switchMethod(next: Method) {
    setMethod(next)
    setValue("")
    setErrors({})
    setResult(null)
  }

  // ── auth loading state ──
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-10">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#32cd32]" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Hero banner */}
        <div className="rounded-[2rem] bg-[#073232] p-6 text-white shadow-xl sm:p-8">
          <Badge className="mb-4 rounded-full bg-[#32cd32] text-[#073232] font-semibold">
            {statusText}
          </Badge>
          <h1 className="text-3xl font-bold">Secure your Swopify account</h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Public users must verify BVN or NIN before adding listings or making swaps.
            BVN verification automatically verifies NIN. Business users verify CAC for B2B access.
          </p>
        </div>

        {/* Info note */}
        <div className="mt-4 flex items-start gap-3 rounded-[1rem] border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            The name and phone number you enter must <strong>exactly match</strong> what is
            on your ID record. BVN and NIN checks match against first name, last name, and
            phone number. CAC checks match against the registered business name.
          </span>
        </div>

        <Card className="mt-4 rounded-[2rem] border-gray-200 shadow-lg">
          <CardContent className="space-y-6 p-6 sm:p-8">

            {/* Mode selector */}
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => switchMode("personal")}
                className={`rounded-[1.5rem] border p-5 text-left transition ${
                  mode === "personal"
                    ? "border-[#32cd32] bg-[#32cd32]/10"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <IdCard className="mb-3 h-7 w-7 text-[#073232]" />
                <div className="font-semibold text-[#073232]">Public user</div>
                <p className="text-sm text-gray-500">Verify BVN or NIN.</p>
              </button>
              <button
                type="button"
                onClick={() => switchMode("business")}
                className={`rounded-[1.5rem] border p-5 text-left transition ${
                  mode === "business"
                    ? "border-[#32cd32] bg-[#32cd32]/10"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <Building2 className="mb-3 h-7 w-7 text-[#073232]" />
                <div className="font-semibold text-[#073232]">Business entity</div>
                <p className="text-sm text-gray-500">Verify CAC for B2B.</p>
              </button>
            </div>

            {/* Personal fields */}
            {mode === "personal" && (
              <div className="space-y-5">
                {/* BVN / NIN toggle */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={() => switchMethod("bvn")}
                    className={
                      method === "bvn"
                        ? "rounded-full bg-[#073232] text-white hover:bg-[#073232]/90"
                        : "rounded-full bg-gray-100 text-[#073232] hover:bg-gray-200"
                    }
                  >
                    BVN
                  </Button>
                  <Button
                    type="button"
                    onClick={() => switchMethod("nin")}
                    className={
                      method === "nin"
                        ? "rounded-full bg-[#073232] text-white hover:bg-[#073232]/90"
                        : "rounded-full bg-gray-100 text-[#073232] hover:bg-gray-200"
                    }
                  >
                    NIN
                  </Button>
                </div>

                {/* Name row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      className={`mt-1 rounded-full ${errors.firstName ? "border-red-500" : ""}`}
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: "" })) }}
                      placeholder="As on your ID"
                      autoComplete="given-name"
                    />
                    {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      className={`mt-1 rounded-full ${errors.lastName ? "border-red-500" : ""}`}
                      value={lastName}
                      onChange={(e) => { setLastName(e.target.value); setErrors((p) => ({ ...p, lastName: "" })) }}
                      placeholder="As on your ID"
                      autoComplete="family-name"
                    />
                    {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <Label htmlFor="phoneNumber">Phone number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    className={`mt-1 rounded-full ${errors.phoneNumber ? "border-red-500" : ""}`}
                    value={phoneNumber}
                    onChange={(e) => { setPhoneNumber(e.target.value); setErrors((p) => ({ ...p, phoneNumber: "" })) }}
                    placeholder="+234XXXXXXXXXX"
                    autoComplete="tel"
                  />
                  {errors.phoneNumber
                    ? <p className="text-xs text-red-500">{errors.phoneNumber}</p>
                    : <p className="text-xs text-gray-400">Include the country code, e.g. +2348012345678</p>
                  }
                </div>

                {/* BVN / NIN number */}
                <div className="space-y-1">
                  <Label htmlFor="idValue">{method.toUpperCase()} number</Label>
                  <Input
                    id="idValue"
                    type="text"
                    inputMode="numeric"
                    className={`mt-1 rounded-full ${errors.value ? "border-red-500" : ""}`}
                    value={value}
                    onChange={(e) => { setValue(e.target.value.replace(/\D/g, "").slice(0, 11)); setErrors((p) => ({ ...p, value: "" })) }}
                    maxLength={11}
                    placeholder="11 digits"
                  />
                  {errors.value
                    ? <p className="text-xs text-red-500">{errors.value}</p>
                    : <p className="text-xs text-gray-400">{value.length}/11 digits</p>
                  }
                </div>
              </div>
            )}

            {/* Business fields */}
            {mode === "business" && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <Label htmlFor="businessName">Registered business name</Label>
                  <Input
                    id="businessName"
                    className={`mt-1 rounded-full ${errors.businessName ? "border-red-500" : ""}`}
                    value={businessName}
                    onChange={(e) => { setBusinessName(e.target.value); setErrors((p) => ({ ...p, businessName: "" })) }}
                    placeholder="As shown on CAC certificate"
                  />
                  {errors.businessName && <p className="text-xs text-red-500">{errors.businessName}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cacValue">CAC number</Label>
                  <Input
                    id="cacValue"
                    className={`mt-1 rounded-full ${errors.value ? "border-red-500" : ""}`}
                    value={value}
                    onChange={(e) => { setValue(e.target.value.toUpperCase()); setErrors((p) => ({ ...p, value: "" })) }}
                    placeholder="RC1234567 or 1234567"
                  />
                  {errors.value && <p className="text-xs text-red-500">{errors.value}</p>}
                </div>
              </div>
            )}

            {/* Result banner */}
            {result && (
              <div
                className={`flex items-start gap-3 rounded-[1rem] border p-4 text-sm ${
                  result.ok
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {result.ok
                  ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                }
                <span>{result.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Skip for now
              </Button>
              <Button
                onClick={submit}
                disabled={isLoading || !value.trim() || !user}
                className="rounded-full bg-[#32cd32] px-8 text-[#073232] hover:bg-[#28a428] disabled:opacity-50"
              >
                {isLoading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</>
                  : <><ShieldCheck className="mr-2 h-4 w-4" /> Verify now</>
                }
              </Button>
            </div>

            {/* Not logged-in nudge */}
            {!user && !authLoading && (
              <p className="text-center text-sm text-gray-500">
                You must{" "}
                <button
                  type="button"
                  className="font-semibold text-[#073232] underline underline-offset-2"
                  onClick={() => router.push("/auth/login?redirect=/verification" + (redirectTarget ? `&redirect=${encodeURIComponent(redirectTarget)}` : ""))}
                >
                  log in
                </button>{" "}
                before verifying your identity.
              </p>
            )}

          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
