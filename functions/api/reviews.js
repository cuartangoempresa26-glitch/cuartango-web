// GET /api/reviews?venue=las-palmas|vecindario
// Reads rating + latest reviews from the Google Places API (New) and caches them for 6 hours.
// Needs: secret GOOGLE_PLACES_API_KEY and vars PLACE_ID_LAS_PALMAS / PLACE_ID_VECINDARIO.
// Note: Places returns at most 5 reviews per place. Google requires showing its attribution (the page does).
const PLACE_VAR = { "las-palmas": "PLACE_ID_LAS_PALMAS", "vecindario": "PLACE_ID_VECINDARIO" };
const TTL = 6 * 3600;

const json = (o, status = 200, extra = {}) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json", ...extra } });

export const normalize = (p) => ({
  rating: p.rating ?? null,
  total: p.userRatingCount ?? 0,
  url: p.googleMapsUri || null,
  reviews: (p.reviews || []).slice(0, 5).map((r) => ({
    author: r.authorAttribution?.displayName || "Cliente de Google",
    link: r.authorAttribution?.uri || null,
    stars: Math.round(r.rating || 0),
    text: (r.text?.text || r.originalText?.text || "").trim(),
    when: r.relativePublishTimeDescription || ""
  })).filter((r) => r.stars >= 1)
});

export async function handleReviews(request, env) {
  const venue = new URL(request.url).searchParams.get("venue");
  const placeId = env[PLACE_VAR[venue]];
  if (!PLACE_VAR[venue]) return json({ error: "invalid_venue" }, 400);
  if (!env.GOOGLE_PLACES_API_KEY || !placeId) return json({ error: "not_configured" }, 503);

  const cacheKey = new Request(`https://cache.internal/reviews/${venue}`);
  const cache = typeof caches !== "undefined" ? caches.default : null;
  const hit = cache && (await cache.match(cacheKey));
  if (hit) return new Response(hit.body, { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=900" } });

  try {
    const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=es`, {
      headers: { "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY, "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri" }
    });
    if (!r.ok) return json({ error: "google_" + r.status }, 502);
    const data = normalize(await r.json());
    if (cache) await cache.put(cacheKey, json(data, 200, { "Cache-Control": `public, max-age=${TTL}` }));
    return json(data, 200, { "Cache-Control": "public, max-age=900" });
  } catch (e) { return json({ error: "google_unavailable" }, 502); }
}
