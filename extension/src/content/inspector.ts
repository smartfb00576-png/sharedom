import { OverlayManager } from './overlay';
import { ActionModal, ModalOptions } from './modal';
import { ExtensionLanguage } from '../shared/i18n';

export interface InspectorStartOptions {
  scale?: number;
  format?: 'png' | 'jpeg' | 'webp';
  language?: ExtensionLanguage;
}

export class DomInspector {
  private overlay: OverlayManager | null = null;
  private modal: ActionModal | null = null;
  private isActive = false;
  private isModalOpen = false;
  private hoveredElement: HTMLElement | null = null;
  private selectedElement: HTMLElement | null = null;
  private currentLanguage: ExtensionLanguage = 'en';

  private onMouseMoveBound = this.onMouseMove.bind(this);
  private onMouseOverBound = this.onMouseOver.bind(this);
  private onClickBound = this.onClick.bind(this);
  private onKeyDownBound = this.onKeyDown.bind(this);
  private onScrollBound = this.onScroll.bind(this);

  public async start(options?: InspectorStartOptions): Promise<void> {
    if (this.isActive) return;

    this.isActive = true;
    this.isModalOpen = false;
    this.hoveredElement = null;
    this.selectedElement = null;

    let scale = options?.scale ?? 2;
    let format = options?.format ?? 'png';
    let language = options?.language;

    if (!language) {
      try {
        const stored = await chrome.storage.local.get(['language', 'defaultScale', 'defaultFormat']);
        if (stored.language === 'en' || stored.language === 'es') {
          language = stored.language;
        }
        if (stored.defaultScale && !options?.scale) {
          scale = Number(stored.defaultScale);
        }
        if (stored.defaultFormat && !options?.format) {
          format = stored.defaultFormat;
        }
      } catch {}
    }

    this.currentLanguage = language || 'en';

    if (!this.overlay) {
      this.overlay = new OverlayManager(this.currentLanguage);
    } else {
      this.overlay.setLanguage(this.currentLanguage);
    }

    const shadow = this.overlay.getShadowRoot();
    if (shadow) {
      const modalOptions: Partial<ModalOptions> = {
        scale,
        format,
        language: this.currentLanguage,
      };

      this.modal = new ActionModal(
        shadow,
        {
          onClose: () => this.stop(),
          onReselect: () => this.resumeInspection(),
          onToast: (msg, icon) => this.overlay?.showToast(msg, icon),
        },
        modalOptions
      );
    }

    this.overlay.showStatusPill(() => this.stop(), this.currentLanguage);
    this.attachEvents();
  }

  public stop(): void {
    if (!this.isActive) return;

    this.detachEvents();
    this.isActive = false;
    this.isModalOpen = false;
    this.hoveredElement = null;
    this.selectedElement = null;

    if (this.modal) {
      this.modal.hide();
      this.modal = null;
    }

    if (this.overlay) {
      this.overlay.destroy();
      this.overlay = null;
    }
  }

  public async toggle(options?: InspectorStartOptions): Promise<void> {
    if (this.isActive) {
      this.stop();
    } else {
      await this.start(options);
    }
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  private resumeInspection(): void {
    this.isModalOpen = false;
    this.selectedElement = null;
    if (this.overlay) {
      this.overlay.showStatusPill(() => this.stop(), this.currentLanguage);
    }
  }

  private attachEvents(): void {
    window.addEventListener('mousemove', this.onMouseMoveBound, true);
    window.addEventListener('mouseover', this.onMouseOverBound, true);
    window.addEventListener('click', this.onClickBound, true);
    window.addEventListener('keydown', this.onKeyDownBound, true);
    window.addEventListener('scroll', this.onScrollBound, true);
    window.addEventListener('resize', this.onScrollBound, true);
  }

  private detachEvents(): void {
    window.removeEventListener('mousemove', this.onMouseMoveBound, true);
    window.removeEventListener('mouseover', this.onMouseOverBound, true);
    window.removeEventListener('click', this.onClickBound, true);
    window.removeEventListener('keydown', this.onKeyDownBound, true);
    window.removeEventListener('scroll', this.onScrollBound, true);
    window.removeEventListener('resize', this.onScrollBound, true);
  }

  private isExtensionElement(target: EventTarget | null): boolean {
    if (!target || !(target instanceof Node)) return false;
    const host = this.overlay?.getHostElement();
    if (!host) return false;
    return host === target || host.contains(target);
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isActive || this.isModalOpen) return;
    if (this.isExtensionElement(e.target)) return;

    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target || !(target instanceof HTMLElement)) return;
    if (this.isExtensionElement(target)) return;
    if (target === document.documentElement) return;

    this.hoveredElement = target;
    this.overlay?.showHighlight(target);
  }

  private onMouseOver(e: MouseEvent): void {
    if (!this.isActive || this.isModalOpen) return;
    if (this.isExtensionElement(e.target)) return;

    if (e.target instanceof HTMLElement && e.target !== document.documentElement) {
      this.hoveredElement = e.target;
      this.overlay?.showHighlight(e.target);
    }
  }

  private onClick(e: MouseEvent): void {
    if (!this.isActive) return;
    if (this.isExtensionElement(e.target)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (this.isModalOpen) return;

    const target = this.hoveredElement || (e.target instanceof HTMLElement ? e.target : null);
    if (!target || target === document.documentElement) return;

    this.selectedElement = target;
    this.isModalOpen = true;

    this.overlay?.hideHighlight();
    this.overlay?.hideStatusPill();

    if (this.modal) {
      this.modal.show(this.selectedElement);
    }
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (!this.isActive) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.stop();
      return;
    }

    if (this.isModalOpen) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      const target = this.hoveredElement;
      if (target && target !== document.documentElement) {
        this.selectedElement = target;
        this.isModalOpen = true;
        this.overlay?.hideHighlight();
        this.overlay?.hideStatusPill();
        if (this.modal) {
          this.modal.show(this.selectedElement);
        }
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (
        this.hoveredElement &&
        this.hoveredElement.parentElement &&
        this.hoveredElement.parentElement !== document.documentElement
      ) {
        this.hoveredElement = this.hoveredElement.parentElement;
        this.overlay?.showHighlight(this.hoveredElement);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (
        this.hoveredElement &&
        this.hoveredElement.firstElementChild instanceof HTMLElement
      ) {
        this.hoveredElement = this.hoveredElement.firstElementChild;
        this.overlay?.showHighlight(this.hoveredElement);
      }
    }
  }

  private onScroll(): void {
    if (!this.isActive || this.isModalOpen || !this.hoveredElement) return;
    this.overlay?.showHighlight(this.hoveredElement);
  }
}
