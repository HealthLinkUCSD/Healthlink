# Event setup

In Supabase Table Editor, open `public.events` and edit the event row:

- `checkin_code`: the board's chosen code, at most 128 characters. Codes are case-sensitive; surrounding spaces are ignored. Share the code at the event, not in its public description.
- `checkin_opens_at`: when check-in starts, with a timezone.
- `checkin_closes_at`: when check-in ends, later than the opening time.
- `title`, `description`, `location`: public event details.

Check-in requires a configured code and an open window. A blank code disables check-in rather than allowing attendance without a code. No student account is needed. Attendance is deduplicated by normalized email and event; email ownership is not verified.

Share `/checkin?event=<event UUID>` with attendees. They enter their name, UCSD email, and the event code.

The Google Calendar button uses the event's title, description, location, and current check-in opening/closing times as the calendar start/end times. Use the full event duration for these fields. Separate calendar times would require separate event scheduling fields. Missing or invalid times hide the calendar button. Students review and save the prefilled event in Google Calendar; this is not an automatically synchronized calendar subscription.

Verification commands:

```sh
node scripts/test-checkin.cjs
node scripts/test-calendar.cjs
```
