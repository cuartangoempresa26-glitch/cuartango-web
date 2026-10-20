# Plan SEO y analítica del catering (medido el 20/10/2026)

## 1. Dónde estamos (datos reales)
Search Console (16-17 oct, web recién publicada): 4 impresiones, 0 clics, posición media 4,5. Aún no hay datos suficientes; hasta tener 4 semanas no se pueden sacar conclusiones.

Posiciones en Google España (búsqueda manual, sin personalizar):
| Búsqueda | cuartango.com | Quién domina |
|---|---|---|
| catering argentino gran canaria | **#8** (/catering) | Instagram propio, tierradefuegos.es, pasionllanera.com, la web antigua de Dish (hasta que Google procese la redirección) |
| catering para eventos las palmas de gran canaria | no aparece (top 10) | cateringlaspalmasguanchef, bodas.net, cateringclick, vintia, grupoadaya |
| catering parrillada argentina eventos gran canaria | no aparece (top 10) | tierradefuegos.es, pasionllanera.com |

Competidor directo con parrilla: **Tierra de Fuegos** y **Pasión Llanera** ("asado argentino a domicilio"). En "catering para eventos" genérico dominan agencias y directorios (bodas.net, cateringclick, celebrents).

## 2. Analítica (GA4)
Hecho en la web (inactivo hasta poner el ID): banner de cookies con Aceptar/Rechazar, GA4 con IP anonimizada, y eventos:
- `generate_lead` (tipo: catering | evento_en_local) al enviar el formulario
- `reserva_confirmada` (local, personas)
- `whatsapp_click`, `llamada_click`, `reservar_click`, `pedido_online_click`
Falta: crear la propiedad GA4 y pegar su ID (G-XXXXXXXXXX) en `js/data.js` (`ga4MeasurementId`). Después, en GA4: marcar como "evento clave" `generate_lead` y `reserva_confirmada`, y vincular Search Console (Administrar → Vínculos de Search Console).
Informes a mirar cada mes: Adquisición (canal → conversiones), Páginas de destino (/catering, /eventos), Eventos clave por fuente, y Search Console: consultas y posición de /catering.

## 3. Palabras clave a trabajar (catering)
Principales: catering argentino gran canaria · catering parrillada gran canaria · asado argentino para eventos las palmas · catering para empresas las palmas · catering cumpleaños gran canaria · catering bodas argentino.
Cola larga y preguntas (para FAQ/blog): precio catering por persona gran canaria · cuánto cuesta un asado para 30 personas · catering para 50 personas las palmas · empanadas argentinas para eventos · catering con parrillero en el sitio · qué incluye un catering de asado argentino.

## 4. Acciones SEO (por prioridad)
On-page (ya hecho: títulos, JSON-LD, FAQ, sitemap): 
1. Añadir en /catering una tabla "precio orientativo por persona" y "mínimo 25 personas" visible (responde la búsqueda de precio; Google la usa en rich results).
2. Crear 3 páginas de destino: /catering/empresas, /catering/bodas, /catering/cumpleanos (cada una con su H1, fotos del evento real y FAQ). Ahora todo está en una sola página.
3. Reseñas y fotos reales de eventos en /catering (prueba social) — necesito casos reales (cliente, tipo de evento, nº personas) con su permiso.
Off-page:
4. Ficha en **bodas.net** (ya existe "Cuartango Argentina"): completar fotos, precios, enlace a cuartango.com/catering. Es el directorio que Google posiciona para bodas.
5. Altas en directorios de catering de Canarias (cateringclick.com, celebrents.es) con enlace a /catering.
6. Prensa/blogs locales: ya hay artículo en La Provincia (feb 2026) y vídeos de TikTok/Instagram: pedir que enlacen a cuartango.com.
Local (GBP):
7. Publicar en Google Business Profile 1 vez por semana (evento, plato, catering) con botón "Más información" → /catering.
8. Pedir reseñas tras cada evento de catering (enlace corto de reseña de Google).
9. Añadir servicios "Catering" y "Eventos privados" en la ficha, y preguntas frecuentes (Preguntas y respuestas).

## 5. Seguimiento
Revisar cada 2 semanas (Search Console + GA4): impresiones y clics de /catering, posición de las 3 búsquedas de la tabla, nº de `generate_lead`. Meta a 3 meses: top 5 en "catering argentino gran canaria" y primeras posiciones en "asado/parrillada para eventos las palmas".
