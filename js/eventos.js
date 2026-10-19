// "Festeja tu evento" form: same endpoint as the catering form, tagged as an event in one of our venues.
(function () {
  const cfg = window.CUARTANGO_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const f = $("#ev-form"); if (!f) return;
  const min = new Date(); min.setDate(min.getDate() + 1); $("#e-date").min = min.toISOString().slice(0, 10);
  // "Festejar en ..." buttons preselect the venue
  document.querySelectorAll("[data-pick]").forEach((a) => a.addEventListener("click", () => { $("#e-place").value = a.dataset.pick; }));
  const qp = new URLSearchParams(location.search), g = Number(qp.get("personas")); if (g > 0 && $("#e-guests")) $("#e-guests").value = g;
  const q = qp.get("local"); if (q && $("#e-place").querySelector(`[value="${q}"]`)) $("#e-place").value = q;

  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const res = $("#e-result"), btn = $("#e-submit");
    if (!f.reportValidity()) return;
    const payload = Object.fromEntries(new FormData(f));
    payload.kind = "local";
    btn.disabled = true; btn.textContent = "Enviando…";
    try {
      const r = await fetch(cfg.cateringEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Error");
      f.reset();
      res.innerHTML = `<div class="ok"><strong>¡Gracias, ${esc(payload.name)}!</strong><br>Hemos recibido tu consulta y te responderemos pronto a ${esc(payload.email)}.</div>`;
    } catch (err) {
      res.innerHTML = `<div class="ok err">No se ha podido enviar. Escríbenos a <a href="mailto:info@cuartango.com">info@cuartango.com</a> o llama al +34 656 441 966.</div>`;
    }
    btn.disabled = false; btn.textContent = "Enviar consulta";
    res.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
