# Cuartango web (versión de prueba)

Sitio estático (HTML/CSS/JS) + una función serverless para el formulario de catering.

## Ver en local
`node serve.cjs` (en esta carpeta) y abrir http://localhost:8080. En local el formulario solo registra la consulta en la consola del servidor; no envía correo.

## Dónde editar
- `js/data.js`: locales, carta, especiales, reseñas de ejemplo.
- `js/catering-data.js`: menús, precios y condiciones del catering (del dossier).
- `js/config.js`: endpoint del formulario.

## Activar el correo del formulario de catering (producción)
1. Publicar en Cloudflare Pages (repo de GitHub). `functions/api/catering.js` se publica solo como `/api/catering`.
2. Crear cuenta en Resend y verificar `cuartango.com` (registros DNS SPF/DKIM en Cloudflare).
3. En Cloudflare Pages > Settings > Variables and Secrets:
   - Secret `RESEND_API_KEY`
   - Variable `CONTACT_TO` = info@cuartango.com
   - Variable `MAIL_FROM` = Cuartango Web <web@cuartango.com>
4. Opcional anti-spam: crear widget Turnstile; secret `TURNSTILE_SECRET` y poner la site key en `js/config.js` (falta añadir el widget en `catering.html`).
5. Probar enviando una consulta y comprobar que llega a Zoho con "Responder a" = email del cliente.

Pendiente de confirmar con el cliente: moneda e impuestos de los precios del dossier (se asume euros por persona, IVA/IGIC aparte si se pide factura).
