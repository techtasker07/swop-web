import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/hero-section"
import { CategoriesSection } from "@/components/home/categories-section"
import { HowItWorksSection } from "@/components/home/how-it-works-section"
import { FeaturedListings } from "@/components/home/featured-listings"
import { CTASection } from "@/components/home/cta-section"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <FeaturedListings />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
