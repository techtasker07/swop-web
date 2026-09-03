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
  const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 404 });
  return NextResponse.json({ success: true, data });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = adminOnly(request);
  if (err) return err;
  const body = await request.json();
  const { id } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const patch: Record<string, any> = { updated_at: new Date().toISOString() };
  const fields = ["title", "slug", "content", "excerpt", "cover_image", "author_name", "is_published", "is_active"];
  for (const f of fields) if (f in body) patch[f] = body[f];
  const { data, error } = await supabase.from("blog_posts").update(patch).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  return PATCH(request, context)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = adminOnly(request);
  if (err) return err;
  const { id } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
