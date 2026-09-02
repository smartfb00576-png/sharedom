# sharedom — Chrome Extension (DOM Screenshot Inspector)

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Instalar-blue?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/sharedom-dom-screenshot-i/nnpbohgnnkkagbbfjeknpeokbppddjnm)
[![NPM Library](https://img.shields.io/badge/NPM_Library-sharedom-red?logo=npm&logoColor=white)](https://www.npmjs.com/package/sharedom)

Extensión profesional para Google Chrome basada en el motor de la librería **`sharedom`**. Permite inspeccionar interactivamente cualquier página web, resaltar contenedores del DOM en hover, y capturar elementos, registros de consola y peticiones de red con un solo clic para copiarlos al portapapeles o descargarlos en alta resolución.

> 🌐 **Instálala directamente desde la Chrome Web Store:**  
> [**Descargar ShareDOM para Chrome**](https://chromewebstore.google.com/detail/sharedom-dom-screenshot-i/nnpbohgnnkkagbbfjeknpeokbppddjnm)

---

## ✨ Características Principales

- 🎯 **Inspector de DOM en tiempo real**: Resaltado visual instantáneo al pasar el cursor sobre cualquier elemento o contenedor de la página.
- 🏷️ **Etiquetas informativas**: Muestra etiqueta HTML (`<div>`, `<section>`, `<button>`), clases CSS, ID y dimensiones exactas en píxeles (`W × H`).
- ⌨️ **Navegación con teclado**:
  - `↑ (Flecha Arriba)`: Selecciona el contenedor padre (`parentElement`).
  - `↓ (Flecha Abajo)`: Selecciona el primer elemento hijo.
  - `Esc`: Cancela o cierra el inspector inmediatamente.
  - `Alt + Shift + S` (o `Cmd + Shift + S` en macOS): Atajo global para activar el inspector en la pestaña activa.
- 🛡️ **Aislamiento con Shadow DOM**: La interfaz y overlays de la extensión no interfieren con el CSS de la página web ni son capturados en la imagen final.
- 📋 **Copiar al portapapeles**: Copia la imagen PNG directamente al portapapeles del sistema operativo (`navigator.clipboard.write`).
- 💾 **Descarga instantánea & ZIP Multipágina**: Descarga capturas optimizadas. Si la captura contiene múltiples páginas de red o consola, las empaqueta automáticamente en un archivo `.zip` comprimido con cero dependencias.
- 📊 **Captura de Consola y Red**: Exporta los registros de la consola del navegador y tablas de peticiones HTTP (método, endpoint, status, duración) como imágenes compactas (12-15 filas por página), documentos PDF multipágina o archivos ZIP.
- 📄 **Exportación a PDF**: Descarga cualquier elemento o captura especializada directamente como documento PDF formateado.
- 🎨 **Controles en tiempo real**:
  - **Resolución**: `1x`, `2x (Retina HD)`, `3x (Ultra HD)`.
  - **Formato**: `PNG` (con canal alfa), `JPEG`, `WebP`.
  - **Fondo**: `Transparente`, `Blanco`, `Oscuro` o `Color personalizado`.
- 🌐 **Soporte Bilingüe (EN / ES)**: Cambio instantáneo de idioma en popup y modales.
- ⚡ **Zero dependencias externas**: Motor de renderizado `sharedom` autónomo mediante SVG `foreignObject` y Canvas nativo.
- 🧩 **Librería NPM disponible**: Todas las funciones de captura de elementos, consola, red, PDF y ZIP también están disponibles programáticamente vía `npm i sharedom`.

---

## 🚀 Instalación en Google Chrome (Modo Desarrollador)

Sigue estos sencillos pasos para instalar la extensión localmente:

### Paso 1: Compilar la extensión

Desde la raíz del repositorio, ejecuta:

```bash
npm run build:extension
```

Esto compilará los módulos TypeScript y generará la carpeta lista para producción en `extension/dist/`.

### Paso 2: Cargar la extensión en Chrome

1. Abre Google Chrome y navega a:
   ```text
   chrome://extensions/
   ```
2. Activa el interruptor **"Modo de desarrollador"** (*Developer mode*) ubicado en la esquina superior derecha.
3. Haz clic en el botón **"Cargar descomprimida"** (*Load unpacked*) en la esquina superior izquierda.
4. Selecciona la carpeta `extension/dist` dentro de este proyecto:
   ```text
   /ruta/a/sharedom/extension/dist
   ```
5. ¡Listo! El icono de **sharedom** aparecerá en la barra de herramientas de extensiones de Chrome. Puedes fijarlo (*Pin*) para tener acceso rápido.

---

## 📖 Modo de Uso

1. **Abrir cualquier sitio web** (ej. GitHub, Wikipedia, tu propia app web).
2. **Activar el Inspector**:
   - Haz clic en el icono de **sharedom** en la barra de herramientas de Chrome y pulsa **"Inspect DOM Element"**.
   - O presiona el atajo de teclado: `Alt + Shift + S` (`Cmd + Shift + S` en macOS).
   - O haz clic derecho en la página y selecciona **"Inspect & Capture DOM Element"**.
3. **Seleccionar un contenedor**:
   - Pasa el mouse sobre el elemento que deseas capturar. Verás el recuadro de resaltado índigo y las dimensiones.
   - Si deseas capturar el contenedor exterior o padre, presiona la tecla `↑`.
4. **Hacer clic para capturar**:
   - Al hacer clic, se abrirá el panel flotante con la previsualización en vivo.
   - Ajusta la escala (1x, 2x, 3x) o el formato si lo deseas.
   - Haz clic en **"Copy Image"** para pegar directamente en Slack, Discord, Notion, Figma, etc.
   - Haz clic en **"Download"** para guardar el archivo en tu disco.

---

## 🛠️ Estructura del Código

```text
extension/
├── manifest.json                  # Definición Manifest V3
├── icons/                         # Iconos en 16x16, 32x32, 48x48, 128x128
├── scripts/
│   ├── build.mjs                  # Script de empaquetado
│   └── generate-icons.mjs         # Generador nativo de iconos PNG
├── src/
│   ├── background/
│   │   └── service-worker.ts      # Service Worker de Chrome MV3
│   ├── content/
│   │   ├── content.ts             # Entry point del Content Script
│   │   ├── inspector.ts           # Interceptación de eventos y navegación DOM
│   │   ├── overlay.ts             # Shadow DOM host y recuadros de resaltado
│   │   ├── modal.ts               # Modal flotante con preview, copiado y descarga
│   │   └── styles.ts              # Estilos CSS encapsulados
│   └── popup/
│       ├── popup.html             # UI del popup de la extensión
│       ├── popup.ts               # Lógica del popup y sincronización de ajustes
│       └── popup.css              # Estilos modernos para el popup
└── dist/                          # Build final instalable en Chrome
```

---

## 📄 Licencia

MIT © [Erickgiber](https://github.com/Erickgiber)
