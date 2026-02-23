import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CategoriesGrid } from "@/components/categories/categories-grid"
import { CategoryStats } from "@/components/categories/category-stats"

export const metadata = {
  title: "Categories | Swopify",
  description: "Browse all categories of items and services available for trade on Swopify.",
}

export default function CategoriesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-[#073232]/5 via-[#32cd32]/5 to-[#073232]/5 py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            <div className="text-center">
              <h1 className="mb-2 sm:mb-3 md:mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-foreground lg:text-5xl">
                Browse by Category
              </h1>
              <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground px-4">
                Find exactly what you're looking for by exploring our organized categories of items and services.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12 md:py-16">
          <CategoryStats />
          <CategoriesGrid />
        </div>
      </main>
      <Footer />
    </div>
  )
}