chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'sharedom-inspect',
    title: 'Inspect & Capture DOM Element',
    contexts: ['page', 'selection', 'image', 'link', 'editable'],
  });
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
