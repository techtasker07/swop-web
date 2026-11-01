import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, verif-hash, x-flutterwave-signature",
}

const successfulStatuses = new Set(["success", "successful", "completed", "paid", "succeeded"])
const failedStatuses = new Set(["failed", "cancelled", "canceled"])

const normalizeStatus = (value: unknown) => {
  const status = String(value ?? "pending").toLowerCase()
  if (successfulStatuses.has(status)) return "successful"
  if (failedStatuses.has(status)) return "failed"
  return "pending"
}

const html = (body: string) =>
  new Response(body, {
    headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
  })

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const expectedHash = Deno.env.get("FLUTTERWAVE_WEBHOOK_SECRET_HASH")
  const suppliedHash =
    req.headers.get("verif-hash") ?? req.headers.get("x-flutterwave-signature")
  if (req.method === "POST" && (!expectedHash || suppliedHash !== expectedHash)) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  )

  try {
    let event: any = {}
    if (req.method === "GET") {
      const url = new URL(req.url)
      event = {
        tx_ref: url.searchParams.get("tx_ref") ?? url.searchParams.get("reference"),
        transaction_id: url.searchParams.get("transaction_id"),
        status: url.searchParams.get("status"),
      }
    } else {
      event = await req.json()
    }

    const data = event.data ?? event
    const reference =
      data.tx_ref ?? data.reference ?? data.flw_ref ?? event.tx_ref ?? event.reference
    const transactionId =
      data.id?.toString() ?? data.transaction_id?.toString() ?? event.transaction_id?.toString()
    const status = normalizeStatus(data.status ?? event.status)
    let metadata = data.meta ?? data.metadata ?? event.meta ?? event.metadata ?? {}

    if (!reference && !transactionId) {
      return new Response("No reference supplied", { status: 202, headers: corsHeaders })
    }

    // Flutterwave redirects the customer's browser with a GET. Treat those
    // query parameters as navigation hints only; verification remains in the
    // authenticated app flow and payment status is updated by signed webhooks.
    if (req.method === "GET") {
      if (reference) {
        const { data: payment } = await supabase
          .from("payment_transactions")
          .select("metadata")
          .eq("reference", reference)
          .maybeSingle()
        metadata = payment?.metadata ?? metadata
      }

      const configuredAppUrl =
        Deno.env.get("NEXT_PUBLIC_APP_URL") ??
        Deno.env.get("NEXT_PUBLIC_SITE_URL") ??
        Deno.env.get("APP_URL") ??
        "http://localhost:3000"
      const appUrl = configuredAppUrl.endsWith("/")
        ? configuredAppUrl.slice(0, -1)
        : configuredAppUrl
      const paymentPath = String(metadata?.redirect_url ?? "/trade-coins")
      const safePaymentPath = paymentPath.startsWith("/") && !paymentPath.startsWith("//")
        ? paymentPath
        : "/trade-coins"

      if (status === "failed") {
        const cancelUrl = new URL("/payment-return", appUrl)
        cancelUrl.searchParams.set("status", "cancelled")
        return Response.redirect(cancelUrl.toString(), 302)
      }

      const returnUrl = new URL(safePaymentPath, appUrl)
      returnUrl.searchParams.set("payment_reference", String(reference ?? transactionId ?? ""))
      returnUrl.searchParams.set("status", status)
      return Response.redirect(returnUrl.toString(), 302)
    }

    const update: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }
    if (transactionId) update.flutterwave_transaction_id = transactionId
    if (status === "successful") update.verified_at = new Date().toISOString()

    const matchColumn = reference ? "reference" : "flutterwave_transaction_id"
    const matchValue = reference ?? transactionId
    await supabase.from("payment_transactions").update(update).eq(matchColumn, matchValue)

    if (status === "successful" && metadata?.purpose === "subscription") {
      const planId = String(metadata.plan_id ?? "")
      const audience = String(metadata.audience ?? (planId.startsWith("b2b_") ? "b2b" : "p2p"))
      const userId = String(metadata.user_id ?? "")
      const now = new Date()
      const periodEnd = new Date(now)
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      if (userId && planId) {
        await supabase.from("user_subscriptions").upsert(
          {
            user_id: userId,
            plan_id: planId,
            audience,
            status: "active",
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            flutterwave_reference: reference,
            updated_at: now.toISOString(),
          },
          { onConflict: "user_id,audience" },
        )
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message ?? "Webhook processing failed." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
