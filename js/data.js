// Single source of truth for the demo site. Edit here; pages read it.
// TODO = information still missing from the client.
window.CUARTANGO = {
  timezone: "Atlantic/Canary",
  lastSeatingMinutesBeforeClose: 60, // assumption, confirm with the client
  email: "info@cuartango.com",
  phone: "+34 656 441 966",
  slogan: "Donde la carne es un arte y el fuego, tradición",
  instagram: "https://www.instagram.com/cuartango_argentina/",
  venues: {
    "las-palmas": {
      name: "Local Las Palmas",
      city: "Las Palmas de Gran Canaria",
      address: "C. José Franchy Roca 9, 35007 Las Palmas de Gran Canaria",
      phone: "+34 656 441 966",
      maps: "https://www.google.com/maps/search/?api=1&query=C.+Jos%C3%A9+Franchy+Roca+9+35007+Las+Palmas+de+Gran+Canaria",
      mapEmbed: "https://www.google.com/maps?q=C.+Jos%C3%A9+Franchy+Roca+9+35007+Las+Palmas+de+Gran+Canaria&output=embed",
      // 0=Sunday ... 6=Saturday. Times in Atlantic/Canary. Source: Google Maps listing, checked 2026-10-17.
      hours: { 0: [["13:00","17:00"]], 1: [], 2: [["13:00","17:00"],["20:00","23:00"]], 3: [["13:00","17:00"],["20:00","23:00"]],
               4: [["13:00","16:30"],["20:00","23:00"]], 5: [["13:00","16:30"],["20:00","23:00"]], 6: [["13:00","17:00"],["20:00","23:00"]] },
      services: ["Parrilla a la brasa", "En el local", "Para llevar", "Delivery", "Catering", "Buffet", "Eventos privados", "Bodas", "Terraza exterior", "Rooftop bar", "Zona de fumadores", "Wi-Fi gratis"],
      payments: "Visa, Mastercard, Amex, débito, efectivo, contactless, Apple Pay",
      order: { glovo: null, uber: null } // paste the venue links here; buttons appear automatically
    },
    "vecindario": {
      name: "Nuevo Local Vecindario",
      city: "Vecindario (Santa Lucía de Tirajana)",
      address: "C. Granada 22, Balos, Vecindario", // postal code and exact municipality to confirm
      phone: null,   // TODO
      maps: "https://www.google.com/maps/search/?api=1&query=Calle+Granada+22+Balos+Vecindario",
      mapEmbed: "https://www.google.com/maps?q=Calle+Granada+22+Balos+Vecindario&output=embed",
      // PROVISIONAL: same hours as Las Palmas until the client sends the real ones
      hours: { 0: [["13:00","17:00"]], 1: [], 2: [["13:00","17:00"],["20:00","23:00"]], 3: [["13:00","17:00"],["20:00","23:00"]],
               4: [["13:00","16:30"],["20:00","23:00"]], 5: [["13:00","16:30"],["20:00","23:00"]], 6: [["13:00","17:00"],["20:00","23:00"]] },
      services: [], // TODO (este local no tiene parrilla)
      payments: null,
      order: { glovo: null, uber: null }
    }
  },
  // Sources: "carta original - las palmas.pdf" and "carta cuartango milaneseria 2.pdf". Allergen data not provided: left out on purpose.
  // Dish photos: save as img/menu/<slug>.jpg (e.g. milonga.jpg, parrillada.jpg) and add the slug here.
  photos: [],
  menus: {
    "las-palmas": {
      "pdf": "img/carta-las-palmas.pdf",
      "sections": [
        {
          "id": "entrantes",
          "title": "Entrantes",
          "items": [
            {
              "name": "Empanadas",
              "price": "3,50 €",
              "desc": "Clásicas empanadas argentinas: de ternera cortada a cuchillo, de pollo o árabes. Precio por unidad.",
              "featured": true
            },
            {
              "name": "Papas La Mona",
              "price": "11,90 €",
              "desc": "Papas fritas con huevo revuelto de la granja y nuestras salsas chimichurri y criolla."
            },
            {
              "name": "Chorizo con chimichurri",
              "price": "9,90 €",
              "desc": "Chorizo argentino cortado, con chimichurri y nuestro pan rústico."
            },
            {
              "name": "Pimientos rellenos",
              "price": "8,00 €",
              "desc": "Pimientos asados rellenos de queso mozzarella y huevo de la granja, gratinados en nuestra parrilla."
            },
            {
              "name": "Queso provolone",
              "price": "9,90 €",
              "desc": "Provolone fundido a la brasa, con un suave toque de orégano y ají molido."
            },
            {
              "name": "Provolone a caballo",
              "price": "11,50 €",
              "desc": "El clásico a la parrilla, con jamón y un huevo."
            },
            {
              "name": "Provolone fugazzeta",
              "price": "11,90 €",
              "desc": "El clásico a la parrilla, con cebolla caramelizada."
            }
          ]
        },
        {
          "id": "entrepanes",
          "title": "Nuestros entrepanes",
          "items": [
            {
              "name": "Milonga",
              "price": "14,90 €",
              "desc": "Ternera de primer nivel empanada, pan rústico artesanal, tomate y lechuga de la huerta, mayonesa saborizada, queso mozzarella, jamón cocido premium y huevo de la granja.",
              "featured": true
            },
            {
              "name": "Folklore",
              "price": "15,00 €",
              "desc": "Pechuga de pollo de campo empanada, pan rústico artesanal, tomate y lechuga de la huerta, pimientos asados, mayonesa saborizada, mozzarella, jamón cocido premium y huevo de la granja."
            },
            {
              "name": "Cumbia",
              "price": "13,50 €",
              "desc": "Calabacín empanado, pan rústico artesanal, cebolla salteada, tomate y lechuga de la huerta, mayonesa saborizada y mozzarella."
            },
            {
              "name": "Tango",
              "price": "10,00 €",
              "desc": "Chorizo argentino, pan rústico artesanal, tomate y lechuga de la huerta, mayonesa saborizada, criolla y chimichurri."
            },
            {
              "name": "Cuarteto",
              "price": "14,90 €",
              "desc": "Ternera de primer nivel, pan de lomo artesanal, tomate y lechuga de la huerta, mayonesa saborizada, jamón cocido premium, mozzarella y huevo de la granja."
            },
            {
              "name": "Guarnición",
              "price": "2,50 €",
              "desc": "Papas fritas, ensalada o pimiento asado."
            }
          ]
        },
        {
          "id": "milanesas",
          "title": "Milanesas",
          "items": [
            {
              "name": "Milanesa napolitana",
              "price": "17,90 €",
              "desc": "Fina milanesa de ternera empanada con salsa de tomate casera y mozzarella fundida.",
              "featured": true
            },
            {
              "name": "Milanesa a caballo",
              "price": "18,90 €",
              "desc": "Fina milanesa de ternera empanada con salsa de tomate casera, jamón cocido premium y mozzarella fundida, coronada con dos huevos fritos."
            },
            {
              "name": "Milanesa fugazzeta",
              "price": "18,50 €",
              "desc": "Fina milanesa de ternera empanada con salsa de tomate casera, mozzarella fundida y cebolla caramelizada, gratinada al horno."
            }
          ]
        },
        {
          "id": "ensaladas",
          "title": "Ensaladas",
          "items": [
            {
              "name": "Ensalada Sesarpo",
              "price": "11,90 €",
              "desc": "Cuartonesa, atún, lechuga romana, tomates cherry, pollo empanado y crutones."
            },
            {
              "name": "Ensalada Villera",
              "price": "10,00 €",
              "desc": "Lechuga romana, tomate de la huerta, huevo duro, atún, pasta y choclo."
            },
            {
              "name": "Ensalada Lacheta",
              "price": "11,50 €",
              "desc": "Lechuga romana, tomates cherry, cebolla, olivas negras, zanahoria y queso en cubos."
            }
          ]
        },
        {
          "id": "parrilla",
          "title": "Parrilla",
          "note": "Todos nuestros platos se sirven sin guarnición. Puedes añadir una guarnición aparte por solo 2,50 €.",
          "items": [
            {
              "name": "Parrillada",
              "price": "66,90 €",
              "desc": "Chorizo argentino, entraña, vacío, tira de asado, pimientos asados rellenos, salsa criolla y chimichurri. Acompañada de ensalada, papas y pan.",
              "featured": true
            },
            {
              "name": "Parrillada premium",
              "price": "86,90 €",
              "desc": "La parrillada, con queso provolone, mollejas de ternera y morcilla. Acompañada de ensalada, papas y pan.",
              "featured": true
            },
            {
              "name": "Entraña de ternera",
              "price": "17,50 €",
              "desc": "Clásico corte argentino: fina, tierna y de sabor intenso, con nuestra salsa chimichurri.",
              "featured": true
            },
            {
              "name": "Vacío de ternera",
              "price": "16,90 €",
              "desc": "Corte jugoso, tierno y lleno de sabor, con nuestra salsa criolla."
            },
            {
              "name": "Costilla de ternera",
              "price": "17,50 €",
              "desc": "Carne jugosa hecha en nuestra parrilla, con salsa criolla."
            },
            {
              "name": "Mollejas de ternera",
              "price": "14,00 €",
              "desc": "Piezas redondeadas y muy tiernas, de textura suave."
            },
            {
              "name": "Morcilla",
              "price": "4,50 €",
              "desc": "Embutido suave y cremoso hecho a la parrilla, con salsa cuartonesa."
            },
            {
              "name": "Entrecot de ternera",
              "price": "21,90 €",
              "desc": "Corte jugoso, magro y muy sabroso, con ensalada de la huerta, papas fritas y pimiento asado."
            }
          ]
        },
        {
          "id": "postres",
          "title": "Postres",
          "items": [
            {
              "name": "Chocotorta",
              "price": "4,00 €",
              "desc": "Capas de galletas de chocolate suavizadas con café, intercaladas con crema de queso y dulce de leche."
            },
            {
              "name": "Budín de pan con dulce de leche",
              "price": "4,00 €",
              "desc": "Pan mojado en leche y horneado con huevos y azúcar, con dulce de leche."
            },
            {
              "name": "Alfajor artesanal",
              "price": "3,50 €",
              "desc": "Dos galletas artesanales rellenas de dulce de leche, bañadas en chocolate negro o blanco."
            },
            {
              "name": "Piña asada con helado de vainilla",
              "price": "4,00 €",
              "desc": "Piña natural asada a la parrilla con dulce de leche y helado de vainilla."
            },
            {
              "name": "Helado de vainilla con dulce de leche",
              "price": "5,00 €",
              "desc": ""
            }
          ]
        }
      ]
    },
    "vecindario": {
      "pdf": "img/carta-vecindario.pdf",
      "sections": [
        {
          "id": "entrantes",
          "title": "Entrantes",
          "items": [
            {
              "name": "Empanadas",
              "price": "3,00 €",
              "desc": "Rellenas de ternera cortada a cuchillo, o de pollo al estilo argentino. Precio por unidad.",
              "featured": true
            },
            {
              "name": "Pimientos rellenos",
              "price": "7,50 €",
              "desc": "Pimientos asados rellenos de queso mozzarella y huevo de la granja, gratinados en nuestra parrilla."
            },
            {
              "name": "Papas La Mona",
              "price": "11,40 €",
              "desc": "Papas fritas con huevo revuelto de la granja y nuestras salsas chimichurri y criolla.",
              "featured": true
            },
            {
              "name": "Chorizo con chimichurri",
              "price": "9,40 €",
              "desc": "Chorizo argentino cortado, con chimichurri y nuestro pan rústico."
            },
            {
              "name": "Croquetas de vacío",
              "price": "9,90 €",
              "desc": "Croquetas cremosas de vacío desmechado."
            },
            {
              "name": "Morcilla",
              "price": "3,50 €",
              "desc": "Embutido suave y cremoso con nuestra salsa cuartonesa."
            },
            {
              "name": "Sesarpo",
              "price": "11,40 €",
              "desc": "Lechuga romana, tomates cherry, crutones, atún, cuartonesa y pollo."
            }
          ]
        },
        {
          "id": "provolones",
          "title": "Provolones",
          "items": [
            {
              "name": "Clásico",
              "price": "9,40 €",
              "desc": "Queso provolone fundido a la brasa, con un suave toque de orégano y ají molido."
            },
            {
              "name": "A caballo",
              "price": "11,00 €",
              "desc": "El clásico, con jamón y un huevo."
            },
            {
              "name": "Fugazzeta",
              "price": "11,40 €",
              "desc": "El clásico, con cebolla caramelizada."
            }
          ]
        },
        {
          "id": "entrepanes",
          "title": "Nuestros entrepanes",
          "items": [
            {
              "name": "Milonga",
              "price": "14,40 €",
              "desc": "Ternera de primer nivel empanada, pan rústico artesanal, tomate y lechuga de la huerta, mayonesa saborizada, mozzarella, jamón cocido premium y huevo de la granja.",
              "featured": true
            },
            {
              "name": "Tango",
              "price": "9,50 €",
              "desc": "Chorizo argentino, pan rústico artesanal, tomate y lechuga de la huerta, mayonesa saborizada, criolla y chimichurri."
            },
            {
              "name": "Folklore",
              "price": "14,50 €",
              "desc": "Pechuga de pollo de campo empanada, pan rústico artesanal, tomate y lechuga de la huerta, pimientos asados, mayonesa saborizada, mozzarella, jamón cocido premium y huevo de la granja."
            },
            {
              "name": "Cuarteto",
              "price": "14,40 €",
              "desc": "Ternera de primer nivel, pan de lomo artesanal, tomate y lechuga de la huerta, mayonesa saborizada, jamón cocido premium, mozzarella y huevo de la granja.",
              "featured": true
            },
            {
              "name": "Cumbia",
              "price": "13,00 €",
              "desc": "Calabacín empanado, pan rústico artesanal, cebolla salteada, tomate y lechuga de la huerta, mayonesa saborizada y mozzarella."
            },
            {
              "name": "Guarnición",
              "price": "2,00 €",
              "desc": "Papas fritas, ensalada o pimiento asado."
            }
          ]
        },
        {
          "id": "milanesas",
          "title": "Milanesas",
          "note": "Guarnición a elegir por 2,00 €: papas fritas, ensalada o puré de papa.",
          "items": [
            {
              "name": "Napolitana",
              "price": "16,90 €",
              "desc": "Fina milanesa de ternera empanada con salsa de tomate casera y mozzarella fundida.",
              "featured": true
            },
            {
              "name": "Fugazzeta",
              "price": "17,50 €",
              "desc": "Fina milanesa de ternera empanada con salsa de tomate casera, mozzarella fundida y cebolla caramelizada, gratinada al horno."
            },
            {
              "name": "A caballo",
              "price": "17,90 €",
              "desc": "Fina milanesa de ternera empanada con salsa de tomate casera, jamón cocido premium y mozzarella fundida, coronada con dos huevos fritos."
            },
            {
              "name": "Criolla",
              "price": "18,50 €",
              "desc": "Fina milanesa de ternera empanada con salsa de tomate casera, provolone, pimiento asado, cebolla morada y chimichurri."
            },
            {
              "name": "Caprese",
              "price": "18,50 €",
              "desc": "Fina milanesa de ternera empanada con salsa de tomate casera, mozzarella fresca, pesto y rúcula."
            },
            {
              "name": "La Porteña",
              "price": "18,50 €",
              "desc": "Fina milanesa de ternera empanada con salsa de tomate casera picante, mozzarella, jalapeños y cebolla morada."
            }
          ]
        },
        {
          "id": "vacio",
          "title": "Sándwich de vacío",
          "items": [
            {
              "name": "Sándwich de vacío al disco",
              "price": "13,90 €",
              "desc": "Vacío de ternera desmenuzado al disco de arado, ahumado durante 6 horas al fuego de leña. Personalízalo con toppings a 0,50 € cada uno: jalapeño, cebolla morada, cuartonesa, chimichurri, criolla, tomate o lechuga. Queso de cabra, provolone o cheddar: +1 €.",
              "featured": true
            }
          ]
        },
        {
          "id": "postres",
          "title": "Postres",
          "items": [
            {
              "name": "Chocotorta",
              "price": "3,50 €",
              "desc": "Capas de galletas de chocolate suavizadas con café, intercaladas con crema de queso y dulce de leche."
            },
            {
              "name": "Budín de pan con dulce de leche",
              "price": "3,50 €",
              "desc": "Pan mojado en leche y horneado con huevos y azúcar, con dulce de leche."
            },
            {
              "name": "Alfajor artesanal",
              "price": "3,00 €",
              "desc": "Dos galletas artesanales rellenas de dulce de leche, bañadas en chocolate negro o blanco."
            },
            {
              "name": "Helado con dulce de leche",
              "price": "4,50 €",
              "desc": "Sabores: vainilla, fresa con frutos rojos, limón o chocolate."
            }
          ]
        }
      ]
    }
  },
  specials: [
    { venue: "all", title: "Especial del día (ejemplo)", text: "Aquí aparecerán las promociones y especiales de cada local." }
  ],
  reviews: [ // DEMO ONLY: will be replaced by live Google reviews
    { author: "Cliente (demo)", stars: 5, text: "Producto excelente." },
    { author: "Cliente (demo)", stars: 4, text: "Carne de muy buena calidad y buena atención. Precios algo altos." }
  ]
};
