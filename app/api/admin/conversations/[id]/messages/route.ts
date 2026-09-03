import { NextResponse } from "next/server";

function adminOnly(req: Request) {
  const token = req.headers.get("x-admin-token");
  const expected = process.env.ADMIN_ACCESS_TOKEN;
  if (!expected || token !== expected) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = adminOnly(request);
  if (err) return err;
  const body = await request.json();
  const { id } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase.from("messages").insert({
    conversation_id: id,
    sender_id: "admin-system",
    content: `[Admin] ${body.content}`,
    is_read: false
  }).select("*").single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", id);
  return NextResponse.json({ success: true, data }, { status: 201 });
}
