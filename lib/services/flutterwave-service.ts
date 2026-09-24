"use client"

import { createClient } from "@/lib/supabase/client"

export interface FlutterwavePaymentRequest {
  amount: number
  email?: string
  name?: string
  phone?: string
  description: string
  metadata?: Record<string, any>
  redirectPath?: string
  user_id?: string
  currency?: string
  customer?: Record<string, any>
}

export async function createFlutterwavePayment(payload: FlutterwavePaymentRequest) {
  const supabase = createClient()

  // Build metadata with redirect_url for webhook callback
  const metadata = {
    ...payload.metadata,
    redirect_url: payload.redirectPath || "/trade-coins",
  }

  // Call the Supabase Edge Function directly (same as mobile app)
  const { data, error } = await supabase.functions.invoke("flutterwave-create-payment", {
    body: {
      amount: payload.amount,
      currency: payload.currency || "NGN",
      user_id: payload.user_id || payload.metadata?.user_id,
      description: payload.description,
      customer: {
        email: payload.email,
        name: payload.name,
        phone_number: payload.phone,
      },
      metadata,
    },
  })

  if (error) {
    throw new Error(error.message || "Payment initialization failed")
  }

  return {
    success: true,
    checkout_url: data?.payment_link,
    tx_ref: data?.reference,
    data: data,
  }
}

export async function verifyFlutterwavePayment(reference: string) {
  const supabase = createClient()

  // Call the Supabase Edge Function directly (same as mobile app)
  const { data, error } = await supabase.functions.invoke("flutterwave-verify-payment", {
    body: { reference },
  })

  if (error) {
    throw new Error(error.message || "Payment verification failed")
  }

  return {
    success: data?.status === "successful",
    status: data?.status,
    data: {
      status: data?.status,
      meta: data,
    },
  }
}
