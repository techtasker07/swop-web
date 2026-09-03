import { NextResponse } from "next/server";

async function counts(supabase: any, postId: string) {
  const [{ count: likes }, { count: comments }, { count: shares }] = await Promise.all([
    supabase.from("blog_likes").select("*", { count: "exact", head: true }).eq("post_id", postId),
    supabase.from("blog_comments").select("*", { count: "exact", head: true }).eq("post_id", postId).eq("is_active", true),
    supabase.from("blog_shares").select("*", { count: "exact", head: true }).eq("post_id", postId)
  ]);
  return { likes: likes ?? 0, comments: comments ?? 0, shares: shares ?? 0 };
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("is_published", true).eq("is_active", true).single();
  if (error) return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
  const c = await counts(supabase, data.id);
  const { data: comments } = await supabase.from("blog_comments").select("*").eq("post_id", data.id).eq("is_active", true).order("created_at", { ascending: false });
  return NextResponse.json({ success: true, data: { ...data, ...c, comments: comments ?? [] } });
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const body = await request.json();
  if (!body || !["like", "comment", "share"].includes(body.type)) return NextResponse.json({ success: false, error: "Invalid interaction" }, { status: 400 });
  const { slug } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: post } = await supabase.from("blog_posts").select("id").eq("slug", slug).eq("is_published", true).eq("is_active", true).single();
  if (!post) return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });

  const userId = body.user_id || "anonymous";
  if (body.type === "like") {
    const { error } = await supabase.from("blog_likes").upsert({ post_id: post.id, user_id: userId }, { onConflict: "post_id,user_id" });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  }
  if (body.type === "comment") {
    if (typeof body.content !== "string" || body.content.trim().length < 1 || body.content.length > 2000) return NextResponse.json({ success: false, error: "Comment must be between 1 and 2,000 characters" }, { status: 400 });
    const { data, error } = await supabase.from("blog_comments").insert({ post_id: post.id, user_id: userId, user_name: body.user_name || "Anonymous", content: body.content, is_active: true }).select("*").single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, data }, { status: 201 });
  }
  if (body.type === "share") {
    const { error } = await supabase.from("blog_shares").insert({ post_id: post.id, platform: body.platform || "copy", user_id: userId });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
}
