"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    const origin = window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/dashboard/settings` })
    setLoading(false)
    if (error) toast.error(error.message)
    else toast.success("Password reset link sent. Please check your email.")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto flex max-w-md items-center px-4 py-16">
        <Card className="w-full rounded-[2rem] shadow-lg">
          <CardHeader><CardTitle className="text-[#073232]">Reset password</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div><Label>Email</Label><Input className="mt-1 rounded-full" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <Button disabled={loading} className="w-full rounded-full bg-[#073232]"> <Mail className="mr-2 h-4 w-4" /> Send reset link</Button>
              <Link href="/auth/login" className="block text-center text-sm text-[#073232]">Back to login</Link>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
