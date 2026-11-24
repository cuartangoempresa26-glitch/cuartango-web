# Tarjetas NFC de reseñas de Google · Cuartango Argentina (Las Palmas) y Cuartango Milanesería (Vecindario)

## 1. Qué se graba en cada tarjeta (lo más importante)

| Local | Chip NFC (grabar como URL) | Código QR (ya impreso en la tarjeta) |
|---|---|---|
| Las Palmas | `https://cuartango.com/resena/las-palmas?src=nfc` | `https://cuartango.com/resena/las-palmas?src=qr` |
| Vecindario | `https://cuartango.com/resena/vecindario?src=nfc` | `https://cuartango.com/resena/vecindario?src=qr` |

- Son **enlaces de cuartango.com que redirigen a Google** (no el enlace de Google directo). Ventaja: si el enlace de Google cambia, se cambia en la web y **las tarjetas ya impresas siguen funcionando**.
- La redirección es temporal (302), así que se puede cambiar cuando haga falta.
- El final `?src=nfc` / `?src=qr` permite contar en los registros de Cloudflare cuántos toques y escaneos hay por local.
- **Pendiente:** pegar en la web el enlace oficial "Pedir reseñas" de cada Perfil de Empresa (Google Business Profile → *Pedir reseñas* → copiar enlace, tipo `https://g.page/r/XXXX/review`). Mientras tanto la tarjeta abre la ficha del local en Google Maps, donde está el botón "Escribir una reseña" (un toque más).

## 2. Especificaciones técnicas

**Chip recomendado: NTAG213** (NXP)
- 144 bytes de memoria útil: sobra para la URL (~55 caracteres, ~60 bytes con el formato NDEF).
- El más barato y compatible: Android con NFC y **iPhone XS o posterior** leen la URL sin abrir ninguna app (iPhone 7–X necesitan abrir el lector NFC del centro de control; por eso va también el QR).
- NTAG215/216 solo hacen falta para más memoria (no es el caso). Evitar chips MIFARE Classic: no los leen los iPhone.
- Frecuencia 13,56 MHz (ISO 14443-A). Alcance real de lectura: 1–4 cm, depende del móvil.

**Grabación**
- Formato: **registro NDEF de tipo URI** con la URL de la tabla.
- App gratuita: *NFC Tools* (Android/iOS) → Escribir → Añadir registro → URL.
- **Bloquear la escritura** después de grabar (opción *Bloquear etiqueta* de NFC Tools o el proveedor) para que nadie pueda cambiarla. Es irreversible: grabar y probar antes.
- Pedir al proveedor que las entregue **ya codificadas y bloqueadas** con la URL de cada local (la mayoría lo hacen gratis o por céntimos).

**Soporte y fabricación**
- **Tarjeta PVC tamaño CR80 (85,6 × 54 mm, 0,76 mm)** con el chip **laminado dentro** (inlay). Más duradera que el papel, resiste agua y manchas: ideal para mesa o barra de restaurante.
- Alternativa barata: tarjeta de papel de 350 g con **pegatina NFC NTAG213 de 25 mm** en el dorso (se nota al tacto y dura menos).
- **No usar acabados metálicos** (stamping, tinta metalizada, papel metalizado) sobre el chip: bloquean la señal. Tampoco poner la tarjeta sobre mesas o bandejas de metal.
- Archivo para imprenta: `docs/nfc/tarjetas-resenas.pdf` (4 páginas: frente y dorso de cada local, 85,6 × 54 mm). Si el proveedor pide sangrado, pedir el archivo con 2–3 mm de sangrado.
- Prueba antes de la tirada: pedir **1 muestra por local** y probarla con un Android y un iPhone.

**Cantidades orientativas**: 30–50 por local para empezar (mesas + barra + reposición). Coste típico: tarjeta PVC NFC impresa a doble cara 1–3 € la unidad en tiradas de 50–100.

## 3. Diseño y llamada a la acción (ya aplicados en el PDF)

- **Frente** (negro, marca): logo del local, "¿Te gustó? Cuéntalo en Google", una línea de por qué ayuda, y una banda **"ACERCA TU MÓVIL AQUÍ"** con el icono de contacto/NFC: marca dónde tocar.
- **Dorso** (beige): "Déjanos tu reseña en 30 segundos", **QR grande** como alternativa, 3 pasos y la dirección del local.
- Frases alternativas para otras piezas: "Toca y opina", "¿Qué tal estuvo? Cuéntanos en Google", "Tu opinión cuenta: acerca el móvil", "Escanea o acerca tu móvil para valorarnos".
- Siempre **NFC + QR al mismo enlace**: el QR funciona en cualquier móvil con cámara.

## 4. Recorrido del cliente y fricciones

1. El camarero entrega la tarjeta con la cuenta o la deja en la mesa al final.
2. El cliente acerca el móvil (o escanea) → se abre el navegador → Google.
3. Elige estrellas y escribe → publica.

| Fricción | Solución |
|---|---|
| No sabe dónde tocar | Icono y banda "Acerca tu móvil aquí" sobre el chip |
| NFC apagado (algunos Android) o iPhone antiguo | QR en el dorso |
| No ha iniciado sesión en Google | Google pide iniciar sesión: el camarero puede indicarlo ("se abre Google, solo eliges estrellas") |
| Funda gruesa o metálica | Acercar la parte de arriba del móvil (iPhone) o el centro de la espalda (Android) |
| Se lleva la tarjeta | Usar tarjetas de mesa con soporte, o versión pegatina en la carta |

## 5. Dónde usarlas y cómo entrenar al equipo

- **Momento clave: al cobrar**, cuando el cliente se va contento. Entregar en el platillo de la cuenta o junto al datáfono.
- Tarjeta fija en la barra / caja y en cada mesa (soporte o pegatina en el porta-servilletas).
- En los pedidos para llevar: una tarjeta en la bolsa (versión papel, más barata).
- **Frase para el personal**: "Si te gustó, nos ayuda mucho que lo cuentes en Google: acerca el móvil aquí". Corta, sin presionar.
- Comprobar cada semana que las tarjetas funcionan (un toque con el móvil del encargado).

## 6. Indicadores y seguimiento

| KPI | Dónde se ve |
|---|---|
| Toques NFC y escaneos QR por local | Registros de Cloudflare Workers (evento `review_link`, con `venue` y `src`) |
| Reseñas nuevas por semana y por local | Google Business Profile → Reseñas / Rendimiento |
| Nota media | Ficha de Google (hoy Las Palmas 4,7 ★ con 536 reseñas; Vecindario sin reseñas aún) |
| Conversión (reseñas / toques) | Comparar ambos cada mes |
| Respuesta a reseñas | Objetivo: responder todas en menos de 48 h |

Objetivo razonable el primer mes en Vecindario: llegar a 30–50 reseñas para que la ficha gane visibilidad.

## 7. Normas de Google y buenas prácticas (importante)

- **Pedir reseñas a todos los clientes**, no solo a los contentos. Google prohíbe el "filtrado" (mostrar la tarjeta solo a quien parece satisfecho).
- **No dar nada a cambio** (descuentos, postres, sorteos): está prohibido y Google puede borrar reseñas o penalizar la ficha.
- No pedir "5 estrellas": la tarjeta pide la opinión, no la nota.
- Que no escriban reseñas el personal, familiares ni desde el wifi o un móvil del local de forma masiva: Google las detecta y las elimina.
- **Responder todas las reseñas**, también las negativas, con educación y una solución: eso convence más a nuevos clientes que la nota.
- La mejor herramienta sigue siendo el servicio: la tarjeta solo facilita que quien está contento lo diga.
