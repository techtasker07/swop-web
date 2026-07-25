import { NextResponse } from "next/server"

async function resolveNigerianBankCode(secretKey: string, bankName: string) {
  const response = await fetch("https://api.flutterwave.com/v3/banks/NG", {
    headers: { Authorization: `Bearer ${secretKey}` },
  })
  const data = await response.json()
  if (!response.ok || data.status !== "success") throw new Error(data.message || "Could not load Flutterwave bank list")

  const needle = bankName.trim().toLowerCase()
  const banks = Array.isArray(data.data) ? data.data : []
  const exact = banks.find((bank: any) => String(bank.name || "").toLowerCase() === needle)
  const partial = banks.find((bank: any) => String(bank.name || "").toLowerCase().includes(needle) || needle.includes(String(bank.name || "").toLowerCase()))
  const match = exact || partial
  if (!match?.code) throw new Error("Bank name was not found on Flutterwave. Use the official bank name, for example Access Bank, Opay, or Zenith Bank.")
  return match.code
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY || process.env.FLW_SECRET_KEY
    if (!secretKey) return NextResponse.json({ success: false, error: "FLUTTERWAVE_SECRET_KEY is not configured." }, { status: 500 })

    const amount = Number(body.amount)
    const accountNumber = String(body.account_number || "").trim()
    const accountName = String(body.account_name || "").trim()
    const bankName = String(body.bank_name || "").trim()
    if (!Number.isFinite(amount) || amount < 1 || !accountNumber || !accountName || !bankName) {
      return NextResponse.json({ success: false, error: "Enter payout account name, account number, bank, and a valid amount." }, { status: 400 })
    }

    const accountBank = body.account_bank || await resolveNigerianBankCode(secretKey, bankName)
    const reference = `SWOPIFY_SC_PAYOUT_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

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
        narration: `Swopify Service Coin payout - ${accountName}`,
        currency: "NGN",
        reference,
        beneficiary_name: accountName,
      }),
    })

    const data = await response.json()
    if (!response.ok || data.status !== "success") {
      return NextResponse.json({ success: false, error: data.message || "Flutterwave payout failed", details: data }, { status: response.status || 400 })
    }

    return NextResponse.json({ success: true, reference, data: data.data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Payout request failed" }, { status: 500 })
  }
}