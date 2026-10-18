// Source: DOSSIER CUARTANGO (catering). Prices per person; currency and tax wording to confirm with the client.
window.CATERING = {
  tagline: "La excelencia de la carne argentina, llevada a la mesa",
  intro: "Creamos experiencias gastronómicas traídas directamente desde Argentina para todo tipo de eventos. Llevamos a tu evento la esencia de una tradición que vive en cada parrilla del país, con la carne y el fuego como protagonistas.",
  why: [
    "Cocción al más puro estilo tradicional argentino, con parrilleros expertos que dominan el arte del asado.",
    "Presentaciones rústicas y elegantes, con detalles que combinan lo criollo con lo gourmet.",
    "Menús completos con entradas típicas, guarniciones, postres caseros y bebidas seleccionadas.",
    "Atención 100% personalizada: bodas, cumpleaños, reuniones, encuentros familiares, eventos al aire libre o formales."
  ],
  services: [
    ["Show cook", "Parrillero profesional y ayudantes"],
    ["Montaje in situ", "Montaje de la parrilla en el lugar del evento"],
    ["Vajilla y menaje", "Opcional"],
    ["Servicio de camareros", ""],
    ["Transporte e instalación", ""],
    ["Barra libre", "Opcional"]
  ],
  includes: "Todos los menús incluyen salsa criolla, chimichurri, cuartonesa y pan.",
  menus: [
    { name: "Menú Gaucho", price: 40, img: "img/media/pollo-chorizos.jpg", imgPos: "50% 18%", imgAlt: "Muslos de pollo y chorizos a la parrilla", sections: [
      ["Entrantes", ["Chorizo argentino", "Empanada de carne y de pollo"]],
      ["Primeros", ["Pimientos rellenos de queso y huevo", "Muslos de pollo marinados"]],
      ["Segundos", ["Entraña de ternera", "Vacío a la salmuera", "Costillas de ternera"]],
      ["Postre", ["Piña a la parrilla con helado de vainilla y dulce de leche"]] ] },
    { name: "Menú Piola", price: 48, img: "img/media/ensalada-gaucha.jpg", imgAlt: "Ensalada gaucha con rúcula, tomate cherry y queso", sections: [
      ["Entrantes", ["Ensalada gaucha: rúcula, tomate cherry, queso de cabra y albariño", "Empanada de carne y de pollo"]],
      ["Primeros", ["Pimientos rellenos de queso y huevo", "Muslos de pollo marinados", "Chorizo argentino"]],
      ["Segundos", ["Entraña de ternera", "Vacío a la salmuera", "Costillar de ternera"]],
      ["Postre", ["Piña a la parrilla con helado de vainilla y dulce de leche"]] ] },
    { name: "Menú Cheto", price: 58, img: "img/media/costillar-primer-plano.jpg", imgAlt: "Costillar de ternera con romero en la parrilla", sections: [
      ["Entrantes", ["Ensalada gaucha: rúcula, tomate cherry, queso de cabra y albariño", "Queso provoleta", "Chinchulín y mollejas de ternera", "Pimientos rellenos de queso y huevo"]],
      ["Primeros", ["Muslos de pollo marinados", "Secreto ibérico"]],
      ["Segundos", ["Entraña de ternera", "Chorizo argentino", "Costillar de ternera"]],
      ["Postre", ["Piña a la parrilla con helado de vainilla y dulce de leche"]] ] }
  ],
  canapes: ["Focaccia argentina con anchoa", "Canapé de remolacha con roquefort y nuez", "Canapé de pan con compota de manzana y morcilla negra", "Canapé de membrillo con queso de cabra", "Canapé con paté de pimiento, berenjena y cebolla ahumados"],
  canapesNote: "Los canapés no están incluidos en los menús: tienen un coste adicional.",
  extras: ["Tabla de quesos", "Mesas dulces", "Alcohol argentino"],
  conditions: [
    "Servicio mínimo de 25 comensales.",
    "Número de comensales y menú se fijan con un mínimo de 30 días de antelación.",
    "Si los asistentes finales son menos que los acordados, hay que comunicarlo con más de 5 días laborables de antelación; si no, se mantiene el presupuesto inicial.",
    "Si los asistentes son más de los acordados, la diferencia se abona al finalizar el evento.",
    "Anulación: comunicarla con al menos 15 días de antelación; si no, se abona el 100% del servicio contratado.",
    "Si se solicita factura, el IVA/IGIC no está incluido."
  ]
};
