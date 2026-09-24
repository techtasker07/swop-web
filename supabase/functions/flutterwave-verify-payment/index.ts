import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })

const secretKey = () => {
  const value = Deno.env.get("FLUTTERWAVE_SECRET_KEY")?.trim() || Deno.env.get("FLW_SECRET_KEY")?.trim()
  if (!value) {
    throw new Error("Set FLUTTERWAVE_SECRET_KEY to your Flutterwave v3 Secret Key in Supabase secrets.")
  }
  return value
}

const successfulStatuses = new Set(["success", "successful", "completed", "paid"])
const failedStatuses = new Set(["failed", "cancelled", "canceled"])

const normalizeStatus = (value: unknown) => {
  const status = String(value ?? "pending").toLowerCase()
  if (successfulStatuses.has(status)) return "successful"
  if (failedStatuses.has(status)) return "failed"
  return "pending"
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const { reference } = await req.json()
    if (!reference) return json({ message: "reference is required." }, 400)

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    const { data: existing } = await supabase
      .from("payment_transactions")
      .select()
      .eq("reference", reference)
      .maybeSingle()

    if (existing?.status === "successful") {
      return json({
        status: "successful",
        amount: existing.amount,
        currency: existing.currency,
        transaction_id: existing.flutterwave_transaction_id,
        message: "Payment completed successfully.",
      })
    }

    const url = new URL("https://api.flutterwave.com/v3/transactions/verify_by_reference")
    url.searchParams.set("tx_ref", String(reference))
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${secretKey()}`,
        "Content-Type": "application/json",
      },
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok || data.status === "error") {
      return json({
        status: existing?.status ?? "pending",
        amount: existing?.amount ?? 0,
        currency: existing?.currency ?? "NGN",
        message: data.message ?? "Payment is still pending.",
      })
    }

    const tx = data.data ?? {}
    const status = normalizeStatus(tx.status)
    const amount = Number(tx.amount ?? existing?.amount ?? 0)
    const currency = String(tx.currency ?? existing?.currency ?? "NGN")
    const transactionId = tx.id?.toString() ?? existing?.flutterwave_transaction_id ?? null

    if (existing?.id) {
      await supabase
        .from("payment_transactions")
        .update({
          status,
          amount,
          currency,
          flutterwave_transaction_id: transactionId,
          verified_at: status === "successful" ? new Date().toISOString() : existing.verified_at,
          updated_at: new Date().toISOString(),
          metadata: {
            ...(existing.metadata ?? {}),
            flutterwave_verification: data,
          },
        })
        .eq("id", existing.id)
    }

    return json({
      status,
      amount,
      currency,
      transaction_id: transactionId,
      message:
        status === "successful"
          ? "Payment completed successfully."
          : status === "failed"
            ? "Payment failed. Please try again."
            : "Payment is still pending.",
    })
  } catch (error) {
    return json({ message: error.message ?? "Flutterwave payment verification failed." }, 500)
  }
})
