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
const list = (v, id) => sec(v, id).items.map((i) => item(v, i, id)).join("");
const block = (v, id, title) => { const s = sec(v, id); if (!s) throw new Error("no section " + id); return `<section class="sec">${title === false ? "" : `<h2>${esc(title || s.title)}</h2>`}${list(v, id)}${s.note ? `<p class="note">${esc(s.note)}</p>` : ""}</section>`; };
const panel = (name, p, text, extra) => `<div class="pnl"><div class="pt"><span>${FLAME}${esc(name)}</span><b>${esc(price(p))}</b></div><div class="pd">${esc(text)}</div>${extra ? `<div class="px">${esc(extra)}</div>` : ""}</div>`;
async function qr(url) { return QR.toString(url, { type: "svg", margin: 0, color: { dark: "#2b1d17", light: "#0000" } }); }

async function build(v) {
  const V = D.venues[v], name = v === "las-palmas" ? "Las Palmas" : "Vecindario";
  const brandName = v === "las-palmas" ? "Cuartango" : "Cuartango Milanesería"; // Vecindario is "Cuartango Milanesería"
  const utm = (u, c) => u + (u.includes("?") ? "&" : "?") + "utm_source=carta&utm_medium=qr&utm_campaign=" + c;
  const q1 = await qr(utm("https://cuartango.com/reservas?local=" + v, "reservar"));
  const q2 = await qr("https://www.instagram.com/cuartango_argentina/");
  const q3 = await qr(utm("https://catering.cuartango.com/", "catering"));
  const logo = v === "las-palmas" ? "../../img/logo-menu.jpg" : "../../img/logo-milaneseria.png";
  const logoW = v === "las-palmas" ? 150 : 95; // the Milanesería logo is a 543 px file: keep it smaller so it prints sharp
  const flag = '<div class="flag"><i></i><i></i><i></i></div>';
  const TOTAL = 6; let n = 0;
  const page = (title, body, opts = {}) => {
    n += 1;
    const side = n % 2 ? "odd" : "even"; // odd faces: binding on the left; even faces (back of a sheet): binding on the right
    return `<div class="sheet ${side}${opts.cover ? " cover" : ""}">${opts.cover ? body : `<header class="band"><div class="bt" style="${title.length > 18 ? "font-size:21pt" : ""}">${esc(title)}</div><div class="bl">${esc(brandName)}${v === "las-palmas" ? " · Las Palmas" : ""}</div></header><div class="body${opts.xl ? " xl" : ""}">${body}</div><div class="pg">${n} / ${TOTAL}</div>${flag}`}</div>`;
  };
  const slogan = v === "las-palmas" ? D.slogan : "Donde la milanesa es un arte"; // Vecindario slogan is tied to the milanesa (confirm wording with the owner)
  const cover = `<div class="cv"><img src="${logo}" alt="${esc(brandName)}" style="width:${logoW}mm"><div class="cvt">Carta</div><div class="cvs">${esc(slogan)}</div><div class="cvl">${esc(name)}</div><div class="cva">${esc(V.address)}</div></div>${flag}`;
  const qrs = `<div class="qrsec"><div class="qh">Escanea y conecta con nosotros</div><div class="qrow">
    <div class="q"><div class="qi">${q1}</div><b>Reservar mesa</b><span>Elige día y hora</span></div>
    <div class="q"><div class="qi">${q2}</div><b>Instagram</b><span>@cuartango_argentina</span></div>
    <div class="q"><div class="qi">${q3}</div><b>Catering</b><span>Parrilla en tu evento</span></div></div>
    <p class="al"><b>${esc(brandName)}</b> · ${esc(V.address)}${V.phone ? " · " + esc(V.phone) : ""}<br>Consulta con el personal si tienes alergias o intolerancias. <span class="stk">${FLAME} Recomendado de la casa</span></p></div>`;

  let pages;
  if (v === "las-palmas") {
    const par = sec(v, "parrilla"), g = par.items.find((i) => i.name === "Parrillada"), gp = par.items.find((i) => i.name === "Parrillada premium"), rest = par.items.filter((i) => !/^Parrillada/.test(i.name));
    pages = [
      page("", cover, { cover: true }),
      page("Entrantes", list(v, "entrantes"), { xl: true }),
      page("Parrilla", `${panel("Parrillada", g.price, "Chorizo argentino, entraña, vacío, tira de asado, pimientos asados rellenos, salsa criolla y chimichurri.", "Con ensalada, papas y pan.")}${panel("Parrillada premium", gp.price, "La parrillada, con queso provolone, mollejas de ternera y morcilla.", "Con ensalada, papas y pan.")}${rest.map((i) => item(v, i, "parrilla")).join("")}<p class="note">${esc(par.note)}</p>`),
      page("Entrepanes", list(v, "entrepanes"), { xl: true }),
      page("Milanesas y ensaladas", block(v, "milanesas") + block(v, "ensaladas")),
      page("Postres", `${block(v, "postres", false)}${qrs}`)
    ];
  } else {
    const vac = sec(v, "vacio").items[0];
    pages = [
      page("", cover, { cover: true }),
      page("Entrantes", list(v, "entrantes"), { xl: true }),
      page("Provolones", `${block(v, "provolones")}<h2 class="h2b">Sándwich de vacío al disco</h2>${panel(vac.name, vac.price, "Vacío de ternera desmenuzado al disco de arado, ahumado durante 6 horas al fuego de leña.", "Personalízalo con tus toppings.")}<div class="top"><div class="th">Toppings a 0,50 € cada uno</div><div class="tl">Jalapeño · Cebolla morada · Cuartonesa · Chimichurri · Criolla · Tomate · Lechuga</div><div class="th">Con queso · +1 €</div><div class="tl">Queso de cabra · Queso provolone · Queso cheddar</div></div>`),
      page("Entrepanes", list(v, "entrepanes"), { xl: true }),
      page("Milanesas", `${list(v, "milanesas")}<p class="note">${esc(sec(v, "milanesas").note || "")}</p>`, { xl: true }),
      page("Postres", `${block(v, "postres", false)}${qrs}`)
    ];
  }

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Carta ${esc(brandName)} ${esc(name)} (6 caras A4, para plastificar y encuadernar)</title>
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
.body{flex:1;padding:11mm 12mm 4mm;display:flex;flex-direction:column;min-height:0}
.sheet.odd .body{padding-left:24mm}.sheet.even .body{padding-right:24mm}
.sec{margin:0 0 6mm}
h2{font:700 19pt/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.2em;text-transform:uppercase;color:#a44f27;margin:0 0 4mm;padding-bottom:1.8mm;border-bottom:.5mm solid #b08d57}
.h2b{margin-top:6mm}
.it{display:flex;justify-content:space-between;align-items:flex-start;gap:4mm;margin:0 0 7mm}
.nm{font:700 14.6pt/1.15 Inter;letter-spacing:.03em;text-transform:uppercase}
.ds{font:400 12pt/1.32 Inter;color:#4a4f54;margin-top:1.2mm}
.pr{font:700 15.6pt/1.1 Inter;color:#a44f27;white-space:nowrap;font-variant-numeric:tabular-nums}
.it.star{background:#f6ead0;border-left:1.4mm solid #a44f27;padding:2.4mm 2.6mm;margin-left:-4mm;margin-right:-2.6mm}
.fl{width:3.6mm;height:3.6mm;fill:#a44f27;margin-right:1.4mm;vertical-align:-.5mm}
.xl .nm{font-size:16.6pt}.xl .ds{font-size:13.6pt}.xl .pr{font-size:17.6pt}.xl .it{margin-bottom:9mm}.xl .note{font-size:11pt}
.note{font:italic 10pt/1.35 Inter;color:#667078;margin:1mm 0 3mm}
.pnl{border:.35mm solid #b08d57;outline:.35mm solid #e9c46a;outline-offset:-1.6mm;background:#f6ead0;padding:5mm 6mm;margin:0 0 7mm}
.pt{display:flex;justify-content:space-between;align-items:baseline;font:700 15pt Inter;letter-spacing:.04em;text-transform:uppercase}
.pt b{color:#a44f27;font-size:18pt}.pd{font:400 12pt/1.35 Inter;color:#3a3f44;margin-top:1.8mm}.px{font:600 10.5pt Inter;color:#823b1b;margin-top:1.6mm}
.top{margin:4mm 0 4mm;border-top:.5mm solid #b08d57;padding-top:5mm}.th{font:700 13pt Inter;letter-spacing:.1em;text-transform:uppercase;color:#823b1b;margin-bottom:2mm}.tl{font:500 14pt/1.5 Inter;margin-bottom:6mm}
.qrsec{margin-top:auto;border-top:.5mm solid #b08d57;padding-top:7mm}
.qh{font:700 17pt/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.16em;text-transform:uppercase;color:#a44f27;text-align:center;margin-bottom:8mm}
.qrow{display:flex;justify-content:space-between;gap:10mm;padding:0 3mm}
.q{flex:1;text-align:center}
.qi{width:41mm;height:41mm;margin:0 auto 3mm;background:#fff;padding:2.4mm;border:.35mm solid #b08d57}.qi svg{width:100%;height:100%;display:block}
.q b{display:block;font:700 12pt Inter;letter-spacing:.06em;text-transform:uppercase;color:#2b1d17}.q span{display:block;font:400 9.6pt Inter;color:#667078;margin-top:.8mm}
.al{font:400 9.2pt/1.5 Inter;text-align:center;margin:8mm 0 2mm;color:#4a4f54}.stk{white-space:nowrap}
.pg{font:500 8pt Inter;color:#667078;text-align:center;padding:2mm 0}
.flag{display:grid;grid-template-columns:repeat(3,1fr);height:3mm}.flag i{background:#3b8ee8}.flag i:nth-child(2){background:#fff}
.sheet.cover{background:#000200;color:#fff}
.cv{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 20mm}
.cv img{height:auto;mix-blend-mode:lighten}
.cvt{font:600 46pt/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.3em;text-transform:uppercase;color:#e9c46a;margin-top:8mm;padding-left:.3em}
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
