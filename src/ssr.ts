export interface SsrViewport {
    width: number;
    height: number;
}

export interface SsrCaptureOptions {
    scale?: number;
    viewport?: SsrViewport;
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
    backgroundColor?: string;
    delay?: number;
    fullPage?: boolean;
    headers?: Record<string, string>;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export async function captureSSR(
    htmlOrUrl: string,
    options: SsrCaptureOptions = {}
): Promise<Uint8Array> {
    const {
        viewport = { width: 1200, height: 630 },
        backgroundColor = '#ffffff',
        delay = 0,
    } = options;

    if (!htmlOrUrl || typeof htmlOrUrl !== 'string') {
        throw new Error('[sharedom/ssr]: htmlOrUrl must be a non-empty string.');
    }

    if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const svgWidth = viewport.width;
    const svgHeight = viewport.height;
    const isUrl = /^https?:\/\//i.test(htmlOrUrl.trim());

    const contentHtml = isUrl
        ? `<iframe src="${htmlOrUrl}" style="width:100%;height:100%;border:none;"></iframe>`
        : htmlOrUrl;

    const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;background:${backgroundColor};">
          ${contentHtml}
        </div>
      </foreignObject>
    </svg>
  `;

    const encoder = new TextEncoder();
    return encoder.encode(svgString);
}

export async function createSsrSnapshot(
    htmlOrUrl: string,
    options: SsrCaptureOptions = {}
): Promise<string> {
    const buffer = await captureSSR(htmlOrUrl, options);
    const base64 = uint8ArrayToBase64(buffer);
    const format = options.format || 'png';
    const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
    return `data:${mime};base64,${base64}`;
}
