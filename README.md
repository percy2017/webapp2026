# WebApp v0.2

![WebApp banner](public/img/banner-webapp.png)

Plataforma **todo-en-uno** para que tu negocio tenga presencia online con **reservas** y **tarjeta de presentación digital**. Construido con **Laravel 13 + Inertia 3 + React 19**.

## ¿Qué es WebApp?

WebApp combina **tres pilares** en una sola plataforma:

1. **Tarjeta de presentación digital** — Una página web profesional, personalizable y lista para publicar sin tocar código.
2. **Sistema de reservas** — Un calendario para que tus clientes agenden turnos o eventos.
3. **Chat en Vivo** — Un botón flotante en tu sitio donde los visitantes te escriben y vos respondés desde el panel.

Pensado para peluquerías, streamers, restaurantes, profesionales independientes y cualquier negocio que necesite presencia online + gestión de clientes.

## Stack

- **PHP 8.3** · **Laravel 13**
- **Inertia.js 3** · **React 19** · **TypeScript**
- **Tailwind CSS v4** · **shadcn/ui** (Radix UI)
- **Spatie Permission** (roles + permisos)
- **Spatie MediaLibrary** (biblioteca de medios)
- **Laravel Reverb** (WebSockets para chat en tiempo real)
- **Laravel Wayfinder** (rutas TypeScript tipadas)
- **Puck Editor** (editor visual drag-and-drop de páginas)
- **Leaflet + OpenStreetMap** (mapas)
- **FullCalendar v7** (calendario)
- **Laravel Pint** · **Pest 4** · **Larastan**
- **pm2** (gestión de procesos en producción)

## Características

### 👥 Multiusuario
- CRUD de usuarios con roles (`admin`, `user`)
- Permisos granulares: `manage-users`, `manage-roles`, `manage-media`, `manage-templates`, `manage-settings`
- Roles por defecto: `admin` (todos los permisos) y `user` (sin permisos administrativos)
- Verificación de email
- Soporte para passkeys (WebAuthn) y two-factor authentication (TOTP) vía Fortify

### 📄 Páginas dinámicas (tarjeta de presentación digital)
Editor visual drag-and-drop con **Puck**. Las páginas se construyen con dos tipos de elementos:

- **Bloques básicos** (`resources/js/site/blocks/`): Título, Párrafo, Imagen, Botón, Espaciador, Divisor, Contenedor (con DropZone anidado), Galería, Video, Mapa, Antes/Después, Cronómetro, Estadísticas, Agenda Semanal
- **Secciones prediseñadas** (`resources/js/site/sections/`): Hero, Características, Servicios (grid), Galería, Planes/Precios, FAQ, Testimonios, Equipo, Slider/Carousel, Ubicación, Llamado a la acción

Cada sección expone campos para **elegir imagen desde URL externa o desde la Biblioteca de Medios** (radio `source: 'url' | 'media'` + fallback a `/blocks/*.svg`). Los datos se persisten en `site_templates.sections` (JSON).

### 🎨 Páginas (tarjeta de presentación)
Las páginas se construyen desde cero con el editor Puck, sección por sección. `/admin/site-templates` arranca vacío: el usuario crea su propia página eligiendo nombre, slug, icono y armando las secciones en el orden que quiera. No hay plantillas predefinidas que se autoinstalen.

El sistema distingue tres cosas:

- **Bloques básicos**: piezas genéricas reutilizables (título, párrafo, imagen, botón, galería, video, mapa, etc.). Una vez definidos en `resources/js/site/blocks/` quedan disponibles en cualquier página.
- **Secciones prediseñadas**: composiciones prearmadas (Hero, Equipo, Servicios, Galería, CTA, etc.) que el usuario arrastra al canvas de su página y edita con campos amigables.
- **Páginas** (`site_templates`): la unidad publicable. Una página tiene secciones, menú y slug propio. Se publica una a la vez; `/` siempre muestra la activa.

> **Media library**: cada sección que admite imagen expone un radio **URL externa / Biblioteca de Medios**. Los assets se suben desde `/admin/media` y se eligen desde el picker.

### 💬 Chat en Vivo
WebSockets con **Laravel Reverb** (protocolo Pusher). El visitante ve un botón flotante en tu sitio, se loguea con email + teléfono (sin contraseña, registro rápido), y te escribe. Vos respondés desde el panel.

- Mensajes en tiempo real sin recargar
- Badge de no leídos en el botón flotante cuando el admin envía
- Lista de conversaciones con contador de no leídos
- Adjuntar archivos (imágenes, PDFs)
- Estados: abierto / cerrado
- Persistencia del estado abierto/cerrado en `sessionStorage`
- Channel auth para canales privados

### 📅 Calendario y reservas
- Vista mensual, semanal y diaria (FullCalendar v7)
- CRUD de eventos con fecha, hora y descripción
- Endpoints JSON para actualización sin recarga
- Exportación de eventos a JSON

### 🖼️ Biblioteca de medios (`/admin/media`)
- Subida de archivos (imágenes, videos, audio, PDFs)
- Filtros por tipo y origen
- Búsqueda por nombre
- **Panel lateral de detalle** con preview según tipo (imagen/video/audio/PDF)
- URL pública copiable, dimensiones de imagen, descargar
- Conversión `thumb` automática para imágenes
- Picker visual reutilizable desde el editor Puck

### 🧭 Menú de navegación (`/admin/site-menu`)
- Items del header público con **sub-menús** (parent_id recursivo)
- 35+ íconos Lucide elegibles vía picker visual
- Reordenamiento con flechas ↑↓
- Switch de visibilidad
- Filtrado por template activo (cada página tiene su propio menú)

### ⚙️ Configuración del sitio (`/admin/site-settings`)
Configuración global: nombre, eslogan, SEO (título + descripción), logo, favicon, página activa.

### 📊 Dashboard (`/admin`)
- **Estado del socket** (conectado/desconectado en tiempo real)
- 4 métricas: mensajes hoy, chats abiertos, sin leer, pico de hoy
- Gráfico de **mensajes por hora** de las últimas 24 horas
- Auto-actualización vía WebSocket cuando llegan mensajes nuevos

### 📲 PWA (Progressive Web App)
- `manifest.webmanifest` con theme-color, íconos Apple Touch y maskable
- Service Worker (`/sw.js`) con scope `/` (header `Service-Worker-Allowed` configurado)
- Captura global de `beforeinstallprompt` + helper `window.installPWA()`

### 🛡️ Seguridad
- **Laravel Fortify** (login, registro, recuperación de contraseña)
- **Two-factor authentication** (TOTP) y **passkeys** (WebAuthn)
- **HTTPS forzado** vía Nginx/SSL
- **Trusted proxies** configurado (X-Forwarded-Proto)
- **CSRF protection** en todos los forms
- **Channel auth** en broadcasts (solo owner o admin)

### 🌐 Sitio público
- Renderizado desde la página activa
- **Responsive** (mobile/tablet/desktop)
- **Dark/light mode** automático según sistema operativo
- Geolocalización con **OpenStreetMap + Leaflet** (sin API key, gratis)
- SEO básico (title, description, favicon)
- Soporte para dominio personalizado + SSL (Let's Encrypt vía Hestia)
- **QR por plantilla** en `/admin/site-templates`: se muestra solo si la plantilla está activa y la URL apunta a `/`

## Documentación del cliente

La documentación para el usuario final (en español) está en **`resources/docs/0.1/`** usando **LaRecipe 2.2**.

Disponible en **`/docs/0.1/overview`** con:
- Overview, Getting Started, Dashboard
- Multiusuario, Páginas dinámicas, Plantillas prediseñadas
- Chat en Vivo, Calendario y reservas
- Biblioteca de medios, Menú de navegación, Configuración del sitio
- FAQ

## Credenciales por defecto

- **Email**: `admin@admin.com`
- **Password**: `Admin2026$`

## Comandos

```bash
# Instalar dependencias
composer install
npm install

# Setup inicial
php artisan migrate:fresh --seed
php artisan storage:link
npm run build

# Producción (con pm2)
pm2 start ecosystem.config.cjs
pm2 save
```

## Estructura clave

```
app/
├── Http/Controllers/
│   ├── Admin/             panel admin (Dashboard, SiteTemplate, SiteMenu, etc.)
│   ├── Site/HomeController.php   resuelve plantilla activa → render Inertia
│   └── Widget/            endpoints públicos del chat flotante
├── Models/                User, SiteTemplate, SiteSetting, Event, Chat, etc.
├── Support/TemplateMediaUrl.php   reescribe IDs de media a URLs públicas
└── Console/Commands/      RegisterLogoConceptsCommand, etc.

database/seeders/
├── DatabaseSeeder.php     orquesta RoleSeeder + admin user
└── RoleSeeder.php         5 permisos + roles admin/user

resources/js/site/
├── blocks/                bloques básicos (heading, paragraph, image, etc.)
├── sections/              secciones prediseñadas (hero, team, gallery, etc.)
├── lib/
│   ├── basic-blocks-registry.ts   schema Puck de los bloques básicos
│   ├── template-registry.ts       schema Puck de las secciones prediseñadas
│   ├── puck-config.tsx            configuración del editor visual
│   └── template-icons.tsx         íconos Lucide por plantilla
└── landing.tsx            página Inertia que renderiza el sitio público

public/blocks/             SVGs por defecto para hero, equipo, galería, plataformas, etc.
public/canvas/             archivos legacy del brief de marca
```

## Licencia

MIT