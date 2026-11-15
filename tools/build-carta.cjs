// Printable menu (6 A4 faces = 3 sheets, laminated and bound) for each venue, generated from js/data.js so prices never drift.
// Usage: node tools/build-carta.cjs  ->  docs/carta/carta-las-palmas.html and carta-vecindario.html (then print to PDF, duplex, flip on long edge).
// Odd faces keep extra margin on the left, even faces on the right (ring/spiral binding).
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const QR = require(path.join(root, "media-work/node_modules/qrcode"));
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(root, "js/data.js"), "utf8"), ctx);
const D = ctx.window.CUARTANGO;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const price = (p) => String(p).replace(/\s*€/, "");

// Short descriptions (max ~70 characters, only facts from the carta). Key = dish name; "@vecindario:" prefix overrides.
const S = {
  "Empanadas": "De ternera cortada a cuchillo, de pollo o árabes. Precio por unidad.",
  "@vecindario:Empanadas": "De ternera cortada a cuchillo o de pollo. Precio por unidad.",
  "Papas La Mona": "Papas fritas con huevo revuelto, chimichurri y criolla.",
  "Chorizo con chimichurri": "Chorizo argentino cortado, con chimichurri y pan rústico.",
  "Pimientos rellenos": "Asados, rellenos de mozzarella y huevo, gratinados en la parrilla.",
  "Queso provolone": "Fundido a la brasa, con orégano y ají molido.",
  "Provolone a caballo": "El clásico a la parrilla, con jamón y un huevo.",
  "Provolone fugazzeta": "El clásico a la parrilla, con cebolla caramelizada.",
  "Croquetas de vacío": "Cremosas, de vacío desmechado.",
  "Morcilla": "Suave y cremosa, con salsa cuartonesa.",
  "Sesarpo": "Romana, cherry, crutones, atún, cuartonesa y pollo.",
  "Clásico": "Provolone fundido a la brasa, con orégano y ají molido.",
  "A caballo": "El clásico, con jamón y un huevo.",
  "Fugazzeta": "El clásico, con cebolla caramelizada.",
  "Milonga": "Ternera empanada, mozzarella, jamón cocido, huevo, tomate y lechuga.",
  "Folklore": "Pollo de campo empanado, pimientos asados, mozzarella, jamón y huevo.",
  "Cumbia": "Calabacín empanado, cebolla salteada, mozzarella, tomate y lechuga.",
  "Tango": "Chorizo argentino, criolla y chimichurri, tomate y lechuga.",
  "Cuarteto": "Ternera, pan de lomo, jamón, mozzarella, huevo, tomate y lechuga.",
  "Guarnición": "Papas fritas, ensalada o pimiento asado.",
  "Milanesa napolitana": "Ternera empanada, salsa de tomate casera y mozzarella fundida.",
  "Milanesa a caballo": "Con salsa casera, jamón, mozzarella y dos huevos fritos.",
  "Milanesa fugazzeta": "Con salsa casera, mozzarella y cebolla caramelizada, gratinada.",
  "Napolitana": "Ternera empanada, salsa de tomate casera y mozzarella fundida.",
  "Criolla": "Salsa casera, provolone, pimiento asado, cebolla morada y chimichurri.",
  "Caprese": "Salsa casera, mozzarella fresca, pesto y rúcula.",
  "La Porteña": "Salsa casera picante, mozzarella, jalapeños y cebolla morada.",
  "Ensalada Sesarpo": "Cuartonesa, atún, romana, cherry, pollo empanado y crutones.",
  "Ensalada Villera": "Romana, tomate, huevo duro, atún, pasta y choclo.",
  "Ensalada Lacheta": "Romana, cherry, cebolla, olivas negras, zanahoria y queso.",
  "Entraña de ternera": "Fina, tierna y de sabor intenso, con chimichurri.",
  "Vacío de ternera": "Jugoso y tierno, con salsa criolla.",
  "Costilla de ternera": "Jugosa, hecha en nuestra parrilla, con salsa criolla.",
  "Mollejas de ternera": "Piezas redondeadas, muy tiernas y de textura suave.",
  "Entrecot de ternera": "Jugoso y magro, con ensalada, papas fritas y pimiento asado.",
  "Sándwich de vacío al disco": "Vacío desmenuzado al disco, ahumado 6 h al fuego de leña. Toppings +0,50 · queso de cabra, provolone o cheddar +1.",
  "Chocotorta": "Galleta de chocolate, café, crema de queso y dulce de leche.",
  "Budín de pan con dulce de leche": "Pan horneado con huevos, con dulce de leche.",
  "Alfajor artesanal": "Dos galletas con dulce de leche, bañadas en chocolate negro o blanco.",
  "Piña asada con helado de vainilla": "Piña a la parrilla con dulce de leche y helado de vainilla.",
  "Helado de vainilla con dulce de leche": "Helado de vainilla con dulce de leche.",
  "@milanesas:A caballo": "Con salsa casera, jamón, mozzarella y dos huevos fritos.",
  "@milanesas:Fugazzeta": "Con salsa casera, mozzarella y cebolla caramelizada, gratinada.",
  "Helado con dulce de leche": "Sabores: vainilla, fresa con frutos rojos, limón o chocolate."
};
const desc = (v, name, sec) => S["@" + sec + ":" + name] || S["@" + v + ":" + name] || S[name] || "";

const FLAME = '<svg class="fl" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c3 3 5 6 5 9.5a5 5 0 0 1-10 0c0-1.4.5-2.6 1.3-3.8.5 1.6 1.4 2.4 2.6 2.7C10.4 8.6 11 5.4 12 2Z"/></svg>';
const item = (v, it, sec) => `<div class="it${it.featured ? " star" : ""}"><div><div class="nm">${it.featured ? FLAME : ""}${esc(it.name)}</div><div class="ds">${esc(desc(v, it.name, sec))}</div></div><div class="pr">${esc(price(it.price))}</div></div>`;
const sec = (v, id) => D.menus[v].sections.find((x) => x.id === id);
const block = (v, id, title) => { const s = sec(v, id); if (!s) throw new Error("no section " + id); return `<section class="sec">${title === false ? "" : `<h2>${esc(title || s.title)}</h2>`}${s.items.map((i) => item(v, i, id)).join("")}${s.note ? `<p class="note">${esc(s.note)}</p>` : ""}</section>`; };
const panel = (name, p, text, extra) => `<div class="pnl"><div class="pt"><span>${FLAME}${esc(name)}</span><b>${esc(price(p))}</b></div><div class="pd">${esc(text)}</div>${extra ? `<div class="px">${esc(extra)}</div>` : ""}</div>`;
// photos keep their own proportions (never cropped); height fixed per row
const photos = (slugs, h = 58) => `<div class="ph">${slugs.map((s) => `<img src="../../img/menu/${s}.jpg" alt="" style="height:${h}mm">`).join("")}</div>`;
const one = (h) => `<div class="one">${h}</div>`;
const list = (v, id) => sec(v, id).items.map((i) => item(v, i, id)).join("");
const split = (a, b) => `<div class="cols"><div>${a}</div><div>${b}</div></div>`;
async function qr(url) { return QR.toString(url, { type: "svg", margin: 0, color: { dark: "#2b1d17", light: "#0000" } }); }

async function build(v) {
  const V = D.venues[v], name = v === "las-palmas" ? "Las Palmas" : "Vecindario";
  const utm = (u, c) => u + (u.includes("?") ? "&" : "?") + "utm_source=carta&utm_medium=qr&utm_campaign=" + c;
  const q1 = await qr(utm("https://cuartango.com/reservas?local=" + v, "reservar"));
  const q2 = await qr("https://www.instagram.com/cuartango_argentina/");
  const q3 = await qr(utm("https://catering.cuartango.com/", "catering"));
  const logoDark = "../../img/logo-menu.jpg", logoBand = "../../img/logo-menu.jpg";
  const flag = '<div class="flag"><i></i><i></i><i></i></div>';
  const TOTAL = 6; let n = 0;
  const page = (title, body, opts = {}) => {
    n += 1;
    const side = n % 2 ? "odd" : "even"; // odd pages: binding on the left; even pages (back of a sheet): binding on the right
    return `<div class="sheet ${side}${opts.cover ? " cover" : ""}">${opts.cover ? body : `<header class="band"><div class="bt" style="${title.length > 18 ? "font-size:21pt" : ""}">${esc(title)}</div><div class="bl">Cuartango · ${esc(name)}</div></header><div class="body">${body}</div><div class="pg">${n} / ${TOTAL}</div>${flag}`}</div>`;
  };
  const cover = `<div class="cv"><img src="${logoDark}" alt="Cuartango"><div class="cvt">Carta</div><div class="cvs">${esc(D.slogan)}</div><div class="cvl">${esc(name)}</div><div class="cva">${esc(V.address)}</div></div>${flag}`;
  const brand = `<div class="brandblock"><img src="${logoBand}" alt=""><div><div class="bh">Cocinamos como en casa, en Argentina</div><div class="bp">Leña, brasa y recetas de siempre. ¿Celebras algo? Hacemos catering con parrillero en tu evento, y también puedes festejar en nuestro local.</div></div></div>`;
  const sug = `<div class="sug"><div class="sh">Sugerencia del día</div><div class="sl"></div><div class="sl"></div><div class="sl"></div></div>`;
  const foot = `<div class="foot"><div class="about"><p><b>Cuartango ${esc(name)}</b> · ${esc(V.address)}${V.phone ? " · " + esc(V.phone) : ""}</p><p class="al">Consulta con el personal si tienes alergias o intolerancias. ★ = recomendado de la casa.</p></div>
    <div class="qrs"><div class="q"><div class="qi">${q1}</div><span>Reservar</span></div><div class="q"><div class="qi">${q2}</div><span>Instagram</span></div><div class="q"><div class="qi">${q3}</div><span>Catering</span></div></div></div>`;

  let pages;
  if (v === "las-palmas") {
    const par = sec(v, "parrilla"), g = par.items.find((i) => i.name === "Parrillada"), gp = par.items.find((i) => i.name === "Parrillada premium"), rest = par.items.filter((i) => !/^Parrillada/.test(i.name));
    const half = Math.ceil(rest.length / 2);
    pages = [
      page("", cover, { cover: true }),
      page("Entrantes", `${one(list(v, "entrantes"))}${photos(["empanadas", "pimientos-rellenos"], 58)}`),
      page("Parrilla", `<div class="cols">${panel("Parrillada", g.price, "Chorizo argentino, entraña, vacío, tira de asado, pimientos asados rellenos, salsa criolla y chimichurri.", "Con ensalada, papas y pan.")}${panel("Parrillada premium", gp.price, "La parrillada, con queso provolone, mollejas de ternera y morcilla.", "Con ensalada, papas y pan.")}</div>${split(rest.slice(0, half).map((i) => item(v, i, "parrilla")).join(""), rest.slice(half).map((i) => item(v, i, "parrilla")).join(""))}<p class="note">${esc(par.note)}</p>${photos(["parrillada", "costilla-de-ternera"], 62)}`),
      page("Entrepanes", `${one(list(v, "entrepanes"))}${photos(["cumbia", "folklore", "cuarteto", "tango"], 56)}`),
      page("Milanesas y ensaladas", `${one(block(v, "milanesas") + block(v, "ensaladas"))}${photos(["milanesa-a-caballo", "milanesa-fugazzeta"], 62)}`),
      page("Postres", `${block(v, "postres", false)}${sug}${brand}${foot}`)
    ];
  } else {
    const vac = sec(v, "vacio").items[0];
    const ent = sec(v, "entrantes"), hh = Math.ceil(ent.items.length / 2);
    pages = [
      page("", cover, { cover: true }),
      page("Entrantes y provolones", `${split(ent.items.slice(0, hh).map((i) => item(v, i, "entrantes")).join(""), ent.items.slice(hh).map((i) => item(v, i, "entrantes")).join("") + block(v, "provolones"))}${photos(["empanadas", "pimientos-rellenos"], 56)}`),
      page("Entrepanes", `${one(list(v, "entrepanes"))}${photos(["cumbia", "folklore", "cuarteto", "tango"], 56)}`),
      page("Milanesas", `${one(list(v, "milanesas"))}<p class="note">${esc(sec(v, "milanesas").note || "")}</p>${photos(["milanesa-a-caballo", "milanesa-fugazzeta"], 60)}`),
      page("Sándwich de vacío", `${panel(vac.name, vac.price, "Vacío de ternera desmenuzado al disco de arado, ahumado durante 6 horas al fuego de leña.", "Personalízalo con tus toppings.")}<div class="top"><div class="th">Elige tus toppings a 0,50 € cada uno</div><div class="tl">Jalapeño · Cebolla morada · Cuartonesa · Chimichurri · Criolla · Tomate · Lechuga</div><div class="th">Con queso · +1 €</div><div class="tl">Queso de cabra · Queso provolone · Queso cheddar</div></div>${brand}`),
      page("Postres", `${block(v, "postres", false)}${sug}${foot}`)
    ];
  }

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Carta Cuartango ${esc(name)} (6 caras A4, para plastificar y encuadernar)</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap">
<style>
@page{size:A4;margin:0}
*{box-sizing:border-box}html,body{margin:0;background:#d9d5cc}
body{font-family:Inter,Arial,sans-serif;color:#2b1d17;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.sheet{width:210mm;height:297mm;margin:0 auto 6mm;background:#faf8f4;position:relative;overflow:hidden;display:flex;flex-direction:column;page-break-after:always}
.sheet:last-child{page-break-after:auto}
.band{background:#000200;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:7mm 12mm;border-bottom:1.2mm solid #b08d57}
.sheet.odd .band{padding-left:24mm}.sheet.even .band{padding-right:24mm}
.bt{white-space:nowrap;font:600 27pt/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.14em;text-transform:uppercase;color:#e9c46a}
.bl{white-space:nowrap;font:500 8.5pt Inter;letter-spacing:.16em;text-transform:uppercase;color:#d8c3a0;text-align:right}
.body{flex:1;padding:9mm 12mm 4mm;display:flex;flex-direction:column;min-height:0}
.sheet.odd .body{padding-left:24mm}.sheet.even .body{padding-right:24mm}
.one .nm{font-size:12.8pt}.one .ds{font-size:10.6pt}.one .it{margin-bottom:6.2mm}.one .pr{font-size:13.6pt}.one .star{margin-bottom:6.2mm}.one h2{font-size:18pt;margin-top:2mm}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:0 9mm;flex:none}
.sec{margin:0 0 5mm}
h2{font:700 17pt/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.2em;text-transform:uppercase;color:#a44f27;margin:0 0 3.4mm;padding-bottom:1.6mm;border-bottom:.5mm solid #b08d57}
.it{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:0 0 5mm}
.nm{font:700 11.4pt/1.15 Inter;letter-spacing:.035em;text-transform:uppercase}
.ds{font:400 9.4pt/1.32 Inter;color:#4a4f54;margin-top:.9mm}
.pr{font:700 12.4pt/1.1 Inter;color:#a44f27;white-space:nowrap;font-variant-numeric:tabular-nums}
.it.star{background:#f6ead0;border-left:1.2mm solid #a44f27;padding:1.8mm 2.2mm;margin-left:-3.4mm;margin-right:-2.2mm}
.fl{width:3.2mm;height:3.2mm;fill:#a44f27;margin-right:1.2mm;vertical-align:-.4mm}
.note{font:italic 8.6pt/1.3 Inter;color:#667078;margin:1mm 0 3mm}
.pnl{border:.35mm solid #b08d57;outline:.35mm solid #e9c46a;outline-offset:-1.6mm;background:#f6ead0;padding:4mm 5mm;margin:0 0 5mm}
.pt{display:flex;justify-content:space-between;align-items:baseline;font:700 12.6pt Inter;letter-spacing:.04em;text-transform:uppercase}
.pt b{color:#a44f27;font-size:15pt}.pd{font:400 9.6pt/1.35 Inter;color:#3a3f44;margin-top:1.4mm}.px{font:600 8.8pt Inter;color:#823b1b;margin-top:1.2mm}
.ph{display:flex;justify-content:center;align-items:flex-end;gap:4mm;margin-top:auto;padding-top:4mm}
.ph img{width:auto;display:block;border:.4mm solid #d8c3a0;background:#fff}
.top{margin:4mm 0 6mm;border-top:.5mm solid #b08d57;padding-top:5mm}.th{font:700 12pt Inter;letter-spacing:.1em;text-transform:uppercase;color:#823b1b;margin-bottom:2mm}.tl{font:500 13pt/1.5 Inter;margin-bottom:6mm}
.sug{border:.5mm dashed #a44f27;border-radius:3mm;padding:3mm 4mm;background:#fff;margin:2mm 0 6mm}
.sh{font:700 9.5pt Inter;letter-spacing:.14em;text-transform:uppercase;color:#823b1b}.sl{border-bottom:.3mm solid #cfc8bb;height:10mm}
.brandblock{flex:1;margin:2mm 0 6mm;background:#000200;color:#fff;border-radius:3mm;border:.5mm solid #b08d57;display:flex;align-items:center;gap:8mm;padding:0 9mm;min-height:26mm;max-height:70mm}
.brandblock img{height:24mm;width:auto}.brandblock .bh{font:600 17pt/1.1 "Cormorant Garamond",Georgia,serif;letter-spacing:.06em;color:#e9c46a}.brandblock .bp{font:400 8.8pt/1.4 Inter;color:#f6efe4;margin-top:1.6mm}
.foot{display:grid;grid-template-columns:1.6fr 1fr;gap:6mm;align-items:stretch;border-top:.5mm solid #b08d57;padding-top:5mm;margin-top:auto}
.about p{font:400 8.6pt/1.35 Inter;margin:0 0 2mm}.about .al{font-size:7.4pt;color:#667078}
.qrs{display:flex;gap:3mm;justify-content:flex-end;align-items:flex-end}
.q{text-align:center;font:600 7pt Inter;letter-spacing:.08em;text-transform:uppercase}
.qi{width:17mm;height:17mm;margin:0 auto 1mm;background:#fff;padding:1mm;border:.25mm solid #d8c3a0}.qi svg{width:100%;height:100%;display:block}
.pg{font:500 8pt Inter;color:#667078;text-align:center;padding:2mm 0}
.flag{display:grid;grid-template-columns:repeat(3,1fr);height:3mm}.flag i{background:#3b8ee8}.flag i:nth-child(2){background:#fff}
/* cover */
.sheet.cover{background:#000200;color:#fff}
.cv{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 20mm}
.cv img{width:150mm;height:auto;mix-blend-mode:lighten}
.cvt{font:600 46pt/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.3em;text-transform:uppercase;color:#e9c46a;margin-top:6mm;padding-left:.3em}
.cvs{font:500 10pt Inter;letter-spacing:.18em;text-transform:uppercase;color:#f6efe4;margin-top:8mm}
.cvl{font:600 22pt "Cormorant Garamond",Georgia,serif;letter-spacing:.2em;text-transform:uppercase;color:#fff;margin-top:14mm;border-top:.5mm solid #b08d57;padding-top:6mm}
.cva{font:400 9pt Inter;color:#d8c3a0;margin-top:2mm}
</style></head><body>
${pages.join("\n")}
</body></html>`;
  const out = path.join(root, "docs/carta", `carta-${v}.html`);
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, html);
  console.log("written", path.relative(root, out), pages.length, "caras");
}
(async () => { for (const v of ["las-palmas", "vecindario"]) await build(v); })();
