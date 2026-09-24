import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

async function resolveBankCode(secretKey: string, bankName: string, suppliedCode: string) {
  if (suppliedCode) return suppliedCode
  const wanted = normalize(bankName)
  if (!wanted) return ""

  const banksResponse = await fetch("https://api.flutterwave.com/v3/banks/NG", {
    headers: { Authorization: `Bearer ${secretKey}` },
  })
  const banksData = await banksResponse.json().catch(() => ({}))
  const banks = Array.isArray(banksData.data) ? banksData.data : []

  const bank = banks.find((entry: Record<string, unknown>) => {
    const name = normalize(String(entry.name ?? ""))
    return name === wanted || name.includes(wanted) || wanted.includes(name)
  })

  return String(bank?.code ?? "")
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return json({ message: "Method not allowed" }, 405)

  const secretKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY") ?? Deno.env.get("FLW_SECRET_KEY")
  if (!secretKey) {
    return json({ message: "Set FLUTTERWAVE_SECRET_KEY in Supabase secrets." }, 500)
  }

  try {
    const body = await req.json()
    const amount = Number(body.amount)
    const suppliedBankCode = String(body.account_bank ?? "").trim()
    const bankName = String(body.bank_name ?? "").trim()
    const accountNumber = String(body.account_number ?? "").trim()
    const reference = String(body.reference ?? `swopify-payout-${crypto.randomUUID()}`)
    const narration = String(body.narration ?? "Swopify Service Coin payout")

    if (!Number.isFinite(amount) || amount <= 0) return json({ message: "Invalid payout amount" }, 400)
    if (!accountNumber || (!suppliedBankCode && !bankName)) {
      return json({ message: "Account number and bank name are required" }, 400)
    }

    const accountBank = await resolveBankCode(secretKey, bankName, suppliedBankCode)
    if (!accountBank) {
      return json({
        message: "Could not identify the bank on Flutterwave. Enter the bank name exactly as Flutterwave lists it, for example 'OPay Digital Services Limited'.",
      }, 400)
    }

    const response = await fetch("https://api.flutterwave.com/v3/transfers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_bank: accountBank,
        account_number: accountNumber,
        amount,
        narration,
        currency: "NGN",
        reference,
        debit_currency: "NGN",
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok || data.status === "error") {
      return json({ message: data.message ?? "Flutterwave transfer failed", details: data }, response.status || 400)
    }

    return json({
      success: true,
      status: data.status,
      message: data.message ?? "Transfer queued",
      reference,
      bank_code: accountBank,
      data: data.data ?? data,
    })
  } catch (error) {
    return json({ message: error instanceof Error ? error.message : "Payout failed" }, 500)
  }
})
