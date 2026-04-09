"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Event = {
  id: string;
  title: string;
  date: string;
  location?: string | null;
  accessCode?: string | null;
};

export default function CheckInPage() {
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);
  const [checkinSuccess, setCheckinSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setEventLoading(true);
      setEventError(null);

      try {
        const res = await fetch("/api/events/upcoming");
        if (!res.ok) throw new Error("Failed to load event");
        const events = (await res.json()) as any[];

        if (!events || events.length === 0) {
          setActiveEvent(null);
        } else {
          const evt = events[0];
          setActiveEvent({
            id: evt.id,
            title: evt.title || "Event",
            date: evt.checkinOpensAt || evt.date || evt.createdAt,
            location: evt.location ?? null,
            accessCode: evt.checkinCode ?? null,
          });
        }
      } catch (err) {
        setEventError((err as Error).message);
        setActiveEvent(null);
      }

      setEventLoading(false);
    };

    fetchEvent();
  }, []);

  const handleCheckIn = async () => {
    if (!activeEvent) {
      setCheckinError("No active event found.");
      return;
    }
    setCheckinLoading(true);
    setCheckinError(null);
    setCheckinSuccess(null);

    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();

    if (!trimmedEmail || !trimmedCode) {
      setCheckinError("Email and access code are required.");
      setCheckinLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/events/check-in-kiosk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: activeEvent.id,
          accessCode: trimmedCode,
          email: trimmedEmail,
          name: name.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || "Check-in failed");
      }

      setCheckinSuccess("You're checked in!");
      setCode("");
    } catch (err) {
      setCheckinError((err as Error).message);
    } finally {
      setCheckinLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#071225] via-[#0a1b35] to-[#102647] text-white flex items-center justify-center px-6">
      <section className="w-full max-w-md bg-white/5 border border-blue-500/30 rounded-3xl shadow-2xl shadow-blue-900/40 p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block mb-2">
            <h1 className="text-3xl font-extrabold text-white hover:text-blue-300 transition">
              HealthLink Check-In
            </h1>
          </Link>
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Event Access</p>
        </div>

        {eventLoading ? (
          <p className="text-neutral-300 text-center">Loading event...</p>
        ) : eventError ? (
          <p className="text-red-400 text-center">{eventError}</p>
        ) : !activeEvent ? (
          <p className="text-neutral-300 text-center">
            No active events right now. Please check back later.
          </p>
        ) : (
          <>
            <div className="bg-white/5 border border-blue-500/30 rounded-2xl p-4 space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Active Event</p>
              <h2 className="text-2xl font-bold text-white">{activeEvent.title}</h2>
              <p className="text-sm text-neutral-200">
                {new Date(activeEvent.date).toLocaleString()}
              </p>
              {activeEvent.location && (
                <p className="text-sm text-neutral-300">{activeEvent.location}</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm text-neutral-300">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-neutral-300">Your Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@ucsd.edu"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-neutral-300">Access Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter access code"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>

              {checkinError && (
                <p className="text-xs text-red-400 text-center">{checkinError}</p>
              )}
              {checkinSuccess && (
                <p className="text-xs text-green-300 text-center">{checkinSuccess}</p>
              )}

              <button
                type="button"
                onClick={handleCheckIn}
                disabled={checkinLoading || !activeEvent}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-900/40 hover:shadow-xl hover:shadow-blue-900/60 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {checkinLoading ? "Checking in..." : activeEvent ? "Check In" : "No active event"}
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
