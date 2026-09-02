import { capture, downloadPDF, CaptureOptions, PdfOptions } from '../../../src/index';
import { translations, ExtensionLanguage } from '../shared/i18n';

export interface ModalOptions {
  scale: number;
  format: 'png' | 'jpeg' | 'webp';
  backgroundColor: string | undefined;
  language: ExtensionLanguage;
}

function rgbToHex(rgbStr: string): string {
  const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return '#6366f1';
  const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
  const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
  const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

export class ActionModal {
  private shadow: ShadowRoot;
  private backdrop: HTMLElement | null = null;
  private currentElement: HTMLElement | null = null;
  private currentDataUrl = '';
  private detectedBgColor: string | undefined = undefined;
  private currentOptions: ModalOptions = {
    scale: 2,
    format: 'png',
    backgroundColor: undefined,
    language: 'en',
  };
  private isCapturing = false;

  private onClose: () => void;
  private onReselect: () => void;
  private onToast: (msg: string, icon?: string) => void;

  constructor(
    shadow: ShadowRoot,
    callbacks: {
      onClose: () => void;
      onReselect: () => void;
      onToast: (msg: string, icon?: string) => void;
    },
    initialOptions?: Partial<ModalOptions>
  ) {
    this.shadow = shadow;
    this.onClose = callbacks.onClose;
    this.onReselect = callbacks.onReselect;
    this.onToast = callbacks.onToast;

    if (initialOptions) {
      this.currentOptions = { ...this.currentOptions, ...initialOptions };
    }
  }

  public setOptions(options: Partial<ModalOptions>): void {
    this.currentOptions = { ...this.currentOptions, ...options };
  }

  private detectBackgroundColor(element: HTMLElement): string | undefined {
    let current: HTMLElement | null = element;
    while (current && current !== document.documentElement) {
      const style = window.getComputedStyle(current);
      const bg = style.backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)' && !bg.endsWith(', 0)')) {
        return bg;
      }
      current = current.parentElement;
    }

    const bodyStyle = window.getComputedStyle(document.body);
    const bodyBg = bodyStyle.backgroundColor;
    if (bodyBg && bodyBg !== 'transparent' && bodyBg !== 'rgba(0, 0, 0, 0)' && !bodyBg.endsWith(', 0)')) {
      return bodyBg;
    }

    return undefined;
  }

  public async show(element: HTMLElement): Promise<void> {
    this.currentElement = element;
    this.detectedBgColor = this.detectBackgroundColor(element);
    this.currentOptions.backgroundColor = this.detectedBgColor;

    this.hide();
    this.createModalDOM();
    await this.refreshCapture();
  }

  public hide(): void {
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
  }

  private createModalDOM(): void {
    if (!this.currentElement) return;
    const t = translations[this.currentOptions.language].modal;

    this.backdrop = document.createElement('div');
    this.backdrop.className = 'sharedom-modal-backdrop';

    const card = document.createElement('div');
    card.className = 'sharedom-modal-card';
    card.addEventListener('click', (e) => e.stopPropagation());

    const header = document.createElement('div');
    header.className = 'sharedom-modal-header';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'sharedom-modal-title-wrap';

    const logo = document.createElement('div');
    logo.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="28" height="28" fill="none">
        <defs>
          <linearGradient id="modalLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#a78bfa" />
            <stop offset="100%" stop-color="#7c3aed" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="url(#modalLogoGrad)" />
        <rect x="1" y="1" width="46" height="46" rx="11" stroke="rgba(255,255,255,0.25)" stroke-width="1" />
        <path d="M12 18V14H16" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M36 18V14H32" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M12 30V34H16" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M36 30V34H32" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M19 22L16 24.5L19 27" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M29 22L32 24.5L29 27" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="24" cy="24.5" r="3" fill="white" />
        <circle cx="34" cy="14" r="1.5" fill="#facc15" />
      </svg>
    `;
    logo.style.display = 'flex';
    logo.style.alignItems = 'center';

    const textWrap = document.createElement('div');

    const title = document.createElement('div');
    title.className = 'sharedom-modal-title';
    title.textContent = t.title;

    const subtitle = document.createElement('div');
    subtitle.className = 'sharedom-modal-subtitle';
    const tag = this.currentElement.tagName.toLowerCase();
    const idStr = this.currentElement.id ? `#${this.currentElement.id}` : '';
    const classStr = this.currentElement.className && typeof this.currentElement.className === 'string'
      ? `.${this.currentElement.className.trim().split(/\s+/).slice(0, 2).join('.')}`
      : '';
    subtitle.textContent = `<${tag}${idStr}${classStr}>`;

    textWrap.appendChild(title);
    textWrap.appendChild(subtitle);
    titleWrap.appendChild(logo);
    titleWrap.appendChild(textWrap);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'sharedom-icon-btn';
    closeBtn.setAttribute('title', 'Close (Esc)');
    closeBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    closeBtn.addEventListener('click', () => {
      this.hide();
      this.onClose();
    });

    header.appendChild(titleWrap);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'sharedom-modal-body';

    const previewContainer = document.createElement('div');
    previewContainer.className = 'sharedom-preview-container';
    previewContainer.id = 'sharedom-modal-preview-box';

    const loader = document.createElement('div');
    loader.className = 'sharedom-preview-loader';
    loader.innerHTML = `
      <div class="sharedom-spinner"></div>
      <span>${t.rendering}</span>
    `;
    previewContainer.appendChild(loader);

    const controlsGrid = document.createElement('div');
    controlsGrid.className = 'sharedom-controls-grid';

    const scaleGroup = document.createElement('div');
    scaleGroup.className = 'sharedom-control-group';
    const scaleLabel = document.createElement('label');
    scaleLabel.className = 'sharedom-control-label';
    scaleLabel.textContent = t.resolution;

    const scaleBtnGroup = document.createElement('div');
    scaleBtnGroup.className = 'sharedom-btn-group';

    const scales = [1, 2, 3];
    scales.forEach((s) => {
      const btn = document.createElement('button');
      btn.className = `sharedom-btn-option ${this.currentOptions.scale === s ? 'active' : ''}`;
      btn.textContent = `${s}x`;
      btn.addEventListener('click', async () => {
        if (this.currentOptions.scale === s || this.isCapturing) return;
        scaleBtnGroup.querySelectorAll('.sharedom-btn-option').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentOptions.scale = s;
        await this.refreshCapture();
      });
      scaleBtnGroup.appendChild(btn);
    });

    scaleGroup.appendChild(scaleLabel);
    scaleGroup.appendChild(scaleBtnGroup);

    const formatGroup = document.createElement('div');
    formatGroup.className = 'sharedom-control-group';
    const formatLabel = document.createElement('label');
    formatLabel.className = 'sharedom-control-label';
    formatLabel.textContent = t.format;

    const formatSelectWrap = document.createElement('div');
    formatSelectWrap.className = 'sharedom-select-wrap';

    const formatSelect = document.createElement('select');
    formatSelect.className = 'sharedom-select';
    ['png', 'jpeg', 'webp'].forEach((fmt) => {
      const opt = document.createElement('option');
      opt.value = fmt;
      opt.textContent = fmt.toUpperCase();
      if (this.currentOptions.format === fmt) opt.selected = true;
      formatSelect.appendChild(opt);
    });

    formatSelect.addEventListener('change', async () => {
      if (this.isCapturing) return;
      this.currentOptions.format = formatSelect.value as 'png' | 'jpeg' | 'webp';
      await this.refreshCapture();
    });

    formatSelectWrap.appendChild(formatSelect);
    formatGroup.appendChild(formatLabel);
    formatGroup.appendChild(formatSelectWrap);

    const bgGroup = document.createElement('div');
    bgGroup.className = 'sharedom-control-group';
    const bgLabel = document.createElement('label');
    bgLabel.className = 'sharedom-control-label';
    bgLabel.textContent = t.background;

    const bgSelectWrap = document.createElement('div');
    bgSelectWrap.className = 'sharedom-select-wrap';

    const bgSelect = document.createElement('select');
    bgSelect.className = 'sharedom-select';

    const bgOptions: Array<{ label: string; value: string }> = [];

    if (this.detectedBgColor) {
      bgOptions.push({ label: t.bgAuto, value: 'auto' });
    }
    bgOptions.push({ label: t.bgTransparent, value: 'transparent' });
    bgOptions.push({ label: t.bgWhite, value: '#ffffff' });
    bgOptions.push({ label: t.bgDark, value: '#111116' });
    bgOptions.push({ label: t.bgCustom, value: 'custom' });

    bgOptions.forEach((optData) => {
      const opt = document.createElement('option');
      opt.value = optData.value;
      opt.textContent = optData.label;

      if (this.detectedBgColor && optData.value === 'auto') {
        opt.selected = true;
      } else if (!this.detectedBgColor && optData.value === 'transparent') {
        opt.selected = true;
      }

      bgSelect.appendChild(opt);
    });

    const customColorInput = document.createElement('input');
    customColorInput.type = 'color';
    customColorInput.className = 'sharedom-color-input';
    customColorInput.value = this.detectedBgColor ? rgbToHex(this.detectedBgColor) : '#6366f1';
    customColorInput.style.display = 'none';

    bgSelect.addEventListener('change', async () => {
      if (this.isCapturing) return;
      const val = bgSelect.value;
      if (val === 'auto') {
        this.currentOptions.backgroundColor = this.detectedBgColor;
        customColorInput.style.display = 'none';
      } else if (val === 'transparent') {
        this.currentOptions.backgroundColor = undefined;
        customColorInput.style.display = 'none';
      } else if (val === 'custom') {
        customColorInput.style.display = 'block';
        this.currentOptions.backgroundColor = customColorInput.value;
      } else {
        this.currentOptions.backgroundColor = val;
        customColorInput.style.display = 'none';
      }
      await this.refreshCapture();
    });

    customColorInput.addEventListener('input', async () => {
      if (this.isCapturing) return;
      this.currentOptions.backgroundColor = customColorInput.value;
      await this.refreshCapture();
    });

    bgSelectWrap.appendChild(bgSelect);
    bgGroup.appendChild(bgLabel);
    bgGroup.appendChild(bgSelectWrap);
    bgGroup.appendChild(customColorInput);

    controlsGrid.appendChild(scaleGroup);
    controlsGrid.appendChild(formatGroup);
    controlsGrid.appendChild(bgGroup);

    body.appendChild(previewContainer);
    body.appendChild(controlsGrid);

    const footer = document.createElement('div');
    footer.className = 'sharedom-modal-footer';

    const footerLeft = document.createElement('div');
    footerLeft.className = 'sharedom-footer-left';

    const reselectBtn = document.createElement('button');
    reselectBtn.className = 'sharedom-btn sharedom-btn-secondary sharedom-btn-icon';
    reselectBtn.setAttribute('title', t.reselectTooltip);
    reselectBtn.setAttribute('aria-label', t.reselectTooltip);
    reselectBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
        <path d="M21 3v5h-5"></path>
      </svg>
    `;
    reselectBtn.addEventListener('click', () => {
      this.hide();
      this.onReselect();
    });

    const copyDataUrlBtn = document.createElement('button');
    copyDataUrlBtn.className = 'sharedom-btn sharedom-btn-ghost';
    copyDataUrlBtn.setAttribute('title', 'Copy Base64 Data URL string');
    copyDataUrlBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
      ${t.base64}
    `;
    copyDataUrlBtn.addEventListener('click', async () => {
      if (!this.currentDataUrl) return;
      try {
        await navigator.clipboard.writeText(this.currentDataUrl);
        this.onToast(t.dataUrlSuccess, '📋');
      } catch {
        this.onToast(t.dataUrlError, '⚠️');
      }
    });

    footerLeft.appendChild(reselectBtn);
    footerLeft.appendChild(copyDataUrlBtn);

    const footerRight = document.createElement('div');
    footerRight.className = 'sharedom-footer-right';

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'sharedom-btn sharedom-btn-secondary';
    downloadBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      ${t.download}
    `;
    downloadBtn.addEventListener('click', () => {
      this.triggerDownload();
    });

    const downloadPdfBtn = document.createElement('button');
    downloadPdfBtn.className = 'sharedom-btn sharedom-btn-pdf';
    downloadPdfBtn.setAttribute('title', t.pdfTooltip);
    downloadPdfBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      <span>${t.pdf}</span>
    `;
    downloadPdfBtn.addEventListener('click', async () => {
      await this.triggerPdfDownload(downloadPdfBtn);
    });

    const copyBtn = document.createElement('button');
    copyBtn.className = 'sharedom-btn sharedom-btn-primary';
    copyBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      ${t.copyImage}
    `;
    copyBtn.addEventListener('click', async () => {
      await this.copyImageToClipboard();
    });

    footerRight.appendChild(downloadBtn);
    footerRight.appendChild(downloadPdfBtn);
    footerRight.appendChild(copyBtn);

    footer.appendChild(footerLeft);
    footer.appendChild(footerRight);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);

    this.backdrop.appendChild(card);
    this.shadow.appendChild(this.backdrop);
  }

  private async refreshCapture(): Promise<void> {
    if (!this.currentElement || !this.shadow) return;
    const t = translations[this.currentOptions.language].modal;
    this.isCapturing = true;

    const previewBox = this.shadow.getElementById('sharedom-modal-preview-box');
    if (previewBox) {
      previewBox.innerHTML = `
        <div class="sharedom-preview-loader">
          <div class="sharedom-spinner"></div>
          <span>${t.rendering}</span>
        </div>
      `;
    }

    try {
      const options: CaptureOptions = {
        scale: this.currentOptions.scale,
        format: this.currentOptions.format,
        backgroundColor: this.currentOptions.backgroundColor,
        optimize: true,
      };

      const dataUrl = await capture(this.currentElement, options);
      this.currentDataUrl = dataUrl;

      if (previewBox) {
        previewBox.innerHTML = '';
        const img = document.createElement('img');
        img.className = 'sharedom-preview-img';
        img.src = dataUrl;

        const rect = this.currentElement.getBoundingClientRect();
        const width = Math.round(rect.width * this.currentOptions.scale);
        const height = Math.round(rect.height * this.currentOptions.scale);

        const meta = document.createElement('div');
        meta.className = 'sharedom-preview-meta';
        meta.textContent = `${width} × ${height} px (${this.currentOptions.scale}x ${this.currentOptions.format.toUpperCase()})`;

        previewBox.appendChild(img);
        previewBox.appendChild(meta);
      }
    } catch (error) {
      if (previewBox) {
        previewBox.innerHTML = `
          <div style="color: #ef4444; font-size: 13px; text-align: center; padding: 16px;">
            ${t.captureFailed}<br>
            <span style="font-size: 11px; color: #a1a1aa;">${String(error)}</span>
          </div>
        `;
      }
    } finally {
      this.isCapturing = false;
    }
  }

  private async copyImageToClipboard(): Promise<void> {
    if (!this.currentElement) return;
    const t = translations[this.currentOptions.language].modal;

    try {
      let pngBlob: Blob;

      if (this.currentOptions.format === 'png' && this.currentDataUrl.startsWith('data:image/png')) {
        const res = await fetch(this.currentDataUrl);
        pngBlob = await res.blob();
      } else {
        const pngDataUrl = await capture(this.currentElement, {
          scale: this.currentOptions.scale,
          format: 'png',
          backgroundColor: this.currentOptions.backgroundColor,
          optimize: true,
        });
        const res = await fetch(pngDataUrl);
        pngBlob = await res.blob();
      }

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob }),
      ]);

      this.onToast(t.copySuccess, '📋');
    } catch (error) {
      try {
        if (this.currentDataUrl) {
          await navigator.clipboard.writeText(this.currentDataUrl);
          this.onToast(t.dataUrlSuccess, '📋');
          return;
        }
      } catch {}
      this.onToast(t.copyError, '⚠️');
    }
  }

  private triggerDownload(): void {
    if (!this.currentDataUrl || !this.currentElement) return;
    const t = translations[this.currentOptions.language].modal;

    const tag = this.currentElement.tagName.toLowerCase();
    const id = this.currentElement.id ? `-${this.currentElement.id}` : '';
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const ext = this.currentOptions.format;
    const filename = `domsnap-${tag}${id}-${timestamp}.${ext}`;

    const link = document.createElement('a');
    link.download = filename;
    link.href = this.currentDataUrl;
    link.click();

    this.onToast(`${t.downloaded} ${filename}`, '📥');
  }

  private async triggerPdfDownload(btn?: HTMLButtonElement): Promise<void> {
    if (!this.currentElement || this.isCapturing) return;
    const t = translations[this.currentOptions.language].modal;

    const tag = this.currentElement.tagName.toLowerCase();
    const id = this.currentElement.id ? `-${this.currentElement.id}` : '';
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const filename = `domsnap-${tag}${id}-${timestamp}.pdf`;

    const originalHTML = btn?.innerHTML;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `
        <div class="sharedom-spinner" style="width:13px;height:13px;border-width:2px;display:inline-block"></div>
        <span>${t.pdf}</span>
      `;
    }

    try {
      const bgColor = this.currentOptions.backgroundColor ?? '#ffffff';
      const pdfOpts: PdfOptions = {
        scale: this.currentOptions.scale,
        backgroundColor: bgColor,
        quality: 0.92,
        pageSize: 'auto',
      };

      await downloadPDF(this.currentElement, filename, pdfOpts);
      this.onToast(`${t.pdfSuccess} ${filename}`, '📄');
    } catch (error) {
      this.onToast(`${t.pdfError}: ${String(error)}`, '⚠️');
    } finally {
      if (btn && originalHTML) {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
      }
    }
  }
}
