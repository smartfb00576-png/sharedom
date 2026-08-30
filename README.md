# sharedom

Fast and lightweight DOM snapshot and screenshot capture library for the browser and SSR (Node.js, Next.js, SvelteKit).

`sharedom` allows you to capture any HTML element into a high-quality image (PNG, JPEG, or WebP) directly in the browser or render server-side snapshots with zero runtime dependencies.

---

## Features

- ⚡ **Lightweight & Fast**: Uses native browser APIs (`XMLSerializer`, SVG `foreignObject`, and `HTMLCanvasElement`).
- 🌐 **SSR First-Class Support**: Dedicated `sharedom/ssr` module for Next.js Route Handlers and SvelteKit endpoints.
- 🎨 **Accurate Styles**: Automatically copies computed styles from source elements.
- 🔍 **High-DPI Support**: Configurable scale factor for crisp Retina / 4K snapshots.
- 🖼️ **Multiple Formats**: Export to PNG (with transparency), JPEG, or WebP.
- 🚀 **Automatic Image Optimization**: Cleans transparent pixel entropy and sanitizes Base64 output automatically.
- 💾 **Built-in Downloader**: Helper function to trigger instant file downloads in the browser.
- 📦 **TypeScript First**: Full type definitions included out of the box for ESM and CJS.

---

## Installation

```bash
npm install sharedom
```

Or with your preferred package manager:

```bash
pnpm add sharedom
# or
yarn add sharedom
```

---

## Quick Start (Browser)

### 1. Capture as an Optimized Base64 Data URL

```typescript
import { capture } from 'sharedom';

// Capture by CSS selector
const dataUrl = await capture('#my-card', {
  scale: 2,
  format: 'png'
});

// Display in an <img> element
const imageElement = document.querySelector('img');
if (imageElement) imageElement.src = dataUrl;
```

### 2. Direct Download

```typescript
import { downloadCapture } from 'sharedom';

// Pass element reference or selector and filename
await downloadCapture('#my-card', 'card-snapshot.png', {
  scale: 2,
  backgroundColor: '#ffffff'
});
```

---

## Server-Side Rendering (SSR)

### 1. Sending HTML from Client (`fetch` POST)

```typescript
// Extract HTML from the DOM or provide raw HTML template
const card = document.querySelector('#my-card');
const html = card ? card.outerHTML : '<div class="banner">Hello World</div>';

// Send JSON payload with stringified HTML
const response = await fetch('/api/screenshot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ html })
});

// Receive image blob and create an Object URL
const blob = await response.blob();
const imageUrl = URL.createObjectURL(blob);
```

### 2. Next.js App Router (Route Handler)

```typescript
// app/api/screenshot/route.ts
import { captureSSR } from 'sharedom/ssr';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { html } = await request.json();

  const buffer = await captureSSR(html, {
    scale: 2,
    format: 'png',
    viewport: { width: 1200, height: 630 }
  });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
```

### 3. SvelteKit Server Endpoint

```typescript
// src/routes/api/screenshot/+server.ts
import { captureSSR } from 'sharedom/ssr';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { html } = await request.json();

  const buffer = await captureSSR(html, {
    scale: 2,
    format: 'png',
    viewport: { width: 1200, height: 630 }
  });

  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png'
    }
  });
};
```

---

## API Reference

### Client: `sharedom`

#### `capture(target, options?)`
Captures a DOM element and returns a Promise resolving to an optimized base64 Data URL.
- **`target`** (`string | HTMLElement`): The CSS selector or HTMLElement to capture.
- **`options`** (`CaptureOptions`, optional): Configuration options.

#### `downloadCapture(target, filename?, options?)`
Captures a DOM element and triggers a browser download.
- **`target`** (`string | HTMLElement`): The CSS selector or HTMLElement to capture.
- **`filename`** (`string`, optional, default: `'screenshot.png'`): The name of the downloaded file.
- **`options`** (`CaptureOptions`, optional): Configuration options.

#### `CaptureOptions`
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `scale` | `number` | `1` | Resolution multiplier (e.g. `2` for 2x scale). |
| `backgroundColor` | `string` | `undefined` | Background fill color. Transparent by default. |
| `format` | `'png' \| 'jpeg' \| 'webp'` | `'png'` | Output image format. |
| `quality` | `number` | `0.92` | Compression quality for JPEG/WebP (between `0` and `1`). |
| `optimize` | `boolean` | `true` | Automatically clean transparent entropy and optimize Base64 output. |
| `width` | `number` | `element.width` | Custom target width in pixels. |
| `height` | `number` | `element.height` | Custom target height in pixels. |

---

### SSR: `sharedom/ssr`

#### `captureSSR(htmlOrUrl, options?)`
Captures an HTML string or URL on the server and returns a `Promise<Uint8Array>`.

#### `SsrCaptureOptions`
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `viewport` | `{ width: number, height: number }` | `{ width: 1200, height: 630 }` | Viewport dimensions. |
| `scale` | `number` | `2` | Device pixel ratio / scale. |
| `format` | `'png' \| 'jpeg' \| 'webp'` | `'png'` | Output image format. |
| `backgroundColor` | `string` | `'#ffffff'` | Background fill color. |
| `delay` | `number` | `0` | Delay in milliseconds before capture. |

---

## Development & Live Preview

The repository includes an interactive playground to test all options in real time.

```bash
# Install dependencies
npm install

# Start real-time dev server with live preview
npm run dev

# Build library dist (Client & SSR)
npm run build

# Build Chrome Extension
npm run build:extension

# Build static preview for GitHub Pages
npm run build:preview
```

---

## 🧩 Chrome Extension

`sharedom` includes a built-in Chrome Extension in `extension/` for interactive DOM inspection and one-click capture:

- **Interactive Hover & Highlight**: Highlights elements with tags, classes, and pixel dimensions.
- **Copy & Download**: Copy PNG images directly to the clipboard or download in high resolution (1x, 2x, 3x).
- **Keyboard Navigation**: Use `↑` for parent element, `↓` for child, `Esc` to cancel.
- **Shortcuts**: Press `Alt + Shift + S` (`Cmd + Shift + S` on macOS) to activate.

See the [Extension README](file:///Users/erickgiber/Documents/Repositories/sharedom/extension/README.md) for step-by-step installation instructions in `chrome://extensions`.

---

## License

MIT
