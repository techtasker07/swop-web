import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET
  const signature = request.headers.get("verif-hash")

  if (secretHash && signature !== secretHash) {
    return NextResponse.json({ success: false, error: "Invalid webhook signature" }, { status: 401 })
  }

  const event = await request.json()
  return NextResponse.json({ success: true, received: true, event: event?.event || event?.type || "payment" })
}
