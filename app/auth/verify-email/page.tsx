import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MailCheck } from "lucide-react"

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const params = await searchParams
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto flex max-w-lg items-center px-4 py-16">
        <Card className="w-full rounded-[2rem] shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#32cd32]/15"><MailCheck className="h-8 w-8 text-[#073232]" /></div>
            <h1 className="text-2xl font-bold text-[#073232]">Check your email</h1>
            <p className="mt-3 text-gray-600">We sent a confirmation link to {params.email || "your email"}. After confirming, continue to verification so your account can create listings and swaps.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild className="rounded-full bg-[#073232]"><Link href="/verification">Continue to verification</Link></Button>
              <Button asChild variant="outline" className="rounded-full"><Link href="/auth/login">Sign in</Link></Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
