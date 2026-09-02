import { translations, ExtensionLanguage } from '../shared/i18n';

const inspectBtn = document.getElementById('inspect-btn') as HTMLButtonElement;
const captureConsoleBtn = document.getElementById('capture-console-btn') as HTMLButtonElement;
const captureNetworkBtn = document.getElementById('capture-network-btn') as HTMLButtonElement;
const btnConsoleTitle = document.getElementById('btn-console-title') as HTMLElement;
const btnConsoleSubtitle = document.getElementById('btn-console-subtitle') as HTMLElement;
const btnNetworkTitle = document.getElementById('btn-network-title') as HTMLElement;
const btnNetworkSubtitle = document.getElementById('btn-network-subtitle') as HTMLElement;

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

// Status & Permission Banner elements
const statusBanner = document.getElementById('status-banner') as HTMLElement;
const bannerIconShield = document.getElementById('banner-icon-shield') as HTMLElement;
const bannerIconAlert = document.getElementById('banner-icon-alert') as HTMLElement;
const bannerTitle = document.getElementById('banner-title') as HTMLElement;
const bannerDesc = document.getElementById('banner-desc') as HTMLElement;
const bannerActions = document.getElementById('banner-actions') as HTMLElement;
const bannerRetryBtn = document.getElementById('banner-retry-btn') as HTMLButtonElement;
const bannerReloadBtn = document.getElementById('banner-reload-btn') as HTMLButtonElement;

const isMac = navigator.platform.toUpperCase().includes('MAC') || navigator.userAgent.includes('Macintosh');
if (osModifier) {
  osModifier.textContent = isMac ? '⌥ Option' : 'Alt';
}

let currentLanguage: ExtensionLanguage = 'en';
let currentTab: chrome.tabs.Tab | null = null;
let isRestrictedPage = false;
let hasPermissionError = false;

function isUrlRestricted(url?: string): boolean {
  if (!url) return true;
  const restrictedPrefixes = [
    'chrome://',
    'edge://',
    'about:',
    'chrome-extension://',
    'devtools://',
    'view-source:',
  ];
  if (restrictedPrefixes.some((prefix) => url.startsWith(prefix))) {
    return true;
  }
  if (
    url.startsWith('https://chromewebstore.google.com') ||
    url.startsWith('https://chrome.google.com/webstore') ||
    url.startsWith('https://microsoftedge.microsoft.com/addons')
  ) {
    return true;
  }
  return false;
}

function updateBannerUI(): void {
  const t = translations[currentLanguage].popup;

  if (isRestrictedPage) {
    if (statusBanner) {
      statusBanner.style.display = 'flex';
      statusBanner.className = 'status-banner banner-warning';
    }
    if (bannerIconShield) bannerIconShield.style.display = 'block';
    if (bannerIconAlert) bannerIconAlert.style.display = 'none';
    if (bannerTitle) bannerTitle.textContent = t.restrictedPageTitle;
    if (bannerDesc) bannerDesc.textContent = t.restrictedPageDesc;
    if (bannerActions) bannerActions.style.display = 'none';
    if (inspectBtn) inspectBtn.disabled = true;
    if (captureConsoleBtn) captureConsoleBtn.disabled = true;
    if (captureNetworkBtn) captureNetworkBtn.disabled = true;
  } else if (hasPermissionError) {
    if (statusBanner) {
      statusBanner.style.display = 'flex';
      statusBanner.className = 'status-banner banner-error';
    }
    if (bannerIconShield) bannerIconShield.style.display = 'none';
    if (bannerIconAlert) bannerIconAlert.style.display = 'block';
    if (bannerTitle) bannerTitle.textContent = t.permissionErrorTitle;
    if (bannerDesc) bannerDesc.textContent = t.permissionErrorDesc;
    if (bannerActions) bannerActions.style.display = 'flex';
    if (bannerRetryBtn) bannerRetryBtn.textContent = t.btnRetry;
    if (bannerReloadBtn) bannerReloadBtn.textContent = t.btnReloadTab;
    if (inspectBtn) inspectBtn.disabled = false;
    if (captureConsoleBtn) captureConsoleBtn.disabled = false;
    if (captureNetworkBtn) captureNetworkBtn.disabled = false;
  } else {
    if (statusBanner) statusBanner.style.display = 'none';
    if (inspectBtn) inspectBtn.disabled = false;
    if (captureConsoleBtn) captureConsoleBtn.disabled = false;
    if (captureNetworkBtn) captureNetworkBtn.disabled = false;
  }
}

function applyLanguage(lang: ExtensionLanguage): void {
  currentLanguage = lang;
  const t = translations[lang].popup;

  if (langToggleBtn) {
    langToggleBtn.textContent = lang === 'en' ? 'ES' : 'EN';
  }

  if (ctaTitle) ctaTitle.textContent = t.ctaTitle;
  if (ctaSubtitle) ctaSubtitle.textContent = t.ctaSubtitle;
  if (btnConsoleTitle) btnConsoleTitle.textContent = t.btnConsoleLogs;
  if (btnConsoleSubtitle) btnConsoleSubtitle.textContent = t.btnConsoleLogsSubtitle;
  if (btnNetworkTitle) btnNetworkTitle.textContent = t.btnNetworkRequests;
  if (btnNetworkSubtitle) btnNetworkSubtitle.textContent = t.btnNetworkRequestsSubtitle;

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
    if (opts.length >= 4) {
      opts[0].textContent = t.fmtPng;
      opts[1].textContent = t.fmtJpeg;
      opts[2].textContent = t.fmtWebp;
      opts[3].textContent = t.fmtPdf;
    }
  }

  updateBannerUI();
}

function initFastSettings(): void {
  try {
    const cachedLang = localStorage.getItem('sharedom_lang') as ExtensionLanguage | null;
    if (cachedLang === 'en' || cachedLang === 'es') {
      applyLanguage(cachedLang);
    }
    const cachedScale = localStorage.getItem('sharedom_scale');
    if (cachedScale && scaleSelect) {
      scaleSelect.value = cachedScale;
    }
    const cachedFormat = localStorage.getItem('sharedom_format');
    if (cachedFormat && formatSelect) {
      formatSelect.value = cachedFormat;
    }
  } catch {}
}

async function loadSettings(): Promise<void> {
  try {
    const data = await chrome.storage.local.get(['language', 'defaultScale', 'defaultFormat']);
    if (data.language === 'en' || data.language === 'es') {
      applyLanguage(data.language);
      try { localStorage.setItem('sharedom_lang', data.language); } catch {}
    } else if (!localStorage.getItem('sharedom_lang')) {
      applyLanguage('en');
    }

    if (data.defaultScale && scaleSelect) {
      scaleSelect.value = String(data.defaultScale);
      try { localStorage.setItem('sharedom_scale', String(data.defaultScale)); } catch {}
    }
    if (data.defaultFormat && formatSelect) {
      formatSelect.value = String(data.defaultFormat);
      try { localStorage.setItem('sharedom_format', String(data.defaultFormat)); } catch {}
    }
  } catch {
    applyLanguage('en');
  }
}

async function saveSettings(): Promise<void> {
  try {
    localStorage.setItem('sharedom_lang', currentLanguage);
    if (scaleSelect) localStorage.setItem('sharedom_scale', scaleSelect.value);
    if (formatSelect) localStorage.setItem('sharedom_format', formatSelect.value);
  } catch {}
  try {
    await chrome.storage.local.set({
      language: currentLanguage,
      defaultScale: Number(scaleSelect.value),
      defaultFormat: formatSelect.value,
    });
  } catch {}
}

async function checkActiveTab(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab || null;
    isRestrictedPage = isUrlRestricted(tab?.url);
    updateBannerUI();
  } catch {
    isRestrictedPage = true;
    updateBannerUI();
  }
}

async function triggerTabAction(actionType: 'START_INSPECTOR' | 'CAPTURE_CONSOLE_LOGS' | 'CAPTURE_NETWORK_REQUESTS'): Promise<void> {
  hasPermissionError = false;
  updateBannerUI();

  if (!currentTab?.id || isRestrictedPage) {
    return;
  }

  const inspectorOptions = {
    scale: Number(scaleSelect.value),
    format: formatSelect.value as 'png' | 'jpeg' | 'webp',
    language: currentLanguage,
  };

  try {
    await chrome.tabs.sendMessage(currentTab.id, {
      type: actionType,
      options: inspectorOptions,
    });
    window.close();
  } catch {
    try {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          files: ['page-tracker.js'],
          world: 'MAIN',
        });
      } catch {}

      await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        files: ['content.js'],
      });

      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(currentTab!.id!, {
            type: actionType,
            options: inspectorOptions,
          });
          window.close();
        } catch {
          hasPermissionError = true;
          updateBannerUI();
        }
      }, 120);
    } catch {
      hasPermissionError = true;
      updateBannerUI();
    }
  }
}

langToggleBtn?.addEventListener('click', async () => {
  const nextLang: ExtensionLanguage = currentLanguage === 'en' ? 'es' : 'en';
  applyLanguage(nextLang);
  await saveSettings();
});

scaleSelect?.addEventListener('change', saveSettings);
formatSelect?.addEventListener('change', saveSettings);

inspectBtn?.addEventListener('click', () => triggerTabAction('START_INSPECTOR'));
captureConsoleBtn?.addEventListener('click', () => triggerTabAction('CAPTURE_CONSOLE_LOGS'));
captureNetworkBtn?.addEventListener('click', () => triggerTabAction('CAPTURE_NETWORK_REQUESTS'));
bannerRetryBtn?.addEventListener('click', () => triggerTabAction('START_INSPECTOR'));

bannerReloadBtn?.addEventListener('click', async () => {
  if (currentTab?.id) {
    try {
      await chrome.tabs.reload(currentTab.id);
      window.close();
    } catch {}
  }
});

initFastSettings();
Promise.all([loadSettings(), checkActiveTab()]);
