"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { getAccessTokenHeaders } from "@/lib/authHeaders";

type Attendee = {
  email: string;
  name: string;
  count: number;
  isMember: boolean;
};

export default function AnalyticsPage() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAccessTokenHeaders(async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        return session?.access_token ?? null;
      });

      const res = await fetch("/api/analytics/attendees", { headers });
      const payload = (await res.json()) as { attendees?: Attendee[]; error?: string };

      if (!res.ok) {
        throw new Error(payload.error || "Failed to load analytics");
      }

      setAttendees(payload.attendees ?? []);
    } catch (err) {
      setAttendees([]);
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSessionEmail(session?.user.email?.toLowerCase() ?? null);
      setCheckingSession(false);

      if (session) {
        await loadAnalytics();
      }
    };

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email?.toLowerCase() ?? null);
      if (!session) {
        setAttendees([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAttendees([]);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#08111f] via-[#0d1c31] to-[#173457] text-white px-6 py-24">
      <section className="mx-auto w-full max-w-4xl rounded-3xl border border-blue-500/30 bg-white/5 p-8 shadow-2xl shadow-blue-900/40">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <Link href="/" className="text-3xl font-extrabold hover:text-blue-300 transition">
              HealthLink Analytics
            </Link>
            <p className="mt-2 text-sm uppercase tracking-[0.22em] text-blue-200">
              Board Access Only
            </p>
          </div>
          {sessionEmail && (
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 transition"
            >
              Sign out
            </button>
          )}
        </div>

        {checkingSession ? (
          <p className="text-neutral-300">Checking session...</p>
        ) : !sessionEmail ? (
          <div className="max-w-xl space-y-4">
            <p className="text-neutral-200">
              Sign in with your HealthLink board account to view analytics.
            </p>
            <Link
              href="/join?next=/analytics"
              className="inline-flex rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:scale-[1.01]"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-blue-100">
              Signed in as <span className="font-semibold">{sessionEmail}</span>
            </p>
            {loading ? <p className="text-neutral-300">Loading analytics...</p> : null}
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            {attendees.length === 0 ? (
              !loading && !error ? (
                <p className="text-neutral-300">No attendance records found yet.</p>
              ) : null
            ) : (
              <div className="overflow-hidden rounded-2xl border border-blue-400/25">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/30 text-blue-100">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Attendee</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Events Attended</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((attendee) => (
                      <tr key={attendee.email} className="border-t border-white/10 bg-white/[0.03]">
                        <td className="px-4 py-3 font-medium text-white">{attendee.name}</td>
                        <td className="px-4 py-3 text-neutral-300">{attendee.email}</td>
                        <td className="px-4 py-3 text-white">{attendee.count}</td>
                        <td className="px-4 py-3">
                          {attendee.isMember ? (
                            <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                              Member
                            </span>
                          ) : (
                            <span className="text-neutral-300">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
