import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

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

export default async function BlogPage() {
  const posts = await getPosts()
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Swopify Blog</h1>
      <div className="grid gap-4">
        {posts.map((post: any) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="block p-4 rounded-lg border hover:shadow-sm">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-600 mt-1">{post.excerpt}</p>
            <p className="text-sm text-gray-400 mt-2">{new Date(post.created_at).toLocaleDateString()}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
