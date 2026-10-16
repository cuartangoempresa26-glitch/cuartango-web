// Cancel page: the e-mail link carries ?v=<venue>&id=<event>&t=<signed token>.
(function () {
  const D = window.CUARTANGO, box = document.getElementById("c-box"), q = new URLSearchParams(location.search);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const body = { v: q.get("v"), id: q.get("id"), t: q.get("t") };
  const contact = `escríbenos a <a href="mailto:${D.email}">${D.email}</a>`;
  const call = (extra) => fetch("/api/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, ...extra }) });
  const summary = (j) => `<p><strong>${esc(j.venue)}</strong><br>${esc(j.when)} · ${esc(j.party)} personas<br>A nombre de ${esc(j.name)}</p>`;

  if (!body.v || !body.id || !body.t) { box.innerHTML = `<p>El enlace no es válido. Si necesitas cancelar tu reserva, ${contact}.</p>`; return; }
  (async () => {
    try {
      const r = await call({}), j = await r.json();
      if (r.status === 404) return (box.innerHTML = `<p>Esta reserva ya no existe: probablemente ya está cancelada.</p><p><a class="btn ghost" href="index.html">Volver al inicio</a></p>`);
      if (!r.ok) return (box.innerHTML = `<p>No hemos podido comprobar tu reserva. ${contact[0].toUpperCase() + contact.slice(1)}.</p>`);
      box.innerHTML = `${summary(j)}<p>¿Quieres cancelar esta reserva?</p><p><button id="c-go" class="btn" type="button">Sí, cancelar mi reserva</button> <a class="btn ghost" href="index.html">No, la mantengo</a></p>`;
      document.getElementById("c-go").addEventListener("click", async (e) => {
        e.target.disabled = true; e.target.textContent = "Cancelando…";
        try {
          const r2 = await call({ confirm: true }), j2 = await r2.json();
          box.innerHTML = r2.ok && j2.cancelled
            ? `<div class="ok"><strong>Reserva cancelada.</strong><br>${esc(j2.when)} · ${esc(j2.party)} personas. Gracias por avisar; esperamos verte pronto.</div><p><a class="btn ghost" href="reservas.html">Hacer una nueva reserva</a></p>`
            : `<p>No hemos podido cancelarla. ${contact[0].toUpperCase() + contact.slice(1)}.</p>`;
        } catch { box.innerHTML = `<p>No hemos podido cancelarla. ${contact[0].toUpperCase() + contact.slice(1)}.</p>`; }
      });
    } catch { box.innerHTML = `<p>No hemos podido comprobar tu reserva. ${contact[0].toUpperCase() + contact.slice(1)}.</p>`; }
  })();
})();
