// Short, permanent links for the Google review NFC cards and QR codes: https://cuartango.com/resena/<venue>
// They redirect (302, so the target can change without reprinting) to Google's "write a review" form.
// Order: REVIEW_URL_<VENUE> var (e.g. the g.page/r/.../review link from the Business Profile) > PLACE_ID_<VENUE> var
// > Place ID looked up once with the Places API (GOOGLE_PLACES_API_KEY) and cached > Google Maps search as a last resort.
const VENUES = {
  "las-palmas": { key: "LAS_PALMAS", q: "Cuartango Argentina, C. José Franchy Roca 9, 35007 Las Palmas de Gran Canaria" },
  "vecindario": { key: "VECINDARIO", q: "Cuartango Milanesería, Calle Granada 22, 35110 Vecindario" }
};

async function lookupPlaceId(env, venue) {
  if (!env.GOOGLE_PLACES_API_KEY) return null;
  const cache = caches.default, ck = new Request("https://cuartango.com/__placeid/" + venue);
  const hit = await cache.match(ck);
  if (hit) return (await hit.text()) || null;
  try {
    const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY, "X-Goog-FieldMask": "places.id,places.displayName" },
      body: JSON.stringify({ textQuery: VENUES[venue].q, languageCode: "es", regionCode: "ES" })
    });
    const j = await r.json();
    const id = j.places && j.places[0] && j.places[0].id;
    if (id) await cache.put(ck, new Response(id, { headers: { "Cache-Control": "max-age=2592000" } }));
    return id || null;
  } catch (e) { return null; }
}

export async function reviewRedirect(venue, env, src) {
  const v = VENUES[venue];
  if (!v) return null;
  console.log(JSON.stringify({ event: "review_link", venue, src: src || "direct" })); // visible in Cloudflare Workers logs
  const direct = env["REVIEW_URL_" + v.key];
  if (direct) return Response.redirect(direct, 302);
  const pid = env["PLACE_ID_" + v.key] || await lookupPlaceId(env, venue);
  if (pid) return Response.redirect("https://search.google.com/local/writereview?placeid=" + encodeURIComponent(pid), 302);
  return Response.redirect("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(v.q), 302);
}
