// Photos and videos shown by the visual blocks (js/media.js).
// RULES: (1) keep each shot in its own format: landscape in "gallery", portrait in "reels"/"triptych";
//        (2) "eventos" and the pages of each local use only photos/videos OF OUR LOCALES; the footage of the
//            outdoor catering events (img/media/*, p-*, h-* clips) belongs to catering, home and nosotros.
// To change a file: drop it in img/media/ (video in img/media/video/) and edit its line. A block with no valid items stays hidden.
//   triptych: exactly 3 PORTRAIT items     gallery: landscape carousel     reels: portrait carousel
//   compare : { title, ar:"16/9"|"9/16", a:{src,label,alt}, b:{src,label,alt} }  (both shots with the same format)
//   story   : steps { title, text, src (mp4, portrait), poster }
(function () {
  const I = "img/media/", V = "img/media/video/";
  // ar = aspect ratio of the real shot (w/h)
  const img = (n, ar, alt, caption) => ({ src: I + n + ".jpg", ar, alt, caption });
  const vid = (n, alt, caption) => ({ src: V + n + ".mp4", poster: V + n + ".jpg", ar: /^p-/.test(n) ? "9/16" : "16/9", alt, caption });
  const brasaVsCorte = { title: "De la brasa a la tabla", ar: "16/9",
    a: { src: I + "entrana-brasa.jpg", label: "A la brasa", alt: "Entraña sobre la parrilla con fuego" },
    b: { src: I + "corte-tabla.jpg", label: "Cortada a cuchillo", alt: "Carne asada cortada a cuchillo sobre la tabla" } };
  const pinaVsPostre = { title: "Piña: de la parrilla al postre", ar: "9/16",
    a: { src: I + "pina-parrilla.jpg", label: "En la parrilla", alt: "Rodajas de piña a la parrilla" },
    b: { src: I + "pina-postre.jpg", label: "En el postre", alt: "Postre de piña con helado y dulce de leche" } };

  window.MEDIA = {
    // ---- brand pages: food of the house (landscape and portrait kept apart)
    home: {
      triptych: [
        vid("p-entrana", "Entraña sobre las brasas", "El producto"),
        vid("p-fuego-costillar", "Costillar a la cruz sobre el fuego de leña", "El fuego"),
        vid("p-bandeja", "Carne cortada y servida en la bandeja", "La mesa")],
      gallery: [
        vid("h-costillar-romero", "Costillar de ternera con romero en la parrilla", "Costillar con romero"),
        img("empanadas-h", "4/3", "Empanadas de carne y de pollo sobre tabla de madera", "Empanadas de carne y de pollo"),
        vid("h-corte", "Corte a cuchillo de la carne asada", "Corte a mano"),
        img("pimientos-rellenos", "16/9", "Pimientos rellenos de queso y huevo", "Pimientos rellenos de queso y huevo"),
        img("costillar-primer-plano", "16/9", "Costillar de ternera con romero", "Costillar de ternera"),
        vid("h-fuego-llamas", "Leña ardiendo en la parrilla", "El fuego de leña")],
      reels: [
        vid("p-pina", "Piña a la parrilla", "Piña a la parrilla"),
        vid("p-empanadas", "Empanadas recién hechas sobre la tabla", "Recién salidas"),
        vid("p-corte", "Corte de carne a cuchillo sobre tabla", "El corte a cuchillo"),
        vid("p-pollo-chorizo", "Muslos de pollo y chorizos a la parrilla", "Pollo y chorizo"),
        vid("p-postre", "Postre de piña con helado y dulce de leche", "Para cerrar")],
      compare: [brasaVsCorte]
    },

    // ---- our locales: only footage shot in them
    "las-palmas": { gallery: [
      img("../las-palmas-sirviendo", "16/9", "Camarero llevando la parrillada a la mesa", "Servida en la mesa"),
      vid("l-sala-entrada", "Entrada al local de Las Palmas, vista con dron", "Así es la entrada"),
      vid("l-cocina-pimientos", "Pimientos con queso en la parrilla de leña de la cocina", "La parrilla de leña"),
      vid("l-sala-logo", "Pared de piedra con el logo luminoso de Cuartango", "La sala"),
      img("../las-palmas-parrillada", "16/9", "Parrillada servida sobre la tabla Cuartango", "Parrillada para compartir"),
      vid("l-cocina-corte", "Corte de carne sobre tabla blanca en la cocina", "El corte"),
      vid("l-terraza", "Terraza exterior del local con mesas y sombrillas", "La terraza exterior")
    ] },
    vecindario: { gallery: [] },   // sin material propio todavía: el bloque queda oculto hasta que lleguen fotos y videos del local

    // ---- "celebra tu evento en nuestros locales": only our locales (no catering-event footage here)
    eventos: {
      triptych: [],                // needs 3 vertical shots of our locales
      gallery: [
        vid("l-sala-interior", "Interior del local con mesas y barra", "La sala"),
        vid("l-sala-logo", "Pared de piedra con el logo luminoso de Cuartango", "El logo, de noche"),
        vid("l-sala-mural", "Murales y mesas en el local", "Murales"),
        vid("l-sala-barra", "Barra y zona de mesas altas", "La barra"),
        vid("l-mesa-amigos", "Amigos compartiendo una parrilla individual en la mesa", "Para compartir"),
        vid("l-terraza", "Terraza exterior del local con mesas y sombrillas", "La terraza exterior"),
        img("l-terraza-foto", "4/3", "Fachada y terraza exterior del local", "La terraza, con vida")]
    },

    // ---- catering: footage of the events we cater (outdoors, parrilla in situ)
    catering: {
      triptych: [
        vid("p-pollo-chorizo", "Muslos de pollo y chorizos a la parrilla", "Pollo y chorizo"),
        vid("p-corte", "Corte de carne a cuchillo sobre tabla", "El corte a cuchillo"),
        vid("p-pina", "Piña a la parrilla", "Piña a la parrilla")],
      gallery: [
        img("costillar-cruz", "4/3", "Costillar a la cruz en la parrilla", "Costillar a la cruz"),
        vid("h-ensalada", "Emplatado de la ensalada gaucha", "Ensalada gaucha"),
        img("mesa-parrillas", "4/3", "Mesa con parrillas individuales y cartel Cuartango", "Parrillas en la mesa"),
        vid("h-parrilla-venue", "Parrillero trabajando con el salón del evento al fondo", "La parrilla en vivo"),
        img("pimientos-rellenos", "16/9", "Pimientos rellenos de queso y huevo", "Pimientos rellenos de queso y huevo"),
        img("salon-mesas", "4/3", "Salón con mesas montadas para un evento", "Montaje del salón"),
        img("costillar-primer-plano", "16/9", "Costillar de ternera con romero", "Costillar de ternera")],
      reels: [
        vid("p-ensalada-final", "Ensalada con queso y aderezo", "El último toque"),
        vid("p-empanadas", "Empanadas recién hechas sobre la tabla", "Recién salidas"),
        img("mesa-banquete", "3/4", "Mesa de banquete con vajilla y flores", "La mesa del banquete"),
        vid("p-fuego-noche", "Costillar a la cruz al atardecer, con luces", "El fuego, al atardecer"),
        img("mesa-menu", "3/4", "Plato con servilleta y menú impreso", "El menú en la mesa"),
        vid("p-evento-dusk", "Equipo de sala al atardecer junto a la mesa de empanadas", "Al caer la tarde"),
        img("equipo-bandejas", "3/4", "Equipo de Cuartango sirviendo bandejas de empanadas", "El equipo")],
      compare: [brasaVsCorte, pinaVsPostre]
    },

    // ---- about us: how we cook
    nosotros: {
      story: [
        { title: "La leña y la brasa", text: "Todo empieza con el fuego. Cocinamos al más puro estilo tradicional argentino, con leña, brasa y parrilleros expertos que dominan el arte del asado.", src: V + "p-fuego-costillar.mp4", poster: V + "p-fuego-costillar.jpg" },
        { title: "El producto", text: "Carne de ternera, entraña, vacío a la salmuera, costillar, chorizo argentino y pimientos rellenos de queso y huevo: producto de calidad, pensado para que el fuego sea el protagonista.", src: V + "p-entrana.mp4", poster: V + "p-entrana.jpg" },
        { title: "El corte a cuchillo", text: "Cada pieza se corta a mano, a cuchillo y en el momento, para servirla en su punto, jugosa y caliente.", src: V + "p-corte.mp4", poster: V + "p-corte.jpg" },
        { title: "La mesa", text: "Presentaciones rústicas y elegantes, que combinan lo criollo con lo gourmet: tablas de madera, empanadas, ensaladas y postres como la piña a la parrilla con helado de vainilla y dulce de leche.", src: V + "p-postre.mp4", poster: V + "p-postre.jpg" }],
      gallery: [
        vid("l-cocina-parrilla", "Parrillero trabajando en la parrilla de leña de la cocina", "La parrilla de leña"),
        img("empanadas-h", "4/3", "Empanadas de carne y de pollo sobre tabla de madera", "Empanadas de carne y de pollo"),
        vid("h-chef-chorizos", "Parrillero con chorizos argentinos", "Chorizo argentino"),
        vid("l-cocina-corte", "Corte de carne sobre tabla blanca en la cocina", "El corte"),
        vid("h-costillar-romero", "Costillar de ternera con romero en la parrilla", "Costillar con romero"),
        img("ensalada-gaucha", "16/9", "Ensalada gaucha con rúcula, tomate cherry y queso", "Ensalada gaucha")],
      compare: [brasaVsCorte, pinaVsPostre]
    }
  };
})();
