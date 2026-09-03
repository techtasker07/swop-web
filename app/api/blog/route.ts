import { NextResponse } from "next/server";

export async function GET() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_posts").select("id,title,slug,excerpt,cover_image,author_name,created_at").eq("is_published", true).eq("is_active", true).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: data ?? [] });
}
