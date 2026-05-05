# Backend del formulario (Google Apps Script)

Este folder contiene la **fuente versionada** del Apps Script al que
apunta `VITE_SCRIPT_URL`. El script vive realmente en Google (dentro
de la hoja de Sheets vinculada); aquí guardamos una copia para poder
revisar cambios y trackearlos en git.

## Qué hace

- Recibe `POST` desde la web (BookingModal, QuoteModal, Contacto…).
- Guarda cada envío como una fila en la hoja activa.
- **Solo para `type === 'contacto'`** dispara dos correos automáticos
  HTML branded:
  - Confirmación al cliente.
  - Notificación al admin (`info@boat-solutions.es`).

## Cómo desplegar cambios

1. Abrir [script.google.com](https://script.google.com) con la cuenta
   propietaria del script.
2. Abrir el proyecto vinculado a la hoja de Sheets.
3. Pegar el contenido de `Code.gs` reemplazando el actual.
4. **Implementar → Gestionar implementaciones → ✏️ → Versión: nueva
   versión → Implementar.** La URL `VITE_SCRIPT_URL` se mantiene.

> ⚠️ Si se crea una **implementación nueva** (no editar la existente),
> Google genera una URL distinta y hay que actualizar `.env`.

## Cuotas

- Cuenta gratuita de Gmail: **100 correos/día** desde Apps Script.
- Cada envío de Contacto = 2 correos (cliente + admin) → ~50 envíos/día.
- BookingModal y QuoteModal no mandan emails (solo guardan fila), así
  que no consumen cuota.
