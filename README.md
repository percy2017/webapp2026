# WebApp v0.1

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

- **10 bloques básicos**: Título, Párrafo, Imagen, Botón, Espaciador, Divisor, Galería, Video, Mapa, Cronómetro
- **7 secciones prediseñadas**: Hero, Características, Galería, Planes/Precios, Testimonios, Ubicación, Llamado a la acción

Los datos se persisten en `site_templates.sections` (JSON) y `site_template_blocks` (tabla relacional).

### 🎨 Plantillas prediseñadas
Elegí entre plantillas listas para usar según tu rubro:

- **Peluquería** — Para peluquerías y barberías. Hero, 6 servicios, galería, 3 tiers de precios, testimonios, ubicación con mapa y CTA de reserva.
- **Streaming** — Para streamers y creadores de contenido. Hero "En vivo", 6 plataformas, VODs, 3 tiers (Viewer/Sub/Patreon), comunidad, links a Twitch.

Al elegir una plantilla, se crea automáticamente con contenido de ejemplo, secciones, bloques y menú pre-armados.

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

## Módulos del panel

| Path | Descripción |
|---|---|
| `/admin` | Dashboard con métricas y estado del socket |
| `/admin/agenda` | Calendario de eventos |
| `/admin/media` | Biblioteca de medios |
| `/admin/users` | Gestión de usuarios |
| `/admin/roles` | Gestión de roles y permisos |
| `/admin/site-templates` | Lista de páginas |
| `/admin/site-templates/{id}/edit` | Editor visual Puck |
| `/admin/site-menu` | Menú de navegación |
| `/admin/site-settings` | Configuración del sitio |
| `/admin/chat-live/chats` | Conversaciones del chat |
| `/admin/chat-live/configuration` | Configuración del chat flotante |
| `/` | Landing pública (usa la página activa) |

## Roles y permisos

| Rol | Permisos |
|---|---|
| `admin` | Todos los permisos automáticamente |
| `user` | Sin permisos administrativos (puede usar el panel con acceso limitado) |

| Permiso | Descripción |
|---|---|
| `manage-users` | CRUD de usuarios |
| `manage-roles` | CRUD de roles |
| `manage-media` | Subir / eliminar medios |
| `manage-templates` | CRUD de páginas |
| `manage-settings` | Configuración del sitio + menú |

## Stack técnico

### Frontend
- **Inertia 3** con SSR opcional
- **Wayfinder** genera rutas TypeScript tipadas (`@/routes/...`)
- **shadcn/ui** basado en Radix UI
- **Tailwind v4** con CSS variables para theming
- **Puck Editor** para drag-and-drop visual con auto-save
- **Reverb + Echo** para chat en vivo sin polling
- **Leaflet** para mapas interactivos

### Backend
- **Policies** por modelo (Template, Setting, Menu, Media, Chat, etc.)
- **Form Requests** con validación tipada
- **API Resources** cuando aplica
- **Spatie MediaLibrary** con conversiones (`thumb`)
- **Inertia middleware** comparte estado global (auth, theme, settings, menu, chat widget, site template)
- **Real-time events** con `ShouldBroadcastNow` (Reverb)

### Base de datos
SQLite por default (cambiable a MySQL/PostgreSQL). Migraciones independientes por tabla.

Tablas principales (25+):
- `users` + extras (avatar, phone, 2FA, passkey)
- `roles`, `permissions`, `model_has_*`, `role_has_permissions` (Spatie)
- `media`, `media_holders` (Spatie MediaLibrary)
- `events` (agenda)
- `chats`, `chat_messages`, `chat_widget_settings`
- `site_templates`, `site_template_blocks`, `site_settings`, `site_menu_items`
- `passkeys`, `sessions`, `cache`, `jobs`

### Internacionalización
- Español por defecto (`APP_LOCALE=es`)
- Timezone configurable (default `America/La_Paz` para Bolivia)

### Testing
- **Pest 4** con tests Feature y Unit
- **RefreshDatabase** en suites de DB
- Cobertura de políticas, controllers y flujos críticos

## Documentación del cliente

La documentación para el usuario final (en español) está en **`resources/docs/0.1/`** usando **LaRecipe 2.2**.

Disponible en **`/docs/0.1/overview`** con:
- Overview, Getting Started, Dashboard
- Multiusuario, Páginas dinámicas, Plantillas prediseñadas
- Chat en Vivo, Calendario y reservas
- Biblioteca de medios, Menú de navegación, Configuración del sitio
- FAQ

## Credenciales por defecto (después de `migrate:fresh --seed`)

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

# Desarrollo
php artisan serve
npm run dev
php artisan reverb:start

# Calidad
vendor/bin/pint --dirty
php artisan test --compact
npm run build

# Producción (con pm2)
pm2 start "php artisan reverb:start --host=0.0.0.0 --port=3001" --name webapp-reverb
pm2 save
```

## Roadmap

- Reservas online para clientes (agendar desde el sitio público)
- Notificaciones automáticas (email/SMS) antes de cada evento
- Integración con Google Calendar y Outlook
- Sincronización chat ↔ reservas
- App móvil nativa
- Multi-idioma (inglés además de español)

## Licencia

MIT