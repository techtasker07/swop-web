import { Upload, Search, MessageSquare, ArrowLeftRight } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "List Your Items",
    description: "Post photos and descriptions of items you want to trade. It takes less than a minute.",
  },
  {
    icon: Search,
    title: "Discover Trades",
    description: "Browse listings or search for specific items you need. Filter by category and location.",
  },
  {
    icon: MessageSquare,
    title: "Connect & Chat",
    description: "Message other traders to discuss swap details and arrange the exchange.",
  },
  {
    icon: ArrowLeftRight,
    title: "Make the Swap",
    description: "Meet up safely and complete your trade. Rate your experience to build trust.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="bg-background py-8 sm:py-12 md:py-16 lg:py-24">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="mb-6 sm:mb-8 md:mb-12 text-center">
          <h2 className="mb-2 sm:mb-3 md:mb-4 text-lg sm:text-xl md:text-2xl font-bold text-foreground px-4">
            How Swopify Works
          </h2>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-muted-foreground px-4">
            Trading on Swopify is simple and secure. Here&apos;s how you can start swapping today.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-8 hidden h-0.5 w-full max-w-4xl -translate-x-1/2 bg-border lg:block" />
          
          <div className="grid gap-6 sm:gap-8 grid-cols-2 md:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="relative text-center">
                  <div className="mx-auto mb-3 sm:mb-4 md:mb-6 flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full border-2 sm:border-3 md:border-4 border-background bg-primary shadow-md sm:shadow-lg">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 sm:-top-1.5 md:-top-2 left-1/2 flex h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-xs sm:text-sm font-bold text-accent-foreground">
                    {index + 1}
                  </div>
                  <h3 className="mb-1 sm:mb-1.5 md:mb-2 text-sm sm:text-base md:text-lg font-semibold text-foreground px-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground px-2 leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
