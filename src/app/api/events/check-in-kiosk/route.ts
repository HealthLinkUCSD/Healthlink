import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type AuthenticatedUserMetadata = {
  full_name?: string;
  name?: string;
};

/**
 * POST /api/events/check-in-kiosk
 * Body: { eventId: string, accessCode: string, email: string, name?: string }
 * Pure Supabase version: validates access code against Supabase events table
 * and records attendance in a Supabase table (attendances).
 */
export async function POST(req: Request) {
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

    if (userError || !user?.email) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { eventId, accessCode } = await req.json();

    if (!eventId || !accessCode) {
      return NextResponse.json(
        { error: "eventId and accessCode are required" },
        { status: 400 },
      );
    }

    // Verify event and code
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("id, checkin_code")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.checkin_code !== accessCode) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
    }

    const normalizedEmail = user.email.trim().toLowerCase();
    const metadata = (user.user_metadata ?? {}) as AuthenticatedUserMetadata;
    const displayName =
      metadata.full_name ||
      metadata.name ||
      user.email.split("@")[0] ||
      null;

    // Insert attendance into Supabase table
    const { error: insertError } = await supabaseAdmin.from("attendances").insert({
      event_id: eventId,
      email: normalizedEmail,
      name: typeof displayName === "string" ? displayName.trim() : null,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "You already checked in for this event" },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: insertError.message || "Failed to check in" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Check-in successful" }, { status: 201 });
  } catch (error: unknown) {
    console.error("Kiosk check-in error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check in" },
      { status: 500 },
    );
  }
}
