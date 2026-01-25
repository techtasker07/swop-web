import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="bg-primary py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
          Ready to Start Trading?
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/80">
          Join thousands of people already using Swopify to trade items and services. 
          It&apos;s completely free to get started.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" variant="secondary" asChild className="w-full gap-2 sm:w-auto">
            <Link href="/auth/sign-up">
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            asChild 
            className="w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
          >
            <Link href="/browse">
              Browse First
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
