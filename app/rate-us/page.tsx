import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export default function RateUsPage() {
  return <div className="min-h-screen bg-gray-50"><Header /><main className="mx-auto max-w-xl px-4 py-12"><Card className="rounded-[2rem]"><CardContent className="p-8 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#32cd32]/15"><Star className="h-8 w-8 text-[#073232]" /></div><h1 className="text-3xl font-bold text-[#073232]">Rate Swopify</h1><p className="mt-3 text-gray-600">Thanks for helping us improve. Share feedback through the contact page while app-store ratings are being finalized.</p></CardContent></Card></main><Footer /></div>
}
