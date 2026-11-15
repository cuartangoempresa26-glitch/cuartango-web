// Printable menu (A4, front + back, to laminate) for each venue, generated from js/data.js so prices never drift.
// Usage: node tools/build-carta.cjs      -> docs/carta/carta-las-palmas.html and carta-vecindario.html
// Then print to PDF (see docs/carta/README.txt). Drinks: add `drinks: { "las-palmas": [["Agua", "2,00"]], ... }` to js/data.js when the list exists.
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
const section = (v, id, title, extra = "") => {
  const s = D.menus[v].sections.find((x) => x.id === id); if (!s) throw new Error("no section " + id + " in " + v);
  return `<section class="sec"><h2>${esc(title || s.title)}</h2>${s.items.filter((i) => !(extra === "noparr" && /^Parrillada/.test(i.name))).map((i) => item(v, i, id)).join("")}${s.note && extra !== "nonote" ? `<p class="note">${esc(s.note)}</p>` : ""}</section>`;
};

const panel = (name, p, text, extra) => `<div class="pnl"><div class="pt"><span>${FLAME}${esc(name)}</span><b>${esc(price(p))}</b></div><div class="pd">${esc(text)}</div>${extra ? `<div class="px">${esc(extra)}</div>` : ""}</div>`;

async function qr(url) { return QR.toString(url, { type: "svg", margin: 0, color: { dark: "#2b1d17", light: "#0000" } }); }

async function build(v) {
  const V = D.venues[v], name = v === "las-palmas" ? "Las Palmas" : "Vecindario";
  const utm = (u, c) => u + (u.includes("?") ? "&" : "?") + "utm_source=carta&utm_medium=qr&utm_campaign=" + c;
  const q1 = await qr(utm("https://cuartango.com/reservas?local=" + v, "reservar"));
  const q2 = await qr("https://www.instagram.com/cuartango_argentina/");
  const q3 = await qr(utm("https://catering.cuartango.com/", "catering"));
  const drinks = (D.drinks && D.drinks[v]) || [];
  const logo = "../../img/logo-menu.jpg";
  const head = `<header class="band"><img src="${logo}" alt="Cuartango"><div><div class="t1">Carta</div><div class="t2">${esc(D.slogan)}</div><div class="t3">${esc(name)} · ${esc(V.address)}</div></div></header>`;
  const head2 = `<header class="band slim"><div class="t1 s">Cuartango · ${esc(name)}</div><div class="t2">${v === "las-palmas" ? "Parrilla argentina" : "Milanesas y entrepanes"}</div></header>`;
  const flag = '<div class="flag"><i></i><i></i><i></i></div>';

  const sug = `<div class="sug"><div class="sh">Sugerencia del día</div><div class="sl"></div><div class="sl"></div><div class="sl"></div><div class="sl"></div></div>`;
  let A, B;
  if (v === "las-palmas") {
    const par = D.menus[v].sections.find((s) => s.id === "parrilla");
    const g = par.items.find((i) => i.name === "Parrillada"), gp = par.items.find((i) => i.name === "Parrillada premium");
    A = `<div class="cols"><div>${section(v, "entrantes")}${section(v, "entrepanes")}</div><div><section class="sec"><h2>Parrilla</h2>
      ${panel("Parrillada", g.price, "Chorizo argentino, entraña, vacío, tira de asado, pimientos asados rellenos, salsa criolla y chimichurri.", "Con ensalada, papas y pan.")}
      ${panel("Parrillada premium", gp.price, "La parrillada, con queso provolone, mollejas de ternera y morcilla.", "Con ensalada, papas y pan.")}
      ${par.items.filter((i) => !/^Parrillada/.test(i.name)).map((i) => item(v, i, "parrilla")).join("")}
      <p class="note">${esc(par.note)}</p></section></div></div>`;
    B = `<div class="cols"><div>${section(v, "milanesas")}${section(v, "ensaladas")}</div><div>${section(v, "postres")}${sug}</div></div>`;
  } else {
    const vac = D.menus[v].sections.find((s) => s.id === "vacio").items[0];
    A = `<div class="cols"><div>${section(v, "entrantes")}${section(v, "provolones")}</div><div>${section(v, "entrepanes")}<section class="sec"><h2>Sándwich de vacío</h2>${panel(vac.name, vac.price, desc(v, vac.name, "vacio"), "")}</section></div></div>`;
    B = `<div class="cols"><div>${section(v, "milanesas")}</div><div>${section(v, "postres")}${sug}</div></div>`;
  }
  const drinkBox = drinks.length
    ? `<section class="sec"><h2>Bebidas</h2>${drinks.map(([n, p]) => `<div class="it"><div class="nm">${esc(n)}</div><div class="pr">${esc(p)}</div></div>`).join("")}</section>`
    : "";
  const brandb = `<div class="brandblock"><img src="${logo}" alt=""><div><div class="bh">Cocinamos como en casa, en Argentina</div><div class="bp">Leña, brasa y recetas de siempre. ¿Celebras algo? Hacemos catering con parrillero en tu evento, y también puedes festejar en nuestro local.</div></div></div>`;
  const foot = `<div class="foot">
    <div class="about"><p><b>Cuartango ${esc(name)}</b> · ${esc(V.address)}${V.phone ? " · " + esc(V.phone) : ""}</p>${drinkBox}<p class="al">Consulta con el personal si tienes alergias o intolerancias.</p></div>
    <div class="qrs"><div class="q"><div class="qi">${q1}</div><span>Reservar</span></div><div class="q"><div class="qi">${q2}</div><span>Instagram</span></div><div class="q"><div class="qi">${q3}</div><span>Catering</span></div></div></div>`;

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Carta Cuartango ${esc(name)} (A4, doble cara)</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap">
<style>
@page{size:A4;margin:0}
*{box-sizing:border-box}html,body{margin:0;background:#d9d5cc}
body{font-family:Inter,Arial,sans-serif;color:#2b1d17;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.sheet{width:210mm;height:297mm;margin:0 auto 6mm;background:#faf8f4;position:relative;overflow:hidden;display:flex;flex-direction:column;page-break-after:always}
.sheet:last-child{page-break-after:auto}
.band{background:#000200;color:#fff;display:flex;align-items:center;gap:7mm;padding:3mm 12mm 3mm 10mm;border-bottom:1.2mm solid #b08d57}
.band img{height:30mm;width:auto}
.band .t1{font:600 34pt/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.22em;text-transform:uppercase;color:#e9c46a}
.band .t2{font:500 9pt Inter;letter-spacing:.16em;text-transform:uppercase;color:#f6efe4;margin-top:2mm}
.band .t3{font:400 8pt Inter;color:#d8c3a0;margin-top:1.4mm}
.band.slim{padding:4mm 12mm;justify-content:space-between}.band.slim .t1.s{font-size:17pt;letter-spacing:.12em;white-space:nowrap}.band.slim .t2{margin:0}
.body{flex:1;padding:8mm 12mm 4mm;display:flex;flex-direction:column;min-height:0}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:0 10mm;flex:none}
.brandblock{flex:1;margin:2mm 0 6mm;background:#000200;color:#fff;border-radius:3mm;border:.5mm solid #b08d57;display:flex;align-items:center;gap:8mm;padding:0 9mm;min-height:26mm;max-height:78mm}
.brandblock img{height:24mm;width:auto}.brandblock .bh{font:600 17pt/1.1 "Cormorant Garamond",Georgia,serif;letter-spacing:.06em;color:#e9c46a}.brandblock .bp{font:400 8.6pt/1.4 Inter;color:#f6efe4;margin-top:1.6mm}
.sec{margin:0 0 6mm}
h2{font:700 16.5pt/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.2em;text-transform:uppercase;color:#a44f27;margin:0 0 3.2mm;padding-bottom:1.6mm;border-bottom:.5mm solid #b08d57}
.it{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:0 0 3.6mm}
.nm{font:700 10.8pt/1.15 Inter;letter-spacing:.035em;text-transform:uppercase;color:#2b1d17}
.ds{font:400 9pt/1.28 Inter;color:#4a4f54;margin-top:.7mm}
.pr{font:700 11.8pt/1.1 Inter;color:#a44f27;white-space:nowrap;font-variant-numeric:tabular-nums}
.it.star{background:#f6ead0;border-left:1.2mm solid #a44f27;padding:1.6mm 2mm;margin-left:-3.2mm;margin-right:-2mm}
.fl{width:3mm;height:3mm;fill:#a44f27;margin-right:1.2mm;vertical-align:-.4mm}
.note{font:italic 8pt/1.3 Inter;color:#667078;margin:1mm 0 0}
.pnl{border:.35mm solid #b08d57;outline:.35mm solid #e9c46a;outline-offset:-1.6mm;background:#f6ead0;padding:3.2mm 4mm;margin:0 0 3.4mm}
.pt{display:flex;justify-content:space-between;align-items:baseline;font:700 11.5pt Inter;letter-spacing:.04em;text-transform:uppercase}
.pt b{color:#a44f27;font-size:13pt}.pd{font:400 9pt/1.3 Inter;color:#3a3f44;margin-top:1.2mm}.px{font:600 8pt Inter;color:#823b1b;margin-top:1mm}
.foot{display:grid;grid-template-columns:1.6fr 1fr;gap:6mm;align-items:stretch;border-top:.5mm solid #b08d57;padding-top:5mm;margin-top:auto}
.sug{border:.5mm dashed #a44f27;border-radius:3mm;padding:3mm 4mm;background:#fff;margin-top:6mm}
.sh{font:700 9pt Inter;letter-spacing:.14em;text-transform:uppercase;color:#823b1b}
.sl{border-bottom:.3mm solid #cfc8bb;height:10mm}
.about p{font:400 8.4pt/1.35 Inter;margin:0 0 2mm}.about b{font-weight:700}.about .al{font-size:7.2pt;color:#667078}
.about .sec{margin:0 0 2mm}.about h2{font-size:11pt;margin-bottom:1.6mm}.about .it{margin-bottom:1.2mm}
.qrs{display:flex;gap:3mm;justify-content:flex-end;align-items:flex-end}
.q{text-align:center;font:600 7pt Inter;letter-spacing:.08em;text-transform:uppercase;color:#2b1d17}
.qi{width:17mm;height:17mm;margin:0 auto 1mm;background:#fff;padding:1mm;border:.25mm solid #d8c3a0}.qi svg{width:100%;height:100%;display:block}
.sheet.big .nm{font-size:12.2pt}.sheet.big .ds{font-size:10pt}.sheet.big .pr{font-size:13.2pt}.sheet.big h2{font-size:18.5pt}.sheet.big .it{margin-bottom:4.8mm}.sheet.big .pt{font-size:13pt}.sheet.big .pd{font-size:10pt}
.legend{margin-top:auto;font:500 8.4pt Inter;color:#667078;display:flex;align-items:center;gap:2mm;padding:3mm 0 0}
.flag{display:grid;grid-template-columns:repeat(3,1fr);height:3mm}.flag i{background:#3b8ee8}.flag i:nth-child(2){background:#fff}
</style></head><body>
<div class="sheet${v === "vecindario" ? " big" : ""}">${head}<div class="body">${A}<div class="legend">${FLAME} Recomendado de la casa</div></div>${flag}</div>
<div class="sheet">${head2}<div class="body">${B}${brandb}${foot}</div>${flag}</div>
</body></html>`;
  const out = path.join(root, "docs/carta", `carta-${v}.html`);
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, html);
  console.log("written", path.relative(root, out), drinks.length ? "" : "(sin bebidas: faltan datos)");
}
(async () => { for (const v of ["las-palmas", "vecindario"]) await build(v); })();
