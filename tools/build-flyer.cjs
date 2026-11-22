// Promo flyer (13x18 cm, front + back) for both venues, generated from js/data.js. Usage: node tools/build-flyer.cjs -> docs/flyer/flyer-cuartango.html (then print to PDF).
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const QR = require(path.join(root, "media-work/node_modules/qrcode"));
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(root, "js/data.js"), "utf8"), ctx);
const D = ctx.window.CUARTANGO, LP = D.venues["las-palmas"], VC = D.venues["vecindario"];
const qr = (u) => QR.toString(u, { type: "svg", margin: 0, color: { dark: "#000000", light: "#ffffff" }, errorCorrectionLevel: "M" });
const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
// compact opening hours text, e.g. "Mar-Mié y Sáb 13-17 y 20-23"
const fmt = (t) => t.replace(/^0/, "").replace(":00", "");
const slots = (h) => h.map(([a, b]) => `${fmt(a)}–${fmt(b)}`).join(" y ");
const hoursLines = (hours) => {
  const groups = []; for (const d of [1, 2, 3, 4, 5, 6, 0]) { const k = JSON.stringify(hours[d]); const g = groups.find((x) => x.k === k); if (g) g.d.push(d); else groups.push({ k, d: [d], s: hours[d] }); }
  return groups.map((g) => `${g.d.map((d) => DAYS[d].slice(0, 3)).join(", ")}: ${g.s.length ? slots(g.s) : "cerrado"}`);
};
(async () => {
  const qCat = await qr("https://catering.cuartango.com/?utm_source=flyer&utm_medium=qr&utm_campaign=catering");
  const qIg = await qr("https://www.instagram.com/cuartango_argentina/");
  const logoLP = "../../img/logo-menu.jpg", logoVC = "../../img/logo-milaneseria.png";
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Flyer Cuartango (13x18 cm, doble cara)</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap">
<style>
@page{size:130mm 180mm;margin:0}*{box-sizing:border-box}html,body{margin:0;background:#d9d5cc}
body{font-family:Inter,Arial,sans-serif;color:#2b1d17;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:151.67mm;height:210mm;zoom:.857143;margin:0 auto 6mm;position:relative;overflow:hidden;display:flex;flex-direction:column;page-break-after:always}
.page:last-child{page-break-after:auto}
.front{background:#000200;color:#fff}
.logos{display:flex;justify-content:center;align-items:center;gap:6mm;padding:5mm 8mm 1mm}
.logos img{height:20mm;width:auto;mix-blend-mode:lighten}
.logos .sep{width:.3mm;height:16mm;background:#b08d57}
.kick{font:600 7.6pt Inter;letter-spacing:.3em;text-transform:uppercase;color:#d8c3a0;text-align:center;margin-top:2mm}
h1{font:700 26pt/1.02 "Cormorant Garamond",Georgia,serif;text-align:center;color:#e9c46a;margin:2mm 8mm 0;letter-spacing:.01em}
.sub{font:500 9.6pt/1.3 Inter;text-align:center;color:#f6efe4;margin:2mm 10mm 0}
.cards{display:grid;grid-template-columns:1fr;gap:2.4mm;margin:3.6mm 9mm 0}
.card{border:.4mm solid #b08d57;border-radius:2.5mm;padding:2.8mm 4mm;background:rgba(246,239,228,.06)}
.card.hl{background:#a44f27;border-color:#e9c46a}
.card h2{margin:0;font:800 10.5pt Inter;letter-spacing:.12em;text-transform:uppercase;color:#e9c46a}
.card.hl h2{color:#fff}
.card p{margin:1mm 0 0;font:400 8.6pt/1.34 Inter;color:#f6efe4}
.card b{color:#fff}
.price{display:inline-block;margin-top:1.6mm;font:700 9pt Inter;color:#000200;background:#e9c46a;border-radius:1.5mm;padding:.8mm 2.4mm}
.brands{display:flex;gap:3mm;margin-top:2.4mm;align-items:center}.bd{display:inline-flex;align-items:center;justify-content:center;height:7.2mm;padding:0 3.6mm;border-radius:3.6mm;font:800 10.5pt/1 Inter,Arial,sans-serif;letter-spacing:-.01em}
.bd.uber{background:#000;border:.35mm solid #fff;color:#fff}.bd.uber i{font-style:normal;color:#06c167;margin-left:1mm}
.bd.glovo{background:#ffc244;color:#00a082;text-transform:lowercase;letter-spacing:0}
.qrbar{display:flex;justify-content:center;gap:11mm;margin-top:auto;padding:3mm 8mm 3mm;border-top:.4mm solid #b08d57}
.q{text-align:center}
.qi{width:28mm;height:28mm;background:#fff;padding:2mm;border-radius:2mm;margin:0 auto 1.6mm}.qi svg{width:100%;height:100%;display:block}
.q b{display:block;font:800 8.5pt Inter;letter-spacing:.1em;text-transform:uppercase;color:#e9c46a}
.q span{display:block;font:400 7.4pt Inter;color:#f6efe4;margin-top:.5mm}
.flag{display:grid;grid-template-columns:repeat(3,1fr);height:3mm;flex:none}.flag i{background:#3b8ee8}.flag i:nth-child(2){background:#fff}
/* back */
.back{background:#faf8f4}
.bh{background:#000200;color:#e9c46a;text-align:center;padding:6mm 8mm 5mm;border-bottom:1.2mm solid #b08d57}
.bh .t{font:700 20pt/1.05 "Cormorant Garamond",Georgia,serif;letter-spacing:.08em;text-transform:uppercase}
.bh .s{font:500 8pt Inter;letter-spacing:.2em;text-transform:uppercase;color:#f6efe4;margin-top:1.6mm}
.venues{padding:7mm 9mm 0;display:grid;gap:6mm}
.v{border:.4mm solid #b08d57;border-radius:2.5mm;background:#fff;padding:5mm 5.5mm}
.v h3{margin:0;font:700 15pt "Cormorant Garamond",Georgia,serif;letter-spacing:.1em;text-transform:uppercase;color:#a44f27}
.v .tag{font:500 8.8pt Inter;color:#667078;margin-top:.5mm}
.v .ad{font:600 11pt/1.35 Inter;margin-top:3mm}
.v .ph{font:800 19pt Inter;color:#a44f27;margin-top:2mm;letter-spacing:.02em}
.v .hr{font:400 9pt/1.55 Inter;color:#4a4f54;margin-top:2.4mm}
.how{margin:7mm 9mm 0;display:grid;grid-template-columns:repeat(3,1fr);gap:2.5mm}
.how div{background:#f6ead0;border-radius:2mm;padding:4mm 2.6mm;text-align:center}
.how b{display:block;font:800 9pt Inter;letter-spacing:.08em;text-transform:uppercase;color:#823b1b}
.how span{display:block;font:400 8.4pt/1.4 Inter;color:#3a3f44;margin-top:1mm}
.cta{margin:auto 9mm 6mm;text-align:center;font:600 10.5pt/1.4 Inter;color:#2b1d17}
.cta b{color:#a44f27}
</style></head><body>
<div class="page front">
  <div class="logos"><img src="${logoLP}" alt="Cuartango"><div class="sep"></div><img src="${logoVC}" alt="Cuartango Milanesería"></div>
  <div class="kick">Cocina argentina · Gran Canaria</div>
  <h1>Llevamos el sabor de Argentina<br>a tu mesa</h1>
  <div class="sub">Catering, para llevar y a domicilio: elige cómo disfrutarlo.</div>
  <div class="cards">
    <div class="card hl"><h2>Catering a domicilio</h2><p><b>Cumpleaños y celebraciones especiales.</b> También bodas, reuniones y eventos de empresa. Llevamos la parrilla y al parrillero a tu evento, con un menú pensado a tu medida.</p><span class="price">Desde 40 € por persona · mínimo 25 comensales</span></div>
    <div class="card"><h2>Take away en nuestros locales</h2><p>Pide para llevar en cualquiera de los dos locales, en horario de atención: <b>milanesas, entrepanes, empanadas</b> y más, listos para disfrutar en casa o en la oficina.</p></div>
    <div class="card"><h2>A domicilio con Uber Eats y Glovo</h2><p>Recibe nuestros platos donde estés, rápido y calentitos, desde las plataformas de reparto.</p><div class="brands"><span class="bd uber">Uber<i>Eats</i></span><span class="bd glovo">Glovo</span></div></div>
  </div>
  <div class="qrbar">
    <div class="q"><div class="qi">${qCat}</div><b>Catering</b><span>Menús y presupuesto</span></div>
    <div class="q"><div class="qi">${qIg}</div><b>Instagram</b><span>@cuartango_argentina</span></div>
  </div>
  <div class="flag"><i></i><i></i><i></i></div>
</div>
<div class="page back">
  <div class="bh"><div class="t">Dónde encontrarnos</div><div class="s">Reserva, pide para llevar o escríbenos</div></div>
  <div class="venues">
    <div class="v"><h3>Cuartango Argentina</h3><div class="tag">Las Palmas · parrilla argentina, entrepanes y milanesas</div>
      <div class="ad">${LP.address}</div><div class="ph">${LP.phone}</div><div class="hr">${hoursLines(LP.hours).join("<br>")}</div></div>
    <div class="v"><h3>Cuartango Milanesería</h3><div class="tag">Vecindario · milanesas, entrepanes y sándwich de vacío al disco</div>
      <div class="ad">${VC.address}</div><div class="ph">${VC.phone}</div><div class="hr">${hoursLines(VC.hours).join("<br>")}</div></div>
  </div>
  <div class="how"><div><b>Catering</b><span>Escanea el QR del frente y pide tu presupuesto</span></div><div><b>Para llevar</b><span>Llama o pasa por cualquiera de los locales</span></div><div><b>Reparto</b><span>Uber Eats y Glovo, a tu puerta</span></div></div>
  <div class="cta"><b>cuartango.com</b> · Reserva online, carta y catering</div>
  <div class="flag"><i></i><i></i><i></i></div>
</div>
</body></html>`;
  const out = path.join(root, "docs/flyer", "flyer-cuartango.html");
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, html); console.log("written", path.relative(root, out));
})();
