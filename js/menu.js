// Interactive carta: venue switch, sticky section nav with scroll-spy, featured carousel, accordions, search.
(function () {
  const D = window.CUARTANGO;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const mobile = () => matchMedia("(max-width: 860px)").matches;

  const qv = new URLSearchParams(location.search).get("local");
  let venue = D.menus[qv] ? qv : "las-palmas";
  let query = "";
  let spy = null;

  // Dish photos: list the file slugs in CUARTANGO.photos (data.js) once the files exist in img/menu/. No probing, so no 404s.
  const have = new Set(D.photos || []);
  const photo = (name) => have.has(slug(name)) ? `<img loading="lazy" alt="${esc(name)}" src="img/menu/${slug(name)}.jpg">` : "";

  const drawVenue = () => {
    $("#menu-venue").innerHTML = Object.entries(D.venues).map(([k, v]) =>
      `<button type="button" data-v="${k}" class="${k === venue ? "on" : ""}" aria-pressed="${k === venue}">${esc(v.name)}</button>`).join("");
    const m = D.menus[venue];
    $("#menu-note").innerHTML = (venue === "las-palmas"
      ? "Carta del Local Las Palmas, con parrilla."
      : "Carta del Nuevo Local Vecindario, sin parrilla.") + ` <a href="${m.pdf}" target="_blank" rel="noopener">Descargar carta en PDF</a>`;
  };

  const render = () => {
    const m = D.menus[venue];
    const q = query.trim().toLowerCase();
    const sections = m.sections.map((s) => ({ ...s, items: s.items.filter((it) => !q || (it.name + " " + it.desc).toLowerCase().includes(q)) })).filter((s) => s.items.length);

    // section chips
    $("#menu-cats").innerHTML = sections.map((s) => `<a href="#s-${s.id}" data-id="${s.id}">${esc(s.title)}</a>`).join("");

    // featured carousel (hidden while searching)
    const feat = m.sections.flatMap((s) => s.items.filter((it) => it.featured));
    $("#menu-featured").innerHTML = q || !feat.length ? "" :
      `<div class="feat-head"><h2>Destacados</h2><div class="feat-btns"><button type="button" aria-label="Anterior" data-dir="-1">‹</button><button type="button" aria-label="Siguiente" data-dir="1">›</button></div></div>
       <div class="feat-track" tabindex="0" aria-label="Platos destacados">${feat.map((it) =>
        `<article class="feat-card"><div class="feat-img">${photo(it.name)}<span class="feat-fallback">${esc(it.name)}</span></div>
          <div class="feat-body"><h3>${esc(it.name)}</h3><span class="mprice">${esc(it.price)}</span></div></article>`).join("")}</div>`;

    // accordion sections
    $("#menu-sections").innerHTML = sections.length ? sections.map((s, idx) => {
      const open = q || !mobile() || idx === 0;
      return `<section class="msec${open ? " open" : ""}" id="s-${s.id}">
        <button type="button" class="msec-h" aria-expanded="${open}" aria-controls="b-${s.id}"><h2>${esc(s.title)}</h2><span class="count">${s.items.length}</span><span class="chev" aria-hidden="true"></span></button>
        <div class="msec-b" id="b-${s.id}"><div class="msec-in">${s.note ? `<p class="msec-note">${esc(s.note)}</p>` : ""}
          <div class="mgrid">${s.items.map((it) =>
            `<article class="mitem"><div class="mphoto${have.has(slug(it.name)) ? "" : " noimg"}">${photo(it.name)}</div>
              <div class="mtext"><div class="mrow"><h3>${esc(it.name)}</h3><span class="mdots"></span><span class="mprice">${esc(it.price)}</span></div>
              ${it.desc ? `<p>${esc(it.desc)}</p>` : ""}</div></article>`).join("")}</div></div></div></section>`;
    }).join("") : '<p class="muted">Ningún plato coincide con tu búsqueda.</p>';

    setupSpy();
  };

  const setupSpy = () => {
    if (spy) spy.disconnect();
    const chips = [...document.querySelectorAll("#menu-cats a")];
    spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) chips.forEach((c) => { const on = c.dataset.id === e.target.id.slice(2); c.classList.toggle("on", on);
        if (on) c.scrollIntoView({ block: "nearest", inline: "center" }); }); });
    }, { rootMargin: "-140px 0px -65% 0px" });
    document.querySelectorAll(".msec").forEach((s) => spy.observe(s));
  };

  const toggle = (sec, force) => {
    const o = force ?? !sec.classList.contains("open");
    sec.classList.toggle("open", o);
    sec.querySelector(".msec-h").setAttribute("aria-expanded", o);
  };

  $("#menu-venue").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    venue = b.dataset.v; history.replaceState(null, "", "?local=" + venue); drawVenue(); render();
  });
  $("#menu-q").addEventListener("input", (e) => { query = e.target.value; render(); });
  $("#menu-sections").addEventListener("click", (e) => { const h = e.target.closest(".msec-h"); if (h) toggle(h.parentNode); });
  $("#menu-cats").addEventListener("click", (e) => {
    const a = e.target.closest("a"); if (!a) return;
    e.preventDefault();
    const sec = document.getElementById("s-" + a.dataset.id);
    toggle(sec, true);
    window.scrollTo({ top: sec.getBoundingClientRect().top + scrollY - 130, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
  $("#menu-featured").addEventListener("click", (e) => {
    const b = e.target.closest("[data-dir]"); if (!b) return;
    const t = $(".feat-track"); t.scrollBy({ left: Number(b.dataset.dir) * (t.clientWidth * 0.8), behavior: "smooth" });
  });
  $("#menu-expand").addEventListener("click", (e) => {
    const all = [...document.querySelectorAll(".msec")];
    const open = !all.every((s) => s.classList.contains("open"));
    all.forEach((s) => toggle(s, open)); e.target.textContent = open ? "Contraer todo" : "Expandir todo";
  });

  drawVenue(); render();
  // deep link from the home (menu.html?local=x#s-parrilla): open and scroll to that section
  if (location.hash.startsWith('#s-')) {
    const sec = document.getElementById(location.hash.slice(1));
    if (sec) { toggle(sec, true); setTimeout(() => window.scrollTo({ top: sec.getBoundingClientRect().top + scrollY - 130 }), 120); }
  }
})();
