import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChevronRight } from "lucide-react"
import type { ReactNode } from "react"

interface DocLayoutProps {
  title: string
  subtitle?: string
  lastUpdated?: string
  breadcrumb?: string
  children: ReactNode
}

export function DocLayout({ title, subtitle, lastUpdated, breadcrumb, children }: DocLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[#073232] to-[#0a4a4a] text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-white/60 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              {breadcrumb && (
                <>
                  <span className="text-white/60">{breadcrumb}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
              <span className="text-white/90">{title}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">{title}</h1>
            {subtitle && <p className="text-white/80 text-base sm:text-lg max-w-2xl">{subtitle}</p>}
            {lastUpdated && (
              <p className="mt-4 text-sm text-white/50">Last updated: {lastUpdated}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Reusable section components
export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8 last:mb-0">
      <h2 className="text-xl font-bold text-[#073232] mb-3 pb-2 border-b border-gray-100">{title}</h2>
      <div className="space-y-3 text-gray-700 leading-relaxed">{children}</div>
    </section>
  )
}

export function DocSubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-[#073232] mb-2">{title}</h3>
      <div className="space-y-2 text-gray-700 leading-relaxed">{children}</div>
    </div>
  )
}

export function DocList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 ml-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#32cd32] flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  )
}

export function DocHighlight({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#073232]/5 border-l-4 border-[#32cd32] rounded-r-lg p-4 my-4 text-sm text-[#073232]">
      {children}
    </div>
  )
}
