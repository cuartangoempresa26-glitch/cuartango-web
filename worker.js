// Cloudflare Worker entry: static site (assets) + API endpoints.
// run_worker_first is on (wrangler.jsonc), so every request passes through here.
import { onRequestPost as catering } from "./functions/api/catering.js";
import { handleReviews } from "./functions/api/reviews.js";
import { handleAvailability, handleBook, handleCancel, sendReminders } from "./functions/api/booking.js";

const notAllowed = (allow) => new Response("Method Not Allowed", { status: 405, headers: { Allow: allow } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // www.cuartango.com -> cuartango.com (keeps path and query)
    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }
    // argentina.cuartango.com = link-in-bio page (bio.html); its images/css live in the same assets, everything else belongs to the main site
    if (url.hostname === "argentina.cuartango.com") {
      if (url.pathname === "/") return env.ASSETS.fetch(new Request(new URL("/bio", url), request));
      if (/^\/(img|css)\//.test(url.pathname)) return env.ASSETS.fetch(request);
      return Response.redirect("https://cuartango.com" + url.pathname + url.search, 302);
    }
    // QR codes printed in the venues point here, so the destination can change without reprinting.
    const qr = { "/qr/las-palmas": "/menu?local=las-palmas", "/qr/vecindario": "/menu?local=vecindario", "/qr": "/menu" }[url.pathname.replace(/\/$/, "")];
    if (qr) return Response.redirect(url.origin + qr + (qr.includes("?") ? "&" : "?") + "utm_source=qr", 302);
    const m = request.method;
    switch (url.pathname) {
      case "/api/catering": return m === "POST" ? catering({ request, env }) : notAllowed("POST");
      case "/api/availability": return m === "GET" ? handleAvailability(request, env) : notAllowed("GET");
      case "/api/reviews": return m === "GET" ? handleReviews(request, env) : notAllowed("GET");
      case "/api/book": return m === "POST" ? handleBook(request, env) : notAllowed("POST");
      case "/api/cancel": return m === "POST" ? handleCancel(request, env) : notAllowed("POST");
    }
    return env.ASSETS.fetch(request);
  },

  // hourly cron (see wrangler.jsonc): reminder e-mails for tomorrow's bookings
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendReminders(env));
  }
};
