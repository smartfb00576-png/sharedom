import { DomTarget } from './types';

export function resolveElement(target: DomTarget): HTMLElement {
    if (typeof target === 'string') {
        const element = document.querySelector<HTMLElement>(target);
        if (!element) {
            throw new Error(`[snapdom]: No element found matching selector "${target}".`);
        }
        return element;
    }

    if (target instanceof HTMLElement) {
        return target;
    }

    throw new Error('[snapdom]: Target must be a valid CSS selector string or an HTMLElement.');
}

export function validateElementDimensions(element: HTMLElement): { width: number; height: number } {
    const rect = element.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    if (width <= 0 || height <= 0) {
        throw new Error('[snapdom]: Cannot capture element with width or height of 0. Ensure the element is visible in the DOM.');
    }

    return { width, height };
}

export function validateOptions(options: { scale?: number; quality?: number; format?: string }): void {
    if (options.scale !== undefined && (typeof options.scale !== 'number' || options.scale <= 0)) {
        throw new Error('[snapdom]: Scale option must be a positive number.');
    }

    if (options.quality !== undefined && (typeof options.quality !== 'number' || options.quality < 0 || options.quality > 1)) {
        throw new Error('[snapdom]: Quality option must be a number between 0 and 1.');
    }

    if (options.format !== undefined && options.format !== 'png' && options.format !== 'jpeg' && options.format !== 'webp') {
        throw new Error('[snapdom]: Format option must be "png", "jpeg", or "webp".');
    }
}

export function syncDynamicStates(source: Element, target: Element): void {
    if (source instanceof HTMLInputElement && target instanceof HTMLInputElement) {
        target.setAttribute('value', source.value);
        target.value = source.value;
        if (source.checked) {
            target.setAttribute('checked', '');
            target.checked = true;
        }
    } else if (source instanceof HTMLTextAreaElement && target instanceof HTMLTextAreaElement) {
        target.textContent = source.value;
        target.value = source.value;
    } else if (source instanceof HTMLSelectElement && target instanceof HTMLSelectElement) {
        target.value = source.value;
        const targetOptions = target.querySelectorAll('option');
        const selectedIndex = source.selectedIndex;
        if (selectedIndex >= 0 && targetOptions[selectedIndex]) {
            targetOptions[selectedIndex].setAttribute('selected', 'true');
        }
    } else if (source instanceof HTMLCanvasElement && target instanceof HTMLCanvasElement) {
        try {
            const dataUrl = source.toDataURL();
            const image = new Image();
            image.src = dataUrl;
            target.replaceWith(image);
        } catch {
            // Keep target canvas as-is if tainted
        }
    }

    const sourceChildren = Array.from(source.children);
    const targetChildren = Array.from(target.children);
    for (let i = 0; i < sourceChildren.length; i++) {
        if (targetChildren[i]) {
            syncDynamicStates(sourceChildren[i], targetChildren[i]);
        }
    }
}
