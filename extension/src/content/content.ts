import { DomInspector, installPageTracker } from './inspector';

if (!(window as any).__sharedom_content_script_loaded__) {
  (window as any).__sharedom_content_script_loaded__ = true;

  const inspector = new DomInspector();
  installPageTracker();

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== 'object') return;

    switch (message.type) {
      case 'START_INSPECTOR':
        inspector.start(message.options);
        sendResponse({ success: true, active: true });
        break;

      case 'CAPTURE_CONSOLE_LOGS':
        inspector.captureConsole(message.options);
        sendResponse({ success: true, active: true });
        break;

      case 'CAPTURE_NETWORK_REQUESTS':
        inspector.captureNetwork(message.options);
        sendResponse({ success: true, active: true });
        break;

      case 'STOP_INSPECTOR':
        inspector.stop();
        sendResponse({ success: true, active: false });
        break;

      case 'TOGGLE_INSPECTOR':
        inspector.toggle(message.options);
        sendResponse({ success: true, active: inspector.getIsActive() });
        break;

      case 'GET_INSPECTOR_STATUS':
        sendResponse({ active: inspector.getIsActive() });
        break;

      default:
        break;
    }

    return true;
  });
}
