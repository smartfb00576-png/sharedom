import { getT, onLanguageChange, getLanguage } from '../i18n';
import {
  captureConsoleLogs,
  downloadConsoleLogs,
  captureConsoleLogsPDF,
  downloadConsoleLogsPDF,
  captureNetworkRequests,
  downloadNetworkRequests,
  captureNetworkRequestsPDF,
  downloadNetworkRequestsPDF,
  startConsoleCapture,
  startNetworkCapture,
} from 'sharedom';
import { showToast } from './toast';

export function renderTelemetryDemo(container: HTMLElement): void {
  startConsoleCapture();
  startNetworkCapture();

  let previewDataUrl = '';
  let previewMeta = '';

  function generateSampleLogs(): void {
    console.log('[App] Initialized successfully in environment: production');
    console.info('[Auth] User session verified token_exp=3600');
    console.warn('[Cache] Response time 340ms exceeded budget: 200ms');
    console.error('[Sync] POST /api/v1/sync failed: 500 Internal Server Error');
    console.debug('[DB] Index scan completed on table: orders in 12ms');
    showToast('Sample console logs generated!');
  }

  function generateSampleRequests(): void {
    const endpoints = [
      { method: 'GET', url: 'https://api.example.com/v1/users/me', status: 200 },
      { method: 'POST', url: 'https://api.example.com/v1/telemetry', status: 201 },
      { method: 'GET', url: 'https://api.example.com/v1/products?limit=10', status: 304 },
      { method: 'PUT', url: 'https://api.example.com/v1/settings', status: 400 },
      { method: 'DELETE', url: 'https://api.example.com/v1/sessions/expired', status: 204 },
    ];

    try {
      fetch('https://api.example.com/v1/users/me').catch(() => {});
      fetch('https://api.example.com/v1/products?limit=10').catch(() => {});
    } catch {}

    showToast('Simulated network requests triggered!');
  }

  function update(): void {
    const t = getT();
    const lang = getLanguage();

    container.innerHTML = `
      <section class="playground-section" id="telemetry-demo" style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 60px;">
        <div class="section-header anim-in" data-anim-key="telemetry-header">
          <h2>${t.telemetryDemo.title}</h2>
          <p>${t.telemetryDemo.subtitle}</p>
        </div>

        <div class="playground-layout anim-in" style="transition-delay:150ms" data-anim-key="telemetry-body">
          <div class="controls-container" style="flex: 1; max-width: 100%;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
              <!-- Console Card -->
              <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px;">
                <h4 style="margin: 0 0 8px 0; color: #f8fafc; font-size: 15px; display: flex; align-items: center; gap: 8px;">
                  <span style="color: #a78bfa;">⌨️</span> Console Logs Capture
                </h4>
                <p style="margin: 0 0 16px 0; font-size: 12.5px; color: #94a3b8;">
                  Intercept and capture formatted console tables as PNG or PDF documents.
                </p>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <button type="button" id="btnGenLogs" class="btn-outline" style="width: 100%; font-size: 12px; padding: 8px 12px;">
                    ${t.telemetryDemo.btnSimulateLogs}
                  </button>
                  <div style="display: flex; gap: 8px;">
                    <button type="button" id="btnCapLogs" class="btn-primary" style="flex: 1; font-size: 12px; padding: 8px 12px;">
                      ${t.telemetryDemo.btnCaptureLogs}
                    </button>
                    <button type="button" id="btnPdfLogs" class="btn-outline" style="flex: 1; font-size: 12px; padding: 8px 12px;">
                      ${t.telemetryDemo.btnDownloadLogsPdf}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Network Card -->
              <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px;">
                <h4 style="margin: 0 0 8px 0; color: #f8fafc; font-size: 15px; display: flex; align-items: center; gap: 8px;">
                  <span style="color: #38bdf8;">🌐</span> Network Requests Capture
                </h4>
                <p style="margin: 0 0 16px 0; font-size: 12.5px; color: #94a3b8;">
                  Record and capture HTTP requests with status, method, endpoints, and timing.
                </p>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <button type="button" id="btnGenNetwork" class="btn-outline" style="width: 100%; font-size: 12px; padding: 8px 12px;">
                    ${t.telemetryDemo.btnSimulateNetwork}
                  </button>
                  <div style="display: flex; gap: 8px;">
                    <button type="button" id="btnCapNetwork" class="btn-primary" style="flex: 1; font-size: 12px; padding: 8px 12px;">
                      ${t.telemetryDemo.btnCaptureNetwork}
                    </button>
                    <button type="button" id="btnPdfNetwork" class="btn-outline" style="flex: 1; font-size: 12px; padding: 8px 12px;">
                      ${t.telemetryDemo.btnDownloadNetworkPdf}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Result Box -->
        <div id="telemetryResultSection" class="result-section" style="display: ${previewDataUrl ? 'block' : 'none'}; margin-top: 24px;">
          <div class="result-header">
            <h3>${t.telemetryDemo.resultTitle}</h3>
            <span id="telemetryResultMeta" class="result-meta">${previewMeta}</span>
          </div>
          <div class="result-body" style="background: #090d16; border-radius: 12px; padding: 16px; overflow-x: auto;">
            <img id="telemetryResultImg" src="${previewDataUrl}" alt="Telemetry Capture Result" style="max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
          </div>
          <div class="result-actions" style="margin-top: 12px; display: flex; justify-content: flex-end;">
            <button type="button" id="btnTelemetryCopyBase64" class="btn-copy">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              ${t.telemetryDemo.copyBase64}
            </button>
          </div>
        </div>
      </section>
    `;

    document.getElementById('btnGenLogs')?.addEventListener('click', generateSampleLogs);
    document.getElementById('btnGenNetwork')?.addEventListener('click', generateSampleRequests);

    document.getElementById('btnCapLogs')?.addEventListener('click', async () => {
      try {
        const dataUrl = await captureConsoleLogs({ language: lang });
        previewDataUrl = dataUrl;
        previewMeta = 'Console Logs • PNG';
        update();
        showToast('Console logs captured!');
      } catch (err) {
        showToast(`Capture failed: ${String(err)}`);
      }
    });

    document.getElementById('btnPdfLogs')?.addEventListener('click', async () => {
      try {
        await downloadConsoleLogsPDF('console-logs.pdf', { language: lang });
        showToast('Console logs PDF downloaded!');
      } catch (err) {
        showToast(`PDF download failed: ${String(err)}`);
      }
    });

    document.getElementById('btnCapNetwork')?.addEventListener('click', async () => {
      try {
        const dataUrl = await captureNetworkRequests({ language: lang });
        previewDataUrl = dataUrl;
        previewMeta = 'Network Requests • PNG';
        update();
        showToast('Network requests captured!');
      } catch (err) {
        showToast(`Capture failed: ${String(err)}`);
      }
    });

    document.getElementById('btnPdfNetwork')?.addEventListener('click', async () => {
      try {
        await downloadNetworkRequestsPDF('network-requests.pdf', { language: lang });
        showToast('Network requests PDF downloaded!');
      } catch (err) {
        showToast(`PDF download failed: ${String(err)}`);
      }
    });

    document.getElementById('btnTelemetryCopyBase64')?.addEventListener('click', async () => {
      if (!previewDataUrl) return;
      try {
        await navigator.clipboard.writeText(previewDataUrl);
        showToast(t.telemetryDemo.copied);
      } catch {
        showToast('Failed to copy');
      }
    });
  }

  update();
  onLanguageChange(update);
}
