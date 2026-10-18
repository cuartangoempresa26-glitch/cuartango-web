// Photos and videos shown by the visual blocks (js/media.js).
// To change an image or clip: drop the file in img/media/ (video in img/media/video/) and edit its line here.
//   triptych: exactly 3 items, vertical panels in one frame      gallery: carousel (any number), tap = full screen
//   compare : before/after slider { title, a:{src,label,alt}, b:{src,label,alt} }
//   story   : steps { title, text, src (mp4), poster }  (fire-to-table sequence)
// Item: { src, alt, caption?, pos? ("x% y%" focus), poster? (for videos), p:true (portrait, in carousels) }
// A block with no valid items stays hidden.
(function () {
  const I = "img/media/", V = "img/media/video/";
  const img = (n, alt, caption, extra = {}) => ({ src: I + n + ".jpg", alt, caption, ...extra });
  const vid = (n, alt, caption, extra = {}) => ({ src: V + n + ".mp4", poster: V + n + ".jpg", alt, caption, ...extra });
  const brasaVsBandeja = { title: "De la brasa a la bandeja",
    a: { src: I + "entrana-brasa.jpg", label: "A la brasa", alt: "Entraña sobre la parrilla con fuego" },
    b: { src: I + "bandeja-asado.jpg", label: "En la bandeja", alt: "Carne cortada y servida en la bandeja" } };
  const pinaVsPostre = { title: "Piña: de la parrilla al postre",
    a: { src: I + "pina-parrilla.jpg", label: "En la parrilla", alt: "Rodajas de piña a la parrilla" },
    b: { src: I + "pina-postre.jpg", label: "En el postre", alt: "Postre de piña con helado y dulce de leche" } };

  window.MEDIA = {
    home: {
      triptych: [
        vid("p-entrana", "Entraña sobre las brasas", "El producto"),
        vid("p-fuego-costillar", "Costillar a la cruz sobre el fuego de leña", "El fuego"),
        vid("p-bandeja", "Carne cortada y servida en la bandeja", "La mesa")],
      gallery: [
        vid("h-evento-parrilla", "Costillar a la cruz junto al fuego", "Costillar a la cruz"),
        img("empanadas-h", "Empanadas de carne y de pollo sobre tabla de madera", "Empanadas de carne y de pollo"),
        vid("p-pina", "Piña a la parrilla", "Piña a la parrilla", { p: true }),
        img("costillar-cruz", "Costillar a la cruz en la parrilla", "A la cruz, a fuego lento"),
        img("ensalada-gaucha", "Ensalada gaucha con rúcula, tomate cherry y queso", "Ensalada gaucha"),
        vid("p-empanadas", "Empanadas recién hechas sobre la tabla", "Recién salidas", { p: true }),
        vid("h-chef-chorizos", "Parrillero con chorizos argentinos", "Chorizo argentino"),
        img("pimientos-rellenos", "Pimientos rellenos de queso y huevo", "Pimientos rellenos de queso y huevo")],
      compare: [brasaVsBandeja, pinaVsPostre]
    },
    "las-palmas": { gallery: [
      { src: "img/las-palmas-parrillada.jpg", alt: "Parrillada servida sobre la tabla Cuartango", caption: "Parrillada para compartir", pos: "50% 50%" },
      { src: "img/las-palmas-sirviendo.jpg", alt: "Camarero llevando la parrillada a la mesa", caption: "Servida en la mesa", pos: "60% 50%" },
      vid("h-entrana-brasa", "Entraña sobre las brasas", "A la brasa"),
      img("costillar-romero", "Costillar de ternera con romero en la parrilla", "Costillar con romero"),
      vid("h-fuego-llamas", "Leña ardiendo en la parrilla", "El fuego de leña"),
      img("brasas", "Brasas y leña en la parrilla", "Leña y brasa")
    ] },
    vecindario: { gallery: [
      img("empanadas-h", "Empanadas de carne y de pollo sobre tabla de madera", "Empanadas de carne y de pollo"),
      vid("p-empanadas", "Empanadas recién hechas sobre la tabla", "Recién salidas", { p: true }),
      img("empanadas-v", "Empanadas servidas sobre tabla", "Para compartir", { p: true }),
      img("pimientos-rellenos", "Pimientos rellenos de queso y huevo", "Pimientos rellenos de queso y huevo")
    ] },
    eventos: {
      triptych: [
        img("mesa-banquete", "Mesa de banquete con vajilla y flores", "La mesa", { pos: "50% 55%" }),
        vid("p-fuego-noche", "Costillar a la cruz al atardecer, con luces", "El fuego"),
        img("equipo-bandejas", "Equipo de Cuartango sirviendo bandejas de empanadas", "El equipo", { pos: "50% 45%" })],
      gallery: [
        img("salon-mesas", "Salón con mesas montadas para una celebración", "Mesas listas"),
        img("mesa-menu", "Plato con servilleta y menú impreso", "El menú en la mesa", { p: true }),
        vid("h-parrilla-venue", "Parrillero trabajando con el salón al fondo", "La parrilla en vivo"),
        img("costillar-evento", "Costillar a la cruz y mesa de parrillas", "Costillar a la cruz"),
        vid("p-evento-dusk", "Equipo de sala al atardecer junto a la mesa de empanadas", "Al caer la tarde", { p: true }),
        img("mesa-parrillas", "Mesa de madera con parrillas individuales y cartel Cuartango", "Parrillas en la mesa"),
        img("pina-postre", "Postres de piña con helado y dulce de leche", "Para cerrar", { p: true }),
        vid("h-brasas-fuego", "Leña y brasas en la parrilla", "Leña y brasa")]
    },
    catering: {
      triptych: [
        vid("p-pollo-chorizo", "Muslos de pollo y chorizos a la parrilla", "Pollo y chorizo"),
        vid("p-corte", "Corte de carne a cuchillo sobre tabla", "El corte a cuchillo"),
        vid("p-pina", "Piña a la parrilla", "Piña a la parrilla")],
      gallery: [
        img("costillar-cruz", "Costillar a la cruz en la parrilla", "Costillar a la cruz"),
        vid("h-ensalada", "Emplatado de la ensalada gaucha", "Ensalada gaucha"),
        img("mesa-parrillas", "Mesa con parrillas individuales y cartel Cuartango", "Parrillas en la mesa"),
        vid("p-ensalada-final", "Ensalada con queso y aderezo", "El último toque", { p: true }),
        img("pimientos-rellenos", "Pimientos rellenos de queso y huevo", "Pimientos rellenos de queso y huevo"),
        vid("h-corte", "Corte a cuchillo de la carne asada", "Corte a mano"),
        img("empanadas-v", "Empanadas servidas sobre tabla", "Empanadas de carne y de pollo", { p: true }),
        img("costillar-primer-plano", "Costillar de ternera con romero", "Costillar de ternera"),
        img("salon-mesas", "Salón con mesas montadas para un evento", "Montaje del salón")],
      compare: [brasaVsBandeja, pinaVsPostre]
    },
    nosotros: {
      story: [
        { title: "La leña y la brasa", text: "Todo empieza con el fuego. Cocinamos al más puro estilo tradicional argentino, con leña, brasa y parrilleros expertos que dominan el arte del asado.", src: V + "p-fuego-costillar.mp4", poster: V + "p-fuego-costillar.jpg" },
        { title: "El producto", text: "Carne de ternera, entraña, vacío a la salmuera, costillar, chorizo argentino y pimientos rellenos de queso y huevo: producto de calidad, pensado para que el fuego sea el protagonista.", src: V + "p-entrana.mp4", poster: V + "p-entrana.jpg" },
        { title: "El corte a cuchillo", text: "Cada pieza se corta a mano, a cuchillo y en el momento, para servirla en su punto, jugosa y caliente.", src: V + "p-corte.mp4", poster: V + "p-corte.jpg" },
        { title: "La mesa", text: "Presentaciones rústicas y elegantes, que combinan lo criollo con lo gourmet: tablas de madera, empanadas, ensaladas y postres como la piña a la parrilla con helado de vainilla y dulce de leche.", src: V + "p-postre.mp4", poster: V + "p-postre.jpg" }],
      gallery: [
        vid("h-chef-chorizos", "Parrillero con chorizos argentinos", "Chorizo argentino"),
        img("empanadas-h", "Empanadas de carne y de pollo sobre tabla de madera", "Empanadas de carne y de pollo"),
        vid("h-costillar-romero", "Costillar de ternera con romero en la parrilla", "Costillar con romero"),
        img("ensalada-gaucha", "Ensalada gaucha con rúcula, tomate cherry y queso", "Ensalada gaucha"),
        vid("p-empanadas", "Empanadas recién hechas sobre la tabla", "Recién salidas", { p: true }),
        img("mesa-menu", "Plato con servilleta y menú impreso", "El menú en la mesa", { p: true })],
      compare: [brasaVsBandeja, pinaVsPostre]
    }
  };
})();
