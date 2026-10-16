// E-mail through Resend. If RESEND_API_KEY is missing, mail is skipped (bookings still work).
export const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export async function sendMail(env, { to, subject, html, replyTo }) {
  if (!env.RESEND_API_KEY || !to) return false;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM_BOOKINGS || "Cuartango Reservas <reservas@cuartango.com>", to: [to], subject, html, reply_to: replyTo || env.CONTACT_TO || "info@cuartango.com" })
  });
  return r.ok;
}

const wrap = (title, body) => `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1f2326">
<h1 style="font-weight:500;color:#2b1d17;border-bottom:1px solid #b08d57;padding-bottom:10px">${esc(title)}</h1>${body}
<p style="color:#667078;font-size:13px;margin-top:28px">Cuartango · info@cuartango.com · +34 656 441 966</p></div>`;

export const confirmationMail = ({ name, venueName, address, when, party, cancelUrl }) => ({
  subject: `Reserva confirmada: ${when}`,
  html: wrap("¡Tu reserva está confirmada!", `<p>Hola ${esc(name)}, te esperamos en <strong>${esc(venueName)}</strong>.</p>
<table style="font-size:16px"><tr><td>Cuándo:</td><td><strong>${esc(when)}</strong></td></tr>
<tr><td>Personas:</td><td><strong>${esc(party)}</strong></td></tr><tr><td>Dónde:</td><td>${esc(address)}</td></tr></table>
<p>Si no puedes venir, cancela tu mesa para que otra persona la aproveche:</p>
<p><a href="${esc(cancelUrl)}" style="background:#2b1d17;color:#f6efe4;padding:12px 22px;text-decoration:none">Cancelar mi reserva</a></p>`)
});

export const reminderMail = ({ name, venueName, address, when, party, cancelUrl }) => ({
  subject: `Mañana te esperamos en Cuartango: ${when}`,
  html: wrap("Te recordamos tu reserva de mañana", `<p>Hola ${esc(name)}, mañana tienes mesa en <strong>${esc(venueName)}</strong>.</p>
<p><strong>${esc(when)}</strong> · ${esc(party)} personas<br>${esc(address)}</p>
<p>¿Ha cambiado algo? <a href="${esc(cancelUrl)}">Cancela tu reserva aquí</a>.</p>`)
});

export const staffMail = ({ kind, name, phone, email, venueName, when, party, notes }) => ({
  subject: `${kind === "cancel" ? "Reserva CANCELADA" : "Nueva reserva web"}: ${venueName}, ${when}, ${party} pers. (${name})`,
  html: wrap(kind === "cancel" ? "Reserva cancelada" : "Nueva reserva", `<p><strong>${esc(venueName)}</strong><br>${esc(when)} · ${esc(party)} personas</p>
<p>${esc(name)}<br>${esc(phone)}<br>${esc(email)}</p>${notes ? `<p>Notas: ${esc(notes)}</p>` : ""}`)
});
