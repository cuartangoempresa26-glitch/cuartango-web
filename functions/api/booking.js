// Reservations backed by Google Calendar (one calendar per venue). No database needed:
// each booking is a calendar event tagged with private extended properties.
//   GET  /api/availability?venue=&date=YYYY-MM-DD&party=N   -> free slots
//   POST /api/book                                         -> creates the booking
//   POST /api/cancel                                       -> shows / cancels with the e-mail token
import { RULES, VENUES } from "../lib/venues.js";
import { TZ, zonedToUtc, addDays, weekday, todayLocal, toMinutes, toHHMM, isDate, isTime, prettyWhen } from "../lib/time.js";
import { listEvents, insertEvent, getEvent, patchEvent, deleteEvent, signToken } from "../lib/google.js";
import { sendMail, confirmationMail, reminderMail, staffMail } from "../lib/mail.js";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
const SITE = (env) => env.SITE_URL || "https://cuartango.com";
// Each venue manager gets their own inbox: STAFF_EMAIL_LAS_PALMAS / STAFF_EMAIL_VECINDARIO (fallback: CONTACT_TO).
const staffTo = (env, venue) => env[VENUES[venue]?.staffVar] || env.CONTACT_TO || "info@cuartango.com";

export const isConfigured = (env, key) => !!(VENUES[key] && env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY && env[VENUES[key].calendarVar]);

// ---------- occupancy ----------
/** Converts calendar events into {start,end,seats,block}. Only events made by the web carry seat counts. */
function toOccupancy(events, dayStart, dayEnd) {
  const out = [];
  for (const e of events) {
    if (e.status === "cancelled") continue;
    const allDay = !!e.start?.date;
    const start = allDay ? dayStart : new Date(e.start.dateTime);
    const end = allDay ? dayEnd : new Date(e.end.dateTime);
    const p = e.extendedProperties?.private;
    if (p?.cuartango === "1") out.push({ start, end, seats: Number(p.party) || 0 });
    else if (allDay || /^(cerrado|bloqueo|privado|evento)/i.test(e.summary || "")) out.push({ start, end, seats: 0, block: true });
    else { const m = /^(\d{1,2})\s*(p|pax|pers)/i.exec(e.summary || ""); if (m) out.push({ start, end, seats: Number(m[1]) }); } // manual phone booking: "4p Juan"
  }
  return out;
}

/** Highest number of seats used at any instant inside [start,end); Infinity when a block overlaps. */
function peak(occ, start, end) {
  const overlapping = occ.filter((o) => o.start < end && o.end > start);
  if (overlapping.some((o) => o.block)) return Infinity;
  const points = [start, ...overlapping.map((o) => o.start).filter((s) => s > start && s < end)];
  return Math.max(0, ...points.map((p) => overlapping.filter((o) => o.start <= p && o.end > p).reduce((a, o) => a + o.seats, 0)));
}

async function loadDay(env, key, dateStr) {
  const dayStart = zonedToUtc(dateStr, "00:00"), dayEnd = zonedToUtc(addDays(dateStr, 1), "00:00");
  const events = await listEvents(env, env[VENUES[key].calendarVar], dayStart.toISOString(), dayEnd.toISOString());
  return toOccupancy(events, dayStart, dayEnd);
}

export async function computeSlots(env, key, dateStr, party, now = new Date()) {
  const v = VENUES[key];
  if (!v.hours) return { enabled: false, reason: "sin_horario", slots: [] };
  const ranges = v.hours[weekday(dateStr)] || [];
  if (!ranges.length) return { enabled: true, closed: true, slots: [] };
  const occ = await loadDay(env, key, dateStr);
  const dur = RULES.durationMinutes(party), earliest = now.getTime() + RULES.minLeadMinutes * 60000;
  const slots = [];
  for (const [open, close] of ranges) {
    for (let t = toMinutes(open); t <= toMinutes(close) - RULES.lastSeatingMinutesBeforeClose; t += RULES.slotMinutes) {
      const time = toHHMM(t), start = zonedToUtc(dateStr, time), end = new Date(start.getTime() + dur * 60000);
      const free = start.getTime() < earliest ? 0 : Math.max(0, v.seats - peak(occ, start, end));
      slots.push({ time, free: Number.isFinite(free) ? free : 0, available: free >= party });
    }
  }
  return { enabled: true, closed: false, slots };
}

function checkRequest(venue, date, party, now = new Date()) {
  if (!VENUES[venue]) return "venue";
  if (!Number.isInteger(party) || party < 1 || party > RULES.maxPartyOnline) return "party";
  if (!isDate(date) || date < todayLocal(now) || date > addDays(todayLocal(now), RULES.maxDaysAhead)) return "date";
  return null;
}

// ---------- handlers ----------
export async function handleAvailability(request, env) {
  const u = new URL(request.url), venue = u.searchParams.get("venue"), date = u.searchParams.get("date"), party = Number(u.searchParams.get("party"));
  const bad = checkRequest(venue, date, party);
  if (bad) return json({ error: "invalid_" + bad }, 400);
  if (!VENUES[venue].hours) return json({ enabled: false, reason: "sin_horario", slots: [] });
  if (!isConfigured(env, venue)) return json({ error: "not_configured" }, 503);
  try { return json(await computeSlots(env, venue, date, party)); } catch (e) { return json({ error: "calendar_unavailable" }, 502); }
}

async function verifyTurnstile(request, env, token) {
  if (!env.TURNSTILE_SECRET) return true;
  const v = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST",
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token || "", remoteip: request.headers.get("CF-Connecting-IP") || "" }) }).then((r) => r.json());
  return !!v.success;
}

export async function handleBook(request, env) {
  let d; try { d = await request.json(); } catch { return json({ error: "invalid_json" }, 400); }
  if (d.website) return json({ ok: true }); // honeypot
  const party = Number(d.party), venue = d.venue, date = d.date, time = d.time;
  const name = String(d.name || "").trim(), phone = String(d.phone || "").trim(), email = String(d.email || "").trim(), notes = String(d.notes || "").trim();
  const bad = checkRequest(venue, date, party) || (!isTime(time || "") && "time") || (name.length < 2 || name.length > 80) && "name" ||
    (!/^[+\d][\d\s().-]{5,19}$/.test(phone) && "phone") || (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && "email") || (notes.length > 500 && "notes") || (d.consent !== true && "consent");
  if (bad) return json({ error: "invalid_" + bad }, 400);
  if (!VENUES[venue].hours) return json({ error: "booking_disabled" }, 409);
  if (!isConfigured(env, venue)) return json({ error: "not_configured" }, 503);
  if (!(await verifyTurnstile(request, env, d.turnstile))) return json({ error: "antispam" }, 400);

  const v = VENUES[venue], calId = env[v.calendarVar];
  try {
    const day = await computeSlots(env, venue, date, party);
    if (!day.slots.find((s) => s.time === time && s.available)) return json({ error: "slot_unavailable" }, 409);
    const start = zonedToUtc(date, time), end = new Date(start.getTime() + RULES.durationMinutes(party) * 60000);
    const ev = await insertEvent(env, calId, {
      summary: `${party}p · ${name}`,
      description: `Reserva web\n${name}\nTel: ${phone}\nEmail: ${email}\nPersonas: ${party}\nNotas: ${notes || "-"}`,
      start: { dateTime: start.toISOString(), timeZone: TZ }, end: { dateTime: end.toISOString(), timeZone: TZ },
      reminders: { useDefault: false },
      extendedProperties: { private: { cuartango: "1", party: String(party), name, phone, email, venue } }
    });
    // optimistic concurrency: if two people took the last seats at the same moment, the later one is rolled back
    const occ = await loadDay(env, venue, date);
    if (peak(occ, start, end) > v.seats) { await deleteEvent(env, calId, ev.id); return json({ error: "slot_unavailable" }, 409); }

    const when = prettyWhen(date, time);
    const cancelUrl = `${SITE(env)}/cancelar?v=${venue}&id=${encodeURIComponent(ev.id)}&t=${await signToken(env, `${venue}:${ev.id}`)}`;
    let emailed = false;
    try {
      const c = confirmationMail({ name, venueName: v.name, address: v.address, when, party, cancelUrl });
      emailed = await sendMail(env, { to: email, replyTo: staffTo(env, venue), ...c });
      const s = staffMail({ kind: "new", name, phone, email, venueName: v.name, when, party, notes });
      await sendMail(env, { to: staffTo(env, venue), replyTo: email, ...s });
    } catch { /* e-mail problems never undo a confirmed booking */ }
    return json({ ok: true, id: ev.id, when, venue: v.name, party, emailed });
  } catch (e) { return json({ error: "calendar_unavailable" }, 502); }
}

export async function handleCancel(request, env) {
  let d; try { d = await request.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const { v: venue, id, t } = d;
  if (!VENUES[venue] || !id || !t) return json({ error: "invalid_link" }, 400);
  if (!isConfigured(env, venue)) return json({ error: "not_configured" }, 503);
  if ((await signToken(env, `${venue}:${id}`)) !== t) return json({ error: "invalid_link" }, 403);
  const calId = env[VENUES[venue].calendarVar];
  try {
    let ev; try { ev = await getEvent(env, calId, id); } catch { return json({ error: "not_found" }, 404); }
    const p = ev.extendedProperties?.private;
    if (ev.status === "cancelled" || p?.cuartango !== "1") return json({ error: "not_found" }, 404);
    const startLocal = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ev.start.dateTime));
    const time = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(ev.start.dateTime));
    const when = prettyWhen(startLocal, time), info = { venue: VENUES[venue].name, when, party: Number(p.party), name: p.name };
    if (!d.confirm) return json({ ok: true, ...info });
    await deleteEvent(env, calId, id);
    try { await sendMail(env, { to: staffTo(env, venue), ...staffMail({ kind: "cancel", name: p.name, phone: p.phone, email: p.email, venueName: VENUES[venue].name, when, party: p.party }) }); } catch {}
    return json({ ok: true, cancelled: true, ...info });
  } catch (e) { return json({ error: "calendar_unavailable" }, 502); }
}

// ---------- hourly cron: reminder e-mail ~24 h before ----------
export async function sendReminders(env, now = new Date()) {
  let sent = 0;
  for (const key of Object.keys(VENUES)) {
    if (!isConfigured(env, key)) continue;
    const calId = env[VENUES[key].calendarVar];
    const from = new Date(now.getTime() + 23 * 3600000).toISOString(), to = new Date(now.getTime() + 24 * 3600000).toISOString();
    for (const e of await listEvents(env, calId, from, to)) {
      const p = e.extendedProperties?.private;
      if (e.status === "cancelled" || p?.cuartango !== "1" || p.reminded === "1" || !p.email) continue;
      const startLocal = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(e.start.dateTime));
      const time = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(e.start.dateTime));
      const cancelUrl = `${SITE(env)}/cancelar?v=${key}&id=${encodeURIComponent(e.id)}&t=${await signToken(env, `${key}:${e.id}`)}`;
      const m = reminderMail({ name: p.name, venueName: VENUES[key].name, address: VENUES[key].address, when: prettyWhen(startLocal, time), party: p.party, cancelUrl });
      if (await sendMail(env, { to: p.email, ...m })) {
        await patchEvent(env, calId, e.id, { extendedProperties: { private: { ...p, reminded: "1" } } });
        sent++;
      }
    }
  }
  return sent;
}
