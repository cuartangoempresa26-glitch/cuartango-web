# Cuartango web (versión de prueba)

Sitio estático (HTML/CSS/JS) + una función serverless para el formulario de catering.

## Ver en local
`node serve.cjs` (en esta carpeta) y abrir http://localhost:8080. En local el formulario solo registra la consulta en la consola del servidor; no envía correo.

## Dónde editar
- `js/data.js`: locales, carta, especiales, reseñas de ejemplo.
- `js/catering-data.js`: menús, precios y condiciones del catering (del dossier).
- `js/config.js`: endpoint del formulario.

## Publicación (Cloudflare Workers con archivos estáticos)
- `wrangler.jsonc`: configuración. Sirve la carpeta raíz como web estática y ejecuta `worker.js` para `/api/catering`.
- `.assetsignore`: archivos que NO se publican (código del servidor, documentos, scripts locales).
- Cada `git push` a `main` publica una nueva versión (Workers Builds, comando de despliegue `npx wrangler deploy`).

## Activar el correo del formulario de catering (producción)
1. Crear cuenta en Resend y verificar `cuartango.com` (registros DNS en Cloudflare).
2. En Cloudflare > Workers y Pages > cuartango-web > Settings > Variables and Secrets:
   - Secret `RESEND_API_KEY` (la clave de Resend)
   - Opcional: secret `TURNSTILE_SECRET` (anti-spam)
   - `CONTACT_TO` y `MAIL_FROM` ya están en `wrangler.jsonc` (info@cuartango.com y Cuartango Web <web@cuartango.com>).
3. Probar enviando una consulta y comprobar que llega a Zoho con "Responder a" = email del cliente.

Pendiente de confirmar con el cliente: moneda e impuestos de los precios del dossier (se asume euros por persona, IVA/IGIC aparte si se pide factura).
