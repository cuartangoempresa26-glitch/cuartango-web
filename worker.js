// Cloudflare Worker entry: static site (assets) + the catering enquiry endpoint.
// Static files are served automatically; only unmatched requests reach this code.
import { onRequestPost } from "./functions/api/catering.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/catering") {
      if (request.method === "POST") return onRequestPost({ request, env });
      return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
    }
    return env.ASSETS.fetch(request);
  }
};
