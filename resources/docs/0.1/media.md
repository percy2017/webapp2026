# Biblioteca de medios

La biblioteca de medios es donde se almacenan todas las imágenes, videos, audios y PDFs que usás en tu página, chat o cualquier módulo del sistema. Centraliza los archivos para reutilizarlos en cualquier lugar. También podés **generar imágenes con IA** usando MiniMax image-01.

## Subir un archivo

1. En la sidebar, andá a **General → Medios**.
2. Click en **"Subir"** (o arrastrá el archivo al área de carga).
3. Esperá a que termine la subida (aparece una barra de progreso).

## Tipos de archivo soportados

- **Imágenes** — JPG, PNG, WebP, GIF, SVG.
- **Videos** — MP4, WebM, MOV.
- **Audios** — MP3, OGG, WAV.
- **Documentos** — PDF.

Tamaño máximo por archivo: 10 MB. Si necesitás subir archivos más grandes, contactanos.

## Buscar y filtrar

En la biblioteca podés:

- **Buscar** por nombre de archivo.
- **Filtrar por tipo** — Solo imágenes, solo videos, etc.
- **Ver detalles** — Click en un archivo para ver el detalle, descargar, copiar URL o eliminar.

## Usar un archivo en una página

1. Andá a la página en el editor visual.
2. Click en el bloque donde querés usar el archivo (ej: bloque "Imagen").
3. En el panel derecho, click en el campo de imagen.
4. Se abre el selector de medios. Podés:
   - Elegir un archivo existente.
   - Subir uno nuevo directamente desde el selector.
5. Seleccioná el archivo y listo.

El archivo se inserta en el bloque y se muestra en la página.

## Usar un archivo en el chat

1. En la conversación de chat, click en el ícono de clip.
2. Elegí el archivo desde tu dispositivo o desde la biblioteca.
3. El archivo se envía y aparece como mensaje en la conversación.

## Eliminar un archivo

1. En la biblioteca, hacé click en el archivo para abrir el detalle.
2. Click en **"Eliminar"**.
3. Confirmá.

> **Atención**: si el archivo está siendo usado en alguna página o conversación, igual se elimina. Las páginas mostrarán un placeholder en su lugar.

## URL pública

Cada archivo tiene una URL pública que podés compartir directamente. La URL se ve en el detalle del archivo y tiene el formato:

```
https://tusitio.com/storage/{id}/{nombre-archivo}
```

> **Atención con la privacidad**: las URLs son públicas. Cualquier persona que tenga el link puede ver/descargar el archivo. No las compartas si el archivo es confidencial.

---

## Generar imágenes con IA

Podés crear imágenes directamente desde el panel usando el modelo **MiniMax image-01**, sin necesidad de herramientas externas.

### Cómo generar una imagen

1. En la sidebar, andá a **General → Medios**.
2. Click en **"Generar imagen"**.
3. Elegí el modo de generación:

### Texto a imagen

Escribí una descripción detallada de lo que querés generar.

| Campo | Descripción |
|---|---|
| **Descripción** | Texto de hasta 1500 caracteres. Sé específico: estilo, colores, iluminación, composición. |
| **Relación de aspecto** | Cuadrado (`1:1`), horizontal (`16:9`, `21:9`), vertical (`9:16`, `3:4`), etc. |
| **Cantidad** | De 1 a 9 imágenes por vez. |
| **Optimizar descripción** | Mejora automáticamente tu prompt para mejores resultados. |
| **Semilla** | Número opcional. Usá la misma semilla para reproducir exactamente la misma imagen. |

### Imagen a imagen

Subí una foto de referencia (idealmente un retrato frontal) y describí el contexto donde querés ver a esa persona.

1. Subí una imagen JPG o PNG (máximo 10 MB).
2. Escribí una descripción opcional (ej: "la misma persona en una playa al atardecer").
3. Configurá el resto de los parámetros (aspecto, cantidad, etc.).
4. Click en **"Generar"**.

### ¿Qué pasa después de generar?

- La imagen generada se guarda **automáticamente** en la biblioteca de medios.
- Aparece en la galería junto con el resto de tus archivos.
- Podés usarla en páginas, chat o descargarla como cualquier otro archivo.

### Consejos para mejores resultados

- Sé detallado en la descripción: _"un gato siamés sentado en un sillón de terciopelo rojo, iluminación cálida, estilo fotografía profesional"_ funciona mejor que _"un gato en un sillón"_.
- Para **imagen a imagen**, usá una foto frontal, bien iluminada y sin obstrucciones faciales.
- Probá distintas relaciones de aspecto según el uso final (vertical para mobile, horizontal para landing).
- Si un resultado te gusta, anotá la **semilla** para poder reproducirlo después.