"use client"

import { createClient } from "@/lib/supabase/client"

type VerificationType = "bvn" | "nin" | "business"

export class VerificationService {
  private supabase = createClient()

  validateBVN(value: string) {
    return /^\d{11}$/.test(value.trim())
  }

  validateNIN(value: string) {
    return /^\d{11}$/.test(value.trim())
  }

  validateCAC(value: string) {
    return /^(RC|BN|IT|LLP)\d+$/i.test(value.trim())
  }

  async verifyBVN(bvn: string, extra: { firstName?: string; lastName?: string; phoneNumber?: string } = {}) {
    if (!this.validateBVN(bvn)) return { success: false, error: "Invalid BVN format. Must be 11 digits." }
    return this.verify("bvn", {
      bvn,
      expected_first_name: extra.firstName?.trim() || "",
      expected_last_name: extra.lastName?.trim() || "",
      expected_phone_number: extra.phoneNumber?.trim() || "",
    })
  }

  async verifyNIN(nin: string, extra: { firstName?: string; lastName?: string; phoneNumber?: string } = {}) {
    if (!this.validateNIN(nin)) return { success: false, error: "Invalid NIN format. Must be 11 digits." }
    return this.verify("nin", {
      nin,
      expected_first_name: extra.firstName?.trim() || "",
      expected_last_name: extra.lastName?.trim() || "",
      expected_phone_number: extra.phoneNumber?.trim() || "",
    })
  }

  async verifyCAC(cac: string, extra: { businessName?: string } = {}) {
    if (!this.validateCAC(cac)) return { success: false, error: "Invalid CAC format. Use RC, BN, IT, or LLP followed by numbers." }
    return this.verify("business", {
      rc_number: cac.trim().toUpperCase(),
      expected_business_name: extra.businessName?.trim() || "",
    })
  }

  private async verify(type: VerificationType, data: Record<string, string>) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      await this.supabase.from("verification_requests").insert({
        user_id: user.id,
        verification_type: type,
        verification_data: data,
        status: "pending",
      })

      const response = await this.supabase.functions.invoke("dojah-verify", {
        body: { type, data, userId: user.id },
      })

      if (response.error) throw response.error
      if (response.data?.success !== true) throw new Error(response.data?.error || "Verification failed")

      const updates =
        type === "bvn"
          ? { bvn_verified: true, nin_verified: true, verification_status: "verified", verified_at: new Date().toISOString() }
          : type === "nin"
            ? { nin_verified: true, verification_status: "verified", verified_at: new Date().toISOString() }
            : { business_verified: true, verification_status: "verified", verified_at: new Date().toISOString() }

      await this.supabase.from("profiles").update(updates).eq("id", user.id)

      return {
        success: true,
        message:
          type === "bvn"
            ? "BVN verified successfully. Your NIN is now also verified."
            : type === "nin"
              ? "NIN verified successfully."
              : "CAC verified successfully.",
        data: response.data?.data,
      }
    } catch (error: any) {
      return { success: false, error: String(error?.message || error).replace("Error: ", "") }
    }
  }
}

export const verificationService = new VerificationService()
