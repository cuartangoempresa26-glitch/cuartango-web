// Cloudflare Pages Function: POST /api/catering
// Emails the catering enquiry to env.CONTACT_TO (info@cuartango.com) through Resend.
// Secrets (never in Git): RESEND_API_KEY, optional TURNSTILE_SECRET. Vars: CONTACT_TO, MAIL_FROM.
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });

export async function onRequestPost({ request, env }) {
  let d;
  try { d = await request.json(); } catch { return json({ error: "Solicitud no válida" }, 400); }
  if (d.website) return json({ ok: true });                       // honeypot: pretend success
  const req = ["name", "email", "phone", "eventType", "date", "guests"];
  if (req.some((k) => !String(d[k] ?? "").trim())) return json({ error: "Faltan campos obligatorios" }, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return json({ error: "Email no válido" }, 400);
  if (String(d.message ?? "").length > 3000) return json({ error: "Mensaje demasiado largo" }, 400);

  if (env.TURNSTILE_SECRET) {
    const v = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: d.turnstile || "", remoteip: request.headers.get("CF-Connecting-IP") || "" })
    }).then((r) => r.json());
    if (!v.success) return json({ error: "Verificación anti-spam fallida" }, 400);
  }

  const rows = [["Nombre", d.name], ["Email", d.email], ["Teléfono", d.phone], ["Tipo de evento", d.eventType], ["Fecha", d.date],
    ["Comensales", d.guests], ["Lugar", d.place], ["Menú de interés", d.menu], ["Extras", (d.extras || []).join(", ")], ["Mensaje", d.message]];
  const html = `<h2>Nueva consulta de catering</h2><table cellpadding="6">${rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v) || "—"}</td></tr>`).join("")}</table>`;
  const text = rows.map(([k, v]) => `${k}: ${v || "—"}`).join("\n");

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.MAIL_FROM || "Cuartango Web <web@cuartango.com>",
      to: [env.CONTACT_TO || "info@cuartango.com"],
      reply_to: d.email,
      subject: `Catering: ${d.eventType}, ${d.guests} personas, ${d.date} (${d.name})`,
      html, text
    })
  });
  if (!r.ok) return json({ error: "No se pudo enviar el correo" }, 502);
  return json({ ok: true });
}
