import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY || process.env.FLUTTERWAVE_CLIENT_SECRET
    if (!secretKey) return NextResponse.json({ success: false, error: "FLUTTERWAVE_SECRET_KEY is not configured." }, { status: 500 })

    const txRef = `SWOPIFY_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: body.amount,
        currency: "NGN",
        redirect_url: `${origin}${body.redirectPath || "/pricing"}?payment_reference=${txRef}`,
        customer: {
          email: body.email,
          name: body.name || body.email,
          phonenumber: body.phone || "",
        },
        customizations: {
          title: "Swopify",
          description: body.description,
          logo: `${origin}/swopify.png`,
        },
        meta: body.metadata || {},
      }),
    })

    const data = await response.json()
    if (!response.ok || data.status !== "success") {
      return NextResponse.json({ success: false, error: data.message || "Flutterwave payment initialization failed" }, { status: response.status || 400 })
    }

    return NextResponse.json({ success: true, tx_ref: txRef, checkout_url: data.data.link, data: data.data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Payment initialization failed" }, { status: 500 })
  }
}
