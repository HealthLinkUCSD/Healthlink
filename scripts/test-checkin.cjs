const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const id = "12345678-1234-1234-1234-123456789abc";
let event;
let insertError;
let inserted;
const admin = { from: () => ({
  select: () => ({ eq: () => ({ single: async () => ({ data: event }) }) }),
  insert: async (row) => { inserted = row; return { error: insertError }; },
}) };
const output = ts.transpileModule(fs.readFileSync("src/app/api/events/check-in-kiosk/route.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exportsObject = {};
vm.runInNewContext(output, {
  exports: exportsObject, console, Date,
  require: (name) => name === "next/server"
    ? { NextResponse: { json: (body, init) => Response.json(body, init) } }
    : { supabaseAdmin: admin },
});
async function submit(body) {
  inserted = null;
  return exportsObject.POST(new Request("https://healthlink.test/api/events/check-in-kiosk", {
    method: "POST", body: typeof body === "string" ? body : JSON.stringify(body),
  }));
}
async function main() {
  event = { id, checkin_code: "BOARD", checkin_opens_at: new Date(Date.now() - 60000).toISOString(), checkin_closes_at: new Date(Date.now() + 60000).toISOString() };
  const body = { eventId: id, accessCode: "BOARD", name: " Student Name ", email: " STUDENT@UCSD.EDU " };
  assert.equal((await submit(body)).status, 201);
  assert.equal(inserted.email, "student@ucsd.edu");
  assert.equal(inserted.name, "Student Name");
  insertError = { code: "23505" };
  assert.equal((await submit(body)).status, 200);
  insertError = { code: "other", message: "private database details" };
  const failure = await submit(body);
  assert.equal(failure.status, 500);
  assert.ok(!(await failure.text()).includes("private database"));
  insertError = null;
  for (const invalid of [{ ...body, email: "bad@ucsd.edu.evil" }, { ...body, name: " " }, { ...body, eventId: "bad" }, "{", null]) {
    assert.equal((await submit(invalid)).status, 400);
    assert.equal(inserted, null);
  }
  assert.equal((await submit({ ...body, accessCode: "wrong" })).status, 401);
  assert.equal(inserted, null);
  for (const accessCode of [undefined, null, "", "   "]) {
    assert.equal((await submit({ ...body, accessCode })).status, 400);
    assert.equal(inserted, null);
  }
  for (const storedCode of [null, "", "   "]) {
    event.checkin_code = storedCode;
    assert.equal((await submit(body)).status, 403);
    assert.equal(inserted, null);
  }
  event.checkin_code = " BOARD ";
  assert.equal((await submit({ ...body, accessCode: " BOARD " })).status, 201);
  assert.equal((await submit({ ...body, accessCode: "board" })).status, 401);
  event.checkin_closes_at = new Date(Date.now() - 1000).toISOString();
  assert.equal((await submit(body)).status, 403);
  event.checkin_closes_at = "invalid";
  assert.equal((await submit(body)).status, 403);
  event = null;
  assert.equal((await submit(body)).status, 404);
  console.log("PASS: no-login check-in, normalization, duplicates, validation, event window, code, and safe errors");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
