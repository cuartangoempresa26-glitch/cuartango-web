// Reservation form. Live mode talks to /api/availability and /api/book (Google Calendar behind the scenes).
// If the server is not configured yet (503) the page falls back to a clearly labelled demo mode.
(function () {
  const D = window.CUARTANGO;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const form = $("#book-form");
  if (!form) return;

  const venueSel = $("#b-venue"), dateIn = $("#b-date"), partyIn = $("#b-party"), slotsEl = $("#b-slots"), submit = $("#b-submit"), msg = $("#b-msg"), result = $("#b-result");
  const params = new URLSearchParams(location.search);
  if (D.venues[params.get("local")] && !D.venues[params.get("local")].comingSoon) venueSel.value = params.get("local");
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = new Date(), max = new Date(); max.setDate(max.getDate() + 60);
  dateIn.min = iso(today); dateIn.max = iso(max); dateIn.value = iso(today);

  let chosen = "", demo = false, seq = 0;
  const say = (html, kind = "") => { msg.className = "form-msg " + kind; msg.innerHTML = html; };
  const mins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const hhmm = (t) => pad(Math.floor(t / 60)) + ":" + pad(t % 60);

  // simulated slots (demo mode only), from the opening hours in data.js
  const demoSlots = () => {
    const v = D.venues[venueSel.value];
    if (!v.hours) return { disabled: true };
    const day = new Date(dateIn.value + "T12:00:00").getDay(), out = [];
    (v.hours[day] || []).forEach(([o, c]) => { for (let t = mins(o); t <= mins(c) - D.lastSeatingMinutesBeforeClose; t += 30) out.push({ time: hhmm(t), available: true }); });
    return { slots: out, closed: !out.length };
  };

  const draw = (slots) => {
    chosen = ""; submit.disabled = true;
    slotsEl.innerHTML = slots.map((s) => `<button type="button" data-t="${s.time}" ${s.available ? "" : "disabled"}>${s.time}</button>`).join("");
    if (!slots.some((s) => s.available)) say("No quedan mesas libres a ninguna hora ese día para ese número de personas. Prueba con otra fecha o llámanos.", "warn");
    else say(demo ? "<strong>Modo demostración:</strong> la disponibilidad es simulada y la reserva no se guarda." : "", demo ? "demo" : "");
  };

  // more than 10 people is not booked online: it goes to the groups & celebrations form (eventos)
  const groupLink = () => `eventos.html?local=${encodeURIComponent(venueSel.value)}#evento`;
  async function refresh() {
    const mine = ++seq;
    if (partyIn.value === "grupo") {
      chosen = ""; submit.disabled = true; result.innerHTML = ""; slotsEl.innerHTML = "";
      return say(`Para grupos de más de 10 personas preparamos la mesa a medida. Cuéntanos el día, la hora y cuántos sois en el formulario de grupos y celebraciones y te respondemos con una propuesta.<br><a class="btn" style="margin-top:12px" href="${groupLink()}">Ir al formulario de grupos</a>`, "warn");
    }
    chosen = ""; submit.disabled = true; slotsEl.innerHTML = '<span class="muted">Consultando disponibilidad…</span>'; result.innerHTML = "";
    const q = new URLSearchParams({ venue: venueSel.value, date: dateIn.value, party: partyIn.value });
    try {
      const r = await fetch("/api/availability?" + q);
      if (mine !== seq) return;
      if (r.status === 503 || r.status === 404) { // server not configured yet -> demo
        demo = true; const d = demoSlots();
        if (d.disabled) { slotsEl.innerHTML = ""; return say(`Las reservas online de este local abrirán pronto. Escríbenos a <a href="mailto:${D.email}">${D.email}</a>.`, "warn"); }
        if (d.closed) { slotsEl.innerHTML = ""; return say("Cerrado este día. Elige otra fecha.", "warn"); }
        return draw(d.slots);
      }
      demo = false;
      const j = await r.json();
      if (!r.ok) { slotsEl.innerHTML = ""; return say("Revisa la fecha y el número de personas (hasta 10 personas; para grupos mayores usa el <a href='eventos.html#evento'>formulario de grupos y celebraciones</a>).", "warn"); }
      if (j.enabled === false) { slotsEl.innerHTML = ""; return say(`Las reservas online de este local abrirán pronto. Escríbenos a <a href="mailto:${D.email}">${D.email}</a>.`, "warn"); }
      if (j.closed) { slotsEl.innerHTML = ""; return say("Cerrado este día. Elige otra fecha.", "warn"); }
      draw(j.slots);
    } catch (e) {
      if (mine !== seq) return;
      slotsEl.innerHTML = ""; say("No hemos podido consultar la disponibilidad. Inténtalo de nuevo en unos minutos o escríbenos a " + D.email + ".", "warn");
    }
  }

  slotsEl.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b || b.disabled) return;
    chosen = b.dataset.t; slotsEl.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); submit.disabled = false;
  });
  [venueSel, dateIn, partyIn].forEach((el) => el.addEventListener("change", refresh));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!chosen || !form.reportValidity()) return;
    const v = D.venues[venueSel.value];
    if (demo) {
      result.innerHTML = `<div class="ok"><strong>Reserva de prueba recibida</strong><br>${esc(v.name)} · ${dateIn.value} · ${chosen} · ${partyIn.value} personas<br><span class="muted">Es una demostración: no se guarda ni se envía correo.</span></div>`;
      return result.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    submit.disabled = true; submit.textContent = "Reservando…";
    const body = { venue: venueSel.value, date: dateIn.value, time: chosen, party: Number(partyIn.value), name: $("#b-name").value, phone: $("#b-phone").value,
      email: $("#b-email").value, notes: $("#b-notes").value, consent: $("#b-consent").checked, website: $("#b-website").value };
    const ts = form.querySelector('[name="cf-turnstile-response"]'); if (ts) body.turnstile = ts.value;
    try {
      const r = await fetch("/api/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        form.reset(); dateIn.value = iso(today); slotsEl.innerHTML = ""; say("");
        result.innerHTML = `<div class="ok"><strong>¡Reserva confirmada!</strong><br>${esc(j.venue)} · ${esc(j.when)} · ${esc(j.party)} personas<br>${j.emailed ? "Te hemos enviado la confirmación por correo (revisa también la carpeta de spam)." : "Guarda estos datos; si necesitas cambiar algo, escríbenos a " + esc(D.email) + "."}</div>`;
      } else if (j.error === "slot_unavailable") {
        await refresh(); say("Esa hora se acaba de ocupar. Elige otra, por favor.", "warn");
      } else if (/^invalid_/.test(j.error || "")) {
        const what = { invalid_phone: "el teléfono", invalid_email: "el correo", invalid_name: "el nombre", invalid_consent: "la casilla de aceptación", invalid_date: "la fecha", invalid_party: "el número de personas" }[j.error] || "los datos";
        say("Revisa " + what + ".", "warn");
      } else {
        say("No hemos podido completar la reserva. Inténtalo de nuevo o escríbenos a " + esc(D.email) + ".", "warn");
      }
    } catch (err) { say("No hemos podido completar la reserva. Inténtalo de nuevo o escríbenos a " + esc(D.email) + ".", "warn"); }
    submit.textContent = "Confirmar reserva"; submit.disabled = !chosen;
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  refresh();
})();
