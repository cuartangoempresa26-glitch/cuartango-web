(function () {
  const C = window.CATERING, cfg = window.CUARTANGO_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  $("#c-tagline").textContent = C.tagline; $("#c-intro").textContent = C.intro;
  $("#c-why").innerHTML = C.why.map((t) => `<li>${esc(t)}</li>`).join("");
  $("#c-services").innerHTML = C.services.map(([t, d]) => `<div class="card"><h3>${esc(t)}</h3>${d ? `<p class="muted">${esc(d)}</p>` : ""}</div>`).join("");
  $("#c-includes").textContent = C.includes;
  $("#c-menus").innerHTML = C.menus.map((m) => `<article class="card menu-card"><h3>${esc(m.name)}</h3>
    <div class="price">${m.price} €<small> / persona</small></div>
    ${m.sections.map(([h, l]) => `<h4>${esc(h)}</h4><ul>${l.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`).join("")}</article>`).join("");
  $("#c-canapes").innerHTML = C.canapes.map((t) => `<li>${esc(t)}</li>`).join("");
  $("#c-canapes-note").textContent = C.canapesNote;
  $("#c-extras").innerHTML = C.extras.map((t) => `<li>${esc(t)}</li>`).join("");
  $("#c-cond").innerHTML = C.conditions.map((t) => `<li>${esc(t)}</li>`).join("");
  C.menus.forEach((m) => $("#c-menu").add(new Option(`${m.name} (${m.price} €/pers.)`, m.name)));
  const extras = [...C.extras, "Canapés", "Vajilla y menaje", "Barra libre"];
  $("#c-extra-checks").innerHTML = extras.map((e) => `<label><input type="checkbox" name="extras" value="${esc(e)}"> ${esc(e)}</label>`).join("");

  const date = $("#c-date"), guests = $("#c-guests"), warn = $("#c-warn");
  const min = new Date(); min.setDate(min.getDate() + 1); date.min = min.toISOString().slice(0, 10);
  const hint = () => {
    const m = [];
    if (guests.value && Number(guests.value) < 25) m.push("El servicio mínimo es de 25 comensales; igualmente podemos estudiar tu caso.");
    if (date.value && (new Date(date.value) - new Date()) / 864e5 < 30) m.push("Solemos pedir 30 días de antelación; escríbenos y vemos si es posible.");
    warn.textContent = m.join(" ");
  };
  date.addEventListener("change", hint); guests.addEventListener("input", hint);

  $("#cat-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, res = $("#c-result"), btn = $("#c-submit");
    if (!f.reportValidity()) return;
    const fd = new FormData(f);
    const payload = Object.fromEntries([...fd].filter(([k]) => k !== "extras"));
    payload.extras = fd.getAll("extras");
    const ts = f.querySelector('[name="cf-turnstile-response"]'); if (ts) payload.turnstile = ts.value;
    btn.disabled = true; btn.textContent = "Enviando…";
    try {
      const r = await fetch(cfg.cateringEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Error");
      f.reset(); warn.textContent = "";
      res.innerHTML = `<div class="ok"><strong>¡Gracias, ${esc(payload.name)}!</strong><br>Hemos recibido tu consulta y te responderemos pronto a ${esc(payload.email)}.${j.demo ? '<br><span class="muted">(Modo de prueba: el correo real se activará al publicar la web.)</span>' : ""}</div>`;
    } catch (err) {
      res.innerHTML = `<div class="ok err">No se ha podido enviar. Escríbenos a <a href="mailto:info@cuartango.com">info@cuartango.com</a> o llama al +34 656 441 966.</div>`;
    }
    btn.disabled = false; btn.textContent = "Enviar consulta";
    res.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
