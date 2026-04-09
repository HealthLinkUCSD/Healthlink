/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  checkinOpensAt: string | null;
  checkinClosesAt: string | null;
};

const PACIFIC_TZ = "America/Los_Angeles";

const formatDateLabel = (dateString: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: PACIFIC_TZ,
  }).format(new Date(dateString));

type CalendarDay = {
  label: number | null;
  dateKey: string | null;
  isCurrentMonth: boolean;
  hasEvent: boolean;
};

const buildCalendarDays = (
  year: number,
  month: number,
  eventDates: Set<string>,
): CalendarDay[] => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - firstDay + 1;
    const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
    const dateKey = isCurrentMonth
      ? `${year}-${String(month + 1).padStart(2, "0")}-${String(
          dayNumber,
        ).padStart(2, "0")}`
      : null;

    return {
      label: isCurrentMonth ? dayNumber : null,
      dateKey,
      isCurrentMonth,
      hasEvent: Boolean(dateKey && eventDates.has(dateKey)),
    };
  });
};

type CalendarEvent = Event & { dateKey: string; startDate: Date | null; endDate: Date | null; timeLabel?: string };

const toPacificDateKey = (dateInput: string | Date | null) => {
  if (!dateInput) return null;
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
};

const formatPacificTimeRange = (start: Date | null, end: Date | null) => {
  if (!start) return "";
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TZ,
    hour: "numeric",
    minute: "2-digit",
  });
  const startLabel = fmt.format(start);
  const endLabel = end ? fmt.format(end) : null;
  return endLabel ? `${startLabel} – ${endLabel}` : startLabel;
};

const UpcomingCalendar = ({ eventsData }: { eventsData: CalendarEvent[] }) => {
  const [viewDate, setViewDate] = useState(() => {
    if (eventsData.length === 0) return new Date();
    const earliest = new Date(
      Math.min(
        ...eventsData.map((event) =>
          (event.startDate ?? new Date(`${event.dateKey}T00:00:00`)).getTime(),
        ),
      ),
    );
    return new Date(earliest.getFullYear(), earliest.getMonth(), 1);
  });

  const goMonth = (delta: number) => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const eventDates = new Set(eventsData.map((event) => event.dateKey));
  const eventsByDate = eventsData.reduce<Record<string, CalendarEvent[]>>(
    (acc, event) => {
      acc[event.dateKey] = acc[event.dateKey] || [];
      acc[event.dateKey].push(event);
      return acc;
    },
    {},
  );
  const days = buildCalendarDays(viewYear, viewMonth, eventDates);
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: PACIFIC_TZ,
  }).format(viewDate);

  return (
    <div className="bg-neutral-900/50 border border-blue-500/30 rounded-3xl p-8 shadow-2xl shadow-blue-900/30">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <p className="text-blue-300 uppercase tracking-[0.2em] text-xs">
            Calendar
          </p>
          <div className="flex items-center gap-3">
            <button
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:border-blue-400/60 transition"
              onClick={() => goMonth(-1)}
              aria-label="Previous month"
            >
              ←
            </button>
            <h3 className="text-3xl font-extrabold">{monthLabel}</h3>
            <button
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:border-blue-400/60 transition"
              onClick={() => goMonth(1)}
              aria-label="Next month"
            >
              →
            </button>
          </div>
          <p className="text-neutral-300">
            All HealthLink workshops, mentor hours, and build nights at a glance.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-300">
          <span className="inline-flex h-3 w-3 rounded-full bg-blue-400" />
          Event day
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm text-neutral-300 mb-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2 font-semibold text-blue-100/90">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`min-h-28 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm flex flex-col items-start justify-start p-3 text-left ${
              day.hasEvent
                ? "border-blue-400/60 bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent shadow-lg shadow-blue-900/40"
                : ""
            } ${day.isCurrentMonth ? "text-white" : "text-neutral-500"}`}
          >
            <span className="text-xs uppercase tracking-wide">
              {day.label ?? ""}
            </span>
            {day.dateKey &&
              (eventsByDate[day.dateKey]?.length ?? 0) > 0 &&
              eventsByDate[day.dateKey].map((ev) => (
                <div key={ev.id} className="mt-2 text-xs text-blue-100 space-y-1">
                  <p className="font-semibold leading-tight">{ev.title}</p>
                  <p className="text-[11px] text-neutral-200">{ev.timeLabel || ""}</p>
                </div>
              ))}
          </div>
        ))}
      </div>

    </div>
  );
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/events/all");
        if (!res.ok) throw new Error("Failed to load events");
        const data = (await res.json()) as Event[];
        setEvents(data);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const enriched = useMemo(() => {
    return events
      .map((ev) => {
        const start = ev.checkinOpensAt ? new Date(ev.checkinOpensAt) : null;
        const end = ev.checkinClosesAt ? new Date(ev.checkinClosesAt) : null;
        const dateKey = toPacificDateKey(ev.checkinOpensAt ?? ev.checkinClosesAt);
        const timeLabel = formatPacificTimeRange(start, end);

        return { ...ev, dateKey, startDate: start, endDate: end, timeLabel };
      })
      .filter((ev) => ev.dateKey);
  }, [events]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = enriched.filter((ev) => {
    const close = ev.checkinClosesAt ? new Date(ev.checkinClosesAt) : null;
    const open = ev.checkinOpensAt ? new Date(ev.checkinOpensAt) : null;
    return (close && close >= today) || (open && open >= today);
  });

  const sortedUpcoming = [...upcoming].sort((a, b) => {
    const aTime = a.checkinOpensAt ? new Date(a.checkinOpensAt).getTime() : 0;
    const bTime = b.checkinOpensAt ? new Date(b.checkinOpensAt).getTime() : 0;
    return aTime - bTime;
  });

  const fallbackSorted = [...enriched].sort((a, b) => {
    const aTime = a.checkinOpensAt ? new Date(a.checkinOpensAt).getTime() : 0;
    const bTime = b.checkinOpensAt ? new Date(b.checkinOpensAt).getTime() : 0;
    return aTime - bTime;
  });

  const displayEvents = sortedUpcoming.length ? sortedUpcoming : fallbackSorted;
  const nextEvent = sortedUpcoming[0] ?? null;
  const calendarEvents: CalendarEvent[] = (sortedUpcoming.length ? sortedUpcoming : fallbackSorted)
    .filter((ev) => Boolean(ev.dateKey))
    .map((ev) => ({
      ...ev,
      timeLabel: ev.timeLabel ?? "",
      dateKey: ev.dateKey ?? "",
    }));

  const nextEventDateLabel =
    nextEvent?.startDate
      ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: PACIFIC_TZ }).format(
          nextEvent.startDate,
        )
      : nextEvent?.dateKey
        ? formatDateLabel(nextEvent.dateKey)
        : "";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#071225] via-[#0a1b35] to-[#102647] text-white">
      {/* HERO */}
      <section
        className="relative py-36 px-6 text-center max-w-full mx-auto bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/home/hero_bg_large.png')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <h1 className="text-5xl font-extrabold leading-tight">
            Events & Workshops
          </h1>
          <p className="text-base uppercase tracking-[0.25em] text-blue-300">
            Build together every week
          </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="px-6 py-3 rounded-full bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/50 hover:scale-[1.02] transition">
                  RSVP for the next event
                </button>
                <div className="px-4 py-3 rounded-full bg-white/10 border border-white/10 text-sm text-neutral-200">
                  {nextEvent
                    ? `Next up: ${nextEvent.title} • ${nextEventDateLabel}${nextEvent.timeLabel ? ` at ${nextEvent.timeLabel}` : ""}`
                    : "No upcoming events"}
                </div>
              </div>
            </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="py-12 px-6 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-blue-300 uppercase tracking-[0.2em] text-xs">
              Upcoming
            </p>
            <h2 className="text-4xl font-extrabold">Upcoming Events</h2>
            <p className="text-neutral-300 max-w-2xl">
              Join us for weekly events and workshops designed to help you build, learn, and connect with the HealthLink community
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-neutral-300">Loading events...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {displayEvents.map((event) => {
              const displayDate = event.startDate ?? new Date(`${event.dateKey}T00:00:00`);
              return (
                <div
                  key={event.id}
                  className="rounded-3xl border border-blue-500/40 bg-neutral-900/50 p-6 shadow-xl shadow-blue-900/30 flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/25 border border-blue-400/40 flex flex-col items-center justify-center">
                        <span className="text-xs text-blue-100">
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            timeZone: PACIFIC_TZ,
                          }).format(displayDate)}
                        </span>
                        <span className="text-xl font-extrabold text-white">
                          {new Intl.DateTimeFormat("en-US", {
                            day: "numeric",
                            timeZone: PACIFIC_TZ,
                          }).format(displayDate)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-blue-200">
                          {"Event"}
                        </p>
                        <h3 className="text-2xl font-bold leading-tight">
                          {event.title}
                        </h3>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-sm text-neutral-200 border border-white/10">
                      {event.timeLabel || "TBD"}
                    </span>
                  </div>
                  <p className="text-neutral-200">{event.description || "Details coming soon."}</p>
                  <div className="flex items-center justify-between text-sm text-neutral-300">
                    <span>{event.location || "Location TBA"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CALENDAR */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <UpcomingCalendar eventsData={calendarEvents} />
      </section>
    </main>
  );
}
