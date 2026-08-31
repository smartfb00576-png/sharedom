chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'sharedom-inspect',
    title: 'Inspect & Capture DOM Element',
    contexts: ['page', 'selection', 'image', 'link', 'editable'],
  });
});

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function fetchImageAsDataUrlInBackground(url: string): Promise<{ dataUrl?: string; error?: string }> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { error: `HTTP ${response.status}` };
    }
    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = await response.arrayBuffer();
    const base64 = arrayBufferToBase64(buffer);
    const dataUrl = `data:${contentType};base64,${base64}`;
    return { dataUrl };
  } catch (err) {
    return { error: String(err) };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === 'SHAREDOM_FETCH_IMAGE' && typeof message.url === 'string') {
    fetchImageAsDataUrlInBackground(message.url).then(sendResponse);
    return true;
  }
});

function isUrlRestricted(url?: string): boolean {
  if (!url) return true;
  const restricted = [
    'chrome://',
    'edge://',
    'about:',
    'chrome-extension://',
    'devtools://',
    'view-source:',
    'https://chromewebstore.google.com',
    'https://chrome.google.com/webstore',
    'https://microsoftedge.microsoft.com/addons',
  ];
  return restricted.some((prefix) => url.startsWith(prefix));
}

async function toggleInspectorOnActiveTab(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || isUrlRestricted(tab.url)) {
      return;
    }

    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_INSPECTOR' });
    } catch {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      });
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tab.id!, { type: 'START_INSPECTOR' });
        } catch {}
      }, 150);
    }
  } catch {}
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-inspector') {
    await toggleInspectorOnActiveTab();
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'sharedom-inspect' && tab?.id) {
    await toggleInspectorOnActiveTab();
  }
});
