import { translations, ExtensionLanguage } from '../shared/i18n';

const inspectBtn = document.getElementById('inspect-btn') as HTMLButtonElement;
const scaleSelect = document.getElementById('scale-select') as HTMLSelectElement;
const formatSelect = document.getElementById('format-select') as HTMLSelectElement;
const langToggleBtn = document.getElementById('lang-toggle-btn') as HTMLButtonElement;
const osModifier = document.getElementById('os-modifier') as HTMLElement;

const ctaTitle = document.getElementById('cta-title') as HTMLElement;
const ctaSubtitle = document.getElementById('cta-subtitle') as HTMLElement;
const txtDefaultSettings = document.getElementById('txt-default-settings') as HTMLElement;
const txtResolutionLabel = document.getElementById('txt-resolution-label') as HTMLElement;
const txtFormatLabel = document.getElementById('txt-format-label') as HTMLElement;
const txtShortcutsTitle = document.getElementById('txt-shortcuts-title') as HTMLElement;
const txtShortcutInspect = document.getElementById('txt-shortcut-inspect') as HTMLElement;
const txtShortcutParentChild = document.getElementById('txt-shortcut-parent-child') as HTMLElement;
const txtShortcutCapture = document.getElementById('txt-shortcut-capture') as HTMLElement;
const txtShortcutCancel = document.getElementById('txt-shortcut-cancel') as HTMLElement;
const txtCoffee = document.getElementById('txt-coffee') as HTMLElement;
const txtFooter = document.getElementById('txt-footer') as HTMLElement;

const isMac = navigator.platform.toUpperCase().includes('MAC') || navigator.userAgent.includes('Macintosh');
if (osModifier) {
  osModifier.textContent = isMac ? '⌥ Option' : 'Alt';
}

let currentLanguage: ExtensionLanguage = 'en';

function applyLanguage(lang: ExtensionLanguage): void {
  currentLanguage = lang;
  const t = translations[lang].popup;

  if (langToggleBtn) {
    langToggleBtn.textContent = lang === 'en' ? 'ES' : 'EN';
  }

  if (ctaTitle) ctaTitle.textContent = t.ctaTitle;
  if (ctaSubtitle) ctaSubtitle.textContent = t.ctaSubtitle;
  if (txtDefaultSettings) txtDefaultSettings.textContent = t.defaultSettings;
  if (txtResolutionLabel) txtResolutionLabel.textContent = t.resolution;
  if (txtFormatLabel) txtFormatLabel.textContent = t.format;
  if (txtShortcutsTitle) txtShortcutsTitle.textContent = t.shortcutsTitle;
  if (txtShortcutInspect) txtShortcutInspect.textContent = t.shortcutInspect;
  if (txtShortcutParentChild) txtShortcutParentChild.textContent = t.shortcutParentChild;
  if (txtShortcutCapture) txtShortcutCapture.textContent = t.shortcutCapture;
  if (txtShortcutCancel) txtShortcutCancel.textContent = t.shortcutCancel;
  if (txtCoffee) txtCoffee.textContent = t.buyCoffee;
  if (txtFooter) txtFooter.textContent = t.footer;

  if (scaleSelect) {
    const opts = scaleSelect.options;
    if (opts.length >= 3) {
      opts[0].textContent = t.resStandard;
      opts[1].textContent = t.resRetina;
      opts[2].textContent = t.resUltra;
    }
  }

  if (formatSelect) {
    const opts = formatSelect.options;
    if (opts.length >= 3) {
      opts[0].textContent = t.fmtPng;
      opts[1].textContent = t.fmtJpeg;
      opts[2].textContent = t.fmtWebp;
    }
  }
}

async function loadSettings(): Promise<void> {
  try {
    const data = await chrome.storage.local.get(['language', 'defaultScale', 'defaultFormat']);
    if (data.language === 'en' || data.language === 'es') {
      applyLanguage(data.language);
    } else {
      applyLanguage('en');
    }

    if (data.defaultScale && scaleSelect) {
      scaleSelect.value = String(data.defaultScale);
    }
    if (data.defaultFormat && formatSelect) {
      formatSelect.value = String(data.defaultFormat);
    }
  } catch {
    applyLanguage('en');
  }
}

async function saveSettings(): Promise<void> {
  try {
    await chrome.storage.local.set({
      language: currentLanguage,
      defaultScale: Number(scaleSelect.value),
      defaultFormat: formatSelect.value,
    });
  } catch {}
}

langToggleBtn?.addEventListener('click', async () => {
  const nextLang: ExtensionLanguage = currentLanguage === 'en' ? 'es' : 'en';
  applyLanguage(nextLang);
  await saveSettings();
});

scaleSelect?.addEventListener('change', saveSettings);
formatSelect?.addEventListener('change', saveSettings);

inspectBtn?.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
    return;
  }

  const inspectorOptions = {
    scale: Number(scaleSelect.value),
    format: formatSelect.value as 'png' | 'jpeg' | 'webp',
    language: currentLanguage,
  };

  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: 'START_INSPECTOR',
      options: inspectorOptions,
    });
    window.close();
  } catch {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      });
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tab.id!, {
            type: 'START_INSPECTOR',
            options: inspectorOptions,
          });
        } catch {}
        window.close();
      }, 100);
    } catch {
      window.close();
    }
  }
});

loadSettings();
