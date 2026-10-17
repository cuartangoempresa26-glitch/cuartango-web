// Visual blocks: triptych (3 vertical panels), carousel + full-screen viewer, reveal on scroll, hero parallax.
// Content comes from js/media-data.js. Place a block with <div data-media="triptych"></div> or <div data-media="gallery"></div>;
// the page (home / las-palmas / vecindario / catering) decides which list it reads.
(function () {
  const page = document.body.dataset.page, M = (window.MEDIA || {})[page] || {};
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches || !!(navigator.connection && navigator.connection.saveData);
  const isVid = (it) => it.type === "video" || /\.(mp4|webm)$/i.test(it.src);
  const media = (it, cls) => isVid(it)
    ? `<video class="${cls}" muted loop playsinline preload="metadata"${it.poster ? ` poster="${esc(it.poster)}"` : ""} data-src="${esc(it.src)}" aria-label="${esc(it.alt)}" style="object-position:${esc(it.pos || "50% 50%")}"></video>`
    : `<img class="${cls}" loading="lazy" decoding="async" src="${esc(it.src)}" alt="${esc(it.alt)}" style="object-position:${esc(it.pos || "50% 50%")}">`;

  // ---------- videos play only while visible ----------
  const vio = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
  }), { threshold: 0.25 }) : null;
  const watchVideos = (root) => $$("video[data-src]", root).forEach((v) => { if (reduce || !vio) { if (v.poster) return; } else vio.observe(v); });

  // ---------- triptych ----------
  const triptych = (box, items) => {
    box.innerHTML = `<div class="tri" role="group" aria-label="Galería de tres imágenes">${items.map((it, i) =>
      `<figure class="tri-p" style="--i:${i}" tabindex="0">${media(it, "tri-m")}${it.caption ? `<figcaption>${esc(it.caption)}</figcaption>` : ""}</figure>`).join("")}</div>`;
    const tri = $(".tri", box), ps = $$(".tri-p", tri);
    ps.forEach((p) => {
      p.addEventListener("click", () => { const was = p.classList.contains("on"); ps.forEach((x) => x.classList.remove("on")); if (!was) p.classList.add("on"); });
      p.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); p.click(); } });
    });
    watchVideos(tri);
  };

  // ---------- viewer (full screen) ----------
  let lb;
  const viewer = (items, start) => {
    if (!lb) {
      lb = document.createElement("dialog"); lb.className = "lb"; lb.setAttribute("aria-label", "Galería");
      lb.innerHTML = `<button class="lb-x" type="button" aria-label="Cerrar">×</button><button class="lb-n lb-prev" type="button" aria-label="Anterior">‹</button>
        <figure class="lb-f"></figure><button class="lb-n lb-next" type="button" aria-label="Siguiente">›</button>`;
      document.body.appendChild(lb);
      lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb-f")) lb.close(); });
      $(".lb-x", lb).addEventListener("click", () => lb.close());
      lb.addEventListener("close", () => { const v = $("video", lb); if (v) v.pause(); });
    }
    let i = start;
    const show = () => {
      const it = items[i];
      $(".lb-f", lb).innerHTML = (isVid(it)
        ? `<video src="${esc(it.src)}" controls autoplay playsinline loop${it.poster ? ` poster="${esc(it.poster)}"` : ""}></video>`
        : `<img src="${esc(it.src)}" alt="${esc(it.alt)}">`) + (it.caption ? `<figcaption>${esc(it.caption)}</figcaption>` : "");
      lb.classList.toggle("single", items.length < 2);
    };
    const go = (d) => { i = (i + d + items.length) % items.length; show(); };
    lb.onkeydown = (e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    $(".lb-prev", lb).onclick = () => go(-1); $(".lb-next", lb).onclick = () => go(1);
    let x0 = null;
    lb.ontouchstart = (e) => { x0 = e.touches[0].clientX; };
    lb.ontouchend = (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); x0 = null; };
    show(); lb.showModal();
  };

  // ---------- carousel ----------
  const gallery = (box, items) => {
    box.innerHTML = `<div class="gal" role="region" aria-roledescription="carrusel" aria-label="Galería de imágenes">
      <div class="gal-track" tabindex="0">${items.map((it, i) =>
        `<figure class="gal-s" data-i="${i}">${media(it, "gal-m")}${it.caption ? `<figcaption>${esc(it.caption)}</figcaption>` : ""}<button class="gal-zoom" type="button" aria-label="Ver a pantalla completa: ${esc(it.alt)}"></button></figure>`).join("")}</div>
      <div class="gal-ctl"><div class="gal-dots">${items.map((_, i) => `<button type="button" aria-label="Ir a la imagen ${i + 1}"></button>`).join("")}</div>
        <div class="gal-btns"><button type="button" class="gal-prev" aria-label="Anterior">‹</button><button type="button" class="gal-next" aria-label="Siguiente">›</button></div></div></div>`;
    const tr = $(".gal-track", box), slides = $$(".gal-s", tr), dots = $$(".gal-dots button", box);
    const cur = () => { const c = tr.scrollLeft + tr.clientWidth / 2; let b = 0, bd = 1e9; slides.forEach((s, i) => { const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - c); if (d < bd) { bd = d; b = i; } }); return b; };
    const to = (i) => { i = (i + slides.length) % slides.length; tr.scrollTo({ left: slides[i].offsetLeft - (tr.clientWidth - slides[i].offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" }); };
    const mark = () => { const c = cur(); dots.forEach((d, i) => d.classList.toggle("on", i === c)); slides.forEach((s, i) => s.classList.toggle("on", i === c)); };
    tr.addEventListener("scroll", () => requestAnimationFrame(mark), { passive: true }); mark();
    $(".gal-prev", box).addEventListener("click", () => { stop(); to(cur() - 1); });
    $(".gal-next", box).addEventListener("click", () => { stop(); to(cur() + 1); });
    dots.forEach((d, i) => d.addEventListener("click", () => { stop(); to(i); }));
    tr.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { e.preventDefault(); stop(); to(cur() + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); stop(); to(cur() - 1); } });
    $$(".gal-zoom", tr).forEach((b, i) => b.addEventListener("click", () => { stop(); viewer(items, i); }));
    // mouse drag (touch already swipes natively)
    let down = null;
    tr.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = { x: e.clientX, l: tr.scrollLeft, moved: false }; });
    window.addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - down.x; if (Math.abs(dx) > 4) { down.moved = true; tr.classList.add("drag"); } if (down.moved) tr.scrollLeft = down.l - dx; });
    window.addEventListener("pointerup", () => { if (!down) return; const m = down.moved; down = null; tr.classList.remove("drag"); if (m) { tr.addEventListener("click", (e) => e.stopPropagation(), { capture: true, once: true }); to(cur()); } });
    // gentle autoplay while visible; stops at the first interaction
    let timer = null;
    const stop = () => { clearInterval(timer); timer = null; auto = false; };
    let auto = !reduce && slides.length > 1;
    if (auto && "IntersectionObserver" in window) new IntersectionObserver((es) => es.forEach((e) => {
      clearInterval(timer); timer = null;
      if (e.isIntersecting && auto) timer = setInterval(() => { if (!document.hidden) to(cur() + 1); }, 5500);
    }), { threshold: 0.5 }).observe(box);
    box.addEventListener("pointerenter", () => { clearInterval(timer); timer = null; });
    box.addEventListener("touchstart", stop, { passive: true });
    watchVideos(tr);
  };

  // ---------- build the blocks (only with valid items) ----------
  const check = (it) => new Promise((ok) => {
    if (isVid(it)) return ok(true);
    const im = new Image(); im.onload = () => ok(true); im.onerror = () => ok(false); im.src = it.src;
  });
  $$("[data-media]").forEach(async (box) => {
    const kind = box.dataset.media, list = M[kind] || [];
    const ok = (await Promise.all(list.map(check))).map((v, i) => v && list[i]).filter(Boolean);
    const need = kind === "triptych" ? 3 : 1;
    const wrap = box.closest("[data-media-wrap]") || box;
    if (ok.length < need) { wrap.hidden = true; return; }
    wrap.hidden = false;
    (kind === "triptych" ? triptych : gallery)(box, kind === "triptych" ? ok.slice(0, 3) : ok);
    box.setAttribute("data-reveal", "");
    revealWatch(box);
  });

  // ---------- reveal on scroll ----------
  const rio = !reduce && "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }) : null;
  function revealWatch(el) { if (rio) rio.observe(el); else el.classList.add("in"); }
  if (rio) {
    document.documentElement.classList.add("js-reveal");
    $$("main > section:not(.hero):not(.seo-section) > .wrap > *").forEach((el, i) => {
      if (el.hasAttribute("data-reveal")) return;
      el.setAttribute("data-reveal", ""); el.style.setProperty("--d", (i % 4) * 70 + "ms"); revealWatch(el);
    });
  }

  // ---------- hero parallax (media only, cheap) ----------
  const hm = $(".hero.has-video .hero-video"), hero = hm && hm.closest(".hero");
  if (hm && !reduce) {
    let tick = false;
    addEventListener("scroll", () => {
      if (tick) return; tick = true;
      requestAnimationFrame(() => { const y = Math.min(scrollY, hero.offsetHeight); hm.style.transform = `translate3d(0,${y * 0.18}px,0) scale(1.08)`; tick = false; });
    }, { passive: true });
  }
})();
