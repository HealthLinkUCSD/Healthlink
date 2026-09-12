import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * POST /api/events/check-in-kiosk
 * Body: { eventId: string, accessCode: string, email: string, name?: string }
 * Pure Supabase version: validates access code against Supabase events table
 * and records attendance in a Supabase table (attendances).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid check-in details." }, { status: 400 });
    }
    const { eventId, accessCode, email, name } = body;

    if (typeof eventId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId) || (accessCode != null && (typeof accessCode !== "string" || accessCode.length > 128))) {
      return NextResponse.json(
        { error: "eventId and accessCode are required" },
        { status: 400 },
      );
    }
    if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@ucsd\.edu$/i.test(email.trim()) ||
        typeof name !== "string" || !name.trim() || name.trim().length > 120) {
      return NextResponse.json({ error: "Enter your name and a valid UCSD email address." }, { status: 400 });
    }

    // Verify event and code
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("id, checkin_code, checkin_opens_at, checkin_closes_at")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const now = Date.now();
    if (!event.checkin_opens_at || !event.checkin_closes_at ||
        !Number.isFinite(Date.parse(event.checkin_opens_at)) || !Number.isFinite(Date.parse(event.checkin_closes_at)) ||
        now < new Date(event.checkin_opens_at).getTime() ||
        now >= new Date(event.checkin_closes_at).getTime()) {
      return NextResponse.json({ error: "Check-in is not open for this event." }, { status: 403 });
    }
    if (event.checkin_code && event.checkin_code !== accessCode?.trim()) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Insert attendance into Supabase table
    const { error: insertError } = await supabaseAdmin.from("attendances").insert({
      event_id: eventId,
      email: normalizedEmail,
      name: name.trim(),
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { message: "Already checked in", attended: true },
          { status: 200 },
        );
      }
      return NextResponse.json(
        { error: "Attendance could not be saved. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Check-in successful" }, { status: 201 });
  } catch (error: unknown) {
    console.error("Kiosk check-in error:", error);
    return NextResponse.json(
      { error: "Check-in is temporarily unavailable. Please try again." },
      { status: 500 },
    );
  }
}
