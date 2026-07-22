import { Suspense } from "react"
import { VerificationClient } from "@/components/verification/verification-client"

export default function VerificationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <VerificationClient />
    </Suspense>
  )
}
