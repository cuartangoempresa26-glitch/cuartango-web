// Home page content: venue panels and "Los más elegidos".
// Photos: put files in img/ and fill `photo` (venues) or add the dish slug to CUARTANGO.photos (data.js) for the picks.
window.HOME = {
  venues: {
    "las-palmas": {
      tag: "Local Las Palmas",
      title: "Donde el fuego es tradición",
      photo: "img/las-palmas-parrillada-poster.jpg",
      video: "img/las-palmas-parrillada.mp4",
      chips: ["Parrilla argentina", "Rooftop bar", "Terraza", "Catering"],
      body: "Nuestro local de Las Palmas es el hogar de la parrilla argentina: entraña, vacío y costillar a la brasa, en su punto y con la paciencia de los parrilleros de verdad. Un espacio cuidado, con terraza y rooftop bar, para comer sin prisa. Ideal para una comida de domingo, una cena especial o un brindis en la azotea."
    },
    "vecindario": {
      tag: "Nuevo Local Vecindario",
      title: "Milanesas y entrepanes con alma argentina",
      photo: null, // photo to come
      chips: ["Milanesas", "Entrepanes", "Sándwich de vacío al disco", "Sin parrilla"],
      body: "En nuestro nuevo local de Vecindario encontrarás el mismo ADN argentino en un formato más ágil: milanesas generosas, entrepanes artesanos y el sándwich de vacío al disco, con la calidad de siempre. Aquí no hay parrilla, pero sí el sabor de casa. Perfecto para una comida de calidad sin complicaciones, para compartir en familia o llevar."
    }
  },
  // Most chosen dishes (curated). `item` must match a dish name in the venue's carta.
  picks: [
    { venue: "las-palmas", item: "Parrillada" },
    { venue: "vecindario", item: "Napolitana" },
    { venue: "las-palmas", item: "Entraña de ternera" },
    { venue: "vecindario", item: "Sándwich de vacío al disco" },
    { venue: "las-palmas", item: "Milonga" },
    { venue: "vecindario", item: "Cuarteto" }
  ]
};
