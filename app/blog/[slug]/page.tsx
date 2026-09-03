import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { BlogPostInteractions } from "@/components/blog/blog-post-interactions"
import { sanitizeBlogHtml } from "@/lib/blog-content"

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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Link href="/blog" className="text-blue-600 underline">Back to Blog</Link>
      </div>
    )
  }
  return (
    <div className="container mx-auto px-4 py-10">
      <Link href="/blog" className="text-blue-600 underline mb-4 inline-block">Back to Blog</Link>
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-500 text-sm mb-4">{new Date(post.created_at).toLocaleDateString()} by {post.author_name || "Swopify Team"}</p>
      {post.cover_image && <img src={post.cover_image} alt="" className="mb-6 max-h-[28rem] w-full rounded-xl object-cover" />}
      <div className="blog-content max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(post.content) }} />
      <BlogPostInteractions slug={post.slug} initialLikes={post.likes} initialShares={post.shares} initialComments={post.comments} />
    </div>
  )
}
