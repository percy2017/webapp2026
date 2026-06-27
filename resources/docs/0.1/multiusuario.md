# Multiusuario

WebApp soporta múltiples usuarios con diferentes roles y permisos. Cada persona de tu equipo puede tener su propio acceso.

## Roles disponibles

- **admin** — Acceso completo. Puede gestionar todo el sistema, usuarios, roles, contenido y configuración.
- **user** — Acceso limitado. Puede ver y gestionar el contenido (páginas, chat, agenda) pero no puede modificar usuarios ni roles.

## Crear un usuario

1. En la sidebar, andá a **Usuarios → Todos**.
2. Hacé click en **"Nuevo"**.
3. Completá los datos:
   - **Nombre** — Nombre completo.
   - **Email** — El email con el que va a iniciar sesión.
   - **Contraseña** — Mínimo 8 caracteres.
   - **Rol** — `admin` o `user`.
4. Click en **"Crear"**.

El nuevo usuario recibe un email de verificación y puede iniciar sesión inmediatamente.

## Editar un usuario

1. En la lista de usuarios, hacé click en el ícono de edición del usuario.
2. Modificá los datos necesarios.
3. Click en **"Guardar"**.

## Eliminar un usuario

> **Atención**: esta acción no se puede deshacer. El usuario perderá acceso inmediatamente.

1. En la lista, hacé click en el ícono de papelera.
2. Confirmá la eliminación.

## Permisos granulares

Además de los roles, podés asignar permisos específicos a un usuario para casos especiales. Los permisos disponibles son:

- `manage-users` — Gestión de usuarios.
- `manage-roles` — Gestión de roles.
- `manage-media` — Gestión de biblioteca de medios.
- `manage-templates` — Crear/editar páginas.
- `manage-settings` — Configuración del sitio.

> En general, usar roles es suficiente. Los permisos granulares son para casos avanzados.