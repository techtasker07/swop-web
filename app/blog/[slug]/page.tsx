import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { EnhancedBlogPostInteractions } from "@/components/blog/enhanced-blog-post-interactions"
import { BlogPostProgress } from "@/components/blog/blog-post-progress"
import { AuthorCard } from "@/components/blog/author-card"
import { RelatedPosts } from "@/components/blog/related-posts"
import { BlogContentWithAnchors } from "@/components/blog/blog-content-with-anchors"
import { sanitizeBlogHtml, extractHeadings, calculateReadingTime } from "@/lib/blog-content"
import { ChevronLeft, Calendar, User, Clock } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Blog Post | Swopify",
  description: "Read this blog post.",
}

async function getPost(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("is_active", true)
    .single()
  if (!data) return null
  const [{ count: likes }, { count: shares }, { data: comments }] = await Promise.all([
    supabase.from("blog_likes").select("id", { count: "exact", head: true }).eq("post_id", data.id),
    supabase.from("blog_shares").select("id", { count: "exact", head: true }).eq("post_id", data.id),
    supabase.from("blog_comments").select("id,user_name,content,created_at").eq("post_id", data.id).eq("is_active", true).order("created_at", { ascending: false }),
  ])
  return { ...data, likes: likes ?? 0, shares: shares ?? 0, comments: comments ?? [] }
}

async function getRelatedPosts(slug: string, currentPostId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("blog_posts")
    .select("id,slug,title,excerpt,cover_image,created_at")
    .eq("is_published", true)
    .eq("is_active", true)
    .neq("id", currentPostId)
    .order("created_at", { ascending: false })
    .limit(3)
  return data || []
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 md:px-6 py-6">
          <h1 className="text-xl font-bold mb-3 text-[#073232]">Post not found</h1>
          <Button asChild className="bg-[#32cd32] hover:bg-[#28a428] text-sm h-8">
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  const relatedPosts = await getRelatedPosts(slug, post.id)
  const headings = extractHeadings(post.content)
  const readingTime = calculateReadingTime(post.content)
  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })

  return (
    <div className="flex min-h-screen flex-col">
      <BlogPostProgress />
      <Header />

      <main className="flex-1">
        {/* Back Navigation */}
        <div className="border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-16 z-10">
          <div className="container mx-auto px-4 md:px-6 py-2">
            <Button
              variant="ghost"
              asChild
              className="text-[#073232] hover:text-[#32cd32] hover:bg-transparent p-0 h-auto text-xs md:text-sm"
            >
              <Link href="/blog" className="inline-flex items-center gap-1">
                <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                Back
              </Link>
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Hero Section */}
              <article className="mb-4">
                {/* Cover Image */}
                {post.cover_image && (
                  <div className="mb-3 rounded-lg overflow-hidden group shadow">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-40 md:h-52 object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Title & Meta */}
                <div className="mb-4">
                  <h1 className="text-xl md:text-2xl font-bold mb-2 text-[#073232]">
                    {post.title}
                  </h1>

                  {/* Article Metadata */}
                  <div className="flex flex-wrap gap-2 items-center text-xs text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4 text-[#32cd32]" />
                      <time>{formattedDate}</time>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 md:w-4 md:h-4 text-[#32cd32]" />
                      <span>{post.author_name || "Swopify Team"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 md:w-4 md:h-4 text-[#32cd32]" />
                      <span>{readingTime} min</span>
                    </div>
                  </div>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-sm md:text-base text-gray-700 font-medium italic border-l-4 border-[#32cd32] pl-3 py-1 bg-[#32cd32]/5 rounded-r">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </article>

              {/* Content */}
              <div className="blog-content prose prose-sm max-w-none mb-4 bg-white p-3 md:p-4 rounded-lg shadow-sm">
                <BlogContentWithAnchors content={sanitizeBlogHtml(post.content)} />
              </div>

              {/* Interactions */}
              <div className="bg-white rounded-lg shadow-sm p-3 md:p-4">
                <EnhancedBlogPostInteractions
                  slug={post.slug}
                  title={post.title}
                  initialLikes={post.likes}
                  initialShares={post.shares}
                  initialComments={post.comments}
                />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-3">
                {/* Table of Contents */}
                {headings.length > 0 && (
                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-3 md:p-4">
                      <h3 className="text-xs font-semibold text-[#073232] mb-2 uppercase tracking-wide">
                        Contents
                      </h3>
                      <nav className="space-y-1 text-xs">
                        {headings.map((heading, idx) => (
                          <a
                            key={idx}
                            href={`#heading-${idx}`}
                            className={`block transition-colors hover:text-[#32cd32] truncate ${
                              heading.level === "h2"
                                ? "text-[#073232] font-medium"
                                : "text-gray-600 pl-2"
                            }`}
                            title={heading.text}
                          >
                            {heading.text}
                          </a>
                        ))}
                      </nav>
                    </CardContent>
                  </Card>
                )}

                {/* Author Card */}
                <AuthorCard author={post.author_name || "Swopify Team"} />

                {/* Share Card */}
                <Card className="bg-gradient-to-br from-[#32cd32]/10 to-[#073232]/5 border border-[#32cd32]/30 shadow-sm">
                  <CardContent className="p-3 md:p-4">
                    <p className="text-xs font-semibold text-[#073232] mb-2 uppercase tracking-wide">
                      Share
                    </p>
                    <div className="flex gap-2">
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(post.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-[#073232] text-white text-xs font-medium py-1.5 rounded hover:bg-[#0a4a4a] transition-colors text-center"
                      >
                        Twitter
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-[#32cd32] text-white text-xs font-medium py-1.5 rounded hover:bg-[#28a428] transition-colors text-center"
                      >
                        Facebook
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <RelatedPosts posts={relatedPosts} currentSlug={slug} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
