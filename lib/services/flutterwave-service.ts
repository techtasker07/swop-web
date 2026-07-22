"use client"

export interface FlutterwavePaymentRequest {
  amount: number
  email: string
  name?: string
  phone?: string
  description: string
  metadata?: Record<string, any>
  redirectPath?: string
}

export async function createFlutterwavePayment(payload: FlutterwavePaymentRequest) {
  const response = await fetch("/api/flutterwave/create-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok || !data.success) throw new Error(data.error || "Payment initialization failed")
  return data
}

export async function verifyFlutterwavePayment(reference: string) {
  const response = await fetch(`/api/flutterwave/verify-payment?reference=${encodeURIComponent(reference)}`)
  const data = await response.json()
  if (!response.ok || !data.success) throw new Error(data.error || "Payment verification failed")
  return data
}

