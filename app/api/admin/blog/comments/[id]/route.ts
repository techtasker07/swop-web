import { NextResponse } from "next/server"

function adminOnly(request: Request) {
  const expected = process.env.ADMIN_ACCESS_TOKEN
  return expected && request.headers.get("x-admin-token") === expected ? null : NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = adminOnly(request); if (denied) return denied
  const { is_active } = await request.json(); const { id } = await params
  const { createClient } = await import("@/lib/supabase/server"); const supabase = await createClient()
  const { data, error } = await supabase.from("blog_comments").update({ is_active: Boolean(is_active) }).eq("id", id).select("*").single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = adminOnly(request); if (denied) return denied
  const { id } = await params; const { createClient } = await import("@/lib/supabase/server"); const supabase = await createClient()
  const { error } = await supabase.from("blog_comments").update({ is_active: false, content: "[Comment removed by admin]" }).eq("id", id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
