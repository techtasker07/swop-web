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

const redirectUrl = () =>
  Deno.env.get("APP_PAYMENT_REDIRECT_URL")?.trim() ??
  `${Deno.env.get("SUPABASE_URL")}/functions/v1/flutterwave-webhook`

const secretKey = () => {
  const value = Deno.env.get("FLUTTERWAVE_SECRET_KEY")?.trim() || Deno.env.get("FLW_SECRET_KEY")?.trim()
  if (!value) {
    throw new Error("Set FLUTTERWAVE_SECRET_KEY to your Flutterwave v3 Secret Key in Supabase secrets.")
  }
  return value
}

const customerFrom = (userId: string, customer: Record<string, unknown>) => {
  const email =
    customer?.email?.toString().trim() ||
    `user-${userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 28)}@swopify.com`
  const name = customer?.name?.toString().trim() || "Swopify User"
  const phone = customer?.phone_number?.toString().trim() || customer?.phone?.toString().trim() || "08000000000"
  return { email, name, phonenumber: phone, phone_number: phone }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const payload = await req.json()
    const amount = Number(payload.amount)
    const currency = String(payload.currency ?? "NGN")
    const userId = String(payload.user_id ?? "")
    const description = String(payload.description ?? "Swopify payment")
    const reference = `SWOP-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
    const metadata = {
      ...(payload.metadata ?? {}),
      user_id: userId,
      description,
      flutterwave_flow: "standard_checkout",
    }

    if (!amount || amount <= 0 || !userId) {
      return json({ message: "Amount and user_id are required." }, 400)
    }

    const paymentBody = {
      tx_ref: reference,
      amount,
      currency,
      redirect_url: redirectUrl(),
      customer: customerFrom(userId, payload.customer ?? {}),
      payment_options: "card,banktransfer,ussd,mobilemoney",
      customizations: {
        title: "Swopify",
        description,
        logo: Deno.env.get("APP_PAYMENT_LOGO_URL")?.trim() || undefined,
      },
      meta: metadata,
    }

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentBody),
    })
    const data = await response.json().catch(() => ({}))
    const paymentLink = data?.data?.link?.toString() ?? ""

    if (!response.ok || data.status === "error" || !paymentLink) {
      return json(
        {
          message: data.message ?? "Unable to create Flutterwave Standard checkout link.",
          details: data,
        },
        response.status || 400,
      )
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    await supabase.from("payment_transactions").insert({
      user_id: userId,
      reference,
      flutterwave_transaction_id: null,
      amount,
      currency,
      description,
      status: "pending",
      metadata: {
        ...metadata,
        flutterwave_checkout: data,
      },
    })

    return json({
      reference,
      payment_link: paymentLink,
      transaction_id: null,
      checkout_mode: "flutterwave_standard",
    })
  } catch (error) {
    return json({ message: error.message ?? "Flutterwave payment creation failed." }, 500)
  }
})
