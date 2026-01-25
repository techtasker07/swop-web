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
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
                Browse by Category
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Find exactly what you're looking for by exploring our organized categories of items and services.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <CategoryStats />
          <CategoriesGrid />
        </div>
      </main>
      <Footer />
    </div>
  )
}