import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user?.email) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  const result = await supabaseAdmin.from("attendances").select("event_id").eq("email", user.email.toLowerCase());
  if (result.error) return NextResponse.json({ error: "Unable to load attendance" }, { status: 500 });
  return NextResponse.json({ eventIds: result.data.map(row => row.event_id) }, { headers: { "Cache-Control": "no-store" } });
}
