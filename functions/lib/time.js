// Time helpers for the Atlantic/Canary time zone (UTC+0 in winter, UTC+1 in summer).
export const TZ = "Atlantic/Canary";

const partsInTz = (date, tz = TZ) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(date).map((x) => [x.type, x.value]));
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, mi: +p.minute };
};

/** "2026-11-03" + "20:30" (local Canary time) -> Date (UTC instant). */
export function zonedToUtc(dateStr, hhmm, tz = TZ) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, mi] = hhmm.split(":").map(Number);
  const wanted = Date.UTC(y, m - 1, d, h, mi);
  let utc = wanted;
  for (let i = 0; i < 2; i++) {
    const l = partsInTz(new Date(utc), tz);
    utc -= Date.UTC(l.y, l.m - 1, l.d, l.h, l.mi) - wanted;
  }
  return new Date(utc);
}

export const addDays = (dateStr, n) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

export const weekday = (dateStr) => new Date(dateStr + "T12:00:00Z").getUTCDay(); // 0 = Sunday
export const todayLocal = (now = new Date()) => {
  const l = partsInTz(now);
  return `${l.y}-${String(l.m).padStart(2, "0")}-${String(l.d).padStart(2, "0")}`;
};
export const toMinutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
export const toHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
export const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + "T12:00:00Z"));
export const isTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

/** Human text such as "martes 3 de noviembre a las 20:30". */
export const prettyWhen = (dateStr, hhmm) => {
  const d = new Date(dateStr + "T12:00:00Z");
  const t = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(d);
  return `${t} a las ${hhmm}`;
};
