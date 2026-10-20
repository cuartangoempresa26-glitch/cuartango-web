(function () {
  const D = window.CUARTANGO;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const page = document.body.dataset.page || "";

  // ---------- shared header / footer ----------
  const links = [
    ["menu.html", "Carta", "menu"],
    ["las-palmas.html", "Las Palmas", "las-palmas"], ["vecindario.html", "Vecindario", "vecindario"],
    ["eventos.html", "Eventos", "eventos"], ["catering.html", "Catering", "catering"], ["nosotros.html", "Nosotros", "nosotros"]
  ];
  const nav = links.map(([h, t, k]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ""}>${t}</a>`).join("");
  document.body.insertAdjacentHTML("afterbegin",
    `<header class="site"><div class="wrap">
       <a class="brand" href="index.html">CUARTANGO</a>
       <button class="burger" aria-label="Abrir menú" aria-expanded="false">Menú</button>
       <nav class="main">${nav}</nav>
       <a class="btn reserve" href="reservas.html">Reservar</a>
     </div></header>`);
  const burger = $(".burger"), navEl = $("nav.main");
  const setNav = (o) => { navEl.classList.toggle("open", o); burger.setAttribute("aria-expanded", o); };
  burger.addEventListener("click", () => setNav(!navEl.classList.contains("open")));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });
  document.addEventListener("click", (e) => { if (!e.target.closest("header.site")) setNav(false); });

  const lp = D.venues["las-palmas"];
  document.body.insertAdjacentHTML("beforeend",
    `<footer class="site"><div class="wrap grid three">
       <div><h3>Cuartango Argentina</h3><p class="muted">${esc(D.slogan)}</p>
         <p><a href="${D.instagram}" target="_blank" rel="noopener">Instagram @cuartango_argentina</a></p></div>
       <div><h3>Las Palmas</h3><p>${esc(lp.address)}<br><a href="tel:${lp.phone.replace(/\s/g, "")}">${lp.phone}</a></p>
         <p><a href="las-palmas.html">Parrilla argentina en Las Palmas</a></p></div>
       <div><h3>Vecindario</h3><p>${esc(D.venues.vecindario.address)}<br><a href="vecindario.html">Milanesas y entrepanes en Vecindario</a></p>
         <p><a href="mailto:${D.email}">${D.email}</a></p></div>
     </div>
     <div class="wrap muted" style="margin-top:24px;font-size:.85rem">© ${new Date().getFullYear()} Cuartango Argentina · <a href="aviso-legal.html">Aviso legal</a> · <a href="privacidad.html">Privacidad</a> · <a href="cookies.html">Cookies</a></div></footer>`);

  // ---------- floating WhatsApp button (discreet; opens only when tapped) ----------
  const wa = "https://wa.me/34656441966?text=" + encodeURIComponent("Hola, accedí a la web de Cuartango y quiero reservar");
  document.body.insertAdjacentHTML("beforeend",
    `<a class="wa" href="${wa}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">
       <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2a9.93 9.93 0 0 0-8.45 15.17L2 22l4.97-1.56A9.93 9.93 0 1 0 12.04 2Zm0 1.8a8.13 8.13 0 1 1-4.3 15.04l-.31-.19-2.95.93.96-2.87-.2-.32A8.13 8.13 0 0 1 12.04 3.8ZM8.6 7.5c-.2 0-.5 0-.75.37-.26.37-.98.96-.98 2.34s1 2.7 1.14 2.89c.14.18 1.96 3.1 4.84 4.23 2.39.94 2.88.75 3.4.7.52-.05 1.68-.69 1.92-1.35.24-.66.24-1.23.17-1.35-.07-.12-.26-.19-.54-.33l-1.84-.9c-.25-.12-.43-.17-.6.1l-.84 1.05c-.15.19-.3.21-.56.08-.26-.14-1.1-.4-2.1-1.3-.77-.7-1.3-1.55-1.45-1.81-.15-.26 0-.4.12-.53l.4-.47c.13-.15.17-.26.26-.43.09-.18.04-.33-.02-.46l-.86-2.09c-.2-.5-.43-.43-.6-.44H8.6Z"/></svg>
       <span>WhatsApp</span></a>`);

  // ---------- analytics (inactive until a GA4 id is set in data.js) ----------
  if (D.ga4MeasurementId) { const an = document.createElement("script"); an.src = "js/analytics.js"; document.body.appendChild(an); }

  // ---------- helpers ----------
  const stars = (n) => `<span class="stars" aria-label="${n} de 5">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;
  const reviewsHTML = () => D.reviews.map((r) =>
    `<div class="card">${stars(r.stars)}<p>“${esc(r.text)}”</p><p class="muted">${esc(r.author)}</p></div>`).join("");
  const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const ORDER = [1, 2, 3, 4, 5, 6, 0];
  const mins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const nowIn = () => { const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: D.timezone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(new Date()).map((x) => [x.type, x.value])); return { day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(p.weekday), min: Number(p.hour) * 60 + Number(p.minute) }; };
  const SOON = '<span class="badge todo">Próximamente</span>';
  const openStatus = (v) => { if (v.comingSoon) return SOON; if (!v.hours) return null; const n = nowIn(); const cur = (v.hours[n.day] || []).find(([a, b]) => n.min >= mins(a) && n.min < mins(b));
    return cur ? `<span class="badge open">Abierto ahora · cierra a las ${cur[1]}</span>` : `<span class="badge closed">Cerrado ahora</span>`; };
  const hoursHTML = (v) => { if (v.comingSoon) return SOON + '<span class="muted"> Anunciaremos el horario con la apertura.</span>'; if (!v.hours) return `<span class="badge todo">Horario por confirmar</span>`;
    const today = nowIn().day;
    return openStatus(v) + `<table class="hours">` + ORDER.map((i) => `<tr${i === today ? ' class="today"' : ""}><th>${DAYS[i]}</th><td>${v.hours[i].length ? v.hours[i].map(([a, b]) => a + "–" + b).join(" · ") : "Cerrado"}</td></tr>`).join("") + `</table>`; };
  window.CT = { openStatus, nowIn };
  const lpOpen = $("#lp-open"); if (lpOpen) lpOpen.innerHTML = openStatus(D.venues["las-palmas"]) || "";

  // ---------- hero video (loop background; skipped for reduced motion / data saver) ----------
  const hv = $("#hero-video"), hs = $("#hero"), conn = navigator.connection;
  if (hv && hs && !matchMedia("(prefers-reduced-motion: reduce)").matches && !(conn && conn.saveData)) {
    hv.addEventListener("loadeddata", () => { hs.classList.add("has-video"); hv.play().catch(() => hs.classList.remove("has-video")); });
    hv.addEventListener("error", () => hs.classList.remove("has-video"), true);
    hv.load();
  }

  // ---------- home ----------
  const sp = $("#specials");
  if (sp) sp.innerHTML = D.specials.map((s) => `<div class="specials"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`).join("");
  const rv = $("#reviews");

  // ---------- venue pages ----------
  const vk = document.body.dataset.venue;
  if (vk) {
    const v = D.venues[vk];
    $("#v-address").innerHTML = v.address ? esc(v.address) : '<span class="badge todo">Dirección por confirmar</span>';
    $("#v-phone").innerHTML = v.phone ? `<a href="tel:${v.phone.replace(/\s/g, "")}">${v.phone}</a>` : (v.comingSoon ? 'Lo anunciaremos con la apertura' : '<span class="badge todo">Teléfono por confirmar</span>');
    $("#v-hours").innerHTML = hoursHTML(v);
    $("#v-services").innerHTML = v.services.length ? v.services.map((s) => `<li>${esc(s)}</li>`).join("") : '<li class="badge todo">Servicios por confirmar</li>';
    $("#v-pay").textContent = v.payments || "Por confirmar";
    // Map loads only on click (privacy + speed) and is sandboxed so Google's consent page cannot navigate the whole site away.
    $("#v-map").innerHTML = v.mapEmbed
      ? `<div class="map-facade card"><p><strong>${esc(v.address)}</strong></p><p class="muted">El mapa de Google se carga al pulsar.</p>
         <button class="btn ghost" id="map-load" type="button">Ver mapa</button> <a class="btn ghost" href="${v.maps}" target="_blank" rel="noopener">Cómo llegar</a></div>`
      : '<div class="card muted">El mapa aparecerá cuando tengamos la dirección.</div>';
    const ml2 = $("#map-load");
    if (ml2) ml2.addEventListener("click", () => { $(".map-facade").outerHTML = `<iframe class="map" title="Mapa ${esc(v.name)}" src="${v.mapEmbed}" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" referrerpolicy="no-referrer-when-downgrade"></iframe><p><a class="btn ghost" href="${v.maps}" target="_blank" rel="noopener">Cómo llegar</a></p>`; });
    if (v.comingSoon) { $("#v-book").outerHTML = SOON; const ev = $("#v-event"); if (ev) ev.remove(); } else $("#v-book").href = "reservas.html?local=" + vk;
    $("#v-menu").href = "menu.html?local=" + vk;
    const o = v.comingSoon ? {} : (v.order || {}), ob = $("#v-order");
    if (ob) ob.innerHTML = [[o.glovo, "Pedir en Glovo"], [o.uber, "Pedir en Uber Eats"]].filter(([u]) => u).map(([u, t]) => `<a class="btn ghost" href="${esc(u)}" target="_blank" rel="noopener">${t}</a>`).join(" ");
    $("#v-specials").innerHTML = D.specials.filter((s) => s.venue === "all" || s.venue === vk)
      .map((s) => `<div class="specials"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`).join("");
    if (!$("#v-specials").children.length) $("#v-specials").closest("section").hidden = true;
  }

})();
