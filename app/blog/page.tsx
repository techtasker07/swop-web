import { DocLayout, DocSection, DocHighlight } from "@/components/docs/doc-layout"
import { Calendar, User } from "lucide-react"

export const metadata = {
  title: "Blog | Swopify",
  description: "Tips, stories, and updates from the Swopify community.",
}

const posts = [
  {
    title: "How to Get the Most Out of Bartering on Swopify",
    date: "March 10, 2026",
    author: "Swopify Team",
    category: "Tips & Tricks",
    excerpt: "Bartering is an art. Learn how to write compelling listings, propose fair trades, and build a strong reputation on the platform.",
  },
  {
    title: "The Rise of Time Banking in Nigeria",
    date: "February 28, 2026",
    author: "Swopify Team",
    category: "Community",
    excerpt: "Time Banking is transforming how Nigerians exchange skills and services. Here's how our community is leading the way.",
  },
  {
    title: "5 Safety Tips Every Swopify Trader Should Know",
    date: "February 15, 2026",
    author: "Swopify Team",
    category: "Safety",
    excerpt: "Trading safely is our top priority. Follow these five essential tips to protect yourself in every exchange.",
  },
  {
    title: "Introducing B2B Trading on Swopify",
    date: "January 30, 2026",
    author: "Swopify Team",
    category: "Product Update",
    excerpt: "Businesses can now trade goods and services in bulk on Swopify. Here's everything you need to know about our new B2B marketplace.",
  },
  {
    title: "Trade Coins Explained: Your Guide to Swopify's Currency",
    date: "January 15, 2026",
    author: "Swopify Team",
    category: "Education",
    excerpt: "Not sure how Trade Coins work? This guide breaks down everything — from buying coins to using them in trades.",
  },
  {
    title: "Community Spotlight: 1,000 Successful Trades in Lagos",
    date: "January 5, 2026",
    author: "Swopify Team",
    category: "Community",
    excerpt: "We're celebrating a major milestone — 1,000 completed trades in Lagos alone. Meet some of the traders making it happen.",
  },
]

export default function BlogPage() {
  return (
    <DocLayout title="Swopify Blog" subtitle="Stories, tips, and updates from our community." breadcrumb="Company">
      <DocSection title="Latest Posts">
        <div className="grid gap-6 mt-2">
          {posts.map((post) => (
            <div key={post.title} className="p-5 rounded-xl border border-gray-100 hover:border-[#073232]/20 hover:shadow-sm transition-all bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#32cd32]/15 text-[#073232]">
                  {post.category}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#073232] mb-2">{post.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{post.date}</span>
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{post.author}</span>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocHighlight>
        Want to share your Swopify story? Email us at support@swopify.com with the subject "Community Story" and you might be featured on our blog.
      </DocHighlight>
    </DocLayout>
  )
}
