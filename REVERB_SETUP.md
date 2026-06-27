# Configuración de Laravel Reverb — Requerimiento para servidor

## Contexto

Estamos desplegando **Laravel Reverb** (servidor WebSocket) en un VPS con Ubuntu, PHP 8.3, y Laravel 13. Reverb ya está instalado vía Composer (`laravel/reverb: ^1.0`), configurado en `.env` y listo para correr en el puerto `3001` mediante pm2.

Sin embargo, **Reverb no puede arrancar** en este entorno porque las funciones `pcntl_*` de PHP están deshabilitadas en la configuración CLI del sistema. Reverb (que usa Workerman internamente) llama `pcntl_async_signals()` al inicio y aborta inmediatamente cuando detecta la ausencia de estas funciones.

## Diagnóstico actual

Al ejecutar `php artisan reverb:start --host=0.0.0.0 --port=3001` se obtiene:

```
Signals are not supported. Make sure that the "pcntl" extension is installed
and that "pcntl_*" functions are not disabled by your php.ini's "disable_functions" directive.
```

Y el proceso muere sin abrir el puerto.

Verificación del estado actual:

```bash
php -r "echo function_exists('pcntl_signal') ? 'pcntl OK' : 'pcntl FAIL'; echo PHP_EOL;"
# Resultado actual: pcntl FAIL
```

La extensión `pcntl` está instalada y cargada, pero las funciones están listadas en `disable_functions` dentro de `/etc/php/8.3/cli/php.ini`.

## Solución

Editar el archivo php.ini del **CLI únicamente** (no tocar el de FPM, eso afectaría al webserver) y reducir la lista de funciones deshabilitadas para permitir `pcntl_*`.

### Paso 1 — Hacer backup del php.ini actual

```bash
sudo cp /etc/php/8.3/cli/php.ini /etc/php/8.3/cli/php.ini.bak.$(date +%Y%m%d)
```

### Paso 2 — Localizar la línea `disable_functions`

```bash
grep -n "^disable_functions" /etc/php/8.3/cli/php.ini
```

Esto devolverá algo como:

```
378:disable_functions = pcntl_alarm,pcntl_fork,pcntl_waitpid,pcntl_wait,pcntl_wifexited,...
```

### Paso 3 — Reemplazar la línea

Reemplazar la línea completa `disable_functions = ...` por esta versión (solo se mantienen las funciones que realmente representan un riesgo de seguridad; `pcntl_*` se elimina):

```ini
disable_functions = exec,passthru,shell_exec,system,proc_open,popen,curl_multi_exec,parse_ini_file,show_source
```

**Forma rápida con sed** (ajustar el número de línea si es distinto al del grep):

```bash
sudo sed -i 's/^disable_functions = .*/disable_functions = exec,passthru,shell_exec,system,proc_open,popen,curl_multi_exec,parse_ini_file,show_source/' /etc/php/8.3/cli/php.ini
```

**Forma manual con nano** (si prefieren ver el cambio):

```bash
sudo nano /etc/php/8.3/cli/php.ini
```

Buscar la línea `disable_functions`, borrarla completa, y pegar la nueva lista.

### Paso 4 — Verificar

```bash
php -r "echo function_exists('pcntl_signal') ? 'pcntl OK' : 'pcntl FAIL'; echo PHP_EOL;"
```

Debe devolver: `pcntl OK`

Verificar también que las funciones peligrosas siguen deshabilitadas:

```bash
php -r "echo function_exists('exec') ? 'exec HABILITADO (MAL)' : 'exec OK'; echo PHP_EOL;"
php -r "echo function_exists('system') ? 'system HABILITADO (MAL)' : 'system OK'; echo PHP_EOL;"
```

Ambos deben devolver `OK`.

### Paso 5 (opcional pero recomendado) — Test rápido de Reverb

```bash
cd /home/hostbol/web/app.hostbol.lat/public_html
timeout 4 php artisan reverb:start --host=0.0.0.0 --port=3001 2>&1 | head -10
```

Debe mostrar el banner de Reverb indicando que está escuchando, sin el warning de "Signals are not supported". El `timeout 4` lo mata a los 4 segundos; no afecta nada.

## Qué hacer después

Una vez confirmado el paso 4, **no hace falta hacer nada más**. El programador principal se encargará de:

1. Confirmar que Reverb arranca en el puerto 3001
2. Crear el proceso en pm2 (ya está listo `ecosystem.config.cjs`)
3. Verificar que coexiste con el proceso `constancia` que ya está corriendo

## Notas importantes

- **El cambio afecta SOLO al PHP CLI**, no al webserver (que usa `/etc/php/8.3/fpm/php.ini`).
- La lista nueva sigue bloqueando los vectores de ataque reales: ejecución de comandos del sistema (`exec`, `system`, `popen`, etc.).
- `pcntl_*` no es un riesgo de seguridad por sí solo; los hostings compartidos lo deshabilitan sólo para evitar que un usuario haga forks del proceso.
- No es necesario reiniciar ningún servicio (Apache, Nginx, PHP-FPM, etc.). El PHP CLI lee el `.ini` en cada invocación.

## Reportar de vuelta

Confirmar:
- [ ] Backup del php.ini creado
- [ ] `disable_functions` reemplazada con la nueva lista
- [ ] `pcntl_signal` retorna OK
- [ ] `exec` y `system` siguen bloqueadas
- [ ] `reverb:start` arranca sin warning de pcntl (opcional)

---

# Configuración de Nginx para Reverb

Una vez que Reverb esté corriendo en `localhost:3001`, hay que exponerlo a través de Nginx en el puerto 443 (HTTPS) para que el frontend pueda conectarse vía `wss://app.hostbol.lat/app`.

## Arquitectura

```
Navegador  ──wss://app.hostbol.lat/app──▶  Nginx :443
                                              │
                                              │  proxy_pass
                                              ▼
                                        Reverb :3001
```

El frontend **no se conecta directo a :3001**, va por Nginx para que el WebSocket comparta el mismo certificado SSL y dominio que el resto de la app.

## Paso 1 — Localizar el vhost del dominio

```bash
sudo nginx -T 2>/dev/null | grep -E "server_name.*hostbol|lat" | head -5
```

Esto lista los archivos donde está definido `app.hostbol.lat`. Los candidatos típicos:

- `/etc/nginx/sites-available/app.hostbol.lat`
- `/etc/nginx/conf.d/app.hostbol.lat.conf`
- `/etc/nginx/sites-enabled/...`

Si usan cPanel, suele estar bajo `/var/cpanel/customizations/...` o el vhost principal de Apache. En ese caso, Nginx está como reverse proxy frente a Apache y hay que buscar el bloque `server { ... }` que maneja el puerto 443.

## Paso 2 — Agregar el bloque `location /app` dentro del `server { ... }` del puerto 443

Insertar **dentro del bloque `server { listen 443 ssl; server_name app.hostbol.lat; ... }`**, preferentemente cerca de las otras directivas `location` existentes:

```nginx
# Laravel Reverb WebSocket + HTTP API
location /app {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
    proxy_read_timeout 86400s;
    proxy_send_timeout 86400s;
    proxy_connect_timeout 60s;
}
```

**Notas importantes:**

- `proxy_read_timeout 86400s` es **crítico**. Sin esto, Nginx cierra la conexión WebSocket a los 60 segundos por defecto.
- `proxy_buffering off` evita que Nginx缓冲 el tráfico (necesario para streaming/WebSocket).
- `proxy_pass http://127.0.0.1:3001` usa `127.0.0.1` (no `0.0.0.0`) porque Nginx y Reverb están en el mismo servidor.
- Este bloque cubre tanto el handshake WebSocket (`Upgrade`/`Connection: upgrade`) como la API HTTP interna de Reverb para autenticación de canales privados/presence.

## Paso 3 — Validar la configuración y recargar Nginx

```bash
sudo nginx -t
```

Si la sintaxis es correcta:

```bash
sudo systemctl reload nginx
# o en su defecto:
sudo service nginx reload
```

## Paso 4 — Verificar que Nginx puede alcanzar Reverb

Una vez que Reverb esté corriendo (con pm2), desde el mismo servidor:

```bash
curl -i http://127.0.0.1:3001/
# Debe responder algo de Reverb (probablemente 404 o similar, lo importante es que responda)

curl -i https://app.hostbol.lat/app
# Debe responder algo de Reverb pasando por Nginx (TLS + proxy)
```

Para verificar el WebSocket propiamente, usar `wscat` (si está disponible) o este test simple con curl:

```bash
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  https://app.hostbol.lat/app
```

Debe devolver un `101 Switching Protocols` (o un 426/404 según la versión del cliente, pero lo importante es que Nginx responda, no un 502/504).

## Actualización del `.env` para producción

Con Nginx haciendo proxy, los valores "externos" del `.env` deben apuntar al dominio público, no a `localhost:3001`. Editar `/home/hostbol/web/app.hostbol.lat/public_html/.env`:

```bash
sudo -u hostbol nano /home/hostbol/web/app.hostbol.lat/public_html/.env
```

Reemplazar las líneas `REVERB_*` y `VITE_REVERB_*` por:

```env
# Reverb — servidor (bind local, escucha para Nginx)
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=3001
REVERB_SERVER_PATH=/app

# Reverb — expuesto al cliente vía Nginx
REVERB_HOST=app.hostbol.lat
REVERB_PORT=443
REVERB_SCHEME=https

# Vite — debe coincidir con lo de arriba (se bakea al compilar)
VITE_REVERB_HOST=app.hostbol.lat
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

**Diferencia clave:**

- `REVERB_SERVER_*` → cómo Reverb escucha localmente (`0.0.0.0:3001`, path `/app`)
- `REVERB_*` y `VITE_REVERB_*` → cómo los clientes (navegador y el cliente de broadcasting PHP) se conectan externamente (`app.hostbol.lat:443` vía Nginx)

## Re-compilar los assets del frontend

Como `VITE_REVERB_*` se inyecta en el bundle de JavaScript al compilar, **después de cambiar el `.env` hay que rebuildear**:

```bash
cd /home/hostbol/web/app.hostbol.lat/public_html
sudo -u hostbol npm run build
```

(o `npm run dev` si están en modo desarrollo con HMR).

## Checklist Nginx

- [ ] `location /app { ... }` agregado al `server { listen 443 ... }` de `app.hostbol.lat`
- [ ] `sudo nginx -t` pasa sin errores
- [ ] `sudo systemctl reload nginx` ejecutado
- [ ] `.env` actualizado con valores de producción (REVERB_SERVER_PATH=/app, REVERB_HOST=app.hostbol.lat, REVERB_PORT=443, REVERB_SCHEME=https, VITE_REVERB_* igual)
- [ ] `npm run build` ejecutado después del cambio de `.env`
- [ ] `curl https://app.hostbol.lat/app` responde (no 502/504)

## Reportar de vuelta (Nginx)

Confirmar:
- [ ] Configuración Nginx agregada y validada con `nginx -t`
- [ ] Nginx recargado sin errores
- [ ] `.env` actualizado con valores de producción
- [ ] `npm run build` ejecutado
- [ ] Endpoint `/app` responde a través de Nginx