import { NextResponse } from "next/server";

function adminOnly(req: Request) {
  const token = req.headers.get("x-admin-token");
  const expected = process.env.ADMIN_ACCESS_TOKEN;
  if (!expected || token !== expected) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = adminOnly(request);
  if (err) return err;
  const { id } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_comments").select("*").eq("post_id", id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = adminOnly(request);
  if (err) return err;
  const body = await request.json();
  const { id } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_comments").insert({
    post_id: id,
    user_id: body.user_id || "admin",
    user_name: body.user_name || "Admin",
    content: body.content,
    is_active: true
  }).select("*").single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data }, { status: 201 });
}
