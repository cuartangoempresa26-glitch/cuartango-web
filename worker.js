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
