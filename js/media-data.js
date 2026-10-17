// Photos and videos shown by the visual blocks (js/media.js).
// To change an image: drop the file in img/ and edit its line here. Nothing else to touch.
//   triptych: exactly 3 items, shown as vertical panels in one frame (use vertical photos when you have them).
//   gallery : any number of items, shown as a swipeable carousel with full-screen view.
// Item: { src, alt, caption?, pos? ("x% y%" focus point), type:"video"?, poster? }
// A block with no valid items stays hidden.
window.MEDIA = {
  home: {
    triptych: [
      { src: "img/las-palmas-parrillada.jpg", alt: "Parrillada servida sobre la tabla Cuartango", caption: "El fuego", pos: "58% 50%" },
      { src: "img/las-palmas-sirviendo.jpg", alt: "Camarero de Cuartango llevando una parrillada a la mesa", caption: "La mesa", pos: "72% 50%" },
      { src: "img/las-palmas-sirviendo.jpg", alt: "Interior del local de Las Palmas", caption: "El local", pos: "6% 50%" }
    ],
    gallery: []
  },
  "las-palmas": { gallery: [
    { src: "img/las-palmas-parrillada.jpg", alt: "Parrillada servida sobre la tabla Cuartango", caption: "Parrillada para compartir", pos: "50% 50%" },
    { src: "img/las-palmas-sirviendo.jpg", alt: "Camarero llevando la parrillada a la mesa", caption: "Servida en la mesa", pos: "60% 50%" }
  ] },
  vecindario: { gallery: [] },
  eventos: { triptych: [], gallery: [] },
  catering: { triptych: [], gallery: [] }
};
