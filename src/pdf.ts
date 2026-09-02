import { DomTarget, PdfOptions } from './types';
import { resolveElement, validateElementDimensions, syncDynamicStates } from './dom';
import { cloneComputedStyles } from './styles';
import { inlineImages } from './images';
import { createSvgDataUrl } from './svg';
import { renderSvgToCanvas } from './canvas';
import { buildPdf } from './pdf-writer';

async function captureAsJpeg(
    target: DomTarget,
    scale: number,
    quality: number,
    backgroundColor: string
): Promise<{ dataUrl: string; widthPx: number; heightPx: number }> {
    const element = resolveElement(target);
    const { width, height } = validateElementDimensions(element);

    const clone = element.cloneNode(true) as HTMLElement;
    syncDynamicStates(element, clone);
    cloneComputedStyles(element, clone);

    clone.style.width     = `${width}px`;
    clone.style.height    = `${height}px`;
    clone.style.boxSizing = 'border-box';
    clone.style.margin    = '0';

    const cleanupImages = await inlineImages(clone);

    try {
        const svgDataUrl = createSvgDataUrl(clone, width, height);
        const dataUrl = await renderSvgToCanvas(svgDataUrl, width, height, {
            scale,
            format: 'jpeg',
            quality,
            backgroundColor,
            optimize: true,
        });

        return {
            dataUrl,
            widthPx:  Math.round(width  * scale),
            heightPx: Math.round(height * scale),
        };
    } finally {
        cleanupImages();
    }
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
    const commaIdx  = dataUrl.indexOf(',');
    const base64    = commaIdx !== -1 ? dataUrl.slice(commaIdx + 1) : dataUrl;
    const binaryStr = atob(base64);
    const bytes     = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
}

/**
 * Captures a DOM element and returns it as a PDF `Blob`.
 *
 * The element is rendered to a JPEG via the existing `capture()` pipeline,
 * then embedded into a minimal PDF 1.4 binary — all without any external dependencies.
 *
 * @param target  A CSS selector string or an `HTMLElement`.
 * @param options PDF generation options (page size, metadata, quality, etc.).
 * @returns A `Blob` of type `application/pdf`.
 *
 * @example
 * const blob = await capturePDF('#my-report', {
 *   pageSize: 'A4',
 *   title: 'Monthly Report',
 *   author: 'Acme Inc.',
 *   scale: 2,
 * });
 */
export async function capturePDF(
    target: DomTarget,
    options: PdfOptions = {}
): Promise<Blob> {
    const {
        scale           = 2,
        backgroundColor = '#ffffff',
        quality         = 0.92,
        pageSize        = 'auto',
        orientation     = 'portrait',
        margin          = 0,
        title,
        author,
        subject,
        keywords,
    } = options;

    const { dataUrl, widthPx, heightPx } = await captureAsJpeg(
        target,
        scale,
        quality,
        backgroundColor
    );

    const jpegBytes = dataUrlToBytes(dataUrl);

    const pdfBytes = buildPdf(jpegBytes, {
        imageWidthPx:  widthPx,
        imageHeightPx: heightPx,
        dpi: 96 * scale,
        pageSize,
        orientation,
        margin,
        title,
        author,
        subject,
        keywords,
    });

    return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Captures a DOM element and immediately triggers a PDF download in the browser.
 *
 * @param target    A CSS selector string or an `HTMLElement`.
 * @param filename  Name for the downloaded file. Defaults to `'capture.pdf'`.
 * @param options   PDF generation options.
 *
 * @example
 * await downloadPDF('#invoice', 'invoice-2024.pdf', {
 *   pageSize: 'Letter',
 *   margin: 28,
 *   title: 'Invoice #1234',
 * });
 */
export async function downloadPDF(
    target: DomTarget,
    filename = 'capture.pdf',
    options: PdfOptions = {}
): Promise<void> {
    const blob = await capturePDF(target, options);
    const url  = URL.createObjectURL(blob);

    try {
        const link = document.createElement('a');
        link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
        link.href     = url;
        link.click();
    } finally {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}

/**
 * Captures a DOM element and opens the browser's native Print dialog.
 *
 * @param target  A CSS selector string or an `HTMLElement`.
 * @param options Capture options (`scale`, `quality`, `backgroundColor`, `title`).
 *
 * @example
 * await printElement('#my-card', { scale: 2, title: 'My Card' });
 */
export async function printElement(
    target: DomTarget,
    options: Pick<PdfOptions, 'scale' | 'quality' | 'backgroundColor' | 'title'> = {}
): Promise<void> {
    const {
        scale           = 2,
        quality         = 0.92,
        backgroundColor = '#ffffff',
        title           = document.title || 'sharedom',
    } = options;

    const { dataUrl } = await captureAsJpeg(target, scale, quality, backgroundColor);

    return new Promise<void>((resolve) => {
        const iframe = document.createElement('iframe');

        Object.assign(iframe.style, {
            position: 'fixed',
            top:      '-9999px',
            left:     '-9999px',
            width:    '1px',
            height:   '1px',
            opacity:  '0',
            border:   'none',
        });

        iframe.onload = () => {
            const doc = iframe.contentDocument;
            if (!doc) {
                document.body.removeChild(iframe);
                return resolve();
            }

            const escaped = title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            doc.open();
            doc.write(
                `<!DOCTYPE html><html><head>` +
                `<title>${escaped}</title>` +
                `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#fff}img{display:block;width:100%;height:auto;page-break-after:avoid}@page{margin:0}</style>` +
                `</head><body><img src="${dataUrl}" alt="${escaped}"/></body></html>`
            );
            doc.close();

            setTimeout(() => {
                try { iframe.contentWindow?.print(); } catch (_) {}
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    resolve();
                }, 500);
            }, 300);
        };

        document.body.appendChild(iframe);
        iframe.src = 'about:blank';
    });
}
