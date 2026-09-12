"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMemberSession } from "@/lib/memberSession";

type ClubEvent = { id: string; title: string; description: string | null; location: string | null; checkinOpensAt: string | null; checkinClosesAt: string | null };
const dateLabel = (value: string | null) => value ? new Date(value).toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) + " PT" : "Time to be announced";
function calendar(event: ClubEvent) {
  if (!event.checkinOpensAt || !event.checkinClosesAt) return null;
  const stamp = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(".000", "");
  return "https://calendar.google.com/calendar/render?" + new URLSearchParams({ action: "TEMPLATE", text: event.title, dates: stamp(event.checkinOpensAt) + "/" + stamp(event.checkinClosesAt), details: event.description || "", location: event.location || "" });
}
export default function EventExperience({ checkin = false }: { checkin?: boolean }) {
  const { session, ready } = useMemberSession();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [attendanceError, setAttendanceError] = useState("");
  const [attended, setAttended] = useState<string[]>([]);
  const [attendanceReady, setAttendanceReady] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(0);
  const [confirmation, setConfirmation] = useState("");
  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get("event"));
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30000);
    fetch("/api/events/all").then(async res => {
      if (!res.ok) throw new Error("Events could not be loaded. Please refresh.");
      setEvents(await res.json());
    }).catch(err => setError(err.message)).finally(() => setLoaded(true));
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    let active = true;
    setAttendanceReady(false);
    setAttended([]);
    if (!session) return;
    fetch("/api/events/attendance", { headers: { Authorization: "Bearer " + session.access_token } }).then(async res => {
      if (!res.ok) throw new Error("Attendance could not be loaded. Please refresh before checking in.");
      const data = await res.json();
      if (active) { setAttended(data.eventIds); setAttendanceReady(true); setAttendanceError(""); }
    }).catch(err => { if (active) setAttendanceError(err.message); });
    return () => { active = false; };
  }, [session]);
  const open = (event: ClubEvent) => Boolean(event.checkinOpensAt && event.checkinClosesAt && now >= Date.parse(event.checkinOpensAt) && now < Date.parse(event.checkinClosesAt));
  const past = (event: ClubEvent) => Boolean(event.checkinClosesAt && now >= Date.parse(event.checkinClosesAt));
  const sorted = [...events].sort((a, b) => (Date.parse(a.checkinOpensAt || "") || Infinity) - (Date.parse(b.checkinOpensAt || "") || Infinity));
  const selected = events.find(event => event.id === id);
  const upcoming = sorted.filter(event => !past(event));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!session || !selected) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/events/check-in-kiosk", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token }, body: JSON.stringify({ eventId: selected.id, accessCode: code }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Please try again.");
      setAttended(current => [...current, selected.id]);
      setConfirmation("Confirmed at " + new Date().toLocaleTimeString());
      setCode("");
    } catch (err) { setError(err instanceof Error ? err.message : "Check-in failed."); }
    finally { setBusy(false); }
  }
  const action = "inline-block rounded-xl bg-blue-500 px-5 py-3 font-semibold hover:bg-blue-400 transition";
  function card(event: ClubEvent, featured = false) {
    return <article key={event.id} className={"rounded-3xl border p-6 sm:p-8 " + (featured ? "border-blue-400/40 bg-gradient-to-br from-blue-500/20 to-transparent" : "border-white/10 bg-white/5")}>
      <p className="text-xs uppercase tracking-[0.18em] text-blue-200">{attended.includes(event.id) ? "Attended" : open(event) ? "Check-in open" : past(event) ? "Past event" : featured ? "Next up" : "Upcoming"}</p>
      <h2 className="mt-4 text-3xl font-bold">{event.title}</h2>
      <p className="mt-3 text-blue-100">{dateLabel(event.checkinOpensAt)}</p>
      <p className="mt-1 text-slate-300">{event.location || "Location to be announced"}</p>
      <p className="my-6 max-w-2xl text-slate-300">{event.description || "Come connect with the HealthLink community."}</p>
      <Link className={action} href={"/checkin?event=" + encodeURIComponent(event.id)}>{attended.includes(event.id) ? "View attendance" : open(event) ? "Check in" : "View event"}</Link>
      {!past(event) && calendar(event) && <a className="ml-4 inline-block py-3 text-blue-200 underline" href={calendar(event)!} target="_blank" rel="noreferrer">Add to Google Calendar</a>}
    </article>;
  }
  return <main className="min-h-screen bg-gradient-to-b from-[#071225] via-[#0a1b35] to-[#102647] px-5 py-32 text-white">
    <div className="mx-auto max-w-5xl">
      <p className="text-xs uppercase tracking-[0.25em] text-blue-300">HealthLink UCSD / Community</p>
      <h1 className="mt-5 text-4xl sm:text-6xl font-bold">{checkin && id ? "See you there." : "Make room for connection."}</h1>
      <p className="mt-5 mb-10 max-w-xl text-lg text-slate-300">{checkin ? "Choose your event and check in when you arrive." : "Workshops, conversations, and build nights. Find your next HealthLink event."}</p>
      {error && <p role="alert" className="my-5 text-red-300">{error}</p>}
      {!loaded ? <p role="status">Loading events...</p> : checkin && id ? selected ? <div className="space-y-6">
        {card(selected)}
        <section className="rounded-3xl border border-white/15 bg-slate-950/40 p-6 sm:p-8">
          {attended.includes(id) ? <div role="status"><h2 className="text-2xl font-bold text-emerald-300">You are checked in to {selected.title}.</h2><p className="mt-3">{confirmation || "Your attendance has been recorded."}</p></div> : !ready ? <p>Checking login...</p> : !open(selected) ? <p>{past(selected) ? "Check-in has closed." : "Check-in opens " + dateLabel(selected.checkinOpensAt) + "."}</p> : !session ? <><p className="mb-5">Log in to record your attendance. We will bring you back to this event.</p><Link className={action} href={"/join?next=" + encodeURIComponent("/checkin?event=" + id)}>Log in to check in</Link></> : !attendanceReady ? <p role="status">{attendanceError || "Checking attendance..."}</p> : <form onSubmit={submit} className="max-w-md space-y-4">
            <h2 className="text-2xl font-bold">Check in</h2>
            <p className="text-slate-300">Checking in as {session.user.email}</p>
            <label htmlFor="code" className="block">Event code <span className="text-slate-400">(if provided by the board)</span></label>
            <input id="code" value={code} onChange={e => setCode(e.target.value)} className="w-full rounded-xl border border-white/20 bg-slate-950 px-4 py-3" autoComplete="off" />
            <button disabled={busy} className={action + " disabled:opacity-50"}>{busy ? "Recording..." : "Check in to this event"}</button>
          </form>}
        </section><Link className="inline-block text-blue-200 underline" href="/events">All events</Link>
      </div> : <p>Event not found. <Link href="/events" className="underline">Browse events</Link></p> : <>
        {upcoming.length ? <div className="space-y-6">{card(upcoming[0], true)}<div className="grid gap-6 md:grid-cols-2">{upcoming.slice(1).map(event => card(event))}</div></div> : <p className="rounded-3xl border border-white/10 p-8">New events are on the way. Check back soon.</p>}
        {sorted.some(past) && <><h2 className="mt-14 mb-6 text-2xl font-bold">Past events</h2><div className="grid gap-6 md:grid-cols-2">{sorted.filter(past).reverse().map(event => card(event))}</div></>}
      </>}
    </div>
  </main>;
}

