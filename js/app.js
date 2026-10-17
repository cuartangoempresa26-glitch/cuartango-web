(function () {
  const D = window.CUARTANGO;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const page = document.body.dataset.page || "";

  // ---------- shared header / footer ----------
  const links = [
    ["index.html", "Inicio", "home"], ["menu.html", "Carta", "menu"],
    ["las-palmas.html", "Las Palmas", "las-palmas"], ["vecindario.html", "Vecindario", "vecindario"],
    ["eventos.html", "Eventos", "eventos"], ["catering.html", "Catering", "catering"]
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
     <div class="wrap muted" style="margin-top:24px;font-size:.85rem">© ${new Date().getFullYear()} Cuartango Argentina · <a href="aviso-legal.html">Aviso legal</a> · <a href="privacidad.html">Privacidad</a> · <a href="cookies.html">Cookies</a></div></footer>
     <div class="mobilebar"><a href="tel:${lp.phone.replace(/\s/g, "")}">Llamar</a><a href="${lp.maps}" target="_blank" rel="noopener">Cómo llegar</a></div>`);

  // ---------- helpers ----------
  const stars = (n) => `<span class="stars" aria-label="${n} de 5">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;
  const reviewsHTML = () => D.reviews.map((r) =>
    `<div class="card">${stars(r.stars)}<p>“${esc(r.text)}”</p><p class="muted">${esc(r.author)}</p></div>`).join("");
  const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const ORDER = [1, 2, 3, 4, 5, 6, 0];
  const mins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const nowIn = () => { const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: D.timezone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(new Date()).map((x) => [x.type, x.value])); return { day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(p.weekday), min: Number(p.hour) * 60 + Number(p.minute) }; };
  const openStatus = (v) => { if (!v.hours) return null; const n = nowIn(); const cur = (v.hours[n.day] || []).find(([a, b]) => n.min >= mins(a) && n.min < mins(b));
    return cur ? `<span class="badge open">Abierto ahora · cierra a las ${cur[1]}</span>` : `<span class="badge closed">Cerrado ahora</span>`; };
  const hoursHTML = (v) => { if (!v.hours) return `<span class="badge todo">Horario por confirmar</span>`;
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
    $("#v-phone").innerHTML = v.phone ? `<a href="tel:${v.phone.replace(/\s/g, "")}">${v.phone}</a>` : '<span class="badge todo">Teléfono por confirmar</span>';
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
    $("#v-book").href = "reservas.html?local=" + vk;
    $("#v-menu").href = "menu.html?local=" + vk;
    const o = v.order || {}, ob = $("#v-order");
    if (ob) ob.innerHTML = [[o.glovo, "Pedir en Glovo"], [o.uber, "Pedir en Uber Eats"]].filter(([u]) => u).map(([u, t]) => `<a class="btn ghost" href="${esc(u)}" target="_blank" rel="noopener">${t}</a>`).join(" ");
    $("#v-specials").innerHTML = D.specials.filter((s) => s.venue === "all" || s.venue === vk)
      .map((s) => `<div class="specials"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`).join("");
  }

})();
