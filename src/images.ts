async function fetchImageAsDataUrl(img: HTMLImageElement): Promise<string> {
    const url = img.currentSrc || img.src || img.getAttribute('src') || '';
    if (!url || url.startsWith('data:')) {
        return url;
    }

    try {
        const response = await fetch(url, { mode: 'cors' });
        if (response.ok) {
            const blob = await response.blob();
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(typeof reader.result === 'string' ? reader.result : url);
                };
                reader.onerror = () => {
                    resolve(url);
                };
                reader.readAsDataURL(blob);
            });
        }
    } catch {
        // Fallback to canvas conversion if already loaded in document
    }

    if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                return canvas.toDataURL('image/png');
            }
        } catch {
            // Ignore tainted canvas errors
        }
    }

    return url;
}

export async function inlineImages(rootElement: HTMLElement): Promise<() => void> {
    const images = Array.from(rootElement.querySelectorAll<HTMLImageElement>('img'));
    const originalSources = new Map<HTMLImageElement, string>();

    const inliningPromises = images.map(async (img) => {
        const originalSrc = img.getAttribute('src') || '';
        originalSources.set(img, originalSrc);

        const dataUrl = await fetchImageAsDataUrl(img);
        if (dataUrl && dataUrl.startsWith('data:')) {
            img.setAttribute('src', dataUrl);
        }
    });

    await Promise.all(inliningPromises);

    return () => {
        originalSources.clear();
    };
}
