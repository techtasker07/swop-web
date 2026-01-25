import { Suspense } from "react"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Sign Up | Swopify",
  description: "Join Swopify and start trading with your community today.",
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <Suspense fallback={<div>Loading...</div>}>
            <SignUpForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}