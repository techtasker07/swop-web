import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { MessageSquare, Share2, MoreHorizontal } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CommentsSection } from "@/components/blog/comments-section"

export const metadata = {
  title: "Blog | Swopify",
  description: "Read the latest Swopify blog posts.",
}

async function getPosts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
  return data || []
}

async function getComments(postId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("blog_comments")
    .select("*")
    .eq("post_id", postId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(2)
  return data || []
}

async function getShareCount(postId: string) {
  const supabase = await createClient()
  const { count } = await supabase
    .from("blog_shares")
    .select("*", { count: "exact" })
    .eq("post_id", postId)
  return count || 0
}

// Main Blog Page
export default async function BlogPage() {
  const posts = await getPosts()
  const featuredPost = posts[0]
  const otherPosts = posts.slice(1)

  // Get comments and counts for featured post
  let featuredComments: any[] = []
  let featuredShareCount = 0
  let featuredLikeCount = 0
  if (featuredPost) {
    featuredComments = await getComments(featuredPost.id)
    featuredShareCount = await getShareCount(featuredPost.id)
    // Like count would be set to 0 or fetched from database
    featuredLikeCount = 0
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white border-b border-slate-200 py-8 md:py-10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <p className="text-sm font-semibold text-emerald-700 tracking-wide uppercase mb-2 flex items-center gap-2">
                <span className="w-6 h-px bg-emerald-700"></span>
                INTERACTIVE UPDATES
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Latest News & Updates
              </h1>
              <p className="text-base text-slate-600">
                Stay connected with market notes, product updates, and announcements from Swopify
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300 group">
                  {/* Post Header */}
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                        S
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">Swopify Team</p>
                        <p className="text-xs text-slate-500">
                          {new Date(featuredPost.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 py-3">
                    <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {featuredPost.title}
                    </h2>
                    <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  {/* Post Image */}
                  {featuredPost.cover_image && (
                    <div className="relative w-full h-64 bg-slate-200 overflow-hidden">
                      <img
                        src={featuredPost.cover_image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <span>👍 {featuredLikeCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {featuredComments.length} comments
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        {featuredShareCount} shares
                      </span>
                    </div>
                  </div>

                  {/* Comments Section - Inside the Card */}
                  <div className="px-4 py-4 border-t border-slate-200">
                    <CommentsSection postId={featuredPost.id} initialComments={featuredComments} sharePostId={featuredPost.id} initialShares={featuredShareCount} isCompact={true} />
                  </div>
                </div>
              </div>
            )}

            {/* Other Posts */}
            {otherPosts.length > 0 && (
              <div className="space-y-4">
                {otherPosts.map((post: any) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300 group">
                    {/* Post Header */}
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                          S
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Swopify Team</p>
                          <p className="text-xs text-slate-500">
                            {new Date(post.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>

                    {/* Post Content */}
                    <div className="px-4 py-3">
                      <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Post Image */}
                    {post.cover_image && (
                      <div className="relative w-full h-48 bg-slate-200 overflow-hidden">
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}

                    {/* Post Stats */}
                    <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
                      <span>👍 0</span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          0 comments
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3 h-3" />
                          0 shares
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {posts.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 text-center py-16">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-slate-900 mb-1">No posts yet</h2>
                <p className="text-sm text-slate-600">Check back soon for updates</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
