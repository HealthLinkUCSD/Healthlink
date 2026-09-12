import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * GET /api/events/upcoming
 * Returns events that are upcoming or still open (based on checkin_closes_at / checkin_opens_at)
 */
export async function GET() {
  try {
    const nowIso = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("events")
      .select(
        "id, title, description, location, checkin_opens_at, checkin_closes_at, created_at",
      )
      .or(`checkin_closes_at.gte.${nowIso},checkin_opens_at.gte.${nowIso}`)
      .order("checkin_opens_at", { ascending: true });

    if (error) throw error;

    const normalized =
      data?.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        checkinOpensAt: event.checkin_opens_at,
        checkinClosesAt: event.checkin_closes_at,
        createdAt: event.created_at ?? null,
      })) ?? [];

    return NextResponse.json(normalized);
  } catch (error: unknown) {
    console.error("Upcoming events fetch failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch events" },
      { status: 500 },
    );
  }
}
