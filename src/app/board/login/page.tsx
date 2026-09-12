"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function BoardLogin() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.has("error")) setMessage("This sign-in link is invalid or expired. Request a new link.");
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => subscription.unsubscribe();
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const site = process.env.NEXT_PUBLIC_SITE_URL || "https://healthlink-nine.vercel.app";
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: false, emailRedirectTo: `${site}/join` } });
      setMessage(error ? error.message : "Check your inbox for the board sign-in link.");
    } catch {
      setMessage("Unable to request a link. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return <main className="min-h-screen bg-[#071225] px-6 py-32 text-white"><section className="mx-auto max-w-lg space-y-6 rounded-3xl border border-blue-400/30 p-8">
    <h1 className="text-3xl font-bold">Board access</h1>
    <p>Students do not need an account. This sign-in is only for authorized board analytics.</p>
    {signedIn ? <Link className="block text-blue-300 underline" href="/analytics">Open board analytics</Link> : <form className="space-y-4" onSubmit={submit}>
      <label htmlFor="email" className="block">Board email</label>
      <input id="email" required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-white/20 bg-slate-950 p-3" />
      <button disabled={busy} className="rounded-xl bg-blue-500 px-5 py-3 disabled:opacity-50">{busy ? "Sending..." : "Send board sign-in link"}</button>
    </form>}
    <p role="status">{message}</p>
    <Link href="/checkin" className="block text-blue-300 underline">Student event check-in</Link>
  </section></main>;
}
