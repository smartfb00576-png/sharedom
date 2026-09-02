import { CaptureOptions, DomTarget, DOMTarget } from './types';
import { resolveElement, validateElementDimensions, validateOptions, syncDynamicStates } from './dom';
import { cloneComputedStyles } from './styles';
import { inlineImages } from './images';
import { createSvgDataUrl } from './svg';
import { renderSvgToCanvas } from './canvas';

export type { CaptureOptions, DomTarget, DOMTarget, PdfOptions, PdfPageSize } from './types';
export { capturePDF, downloadPDF, printElement } from './pdf';


export async function capture(target: DomTarget, options: CaptureOptions = {}): Promise<string> {
    validateOptions(options);

    const element = resolveElement(target);
    const { width, height } = validateElementDimensions(element);

    const targetWidth = options.width ?? width;
    const targetHeight = options.height ?? height;

    const clone = element.cloneNode(true) as HTMLElement;
    syncDynamicStates(element, clone);
    cloneComputedStyles(element, clone);

    clone.style.width = `${targetWidth}px`;
    clone.style.height = `${targetHeight}px`;
    clone.style.boxSizing = 'border-box';
    clone.style.margin = '0';

    const cleanupImages = await inlineImages(clone);

    try {
        const svgDataUrl = createSvgDataUrl(clone, targetWidth, targetHeight);
        return await renderSvgToCanvas(svgDataUrl, targetWidth, targetHeight, options);
    } finally {
        cleanupImages();
    }
}

export async function downloadCapture(
    target: DomTarget,
    filename = 'screenshot.png',
    options: CaptureOptions = {}
): Promise<void> {
    const dataUrl = await capture(target, options);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
}