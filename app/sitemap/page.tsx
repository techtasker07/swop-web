import { DocLayout, DocSection } from "@/components/docs/doc-layout"
import Link from "next/link"

export const metadata = {
  title: "Sitemap | Swopify",
  description: "A complete map of all pages on the Swopify platform.",
}

const sections = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse Listings", href: "/browse" },
      { label: "Categories", href: "/categories" },
      { label: "Service Coins", href: "/service-coins" },
      { label: "Trade Coins", href: "/trade-coins" },
      { label: "Time Banking", href: "/time-banking" },
      { label: "B2B Trading", href: "/b2b" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Blog", href: "/blog" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Safety Tips", href: "/safety" },
      { label: "Community Guidelines", href: "/guidelines" },
      { label: "Trust & Safety", href: "/trust-safety" },
      { label: "Report an Issue", href: "/report" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign Up", href: "/auth/signup" },
      { label: "Log In", href: "/auth/login" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "My Listings", href: "/dashboard/listings" },
      { label: "Profile", href: "/dashboard/profile" },
      { label: "Messages", href: "/messages" },
      { label: "Favorites", href: "/favorites" },
    ],
  },
  {
    title: "Downloads",
    links: [
      { label: "Download App", href: "/download" },
    ],
  },
]

export default function SitemapPage() {
  return (
    <DocLayout title="Sitemap" subtitle="A complete overview of all pages on Swopify." breadcrumb="Sitemap">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map((section) => (
          <DocSection key={section.title} title={section.title}>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#073232] hover:underline flex items-center gap-1.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#32cd32] flex-shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </DocSection>
        ))}
      </div>
    </DocLayout>
  )
}
