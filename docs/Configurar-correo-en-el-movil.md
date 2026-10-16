# Cómo ver el correo de Cuartango en el móvil

**Cuenta de correo:** `info@cuartango.com`
**Servicio:** Zoho Mail (servidor de Europa)
**Contraseña:** te la da quien administra la cuenta. No se incluye en este documento.

---

## Opción A (recomendada): app de Zoho Mail

Es la más sencilla y funciona con el plan gratuito.

1. Abre la tienda de tu móvil (App Store en iPhone, Google Play en Android) y busca **Zoho Mail**. Instala la app oficial.
2. Ábrela y pulsa **Iniciar sesión** (Sign in).
3. Escribe el correo completo:

```
info@cuartango.com
```

4. Escribe tu contraseña.
5. Si la app pregunta por el **centro de datos** o la **región**, elige **Europa (zoho.eu)**.
6. Activa las notificaciones para enterarte de cada correo nuevo.

También se puede leer desde cualquier navegador, en el ordenador o el móvil: https://mail.zoho.eu

---

## Opción B: usar la app de correo del móvil (Gmail, Outlook, Apple Mail)

**Aviso:** el plan gratuito de Zoho suele permitir solo la web y su propia app. Si al configurar da error de contraseña o de conexión, usa la Opción A, o pide al administrador que active el acceso IMAP (o pasar a un plan de pago, de unos 1 a 2 euros al mes por usuario).

Si el plan lo permite, estos son los datos:

| | Servidor | Puerto | Seguridad |
|---|---|---|---|
| **Correo entrante (IMAP)**, recomendado | `imappro.zoho.eu` | `993` | SSL |
| Correo entrante (POP), alternativa | `poppro.zoho.eu` | `995` | SSL |
| **Correo saliente (SMTP)** | `smtppro.zoho.eu` | `465` con SSL, o `587` con TLS | Requiere autenticación |

- **Nombre de usuario:** el correo completo, `info@cuartango.com`
- **Contraseña:** la de la cuenta de Zoho
- **Autenticación del servidor saliente:** activada, con el mismo usuario y contraseña

### Pasos en iPhone (Apple Mail)
Ajustes > Correo > Cuentas > Añadir cuenta > Otra > Añadir cuenta de correo. Después elige **IMAP** y escribe los datos de la tabla.

### Pasos en Android (Gmail)
Abre la app Gmail > tu foto de perfil > Añadir otra cuenta > Otra. Elige **Personal (IMAP)** y escribe los datos de la tabla.

---

## Si algo falla

- **"Contraseña incorrecta":** si la cuenta tiene verificación en dos pasos, Zoho pide una **contraseña de aplicación**. Se crea en https://accounts.zoho.eu > Seguridad > Contraseñas de aplicación (App Passwords). Úsala en lugar de la contraseña normal.
- **No llegan correos:** mira la carpeta de spam. Si sigue sin llegar, comprueba en https://mail.zoho.eu que sí aparecen en la web.
- **No puedo enviar:** revisa que el servidor saliente tenga la autenticación activada y el puerto correcto (465 con SSL o 587 con TLS).
