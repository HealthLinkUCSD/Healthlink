type CalendarEvent = {
  title: string;
  description: string | null;
  location: string | null;
  checkinOpensAt: string | null;
  checkinClosesAt: string | null;
};

export function googleCalendarUrl(event: CalendarEvent): string | null {
  const start = Date.parse(event.checkinOpensAt || "");
  const end = Date.parse(event.checkinClosesAt || "");
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  const stamp = (value: number) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return "https://calendar.google.com/calendar/render?" + new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    ctz: "America/Los_Angeles",
    details: event.description || "",
    location: event.location || "",
  });
}
