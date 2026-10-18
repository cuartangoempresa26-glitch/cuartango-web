// Offline test of the booking backend with a fake Google Calendar and fake Resend.
//   node tools/test-booking.mjs
import { generateKeyPairSync } from "node:crypto";
import { handleAvailability, handleBook, handleCancel, sendReminders, computeSlots } from "../functions/api/booking.js";
import { zonedToUtc } from "../functions/lib/time.js";
import { VENUES } from "../functions/lib/venues.js";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("  FAIL:", m); } };

// ---- fake backends ----
const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const pem = privateKey.export({ type: "pkcs8", format: "pem" });
const events = []; const mails = []; let seq = 0;
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init = {}) => {
  const u = new URL(url), method = init.method || "GET";
  if (u.host === "oauth2.googleapis.com") return Response.json({ access_token: "tok", expires_in: 3600 });
  if (u.host === "api.resend.com") { mails.push(JSON.parse(init.body)); return Response.json({ id: "m" + mails.length }); }
  if (u.host === "www.googleapis.com") {
    const m = u.pathname.match(/calendars\/([^/]+)\/events(?:\/(.+))?$/); const cal = decodeURIComponent(m[1]); const id = m[2] && decodeURIComponent(m[2]);
    if (method === "GET" && !id) {
      const min = new Date(u.searchParams.get("timeMin")), max = new Date(u.searchParams.get("timeMax"));
      return Response.json({ items: events.filter((e) => e.cal === cal && new Date(e.end.dateTime) > min && new Date(e.start.dateTime) < max) });
    }
    if (method === "POST") { const e = { ...JSON.parse(init.body), id: "ev" + ++seq, cal, status: "confirmed" }; events.push(e); return Response.json(e); }
    const i = events.findIndex((e) => e.id === id && e.cal === cal);
    if (method === "GET") return i < 0 ? new Response("{}", { status: 404 }) : Response.json(events[i]);
    if (method === "DELETE") { if (i >= 0) events.splice(i, 1); return new Response(null, { status: 204 }); }
    if (method === "PATCH") { const p = JSON.parse(init.body); events[i] = { ...events[i], ...p, extendedProperties: { private: { ...events[i].extendedProperties?.private, ...p.extendedProperties?.private } } }; return Response.json(events[i]); }
  }
  return realFetch(url, init);
};

const env = { GOOGLE_SERVICE_ACCOUNT_EMAIL: "bot@x.iam.gserviceaccount.com", GOOGLE_PRIVATE_KEY: pem, CALENDAR_ID_LAS_PALMAS: "lp@group.calendar.google.com",
  CALENDAR_ID_VECINDARIO: "vc@group.calendar.google.com", RESEND_API_KEY: "re_test", CONTACT_TO: "info@cuartango.com", STAFF_EMAIL_LAS_PALMAS: "laspalmas@x.com", STAFF_EMAIL_VECINDARIO: "vecindario@x.com", SITE_URL: "https://cuartango.com" };
const get = (qs, e = env) => handleAvailability(new Request("https://x/api/availability?" + qs), e);
const post = (fn, body, e = env) => fn(new Request("https://x/api", { method: "POST", body: JSON.stringify(body) }), e);

// next dates (UTC noon trick) -> pick a future Tuesday (open, two shifts) and Monday (closed)
const future = (wd) => { const d = new Date(Date.now() + 5 * 86400000); while (d.getUTCDay() !== wd) d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); };
const tue = future(2), mon = future(1), fri = future(5);

console.log("time zone conversion");
ok(zonedToUtc("2026-01-15", "13:00").toISOString() === "2026-01-15T13:00:00.000Z", "winter = UTC+0");
ok(zonedToUtc("2026-07-15", "13:00").toISOString() === "2026-07-15T12:00:00.000Z", "summer = UTC+1");
ok(zonedToUtc("2026-03-29", "03:00").toISOString() === "2026-03-29T02:00:00.000Z", "after the spring change");

console.log("availability");
let r = await (await get(`venue=las-palmas&date=${tue}&party=4`)).json();
ok(r.enabled && !r.closed && r.slots.length === 7 + 5, `Tuesday slots (got ${r.slots?.length})`); // lunch 13:00..16:00 (7) + dinner 20:00..22:00 (5)
ok(r.slots.some((s) => s.time === "13:00" && s.available), "13:00 available");
ok(!r.slots.some((s) => s.time === "16:30"), "no slot in the last hour before closing");
r = await (await get(`venue=las-palmas&date=${mon}&party=2`)).json();
ok(r.closed === true && r.slots.length === 0, "Monday closed");
r = await (await get(`venue=las-palmas&date=${fri}&party=2`)).json();
ok(r.slots.some((s) => s.time === "13:00") && r.slots.some((s) => s.time === "22:00") && !r.slots.some((s) => s.time === "16:30" || s.time === "17:00"), "Friday: lunch (until 16:30) and dinner (20:00-23:00)");
{ // Vecindario has not opened yet: no online bookings while venues.vecindario.comingSoon is true
  r = await (await get(`venue=vecindario&date=${tue}&party=2`)).json();
  ok(r.enabled === false && r.reason === "proximamente", "Vecindario shows as coming soon (no slots)");
  const before0 = events.length;
  ok((await post(handleBook, { venue: "vecindario", date: tue, time: "13:00", party: 2, name: "Luis Gil", phone: "600 222 333", email: "luis@example.com", consent: true })).status === 409 && events.length === before0, "Vecindario booking refused while coming soon");
}
{ // once it opens (flag removed), bookings go to its own calendar and notify its own manager
  VENUES.vecindario.comingSoon = false;
  r = await (await get(`venue=vecindario&date=${tue}&party=2`)).json();
  ok(r.enabled === true && r.slots.length === 7 + 5, "Vecindario bookable once open");
  const before = events.length;
  const res = await post(handleBook, { venue: "vecindario", date: tue, time: "13:00", party: 2, name: "Luis Gil", phone: "600 222 333", email: "luis@example.com", consent: true });
  ok(res.status === 200 && events.length === before + 1 && events.at(-1).cal === env.CALENDAR_ID_VECINDARIO, "Vecindario booking stored in the Vecindario calendar");
  ok(mails.at(-1).to[0] === "vecindario@x.com", "Vecindario booking e-mails the Vecindario manager");
  events.pop(); mails.length = 0;
  VENUES.vecindario.comingSoon = true;
}
ok((await get(`venue=las-palmas&date=${tue}&party=99`)).status === 400, "party too large rejected");
ok((await get(`venue=nope&date=${tue}&party=2`)).status === 400, "unknown venue rejected");
ok((await get(`venue=las-palmas&date=2020-01-01&party=2`)).status === 400, "past date rejected");
ok((await get(`venue=las-palmas&date=${tue}&party=2`, {})).status === 503, "503 when not configured");

console.log("booking");
const body = { venue: "las-palmas", date: tue, time: "20:30", party: 4, name: "Ana Pérez", phone: "+34 600 111 222", email: "ana@example.com", notes: "Cumpleaños", consent: true };
let res = await post(handleBook, body); let b = await res.json();
ok(res.status === 200 && b.ok, "booking created");
ok(events.length === 1 && events[0].extendedProperties.private.party === "4", "event stored with party size");
ok(events[0].start.dateTime === zonedToUtc(tue, "20:30").toISOString(), "event start correct");
ok(mails.length === 2 && mails[0].to[0] === "ana@example.com" && mails[1].to[0] === "laspalmas@x.com", "customer + Las Palmas manager e-mails sent");
ok(mails[0].html.includes(`cancelar?v=las-palmas&amp;id=${b.id}&amp;t=`), "cancel link in e-mail");
ok((await post(handleBook, { ...body, consent: false })).status === 400, "consent required");
ok((await post(handleBook, { ...body, email: "bad" })).status === 400, "e-mail validated");
ok((await post(handleBook, { ...body, website: "spam" })).status === 200 && events.length === 1, "honeypot silently ignored");

console.log("capacity");
// seats 64 (4 already used by the first booking): fill 20:30 with 6 x 10 -> exactly 64 used, a party of 5 must not fit
for (const p of [10, 10, 10, 10, 10, 10]) await post(handleBook, { ...body, party: p, name: "Grupo " + p, email: `g${p}@example.com` });
r = await (await get(`venue=las-palmas&date=${tue}&party=5`)).json();
const s2030 = r.slots.find((s) => s.time === "20:30");
ok(s2030 && !s2030.available, "20:30 full for 5 people");
res = await post(handleBook, { ...body, party: 5, name: "Late" });
ok(res.status === 409, "409 when slot unavailable");
r = await (await get(`venue=las-palmas&date=${tue}&party=2`)).json();
ok(r.slots.find((s) => s.time === "20:30").available === false || r.slots.find((s) => s.time === "20:30").free < 5, "free seats shrink");
ok(r.slots.find((s) => s.time === "13:00").available, "lunch still open");
// manual blocking + manual phone booking events made by staff
events.push({ id: "m1", cal: env.CALENDAR_ID_LAS_PALMAS, status: "confirmed", summary: "CERRADO evento privado", start: { dateTime: zonedToUtc(tue, "13:00").toISOString() }, end: { dateTime: zonedToUtc(tue, "17:00").toISOString() } });
r = await (await get(`venue=las-palmas&date=${tue}&party=2`)).json();
ok(r.slots.filter((s) => s.time < "17:00").every((s) => !s.available), "staff 'CERRADO' event blocks lunch");

console.log("cancel");
const id = b.id, { signToken } = await import("../functions/lib/google.js");
const t = await signToken(env, `las-palmas:${id}`);
ok((await post(handleCancel, { v: "las-palmas", id, t: "wrong" })).status === 403, "bad token rejected");
let info = await (await post(handleCancel, { v: "las-palmas", id, t })).json();
ok(info.ok && !info.cancelled && info.party === 4, "info before cancelling");
const before = events.length;
info = await (await post(handleCancel, { v: "las-palmas", id, t, confirm: true })).json();
ok(info.cancelled && events.length === before - 1, "cancelled and removed from calendar");
ok(mails.at(-1).subject.startsWith("Reserva CANCELADA"), "staff notified");
ok((await post(handleCancel, { v: "las-palmas", id, t, confirm: true })).status === 404, "second cancel -> 404");

console.log("reminders");
events.length = 0; mails.length = 0;
const tomorrowStart = new Date(Date.now() + 23.5 * 3600000);
events.push({ id: "r1", cal: env.CALENDAR_ID_LAS_PALMAS, status: "confirmed", summary: "2p · Eva", start: { dateTime: tomorrowStart.toISOString() }, end: { dateTime: new Date(tomorrowStart.getTime() + 5400000).toISOString() },
  extendedProperties: { private: { cuartango: "1", party: "2", name: "Eva", phone: "600", email: "eva@example.com", venue: "las-palmas" } } });
ok((await sendReminders(env)) === 1 && mails[0].to[0] === "eva@example.com", "reminder sent");
ok((await sendReminders(env)) === 0, "reminder is sent only once");

console.log("hours stay in sync with the website data");
{
  const vm = await import("node:vm"), fsm = await import("node:fs");
  const ctx = { window: {} }; vm.createContext(ctx);
  vm.runInContext(fsm.readFileSync(new URL("../js/data.js", import.meta.url), "utf8"), ctx);
  for (const k of Object.keys(VENUES)) { ok(JSON.stringify(ctx.window.CUARTANGO.venues[k].hours) === JSON.stringify(VENUES[k].hours), `hours of ${k} equal in js/data.js and functions/lib/venues.js`);
    ok(!!ctx.window.CUARTANGO.venues[k].comingSoon === !!VENUES[k].comingSoon, `comingSoon flag of ${k} equal in js/data.js and functions/lib/venues.js`); }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
