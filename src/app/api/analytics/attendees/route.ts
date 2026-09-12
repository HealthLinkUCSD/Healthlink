import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getBoardEmails, isBoardEmail } from "@/lib/boardAccess";

type AttendanceRow = {
  email: string | null;
  name: string | null;
};

const MEMBER_THRESHOLD = 2;

export async function GET(req: Request) {
  try {
    const authorization = req.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : null;

    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const requesterEmail = user.email?.trim().toLowerCase() ?? null;
    const boardEmails = getBoardEmails();

    if (boardEmails.length === 0) {
      return NextResponse.json(
        { error: "BOARD_MEMBER_EMAILS is not configured" },
        { status: 500 },
      );
    }

    if (!isBoardEmail(requesterEmail)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Supabase caps individual responses; paginate so totals include every attendee.
    const data: AttendanceRow[] = [];
    for (let offset = 0; ; offset += 1000) {
      const { data: page, error } = await supabaseAdmin
        .from("attendances")
        .select("email, name")
        .not("email", "is", null)
        .order("id")
        .range(offset, offset + 999);
      if (error) {
        return NextResponse.json({ error: "Failed to fetch attendees" }, { status: 500 });
      }
      data.push(...(page ?? []));
      if (!page || page.length < 1000) break;
    }

    const grouped = new Map<string, { email: string; name: string; count: number }>();

    for (const row of (data ?? []) as AttendanceRow[]) {
      if (!row.email) continue;
      const normalizedEmail = row.email.trim().toLowerCase();
      if (!normalizedEmail) continue;

      const existing = grouped.get(normalizedEmail);
      if (existing) {
        existing.count += 1;
        if (!existing.name && row.name?.trim()) {
          existing.name = row.name.trim();
        }
      } else {
        grouped.set(normalizedEmail, {
          email: normalizedEmail,
          name: row.name?.trim() || normalizedEmail.split("@")[0],
          count: 1,
        });
      }
    }

    const attendees = Array.from(grouped.values())
      .map((attendee) => ({
        ...attendee,
        isMember: attendee.count >= MEMBER_THRESHOLD,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return NextResponse.json({ attendees });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch analytics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
