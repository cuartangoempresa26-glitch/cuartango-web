// Regenerates every SEO piece from js/data.js and js/catering-data.js so nothing drifts:
// titles, descriptions, canonical, Open Graph, JSON-LD (Organization, Restaurant + Menu, Service, FAQPage, BreadcrumbList),
// the visible "about" text and FAQ block of each page, sitemap.xml, robots.txt and llms.txt.
// Run after changing venue, menu or catering data:  node tools/build-seo.cjs
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const SITE = 'https://cuartango.com';
const BRAND = 'Cuartango Argentina';
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/data.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/catering-data.js'), 'utf8'), ctx);
const D = ctx.window.CUARTANGO, C = ctx.window.CATERING;

const clean = (o) => JSON.parse(JSON.stringify(o)); // drops undefined
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const strip = (s) => s.replace(/<[^>]+>/g, '');
const price = (p) => p.replace(/[^\d,]/g, '').replace(',', '.');

// ---------- hours ----------
const EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const hoursSpec = (hours) => !hours ? undefined : Object.entries(hours).flatMap(([d, ranges]) =>
  ranges.map(([opens, closes]) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: EN[d], opens, closes })));
function hoursText(h) {
  const fmt = (d) => h[d].length ? h[d].map((r) => r.join('–')).join(' y ') : 'cerrado';
  const groups = [];
  for (const d of [1, 2, 3, 4, 5, 6, 0]) {
    const f = fmt(d), last = groups[groups.length - 1];
    if (last && last.f === f) last.days.push(d); else groups.push({ f, days: [d] });
  }
  return groups.map((g) => {
    const n = g.days.map((d) => ES[d]);
    const label = n.length === 1 ? n[0] : n.slice(0, -1).join(', ') + ' y ' + n.at(-1);
    return `${label}: ${g.f}`;
  }).join('; ') + '.';
}

// ---------- schema building blocks ----------
const organization = { '@type': 'Organization', '@id': SITE + '/#org', name: BRAND, alternateName: ['Cuartango Entrepanes', 'Cuartango'],
  url: SITE, logo: SITE + '/img/logo-light.png', email: D.email, telephone: D.phone, sameAs: [D.instagram],
  description: 'Restaurante argentino en Gran Canaria con parrilla en Las Palmas de Gran Canaria, milanesas y entrepanes en Vecindario, y catering con parrillero.' };

const menuNode = (key) => ({
  '@type': 'Menu', '@id': SITE + '/menu?local=' + key + '#menu', name: 'Carta de ' + BRAND + ' ' + (key === 'las-palmas' ? 'Las Palmas' : 'Vecindario'),
  url: SITE + '/menu?local=' + key, inLanguage: 'es-ES',
  hasMenuSection: D.menus[key].sections.map((s) => ({ '@type': 'MenuSection', name: s.title,
    hasMenuItem: s.items.map((i) => ({ '@type': 'MenuItem', name: i.name, description: i.desc || undefined,
      offers: { '@type': 'Offer', price: price(i.price), priceCurrency: 'EUR' } })) }))
});

const restaurant = (key, slugPath, extra = {}) => {
  const v = D.venues[key];
  const [street] = v.address.split(',');
  const lp = key === 'las-palmas';
  return clean({
    '@type': 'Restaurant', '@id': SITE + slugPath + '#restaurant', name: BRAND + ' · ' + (lp ? 'Las Palmas' : 'Vecindario'),
    alternateName: lp ? ['Cuartango Entrepanes Las Palmas', 'Cuartango Las Palmas'] : ['Cuartango Entrepanes Vecindario', 'Cuartango Vecindario'],
    url: SITE + slugPath, parentOrganization: { '@id': SITE + '/#org' },
    description: lp ? 'Parrilla argentina en Las Palmas de Gran Canaria: parrillada, entraña, vacío, empanadas, milanesas y entrepanes. Con terraza exterior.'
      : 'Próxima apertura. Milanesas argentinas, entrepanes artesanos y sándwich de vacío al disco en Vecindario, Gran Canaria.',
    servesCuisine: lp ? ['Argentine', 'Barbecue', 'Steakhouse'] : ['Argentine', 'Sandwiches'],
    acceptsReservations: !v.comingSoon, hasMenu: menuNode(key), priceRange: '€€', telephone: v.phone || undefined,
    paymentAccepted: v.payments || undefined, openingHoursSpecification: v.comingSoon ? undefined : hoursSpec(v.hours), sameAs: [D.instagram, v.maps].filter(Boolean),
    areaServed: lp ? 'Las Palmas de Gran Canaria' : 'Vecindario, Gran Canaria',
    address: { '@type': 'PostalAddress', streetAddress: street.trim(), addressLocality: lp ? 'Las Palmas de Gran Canaria' : 'Vecindario',
      postalCode: lp ? '35007' : undefined, addressRegion: 'Las Palmas', addressCountry: 'ES' },
    ...extra
  });
};

const cateringService = clean({ '@type': 'Service', '@id': SITE + '/catering#service', serviceType: 'Catering argentino a domicilio con parrillero (show cook)',
  name: 'Catering argentino ' + BRAND, provider: { '@id': SITE + '/#org' }, areaServed: { '@type': 'AdministrativeArea', name: 'Gran Canaria' },
  description: C.intro, offers: C.menus.map((m) => ({ '@type': 'Offer', name: m.name, priceCurrency: 'EUR',
    priceSpecification: { '@type': 'UnitPriceSpecification', price: m.price, priceCurrency: 'EUR', unitText: 'por persona' } })) });

const eventService = clean({ '@type': 'Service', '@id': SITE + '/eventos#service', serviceType: 'Celebraciones y eventos privados en restaurante',
  name: 'Festeja tu evento en ' + BRAND, provider: { '@id': SITE + '/#org' }, areaServed: { '@type': 'AdministrativeArea', name: 'Gran Canaria' },
  description: 'Cumpleaños, reuniones y celebraciones en los locales de Cuartango Argentina en Las Palmas de Gran Canaria y Vecindario.' });

// ---------- visible text: about + FAQ (only facts that are in the data/dossier) ----------
const LP = D.venues['las-palmas'], VC = D.venues['vecindario'];
const minMilanesa = Math.min(...D.menus.vecindario.sections.find((s) => s.id === 'milanesas').items.filter((i) => !/Guarnici/.test(i.name)).map((i) => Number(price(i.price))));
const fmtEuro = (n) => n.toFixed(2).replace('.', ',') + ' €';
const cheapest = C.menus[0].price;

const faqHome = [
  ['¿Qué es Cuartango Argentina?', 'Cuartango Argentina es un restaurante argentino en Gran Canaria. Tiene un local abierto en Las Palmas y un nuevo local de próxima apertura en Vecindario: <a href="las-palmas.html">parrilla argentina en Las Palmas de Gran Canaria</a> y <a href="vecindario.html">milanesas, entrepanes y sándwich de vacío al disco en Vecindario</a>. También hacemos <a href="catering.html">catering argentino con parrillero</a> para bodas, cumpleaños y eventos.'],
  ['¿Dónde están los locales de Cuartango Argentina?', `En Las Palmas de Gran Canaria, en ${LP.address}. El nuevo local de Vecindario abrirá próximamente, en ${VC.address}.`],
  ['¿Qué se puede comer en Cuartango Argentina?', 'En Las Palmas: parrillada, entraña, vacío, costilla, entrecot, mollejas y morcilla a la parrilla, empanadas, provolone, milanesas, entrepanes y ensaladas. En Vecindario: milanesas (napolitana, fugazzeta, a caballo, criolla, caprese y La Porteña), entrepanes (Milonga, Cuarteto, Tango, Folklore y Cumbia), sándwich de vacío al disco, empanadas y provolones. De postre: chocotorta, budín de pan con dulce de leche y alfajor artesanal.'],
  ['¿Hay parrilla argentina en los dos locales?', 'La parrilla está en el local de Las Palmas. El local de Vecindario no tiene parrilla: allí la especialidad son las milanesas, los entrepanes y el sándwich de vacío al disco.'],
  ['¿Se puede reservar mesa?', 'Sí. Puedes <a href="reservas.html">reservar online</a> eligiendo local, día, hora y número de personas, y recibes la confirmación por correo. Hasta 10 personas por internet; para grupos mayores usa el <a href="eventos.html#evento">formulario de grupos y celebraciones</a>.'],
  ['¿Hacéis catering argentino a domicilio en Gran Canaria?', `Sí. Llevamos la parrilla a tu celebración, con parrillero profesional, montaje en el lugar y camareros. Menús desde ${cheapest} € por persona, para un mínimo de 25 comensales. <a href="catering.html">Pide tu presupuesto</a>.`],
  ['¿Se puede pedir para llevar o a domicilio?', 'Sí. Hacemos delivery y también para llevar desde el local de Las Palmas. El nuevo local de Vecindario también tendrá delivery cuando abra.'],
  ['¿Se puede celebrar un cumpleaños o un evento en Cuartango Argentina?', 'Sí. Puedes <a href="eventos.html">festejar tu cumpleaños, una reunión o una cena de empresa en nuestro local de Las Palmas</a> (y pronto en Vecindario): cuéntanos el local, la fecha y cuántos sois y te respondemos con una propuesta a medida.']
];

const faqLP = [
  ['¿Dónde está Cuartango Argentina en Las Palmas de Gran Canaria?', `En ${LP.address}, en la zona de Santa Catalina. Teléfono ${LP.phone}.`],
  ['¿Cuál es el horario de Cuartango Argentina Las Palmas?', 'Horario: ' + hoursText(LP.hours)],
  ['¿Tienen parrilla argentina?', 'Sí. Cocinamos a la parrilla entraña, vacío, costilla, entrecot, mollejas, morcilla y chorizo argentino, y tenemos parrillada para compartir (también en versión premium con provolone, mollejas y morcilla).'],
  ['¿Qué más hay en la carta además de la carne?', 'Empanadas de carne cortada a cuchillo, de pollo y árabes; provolone; entrepanes artesanos (Milonga, Cuarteto, Tango, Folklore, Cumbia); milanesas napolitana, a caballo y fugazzeta; ensaladas; y postres como la chocotorta o la piña asada con helado.'],
  ['¿Se puede reservar mesa?', 'Sí, <a href="reservas.html?local=las-palmas">reserva online</a> en el local de Las Palmas: eliges día, hora y personas y te llega la confirmación por correo.'],
  ['¿Tiene terraza?', 'Sí, el local de Las Palmas tiene terraza exterior.'],
  ['¿Cómo se puede pagar?', 'Con ' + LP.payments + '.']
];
const faqVC = [
  ['¿Dónde está Cuartango Argentina en Vecindario?', `En ${VC.address}. Es un local nuevo que todavía no ha abierto: abrirá próximamente.`],
  ['¿Cuándo abre el local de Vecindario?', 'El local de Vecindario abrirá próximamente. Anunciaremos la fecha, el horario y las reservas online en esta web y en nuestro Instagram.'],
  ['¿Tiene parrilla el local de Vecindario?', 'No. El local de Vecindario no tiene parrilla; está pensado para las milanesas, los entrepanes y el sándwich de vacío al disco. Si buscas parrilla argentina, está en el <a href="las-palmas.html">local de Las Palmas</a>.'],
  ['¿Qué milanesas tienen en Vecindario?', `Napolitana, fugazzeta, a caballo, criolla, caprese y La Porteña (con salsa picante y jalapeños), todas de ternera empanada y desde ${fmtEuro(minMilanesa)}.`],
  ['¿Qué es el sándwich de vacío al disco?', 'Vacío de ternera desmenuzado al disco de arado y ahumado durante 6 horas al fuego de leña, que se sirve como sándwich y se personaliza con toppings (jalapeño, cebolla morada, chimichurri, criolla, queso de cabra, provolone o cheddar).'],
  ['¿Hacen delivery en Vecindario?', 'Sí, el local de Vecindario tendrá servicio de delivery cuando abra.'],
  ['¿Cómo se podrá pagar en Vecindario?', 'Con ' + VC.payments + '.'],
  ['¿Tiene terraza el local de Vecindario?', 'Sí, el local de Vecindario tiene terraza exterior cubierta.'],
  ['¿Se puede reservar mesa en Vecindario?', 'Todavía no: el local aún no ha abierto. Las reservas online se activarán con la apertura. Mientras tanto puedes <a href="reservas.html?local=las-palmas">reservar en Las Palmas</a>.']
];
const faqEventos = [
  ['¿Se puede celebrar un cumpleaños en Cuartango Argentina?', 'Sí. Puedes festejar tu cumpleaños, una cena con amigos, una reunión familiar o una comida de empresa en nuestro local de Las Palmas, y pronto también en el nuevo local de Vecindario. Cuéntanos el local, la fecha y cuántas personas sois y te respondemos con una propuesta a tu medida.'],
  ['¿En qué local puedo hacer mi evento?', 'Hoy, en <a href="las-palmas.html">Las Palmas</a>, donde está la parrilla argentina, con terraza exterior y eventos privados. El nuevo local de <a href="vecindario.html">Vecindario</a> (milanesas, entrepanes y sándwich de vacío al disco, con terraza exterior cubierta) abrirá próximamente.'],
  ['¿Cómo armo mi evento?', 'Rellena el formulario de esta página con el local, la fecha, el número de personas y lo que quieres celebrar. Te respondemos por correo o teléfono con una propuesta; no hay compromiso.'],
  ['¿Puedo reservar mesa para un grupo?', 'Sí. Hasta 10 personas puedes <a href="reservas.html">reservar online</a>. Para grupos mayores o celebraciones, usa el formulario de eventos o escríbenos a ' + D.email + '.'],
  ['¿Y si prefiero el evento en mi casa o en otro lugar?', 'Hacemos <a href="catering.html">catering argentino con parrillero</a> y llevamos la parrilla a tu celebración, desde ' + cheapest + ' € por persona.']
];
const faqNosotros = [
  ['¿Cómo cocinan en Cuartango Argentina?', 'Al más puro estilo tradicional argentino: con leña y brasa, y con parrilleros expertos que dominan el arte del asado. Cortamos la carne a cuchillo y presentamos cada plato de forma rústica y elegante, combinando lo criollo con lo gourmet.'],
  ['¿Qué platos son típicos de la parrilla de Cuartango Argentina?', 'Entraña, vacío, costillar de ternera, chorizo argentino, pimientos rellenos de queso y huevo, empanadas de carne y de pollo y, de postre, piña a la parrilla con helado de vainilla y dulce de leche.'],
  ['¿Dónde puedo probar la cocina de Cuartango Argentina?', 'En el local de <a href="las-palmas.html">Las Palmas de Gran Canaria</a>, donde está la parrilla; el nuevo local de <a href="vecindario.html">Vecindario</a> abrirá próximamente. También llevamos la parrilla a tu evento con nuestro <a href="catering.html">catering con parrillero</a>.']
];
const faqCatering = [
  ['¿Cuánto cuesta el catering argentino de Cuartango Argentina?', `Hay tres menús con parrillero: ${C.menus.map((m) => `${m.name} (${m.price} € por persona)`).join(', ')}. Si pides factura, el IVA/IGIC no está incluido.`],
  ['¿Qué incluye el servicio?', 'Parrillero profesional y ayudantes (show cook), montaje de la parrilla en el lugar, servicio de camareros, transporte e instalación. Vajilla y menaje y barra libre son opcionales.'],
  ['¿Cuántas personas como mínimo y con cuánta antelación hay que reservar?', 'El mínimo es de 25 comensales, y el número de personas y el menú se fijan con al menos 30 días de antelación.'],
  ['¿Qué pasa si hay que anular?', 'La anulación debe comunicarse con al menos 15 días de antelación; si no, se abona el 100 % del servicio contratado.'],
  ['¿Para qué tipo de eventos?', 'Bodas, cumpleaños, reuniones, encuentros familiares y eventos al aire libre o formales. Cada catering se diseña a medida: <a href="#consulta">cuéntanos tu evento</a>.']
];

const aboutLP = `<h2>Parrilla argentina en Las Palmas de Gran Canaria</h2>
<p>${BRAND} Las Palmas es nuestro local con parrilla argentina, en ${LP.address}, en la zona de Santa Catalina. Aquí trabajamos el asado a la brasa: entraña, vacío, costilla, entrecot y mollejas, y una parrillada para compartir con chorizo argentino, morcilla y provolone fundido.</p>
<p>Si prefieres algo distinto, tenemos empanadas de carne cortada a cuchillo, milanesas, entrepanes artesanos como la Milonga o el Cuarteto, ensaladas y postres como la chocotorta. El local tiene terraza exterior, y puedes <a href="reservas.html?local=las-palmas">reservar online</a>.</p>`;
const aboutVC = `<h2>Milanesas y entrepanes argentinos en Vecindario</h2>
<p>${BRAND} Vecindario es nuestro nuevo local de milanesas y entrepanes, en ${VC.address}, y abrirá próximamente. No tendrá parrilla: cocinaremos fina milanesa de ternera empanada (napolitana, fugazzeta, a caballo, criolla, caprese y La Porteña), entrepanes artesanos con pan rústico, empanadas y el sándwich de vacío al disco, ahumado durante 6 horas al fuego de leña.</p>
<p>El local tiene terraza exterior cubierta. De postre, chocotorta, budín de pan con dulce de leche o alfajor artesanal. Ya puedes ver la <a href="menu.html?local=vecindario">carta de Vecindario</a>; las reservas online se activarán con la apertura. Si buscas parrilla argentina, la tienes en el <a href="las-palmas.html">local de Las Palmas</a>.</p>`;

// ---------- pages ----------
const pages = {
  'index.html': { path: '/', name: 'Inicio', title: BRAND + ' | Restaurante argentino en Gran Canaria',
    desc: BRAND + ': parrilla argentina en Las Palmas, milanesas y entrepanes en Vecindario. Carta, reservas online y catering con parrillero.',
    img: 'img/las-palmas-parrillada.jpg', faq: faqHome,
    ld: [organization, { '@type': 'WebSite', '@id': SITE + '/#website', url: SITE, name: BRAND, alternateName: ['Cuartango Entrepanes', 'Cuartango'], inLanguage: 'es-ES', publisher: { '@id': SITE + '/#org' } }] },
  'menu.html': { path: '/menu', name: 'Carta', title: 'Carta de ' + BRAND + ' | Parrillada y milanesas',
    desc: 'Carta con precios: parrillada, entraña, vacío, milanesas, entrepanes, empanadas, provolone y postres como chocotorta. Cartas de Las Palmas y Vecindario.',
    img: 'img/las-palmas-parrillada.jpg', ld: [organization] },
  'las-palmas.html': { path: '/las-palmas', name: 'Las Palmas', title: BRAND + ' Las Palmas | Parrilla argentina y asado',
    desc: 'Parrilla argentina en Las Palmas de Gran Canaria (C. José Franchy Roca 9): parrillada, entraña, vacío, empanadas y milanesas. Horario, carta y reservas.',
    img: 'img/las-palmas-sirviendo.jpg', about: aboutLP, faq: faqLP,
    ld: [organization, restaurant('las-palmas', '/las-palmas', { image: [SITE + '/img/las-palmas-sirviendo.jpg', SITE + '/img/las-palmas-parrillada.jpg'] })] },
  'vecindario.html': { path: '/vecindario', name: 'Vecindario', title: BRAND + ' Vecindario | Próxima apertura, milanesas y entrepanes',
    desc: 'Milanesas argentinas, entrepanes artesanos y sándwich de vacío al disco en Vecindario (C. Granada 22, Balos): nuevo local de próxima apertura. Mira su carta.',
    img: 'img/las-palmas-parrillada.jpg', about: aboutVC, faq: faqVC, ld: [organization, restaurant('vecindario', '/vecindario')] },
  'catering.html': { path: '/catering', name: 'Catering', title: 'Catering argentino en Gran Canaria | ' + BRAND,
    desc: `Catering argentino personalizado con parrillero y parrilla in situ en Gran Canaria: bodas, cumpleaños y eventos. Menús desde ${cheapest} € por persona.`,
    img: 'img/media/costillar-cruz.jpg', faq: faqCatering, ld: [organization, cateringService] },
  'eventos.html': { path: '/eventos', name: 'Eventos', title: 'Festeja tu evento en nuestros locales | ' + BRAND,
    desc: 'Arma tu cumpleaños, reunión o celebración en Cuartango Argentina, en Las Palmas (Gran Canaria), y pronto en Vecindario. Cuéntanos tu evento y te preparamos una propuesta.',
    img: 'img/media/mesa-banquete.jpg', faq: faqEventos, ld: [organization, eventService] },
  'reservas.html': { path: '/reservas', name: 'Reservas', title: 'Reservar mesa | ' + BRAND,
    desc: 'Reserva tu mesa online en ' + BRAND + ' Las Palmas. El local de Vecindario abrirá próximamente. Confirmación por correo.',
    img: 'img/las-palmas-sirviendo.jpg', ld: [organization] }
};

const start = '<!--seo-->', end = '<!--/seo-->', cs = '<!--seo-content-->', ce = '<!--/seo-content-->';
for (const [file, p] of Object.entries(pages)) {
  const f = path.join(root, file);
  let h = fs.readFileSync(f, 'utf8');
  const url = SITE + p.path, img = SITE + '/' + p.img;
  const ld = [...p.ld];
  if (p.path !== '/') ld.push({ '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: p.name, item: url }] });
  if (p.faq) ld.push({ '@type': 'FAQPage', mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) });
  const tags = [
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website"><meta property="og:locale" content="es_ES"><meta property="og:site_name" content="${BRAND}">`,
    `<meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${img}">`,
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(p.title)}"><meta name="twitter:description" content="${esc(p.desc)}"><meta name="twitter:image" content="${img}">`,
    `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': ld.map(clean) })}</script>`
  ].join('\n');
  const block = `${start}\n${tags}\n${end}`;
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`);
  h = h.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(p.desc)}">`);
  h = h.includes(start) ? h.replace(new RegExp(start + '[^]*?' + end), block) : h.replace('</head>', block + '\n</head>');
  // visible about text + FAQ
  const inner = (p.about || p.faq) ? `<section class="seo-section"><div class="wrap prose">${p.about || ''}${p.faq ? '<h2>Preguntas frecuentes</h2>' + p.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join('') : ''}</div></section>` : '';
  const sc = `${cs}${inner}${ce}`;
  if (h.includes(cs)) h = h.replace(new RegExp(cs + '[^]*?' + ce), sc);
  else if (inner) h = h.replace('</main>', sc + '\n</main>');
  fs.writeFileSync(f, h);
}

// ---------- catering subdomain (catering.cuartango.com): its own landing page, sitemap and robots ----------
{
  const SUB = 'https://catering.cuartango.com';
  const title = 'Catering argentino con parrillero en Gran Canaria | Cuartango Catering';
  const desc = `Catering argentino con parrillero y parrilla in situ en Gran Canaria para bodas, cumpleaños y eventos de empresa. Menús a medida desde ${cheapest} € por persona.`;
  const faqSub = [
    ...faqCatering.map(([q, a]) => [q, a.replace('<a href="#consulta">', '<a href="#consulta">')]),
    ['¿Se puede personalizar el menú?', 'Sí. Tienes tres menús (' + C.menus.map((m) => m.name).join(', ') + ') y complementos como canapés, tabla de quesos, mesas dulces, alcohol argentino, vajilla y menaje o barra libre. Cuéntanos tu evento, tus invitados y cualquier alergia o necesidad y lo estudiamos contigo para prepararte una propuesta a medida.'],
    ['¿Qué carne utilizáis?', 'Ternera de primer nivel (entraña, vacío a la salmuera, costillar y costillas), chorizo argentino y muslos de pollo marinados, cocinados con leña y brasa por parrilleros expertos y cortados a cuchillo en el momento.'],
    ...faqNosotros.slice(0, 2),
    ['¿Dónde hacéis el catering?', 'En Gran Canaria: llevamos la parrilla al lugar de tu evento y la montamos allí mismo.']
  ];
  const service = clean({ '@type': 'Service', '@id': SUB + '/#service', url: SUB + '/', serviceType: 'Catering argentino con parrillero (show cook)', name: 'Catering argentino ' + BRAND,
    provider: { '@id': SITE + '/#org' }, areaServed: { '@type': 'AdministrativeArea', name: 'Gran Canaria' }, description: C.intro,
    offers: C.menus.map((m) => ({ '@type': 'Offer', name: m.name, priceCurrency: 'EUR', priceSpecification: { '@type': 'UnitPriceSpecification', price: m.price, priceCurrency: 'EUR', unitText: 'por persona' } })) });
  const ld = [organization, service,
    { '@type': 'WebPage', '@id': SUB + '/#page', url: SUB + '/', name: title, inLanguage: 'es-ES', isPartOf: { '@id': SITE + '/#website' }, about: { '@id': SUB + '/#service' } },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: 'Catering', item: SITE + '/catering' }, { '@type': 'ListItem', position: 3, name: 'Catering argentino con parrillero', item: SUB + '/' }] },
    { '@type': 'FAQPage', mainEntity: faqSub.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) }];
  const img = SITE + '/img/media/costillar-cruz.jpg';
  const tags = [`<link rel="canonical" href="${SUB}/">`,
    `<meta property="og:type" content="website"><meta property="og:locale" content="es_ES"><meta property="og:site_name" content="${BRAND} · Catering">`,
    `<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${SUB}/"><meta property="og:image" content="${img}">`,
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${img}">`,
    `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': ld.map(clean) })}</script>`].join('\n');
  const f = path.join(root, 'catering-evento.html');
  let h = fs.readFileSync(f, 'utf8');
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`).replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`);
  h = h.replace(new RegExp(start + '[^]*?' + end), `${start}\n${tags}\n${end}`);
  const faqHtml = `<section class="seo-section"><div class="wrap" style="max-width:820px"><span class="eyebrow">Preguntas frecuentes</span><h2>Todo lo que necesitas saber</h2>${faqSub.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join('')}<p style="margin-top:28px">¿Prefieres comer en nuestro restaurante? <a href="https://cuartango.com/las-palmas">Conoce el local de Las Palmas</a> o <a href="https://cuartango.com/reservas">reserva mesa</a>.</p></div></section>`;
  h = h.replace(new RegExp(cs + '[^]*?' + ce), `${cs}${faqHtml}${ce}`);
  fs.writeFileSync(f, h);
  fs.writeFileSync(path.join(root, 'catering-sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SUB}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`);
  fs.writeFileSync(path.join(root, 'catering-robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SUB}/sitemap.xml\n`);
}

// ---------- sitemap, robots, llms.txt ----------
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.values(pages).map((p) => `  <url><loc>${SITE}${p.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync(path.join(root, 'llms.txt'), `# ${BRAND}

> Restaurante argentino en Gran Canaria (España): parrilla argentina en Las Palmas de Gran Canaria y, de próxima apertura, un local de milanesas, entrepanes y sándwich de vacío al disco en Vecindario. También hace catering argentino con parrillero. También conocido como Cuartango Entrepanes.

## Locales
- Las Palmas (con parrilla): ${LP.address}. Teléfono ${LP.phone}. Horario: ${hoursText(LP.hours)} ${SITE}/las-palmas
- Vecindario (sin parrilla, PRÓXIMA APERTURA: todavía no ha abierto, sin reservas online): ${VC.address}. ${SITE}/vecindario

## Qué se come
- Las Palmas: parrillada, entraña, vacío, costilla, entrecot, mollejas, morcilla, empanadas, provolone, milanesas, entrepanes y ensaladas.
- Vecindario: milanesas (napolitana, fugazzeta, a caballo, criolla, caprese, La Porteña), entrepanes (Milonga, Cuarteto, Tango, Folklore, Cumbia), sándwich de vacío al disco, empanadas y provolones.
- Postres: chocotorta, budín de pan con dulce de leche, alfajor artesanal.

## Servicios
- Reservas online (hasta 10 personas): ${SITE}/reservas
- Carta con precios: ${SITE}/menu
- Celebraciones y eventos en nuestros locales (cumpleaños, reuniones, cenas de empresa): ${SITE}/eventos
- Catering argentino con parrillero (menús desde ${cheapest} € por persona, mínimo 25 comensales): ${SITE}/catering
- Catering en su propia web, con "nuestra cocina" (fuego, brasa y tradición): https://catering.cuartango.com/
- Contacto: ${D.email}
`);
console.log('SEO regenerated for', Object.keys(pages).length, 'pages; llms.txt, sitemap and robots written');
