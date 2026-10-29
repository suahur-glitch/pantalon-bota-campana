# Landing Kosmika · pantalón bota campana

Landing de una sola página en HTML, CSS y JS estándar (sin dependencias ni build).

## Cómo verla
Desde esta carpeta (Node 18 o superior, sin `npm install`):

    npm start

Y abre http://localhost:3000. `server.js` sirve los estáticos sin dependencias, escucha en `process.env.PORT` (3000 si no está definido) y soporta peticiones Range para el video.

En Hostinger (app Node.js): sube la carpeta completa con `package.json` en la raíz; el comando de inicio es `npm start` (archivo de entrada `server.js`).
También funciona subiendo la carpeta a cualquier hosting estático, sin `server.js`.

## Archivos
- `index.html`: estructura y textos de las secciones.
- `style.css`: diseño. Colores en variables al inicio (`.kk`): coral `#F28C7B`, lila `#B79BF2`, crema `#F7EEE4`, texto `#1A1A1A`, turquesa `#7ADBD0`. Tipografías: Fraunces (títulos) e Inter (texto).
- `app.js`: lógica. Arriba están los datos editables: `WA_PHONE` (WhatsApp), `UNIT_PRICE`, `PACKS` (paquetes y precios), `COLORS`, `SIZES` y `DEPS` (departamentos y ciudades, lista de ejemplo).
- `assets/`: video del hero (`hero.mp4`), su primer fotograma (`hero-poster.jpg`) y las 5 fotos.

## Qué hace
- Hero con video en ping-pong (adelante y reversa); con "reducir movimiento" o si falla, muestra la imagen fija.
- Secciones: problema, solución con galería, detalles, compra con confianza y garantía de 30 días, cómo usarlo, antes y después, materiales, comparativa, reseñas, preguntas frecuentes y paquetes.
- Barra fija "Comprar ahora" (aparece al hacer scroll) y botón flotante de WhatsApp.
- Checkout en 2 pasos (paquete con color y talla por unidad, luego datos de entrega) y página de gracias con botón que abre WhatsApp con el pedido.

## Pendientes conocidos
- El pedido NO se envía a ningún sistema: al terminar se muestra la página de gracias y la clienta lo confirma por WhatsApp. El punto para conectarlo está marcado en `submit2()` de `app.js`.
- Las reseñas y las casillas de "Antes / Después" son de ejemplo (marcadas en `index.html`); reemplazar por reales.
- El círculo "Logo" en la barra superior y en el pie es un espacio para el logo de Kosmika.
- Las afirmaciones del producto (opacidad, durabilidad) deben corresponder al producto real.
