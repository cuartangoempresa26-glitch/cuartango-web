// Google Calendar through a service account (JWT, RS256) using only Web APIs available in Workers.
const enc = new TextEncoder();
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const pemToDer = (pem) => Uint8Array.from(atob(pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "")), (c) => c.charCodeAt(0));

let cached = { token: null, exp: 0 };

export async function getAccessToken(env) {
  if (cached.token && Date.now() < cached.exp - 60000) return cached.token;
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(enc.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const claim = b64url(enc.encode(JSON.stringify({
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL, scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600
  })));
  const key = await crypto.subtle.importKey("pkcs8", pemToDer(env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(`${header}.${claim}`));
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${header}.${claim}.${b64url(sig)}` })
  });
  if (!r.ok) throw new Error("google_auth_" + r.status);
  const j = await r.json();
  cached = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return cached.token;
}

async function call(env, method, calId, suffix = "", { query, body } = {}) {
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events${suffix}`);
  if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  const r = await fetch(url, {
    method, headers: { Authorization: `Bearer ${await getAccessToken(env)}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  if (r.status === 204) return null;
  if (!r.ok) throw new Error(`calendar_${method}_${r.status}`);
  return r.json();
}

export const listEvents = async (env, calId, timeMin, timeMax) =>
  (await call(env, "GET", calId, "", { query: { timeMin, timeMax, singleEvents: "true", orderBy: "startTime", maxResults: "250" } })).items || [];
export const insertEvent = (env, calId, event) => call(env, "POST", calId, "", { body: event });
export const getEvent = (env, calId, id) => call(env, "GET", calId, "/" + encodeURIComponent(id));
export const patchEvent = (env, calId, id, patch) => call(env, "PATCH", calId, "/" + encodeURIComponent(id), { body: patch });
export const deleteEvent = (env, calId, id) => call(env, "DELETE", calId, "/" + encodeURIComponent(id));

// HMAC token so only the owner of the confirmation e-mail can cancel a booking.
export async function signToken(env, text) {
  const secret = env.BOOKING_SECRET || env.GOOGLE_PRIVATE_KEY || "";
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(text))).slice(0, 24);
}
