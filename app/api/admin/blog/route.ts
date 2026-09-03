import { NextResponse } from "next/server";

function adminOnly(req: Request) {
  const token = req.headers.get("x-admin-token");
  const expected = process.env.ADMIN_ACCESS_TOKEN;
  if (!expected || token !== expected) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(request: Request) {
  const err = adminOnly(request);
  if (err) return err;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(request: Request) {
  const err = adminOnly(request);
  if (err) return err;
  const body = await request.json();
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_posts").insert({
    title: body.title,
    slug: body.slug,
    content: body.content,
    excerpt: body.excerpt,
    cover_image: body.cover_image,
    author_name: body.author_name || "Swopify Team",
    is_published: !!body.is_published,
    is_active: body.is_active ?? true
  }).select("*").single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data }, { status: 201 });
}
