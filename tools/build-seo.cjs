// Regenerates SEO tags (canonical, Open Graph, JSON-LD), sitemap.xml and robots.txt from js/data.js.
// Run after changing venue data:  node tools/build-seo.cjs
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const SITE = 'https://cuartango.com';
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/data.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/catering-data.js'), 'utf8'), ctx);
const D = ctx.window.CUARTANGO, C = ctx.window.CATERING;

const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hoursSpec = (hours) => !hours ? undefined : Object.entries(hours).flatMap(([d, ranges]) =>
  ranges.map(([opens, closes]) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: DAY[d], opens, closes })));
const clean = (o) => JSON.parse(JSON.stringify(o)); // drops undefined

const organization = { '@type': 'Organization', '@id': SITE + '/#org', name: 'Cuartango Entrepanes', url: SITE,
  logo: SITE + '/img/logo-light.png', email: D.email, telephone: D.phone, sameAs: [D.instagram] };

const restaurant = (key, slugPath, extra = {}) => {
  const v = D.venues[key];
  const [street, ...rest] = v.address.split(',');
  return clean({
    '@type': 'Restaurant', '@id': SITE + slugPath + '#restaurant', name: 'Cuartango Entrepanes · ' + v.name.replace('Nuevo ', '').replace('Local ', ''),
    url: SITE + slugPath, parentOrganization: { '@id': SITE + '/#org' },
    servesCuisine: key === 'las-palmas' ? ['Argentine', 'Barbecue', 'Steakhouse'] : ['Argentine', 'Sandwiches'],
    acceptsReservations: true, hasMenu: SITE + '/menu?local=' + key, priceRange: '€€', telephone: v.phone || undefined,
    paymentAccepted: v.payments || undefined, openingHoursSpecification: hoursSpec(v.hours), sameAs: [D.instagram, v.maps].filter(Boolean),
    address: { '@type': 'PostalAddress', streetAddress: street.trim(), addressLocality: key === 'las-palmas' ? 'Las Palmas de Gran Canaria' : 'Vecindario',
      postalCode: key === 'las-palmas' ? '35007' : undefined, addressRegion: 'Las Palmas', addressCountry: 'ES' },
    ...extra
  });
};

const cateringService = clean({ '@type': 'Service', '@id': SITE + '/catering#service', serviceType: 'Catering argentino a domicilio con parrillero (show cook)',
  provider: { '@id': SITE + '/#org' }, areaServed: { '@type': 'AdministrativeArea', name: 'Gran Canaria' },
  description: C.intro, offers: C.menus.map((m) => ({ '@type': 'Offer', name: m.name, priceCurrency: 'EUR',
    priceSpecification: { '@type': 'UnitPriceSpecification', price: m.price, priceCurrency: 'EUR', unitText: 'por persona' } })) });

// page -> metadata
const pages = {
  'index.html': { path: '/', title: 'Cuartango Entrepanes | Parrilla argentina en Gran Canaria',
    desc: 'Parrilla argentina en Las Palmas y entrepanes y milanesas en Vecindario. Carta, reservas online y catering con parrillero para tus celebraciones.',
    img: 'img/las-palmas-parrillada.jpg', ld: [organization, { '@type': 'WebSite', '@id': SITE + '/#website', url: SITE, name: 'Cuartango Entrepanes', inLanguage: 'es-ES', publisher: { '@id': SITE + '/#org' } }] },
  'menu.html': { path: '/menu', title: 'Carta | Cuartango Entrepanes', desc: 'Carta de Cuartango: entrantes, entrepanes, milanesas, ensaladas, parrilla y postres. Una carta para Las Palmas y otra para Vecindario.',
    img: 'img/las-palmas-parrillada.jpg', ld: [organization] },
  'las-palmas.html': { path: '/las-palmas', title: 'Parrilla argentina en Las Palmas de Gran Canaria | Cuartango',
    desc: 'Cuartango en Las Palmas de Gran Canaria: parrilla argentina, rooftop bar y terraza. Dirección, horario, carta y reservas.',
    img: 'img/las-palmas-sirviendo.jpg', ld: [organization, restaurant('las-palmas', '/las-palmas', { image: [SITE + '/img/las-palmas-sirviendo.jpg', SITE + '/img/las-palmas-parrillada.jpg'] })] },
  'vecindario.html': { path: '/vecindario', title: 'Milanesas y entrepanes argentinos en Vecindario | Cuartango',
    desc: 'Cuartango en Vecindario: milanesas, entrepanes artesanos y sándwich de vacío al disco. Dirección, carta y reservas.',
    img: 'img/las-palmas-parrillada.jpg', ld: [organization, restaurant('vecindario', '/vecindario')] },
  'catering.html': { path: '/catering', title: 'Catering argentino con parrilla en Gran Canaria | Cuartango',
    desc: 'Catering argentino personalizado con show cook y parrilla in situ en Gran Canaria: bodas, cumpleaños y eventos. Menús desde 40 € por persona. Pide tu presupuesto.',
    img: 'img/las-palmas-parrillada.jpg', ld: [organization, cateringService] },
  'reservas.html': { path: '/reservas', title: 'Reservar mesa | Cuartango', desc: 'Reserva tu mesa en Cuartango Las Palmas o Cuartango Vecindario.',
    img: 'img/las-palmas-sirviendo.jpg', ld: [organization] }
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const start = '<!--seo-->', end = '<!--/seo-->';

for (const [file, p] of Object.entries(pages)) {
  const f = path.join(root, file);
  let h = fs.readFileSync(f, 'utf8');
  const url = SITE + p.path, img = SITE + '/' + p.img;
  const tags = [
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website"><meta property="og:locale" content="es_ES"><meta property="og:site_name" content="Cuartango Entrepanes">`,
    `<meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${img}">`,
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(p.title)}"><meta name="twitter:description" content="${esc(p.desc)}"><meta name="twitter:image" content="${img}">`,
    `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': p.ld.map(clean) })}</script>`
  ].join('\n');
  const block = `${start}\n${tags}\n${end}`;
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`);
  h = h.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(p.desc)}">`);
  h = h.includes(start) ? h.replace(new RegExp(start + '[^]*?' + end), block) : h.replace('</head>', block + '\n</head>');
  fs.writeFileSync(f, h);
}

// sitemap + robots (legal pages are noindex and left out)
const urls = Object.values(pages).map((p) => p.path);
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('SEO regenerated for', Object.keys(pages).length, 'pages');
