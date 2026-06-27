# Menú de navegación

El menú de navegación es la **barra superior** de tu sitio. Contiene los links a las secciones de tu página activa (ej: "Inicio", "Servicios", "Precios", "Contacto"). Cada link apunta a una sección de la página y se anima al hacer click.

## Cómo funciona

Cuando creás una página desde una plantilla prediseñada, el menú se **crea automáticamente** con los items correspondientes (ej: la plantilla Peluquería crea items para "Inicio", "Servicios", "Galería", "Precios", etc).

Si activás una página distinta, su menú reemplaza al anterior automáticamente.

## Editar el menú

1. En la sidebar, andá a **Sitio público → Menú**.
2. Vas a ver la lista de items del menú de la página activa.
3. Para cada item podés:
   - **Editar** — Cambiar etiqueta, link o ícono.
   - **Reordenar** — Mover arriba/abajo con las flechas.
   - **Eliminar** — Borrar el item.
4. Para agregar un item nuevo, click en **"Nuevo item"**.

## Estructura de un item

- **Etiqueta** — El texto que ve el visitante (ej: "Servicios").
- **URL** — El destino del link. Puede ser:
  - `#seccion` — Para links a secciones de la página actual (ej: `#features` para ir a la sección de características).
  - `https://...` — Para links externos (ej: `https://wa.me/123456` para abrir WhatsApp).
  - `/ruta` — Para links internos a otras páginas.
- **Ícono** — Un ícono opcional que aparece al lado de la etiqueta (Lucide icon).
- **Item padre** — Para sub-items anidados. Si querés un menú con sub-items (ej: "Servicios > Corte, Color, Peinado"), dejá el item padre como "Sin padre" y los sub-items con "Item padre" apuntando al item principal.

## Íconos

Podés elegir entre más de 30 íconos Lucide. Algunos útiles para menú:

- `Home` — Inicio.
- `Sparkles` — Servicios o características.
- `Image` — Galería.
- `Tag` — Precios.
- `Star` — Testimonios.
- `MapPin` — Ubicación.
- `Phone` — Contacto o reserva.
- `Heart` — Favoritos o comunidad.
- `Video` — VODs o videos.
- `Twitch` — Para streamers.

## Buenas prácticas

- **No más de 5-6 items principales** — El menú se ve mejor cuando es conciso.
- **Usá links internos `#seccion`** — Los visitors esperan que los items del menú los lleven a secciones de la misma página.
- **El último item puede ser un CTA** — Ej: "Reservar" con link a WhatsApp, en color destacado.
- **Mantené el orden lógico** — Inicio primero, contacto al final.