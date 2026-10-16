// node tools/test-reviews.mjs : checks the Places response mapping and the not-configured behaviour.
import { handleReviews, normalize } from "../functions/api/reviews.js";
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log("  FAIL:", m); } };
const sample = { rating: 4.7, userRatingCount: 132, googleMapsUri: "https://maps.google.com/?cid=1", reviews: [
  { rating: 5, text: { text: " Muy buena carne " }, authorAttribution: { displayName: "Marta", uri: "https://g.co/x" }, relativePublishTimeDescription: "hace una semana" },
  { rating: 0, text: { text: "sin estrellas" } }, { rating: 4, originalText: { text: "Buen servicio" }, authorAttribution: {} } ] };
const n = normalize(sample);
ok(n.rating === 4.7 && n.total === 132 && n.url.includes("maps.google"), "summary mapped");
ok(n.reviews.length === 2 && n.reviews[0].text === "Muy buena carne" && n.reviews[1].author === "Cliente de Google", "reviews mapped and cleaned");
const call = (qs, env) => handleReviews(new Request("https://x/api/reviews?" + qs), env);
ok((await call("venue=las-palmas", {})).status === 503, "503 without key");
ok((await call("venue=nope", {})).status === 400, "unknown venue");
globalThis.fetch = async (u, i) => { ok(String(u).includes("places.googleapis.com/v1/places/PID") && i.headers["X-Goog-Api-Key"] === "K" && /reviews/.test(i.headers["X-Goog-FieldMask"]), "Places request well formed"); return Response.json(sample); };
const r = await call("venue=las-palmas", { GOOGLE_PLACES_API_KEY: "K", PLACE_ID_LAS_PALMAS: "PID" });
ok(r.status === 200 && (await r.json()).total === 132, "200 with data");
globalThis.fetch = async () => new Response("{}", { status: 403 });
ok((await call("venue=las-palmas", { GOOGLE_PLACES_API_KEY: "K", PLACE_ID_LAS_PALMAS: "PID" })).status === 502, "502 when Google refuses");
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
