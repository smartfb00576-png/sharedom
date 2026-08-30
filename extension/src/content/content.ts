import { DomInspector } from './inspector';

const inspector = new DomInspector();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== 'object') return;

  switch (message.type) {
    case 'START_INSPECTOR':
      inspector.start(message.options);
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
