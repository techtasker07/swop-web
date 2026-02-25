import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/hero-section"
import { CategoriesSection } from "@/components/home/categories-section"
import { HowItWorksSection } from "@/components/home/how-it-works-section"
import { FeaturedListings } from "@/components/home/featured-listings"
import { CTASection } from "@/components/home/cta-section"
import { BannerCarousel } from "@/components/home/banner-carousel"
import { AppDownloadBanner } from "@/components/home/app-download-banner"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* App Download Banner - 1px spacing from header */}
      <div className="mt-[1px]">
        <AppDownloadBanner />
      </div>
      
      <main className="flex-1">
        {/* Banner Carousel - Responsive padding */}
        <section className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8">
          <BannerCarousel />
        </section>
        
        <FeaturedListings />
        <CategoriesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
