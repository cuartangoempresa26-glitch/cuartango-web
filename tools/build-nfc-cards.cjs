// Google review cards with NFC + QR (CR80 85.6 x 54 mm, front + back) for both venues.
// Usage: node tools/build-nfc-cards.cjs -> docs/nfc/tarjetas-resenas.html (then print to PDF).
// The NFC chip and the QR both point to https://cuartango.com/resena/<venue> (worker redirect), so the
// Google link can change later without reprinting. NFC: ?src=nfc, QR: ?src=qr (counted in Cloudflare logs).
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const QR = require(path.join(root, "media-work/node_modules/qrcode"));
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(root, "js/data.js"), "utf8"), ctx);
const D = ctx.window.CUARTANGO;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const NFC = '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="13" y="6" width="17" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="2.6"/><line x1="19" y1="31" x2="24" y2="31" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M34 15a10 10 0 0 1 0 14M38 11a16 16 0 0 1 0 22M42 7a22 22 0 0 1 0 30" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
const CARDS = [
  { v: "las-palmas", brand: "Cuartango Argentina", place: "Las Palmas", logo: "../../img/logo-menu-trim.png" },
  { v: "vecindario", brand: "Cuartango Milanesería", place: "Vecindario", logo: "../../img/logo-milaneseria.png" }
];
(async () => {
  let pages = "";
  for (const c of CARDS) {
    const link = `https://cuartango.com/resena/${c.v}`;
    const qr = await QR.toString(link + "?src=qr", { type: "svg", margin: 0, color: { dark: "#000000", light: "#ffffff" }, errorCorrectionLevel: "M" });
    const V = D.venues[c.v];
    pages += `
<div class="card front">
  <img class="logo" src="${c.logo}" alt="${esc(c.brand)}">
  <div class="txt"><div class="h">¿Te gustó?</div><div class="s">Cuéntalo en Google</div><div class="p">Tu opinión nos ayuda a mejorar y a que más gente nos conozca.</div></div>
  <div class="tap">${NFC}<span>Acerca tu móvil aquí</span></div>
  <div class="flag"><i></i><i></i><i></i></div>
</div>
<div class="card back">
  <div class="bt">Déjanos tu reseña en 30 segundos</div>
  <div class="row">
    <div class="qr">${qr}<span>Escanea</span></div>
    <ol>
      <li><b>Acerca el móvil</b> a la tarjeta (NFC) <b>o escanea</b> el código.</li>
      <li><b>Elige tus estrellas</b> y escribe tu opinión.</li>
      <li><b>¡Gracias</b> por elegirnos!</li>
    </ol>
  </div>
  <div class="ft"><b>${esc(c.brand)}</b> · ${esc(c.place)} · ${esc(V.address)}<br><span>cuartango.com/resena/${c.v}</span></div>
</div>`;
  }
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Tarjetas NFC de reseñas Cuartango (CR80, 85,6 x 54 mm)</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@400;500;600;700;800&display=swap">
<style>
@page{size:85.6mm 54mm;margin:0}*{box-sizing:border-box}html,body{margin:0;background:#d9d5cc}
body{font-family:Inter,Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.card{width:85.6mm;height:54mm;margin:0 auto 5mm;position:relative;overflow:hidden;page-break-after:always}
.card:last-child{page-break-after:auto}
.front{background:#000200;color:#fff;display:grid;grid-template-columns:27mm 1fr;grid-template-rows:1fr auto;column-gap:2.5mm;padding:4.5mm 4.5mm 0 4mm}
.logo{width:27mm;height:auto;align-self:center;mix-blend-mode:lighten}
.txt{align-self:center}
.h{font:700 17pt/1 "Cormorant Garamond",Georgia,serif;color:#e9c46a}
.s{font:700 9.6pt/1.2 Inter;color:#fff;margin-top:.8mm;letter-spacing:.02em}
.p{font:400 6.6pt/1.35 Inter;color:#f6efe4;margin-top:1.4mm;max-width:40mm}
.tap{grid-column:1/3;display:flex;align-items:center;justify-content:center;gap:2mm;margin:1.6mm 0 2.4mm;padding:1.6mm 3mm;border:.35mm solid #b08d57;border-radius:2.4mm;color:#e9c46a}
.tap svg{width:8mm;height:8mm}.tap span{font:800 8.4pt Inter;letter-spacing:.12em;text-transform:uppercase}
.flag{position:absolute;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(3,1fr);height:1.6mm}.flag i{background:#3b8ee8}.flag i:nth-child(2){background:#fff}
.back{background:#faf8f4;color:#2b1d17;padding:4mm 4.5mm 3mm;display:flex;flex-direction:column}
.bt{font:700 12.6pt/1.05 "Cormorant Garamond",Georgia,serif;color:#a44f27;text-align:center;letter-spacing:.02em}
.row{display:flex;gap:3.6mm;align-items:center;margin-top:2.6mm;flex:1}
.qr{flex:none;width:24mm;text-align:center}.qr svg{width:24mm;height:24mm;display:block;background:#fff;padding:1.5mm;border:.25mm solid #d8c3a0;border-radius:1mm;box-sizing:border-box}
.qr span{display:block;font:800 6.4pt Inter;letter-spacing:.14em;text-transform:uppercase;color:#823b1b;margin-top:.8mm}
ol{margin:0;padding-left:4mm;font:400 7.4pt/1.35 Inter}ol li{margin:0 0 1.2mm}ol b{font-weight:700}
.ft{font:400 5.8pt/1.35 Inter;color:#667078;text-align:center;border-top:.3mm solid #d8c3a0;padding-top:1.2mm}.ft b{color:#2b1d17}.ft span{color:#a44f27;font-weight:600}
</style></head><body>${pages}
</body></html>`;
  const out = path.join(root, "docs/nfc", "tarjetas-resenas.html");
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, html); console.log("written", path.relative(root, out));
})();
