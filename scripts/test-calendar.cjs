const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const output = ts.transpileModule(fs.readFileSync("src/lib/eventCalendar.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exportsObject = {};
vm.runInNewContext(output, { exports: exportsObject, Date, URLSearchParams });
const event = { title: "Health & Tech", description: "Meet + build\nTogether", location: "UCSD", checkinOpensAt: "2026-09-20T18:00:00.123-07:00", checkinClosesAt: "2026-09-20T20:00:00-07:00" };
const url = new URL(exportsObject.googleCalendarUrl(event));
assert.equal(url.origin, "https://calendar.google.com");
assert.equal(url.searchParams.get("dates"), "20260921T010000Z/20260921T030000Z");
assert.equal(url.searchParams.get("text"), event.title);
assert.equal(url.searchParams.get("details"), event.description);
assert.equal(url.searchParams.get("location"), event.location);
assert.equal(url.searchParams.get("ctz"), "America/Los_Angeles");
for (const end of [null, "invalid", event.checkinOpensAt, "2020-01-01T00:00:00Z"]) {
  assert.equal(exportsObject.googleCalendarUrl({ ...event, checkinClosesAt: end }), null);
}
assert.equal(exportsObject.googleCalendarUrl({ ...event, checkinOpensAt: null }), null);
console.log("PASS: Google Calendar fields, encoding, timezone, and invalid dates");
