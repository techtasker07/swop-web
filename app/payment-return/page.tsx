"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function PaymentReturnPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = (params.get("status") || "").toLowerCase()

    if (["cancelled", "canceled", "failed"].includes(status)) {
      window.opener?.postMessage({ type: "swopify:payment-cancelled" }, window.location.origin)
      window.close()
      return
    }

    if (["successful", "success", "completed", "paid"].includes(status)) {
      const returnTo = params.get("return_to") || "/trade-coins"
      const destination = new URL(returnTo, window.location.origin)
      if (destination.origin !== window.location.origin) return
      const reference = params.get("tx_ref") || params.get("reference") || params.get("payment_reference")
      if (reference) destination.searchParams.set("payment_reference", reference)
      destination.searchParams.set("status", status)
      const transactionId = params.get("transaction_id")
      if (transactionId) destination.searchParams.set("transaction_id", transactionId)
      window.location.replace(destination.toString())
    }
  }, [])

  return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-5 text-center">
    <div className="max-w-md rounded-2xl border bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-[#073232]">Returning to Swopify</h1>
      <p className="mt-2 text-sm text-gray-600">If the payment was cancelled, this checkout window will close automatically. Successful payments are being verified securely.</p>
      <div className="mt-5 flex justify-center gap-3">
        <button type="button" onClick={() => window.close()} className="rounded-full bg-[#073232] px-5 py-2 text-sm font-semibold text-white">Close window</button>
        <Link href="/trade-coins" className="rounded-full border px-5 py-2 text-sm font-semibold text-[#073232]">Return to Swopify</Link>
      </div>
    </div>
  </main>
}
