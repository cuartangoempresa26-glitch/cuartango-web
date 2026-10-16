# Activar las reservas, los correos y las reseñas

La web ya incluye todo el código. Faltan solo las claves de tus cuentas, que ponen tú en Cloudflare.
Hasta entonces la web funciona en **modo demostración** (reservas simuladas y reseñas de ejemplo), sin errores.

## 1. Correos (Resend)  ·  ya empezado
- Dominio `cuartango.com` añadido en Resend (región Irlanda) y registros DNS creados en Cloudflare.
- Falta: comprobar que Resend lo marca **Verified** y crear la clave de API (ver pasos en el chat).
- Secreto en Cloudflare: `RESEND_API_KEY`.

## 2. Reservas con Google Calendar
1. En el calendario `Cuartango - Las Palmas` > Configuración > **Integrar el calendario**, copia el **ID del calendario** (termina en `@group.calendar.google.com`). Haz lo mismo con `Cuartango - Vecindario`.
2. En Google Cloud Console, con la cuenta `info@cuartango.com`: crea un proyecto, activa **Google Calendar API** y crea una **cuenta de servicio** (IAM y administración > Cuentas de servicio). Crea una clave JSON y descárgala.
3. En cada calendario > Configuración > **Compartir con personas concretas**, añade el correo de la cuenta de servicio con permiso **Realizar cambios en los eventos**.
4. En Cloudflare (Workers y Pages > cuartango-web > Settings > Variables and Secrets) añade:

| Nombre | Tipo | Valor |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Secret | el `client_email` del JSON |
| `GOOGLE_PRIVATE_KEY` | Secret | el `private_key` del JSON (con los `\n`) |
| `CALENDAR_ID_LAS_PALMAS` | Variable | ID del calendario de Las Palmas |
| `CALENDAR_ID_VECINDARIO` | Variable | ID del calendario de Vecindario |
| `BOOKING_SECRET` | Secret | una frase larga al azar (firma los enlaces de cancelación) |

**Cómo funciona:** cada reserva es un evento del calendario. La web calcula las mesas libres sumando las personas de los eventos que se solapan.
- Las reservas que anotes a mano: escribe el título `4p Juan` (número + "p") y cuentan como 4 plazas.
- Para cerrar un día o una franja (evento privado, vacaciones): crea un evento que empiece por `CERRADO` (o un evento de todo el día). Bloquea esas horas.
- Cancelar desde el calendario: borra el evento. Libera las plazas al instante.

**Reglas editables** (`functions/lib/venues.js`): aforo online (ahora 40 en Las Palmas, 30 en Vecindario: **a confirmar**), duración de la mesa (90 min; 120 si son 6 o más), margen mínimo (2 h), máximo 10 personas, último turno 60 min antes del cierre. Vecindario no acepta reservas online hasta que tenga horario.

## 3. Reseñas de Google
1. En Google Cloud Console activa **Places API (New)** y crea una **clave de API** (restringida a esa API).
2. Busca el **Place ID** de cada local con la herramienta "Place ID Finder" de Google.
3. En Cloudflare añade: `GOOGLE_PLACES_API_KEY` (Secret), `PLACE_ID_LAS_PALMAS` y `PLACE_ID_VECINDARIO` (Variables).

Google devuelve como máximo 5 reseñas por local. Se guardan en caché 6 horas y se muestran con enlace a Google, como exige su política.

## Pruebas
- `node tools/test-booking.mjs`: reservas, capacidad, cancelación, recordatorios y horarios (35 comprobaciones).
- `node tools/test-reviews.mjs`: reseñas.
- `node tools/build-seo.cjs`: regenera metadatos, datos estructurados y sitemap tras cambiar `js/data.js`.
