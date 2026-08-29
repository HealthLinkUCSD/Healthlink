"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const DEFAULT_NEXT_PATH = "/checkin";

type MemberRecord = {
  created_at: string;
  email: string;
  full_name: string;
};

export default function JoinPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [memberRecord, setMemberRecord] = useState<MemberRecord | null>(null);
  const [checkingMembership, setCheckingMembership] = useState(true);
  const [nextPath] = useState(() => {
    if (typeof window === "undefined") {
      return DEFAULT_NEXT_PATH;
    }

    const requested = new URLSearchParams(window.location.search).get("next");
    return requested?.startsWith("/") ? requested : DEFAULT_NEXT_PATH;
  });

  useEffect(() => {
    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSessionEmail(session?.user.email ?? null);

      if (!session?.user.id) {
        setMemberRecord(null);
        setCheckingMembership(false);
        return;
      }

      const { data: member } = await supabase
        .from("members")
        .select("created_at, email, full_name")
        .eq("id", session.user.id)
        .maybeSingle();

      setMemberRecord(member);
      setCheckingMembership(false);
    };

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSessionEmail(session?.user.email ?? null);

      if (!session?.user.id) {
        setMemberRecord(null);
        setCheckingMembership(false);
        return;
      }

      setCheckingMembership(true);

      const { data: member } = await supabase
        .from("members")
        .select("created_at, email, full_name")
        .eq("id", session.user.id)
        .maybeSingle();

      setMemberRecord(member);
      setCheckingMembership(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSendLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith("@ucsd.edu")) {
      setError("Use your UCSD email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/join?next=${encodeURIComponent(nextPath)}`,
      },
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      setStatus("Magic link sent. Open it from your UCSD inbox to finish joining.");
    }

    setLoading(false);
  };

  const handleContinue = () => {
    router.push(nextPath);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setStatus(null);
    setError(null);
    setMemberRecord(null);
    setCheckingMembership(false);
  };

  const joinedOn = memberRecord?.created_at
    ? new Date(memberRecord.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#071225] via-[#0a1b35] to-[#102647] px-6 py-24 text-white">
      <section className="mx-auto w-full max-w-xl rounded-3xl border border-blue-500/30 bg-white/5 p-8 shadow-2xl shadow-blue-900/40">
        <p className="text-sm uppercase tracking-[0.24em] text-blue-300">Join HealthLink</p>
        <h1 className="mt-3 text-4xl font-extrabold">Member login</h1>
        <p className="mt-3 text-neutral-300">
          Public pages stay open. Sign in only when you want to join HealthLink or check into an
          event.
        </p>

        {!sessionEmail ? (
          <form onSubmit={handleSendLink} className="mt-8 space-y-4">
            <label htmlFor="email" className="block text-sm text-neutral-200">
              UCSD email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@ucsd.edu"
              className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? "Sending link..." : "Send magic link"}
            </button>
          </form>
        ) : checkingMembership ? (
          <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-5">
            <p className="text-sm text-neutral-200">Finishing your membership...</p>
          </div>
        ) : (
          <div className="mt-8 space-y-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Membership active</p>
            <h2 className="text-2xl font-bold text-white">You&apos;re in HealthLink</h2>
            <p className="text-sm text-emerald-100">
              Signed in as <span className="font-semibold">{sessionEmail}</span>
            </p>
            {memberRecord ? (
              <div className="rounded-xl border border-emerald-300/20 bg-black/15 p-4 text-sm text-neutral-100">
                <p>
                  Member email: <span className="font-semibold">{memberRecord.email}</span>
                </p>
                {memberRecord.full_name ? (
                  <p className="mt-1">
                    Name on file: <span className="font-semibold">{memberRecord.full_name}</span>
                  </p>
                ) : null}
                {joinedOn ? (
                  <p className="mt-1">
                    Joined on: <span className="font-semibold">{joinedOn}</span>
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-yellow-100">
                Your login worked, but your membership record is still missing.
              </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleContinue}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:scale-[1.01]"
              >
                Continue to member tools
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl border border-white/20 px-5 py-3 font-semibold text-white/85 transition hover:bg-white/10"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-white/10 pt-6 text-sm text-neutral-300">
          Need to browse first? <Link href="/" className="text-blue-300 hover:text-blue-200">Go back to the public site</Link>.
        </div>
      </section>
    </main>
  );
}
