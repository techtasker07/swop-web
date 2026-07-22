import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const reference = url.searchParams.get("reference")
    const transactionId = url.searchParams.get("transaction_id")
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY || process.env.FLUTTERWAVE_CLIENT_SECRET

    if (!secretKey) return NextResponse.json({ success: false, error: "FLUTTERWAVE_SECRET_KEY is not configured." }, { status: 500 })
    if (!reference && !transactionId) return NextResponse.json({ success: false, error: "Payment reference or transaction id is required." }, { status: 400 })

    const endpoint = transactionId
      ? `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`
      : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference!)}`

    const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${secretKey}` } })
    const data = await response.json()
    if (!response.ok || data.status !== "success") {
      return NextResponse.json({ success: false, error: data.message || "Payment verification failed" }, { status: response.status || 400 })
    }

    return NextResponse.json({ success: data.data?.status === "successful", status: data.data?.status, data: data.data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Payment verification failed" }, { status: 500 })
  }
}
