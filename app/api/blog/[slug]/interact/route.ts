import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const form = await request.formData()
  const type = String(form.get("type") || "")
  const slug = String(form.get("slug") || params.slug)
  const userId = String(form.get("user_id") || "anonymous")

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  const { data: post } = await supabase.from("blog_posts").select("id").eq("slug", slug).eq("is_published", true).eq("is_active", true).single()
  if (!post) return NextResponse.redirect(new URL("/blog", request.url))

  if (type === "like") {
    await supabase.from("blog_likes").upsert({ post_id: post.id, user_id: userId }, { onConflict: "post_id,user_id" })
  } else if (type === "share") {
    await supabase.from("blog_shares").insert({ post_id: post.id, platform: "native", user_id: userId })
  } else if (type === "comment") {
    const content = String(form.get("content") || "")
    const userName = String(form.get("user_name") || "Anonymous")
    if (content.trim()) await supabase.from("blog_comments").insert({ post_id: post.id, user_id: userId, user_name: userName, content, is_active: true })
  }

  return NextResponse.redirect(new URL(`/blog/${slug}`, request.url))
}
