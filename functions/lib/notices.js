// One-off e-mail notices sent by the hourly cron (no storage needed: each notice has a one-hour window).
// A notice goes out on the first cron run whose time falls inside [at, at + 55 min).
import { sendMail } from "./mail.js";

const box = (rows) => `<table style="border-collapse:collapse;font:15px/1.5 Arial,sans-serif">${rows.map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#667078">${k}</td><td style="padding:6px 0"><strong>${v}</strong></td></tr>`).join("")}</table>`;
const domainRows = [["Dominio", "cuartango.com"], ["Registrado en", "Namecheap (el DNS está en Cloudflare)"], ["Fecha de registro", "16 de octubre de 2026"],
  ["Vence", "16 de octubre de 2027"], ["Precio de renovación", "aprox. 14,29 € al año (precio de lista de Namecheap sin promoción; el importe exacto lo muestra Namecheap al renovar)"]];

export const NOTICES = [
  { id: "dominio-info", at: "2026-11-04T15:00:00Z", to: "info@cuartango.com",
    subject: "Renovación del dominio cuartango.com: vence el 16/10/2027",
    html: `<p>Información de la renovación del dominio de la web de Cuartango:</p>${box(domainRows)}
      <p><strong>Cómo renovarlo:</strong> entra en Namecheap → Domain List → cuartango.com → Manage, y comprueba que "Auto-Renew" esté activado (o renueva a mano con "Renew"). Namecheap avisa por correo antes del vencimiento.</p>
      <p>Aviso automático: una semana antes del vencimiento se enviará un recordatorio a este mismo buzón (9 de octubre de 2027).</p>` },
  { id: "dominio-recordatorio", at: "2027-10-09T08:00:00Z", to: "info@cuartango.com",
    subject: "Recordatorio: el dominio cuartango.com vence en 1 semana (16/10/2027)",
    html: `<p><strong>Dentro de una semana vence el dominio cuartango.com.</strong> Es el momento de avisar al cliente para que confirme la renovación.</p>${box(domainRows)}
      <p>Si no se renueva, la web, los correos @cuartango.com (reservas, info) y las reservas online dejarán de funcionar.</p>
      <p><strong>Cómo renovarlo:</strong> Namecheap → Domain List → cuartango.com → Manage → Renew (o comprobar que "Auto-Renew" esté activo).</p>` }
];

export async function sendNotices(env, now = new Date()) {
  for (const n of NOTICES) {
    const t = Date.parse(n.at);
    if (now.getTime() >= t && now.getTime() < t + 55 * 60 * 1000) await sendMail(env, { to: n.to, subject: n.subject, html: n.html });
  }
}
