// Google Analytics 4, loaded only after the visitor accepts. Inactive (no banner, no cookies) while CUARTANGO_CONFIG.ga4MeasurementId is empty.
(function () {
  const id = (window.CUARTANGO || {}).ga4MeasurementId;
  window.ctTrack = () => {};
  if (!id) return;
  const KEY = "ct_consent";
  const get = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const set = (v) => { try { localStorage.setItem(KEY, v); } catch (e) {} };
  let loaded = false;

  function load() {
    if (loaded) return; loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    gtag("js", new Date());
    gtag("config", id, { anonymize_ip: true });
    const s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
    window.ctTrack = (name, params) => gtag("event", name, params || {});
    // automatic click events
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
      const h = a.getAttribute("href") || "";
      if (/wa\.me|whatsapp/i.test(h)) ctTrack("whatsapp_click", { page: location.pathname });
      else if (/^tel:/i.test(h)) ctTrack("llamada_click", { page: location.pathname });
      else if (/reservas(\.html)?(\?|#|$)/.test(h)) ctTrack("reservar_click", { page: location.pathname });
      else if (/ubereats|just-eat|glovo/i.test(h)) ctTrack("pedido_online_click", { destino: a.hostname });
    }, true);
  }

  function banner() {
    const b = document.createElement("div");
    b.setAttribute("role", "dialog"); b.setAttribute("aria-label", "Cookies");
    b.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:560px;margin:auto;background:#fff;color:#1f2326;border:1px solid #d8c3a0;box-shadow:0 12px 40px rgba(0,0,0,.25);padding:16px 18px;font:15px/1.5 Inter,system-ui,sans-serif";
    b.innerHTML = '<p style="margin:0 0 12px">Usamos cookies de analítica (Google Analytics) para saber qué páginas te interesan y mejorar la web. Solo se activan si las aceptas. <a href="cookies.html" style="color:#a44f27">Más información</a></p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" data-v="granted" style="flex:1;min-height:44px;border:1px solid #823b1b;background:#a44f27;color:#fff;font:600 15px Inter,system-ui,sans-serif;cursor:pointer">Aceptar</button>' +
      '<button type="button" data-v="denied" style="flex:1;min-height:44px;border:1px solid #2b1d17;background:#fff;color:#2b1d17;font:600 15px Inter,system-ui,sans-serif;cursor:pointer">Rechazar</button></div>';
    b.addEventListener("click", (e) => { const v = e.target.dataset && e.target.dataset.v; if (!v) return; set(v); b.remove(); if (v === "granted") load(); });
    document.body.appendChild(b);
  }

  const c = get();
  if (c === "granted") load(); else if (!c) banner();
  // footer link to change the choice
  window.ctCookieSettings = () => { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };
})();
