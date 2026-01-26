import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Sign In | Swopify",
  description: "Sign in to your Swopify account to continue trading.",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-16">
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}