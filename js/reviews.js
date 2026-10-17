// Live Google reviews. The reviews sections stay hidden until /api/reviews answers (it returns 503 while not configured).
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const stars = (n) => `<span class="stars" aria-label="${n} de 5">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;
  const card = (r) => `<div class="card">${stars(r.stars)}<p>${r.text ? `“${esc(r.text.length > 320 ? r.text.slice(0, 317) + "…" : r.text)}”` : "<em class='muted'>Valoración sin comentario</em>"}</p>
    <p class="muted">${r.link ? `<a href="${esc(r.link)}" target="_blank" rel="noopener nofollow">${esc(r.author)}</a>` : esc(r.author)}${r.when ? " · " + esc(r.when) : ""}</p></div>`;
  const head = (d, label) => `<p class="rating-line"><strong>★ ${String(d.rating).replace(".", ",")}</strong> · ${d.total} reseñas en Google${label ? " · " + esc(label) : ""} ${d.url ? `<a href="${esc(d.url)}" target="_blank" rel="noopener">Ver en Google Maps</a>` : ""}</p>`;
  const get = async (venue) => { try { const r = await fetch("/api/reviews?venue=" + venue); return r.ok ? await r.json() : null; } catch { return null; } };
  const caption = (box) => { const p = box.previousElementSibling; if (p && p.classList.contains("muted")) p.remove(); };

  (async () => {
    const home = document.getElementById("reviews"), venueBox = document.getElementById("v-reviews"), venue = document.body.dataset.venue;
    if (venueBox && venue) {
      const d = await get(venue); if (!d || !d.reviews.length) return;
      caption(venueBox); venueBox.closest("section").hidden = false; venueBox.insertAdjacentHTML("beforebegin", head(d)); venueBox.innerHTML = d.reviews.map(card).join("");
    }
    if (home) {
      const [lp, vc] = await Promise.all([get("las-palmas"), get("vecindario")]);
      const parts = [[lp, "Las Palmas"], [vc, "Vecindario"]].filter(([d]) => d && d.reviews.length);
      if (!parts.length) return;
      caption(home); home.closest("section").hidden = false;
      home.insertAdjacentHTML("beforebegin", parts.map(([d, l]) => head(d, l)).join(""));
      home.innerHTML = parts.flatMap(([d]) => d.reviews.slice(0, 2)).map(card).join("");
    }
  })();
})();
