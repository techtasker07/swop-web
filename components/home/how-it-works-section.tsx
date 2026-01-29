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
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-2xl">
            How Swopify Works
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Trading on Swopify is simple and secure. Here&apos;s how you can start swapping today.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-8 hidden h-0.5 w-full max-w-4xl -translate-x-1/2 bg-border md:block" />
          
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="relative text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-primary shadow-lg">
                    <Icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    {index + 1}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
