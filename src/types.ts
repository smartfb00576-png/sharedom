export interface CaptureOptions {
    scale?: number;
    backgroundColor?: string;
    quality?: number;
    format?: 'png' | 'jpeg' | 'webp';
    width?: number;
    height?: number;
    optimize?: boolean;
}

export type DomTarget = string | HTMLElement;
export type DOMTarget = DomTarget;
