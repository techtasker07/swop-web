import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface RelatedPost {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_image?: string
  created_at: string
}

export function RelatedPosts({ posts, currentSlug }: { posts: RelatedPost[]; currentSlug: string }) {
  if (posts.length === 0) return null

  return (
    <section className="mt-8 pt-6 border-t border-gray-200">
      <h2 className="text-lg md:text-xl font-bold text-[#073232] mb-4">Related Articles</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group">
            <Card className="overflow-hidden hover:shadow-md transition-all duration-300 bg-white border-0 cursor-pointer h-full flex flex-col">
              {/* Image */}
              {post.cover_image && (
                <div className="relative overflow-hidden h-24 md:h-32 bg-gray-200">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              )}

              {/* Content */}
              <CardContent className="p-2.5 md:p-3 space-y-1.5 flex-1 flex flex-col">
                <h3 className="font-semibold text-xs md:text-sm text-[#073232] group-hover:text-[#32cd32] transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-xs text-gray-600 line-clamp-2 flex-1">{post.excerpt}</p>

                <div className="flex items-center justify-between pt-1.5 border-t border-gray-200 mt-auto">
                  <time className="text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <ArrowRight className="w-3 h-3 text-[#32cd32] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
