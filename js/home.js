// Home: interactive venue panels + "Los más elegidos" carousel.
(function () {
  const D = window.CUARTANGO, H = window.HOME, CT = window.CT || {};
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // ----- venue panels -----
  const vp = $("#vpanels");
  if (vp) {
    vp.innerHTML = ["las-palmas", "vecindario"].map((k) => {
      const v = D.venues[k], h = H.venues[k];
      const open = (CT.openStatus && CT.openStatus(v)) || '<span class="badge">Horario próximamente</span>';
      return `<article class="vpanel" data-v="${k}" tabindex="0" aria-label="${esc(h.tag)}">
        <div class="vp-bg${h.photo ? "" : " nophoto"}"${h.photo ? ` style="background-image:url('${h.photo}')"` : ""}></div>
        <div class="vp-shade"></div>
        <div class="vp-in">
          <span class="vp-tag">${esc(h.tag)}</span>
          <h3>${esc(h.title)}</h3>
          <div class="vp-open">${open}<span class="vp-hint" aria-hidden="true">Descubrir <i>→</i></span></div>
          <div class="vp-more">
            <p>${esc(h.body)}</p>
            <ul class="vp-chips">${h.chips.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
            <p class="vp-addr">${esc(v.address)}</p>
            <div class="vp-actions"><a class="btn" href="${k}.html">Ver local</a><a class="btn ghost" href="reservas.html?local=${k}">Reservar</a><a class="btn ghost" href="menu.html?local=${k}">Carta</a></div>
          </div>
        </div></article>`;
    }).join("");
    // tap/click toggles the panel (touch devices have no hover); links keep working
    vp.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      const p = e.target.closest(".vpanel"); if (!p) return;
      const was = p.classList.contains("active");
      vp.querySelectorAll(".vpanel").forEach((x) => x.classList.remove("active"));
      if (!was) p.classList.add("active");
    });
    vp.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("vpanel")) { e.preventDefault(); e.target.click(); }
    });
  }

  // ----- most chosen dishes -----
  const pk = $("#picks");
  if (pk) {
    const have = new Set(D.photos || []);
    const cards = H.picks.map((p) => {
      const sec = D.menus[p.venue].sections.find((s) => s.items.some((i) => i.name === p.item));
      const it = sec && sec.items.find((i) => i.name === p.item);
      if (!it) return "";
      const s = slug(it.name), v = D.venues[p.venue];
      return `<a class="feat-card pick" href="menu.html?local=${p.venue}#s-${sec.id}" aria-label="${esc(it.name)}, ${esc(it.price)}">
        <div class="feat-img">${have.has(s) ? `<img loading="lazy" alt="${esc(it.name)}" src="img/menu/${s}.jpg">` : ""}<span class="feat-fallback">${esc(it.name)}</span>
          <span class="pick-venue">${esc(v.name.replace("Nuevo ", ""))}</span></div>
        <div class="feat-body"><h3>${esc(it.name)}</h3><span class="mprice">${esc(it.price)}</span></div></a>`;
    }).join("");
    pk.innerHTML = `<div class="feat-track" tabindex="0" aria-label="Los platos más elegidos">${cards}</div>`;
    $("#picks-prev").addEventListener("click", () => { const t = $(".feat-track", pk); t.scrollBy({ left: -t.clientWidth * 0.8, behavior: "smooth" }); });
    $("#picks-next").addEventListener("click", () => { const t = $(".feat-track", pk); t.scrollBy({ left: t.clientWidth * 0.8, behavior: "smooth" }); });
  }
})();
