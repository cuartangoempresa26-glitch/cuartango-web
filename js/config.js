// Endpoint that receives the catering enquiry and emails it to info@cuartango.com.
// Same path locally (serve.cjs, demo only) and in production (Cloudflare Pages Function).
window.CUARTANGO_CONFIG = { cateringEndpoint: "/api/catering", turnstileSiteKey: "" };
