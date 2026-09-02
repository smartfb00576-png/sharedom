import { test, expect } from '@playwright/test';

test.describe('ShareDOM E2E Visual & Functional Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('1. Should render landing page with official ShareDOM branding and title', async ({ page }) => {
    // Assert title starts with ShareDOM
    await expect(page).toHaveTitle(/ShareDOM/);

    // Assert navbar branding
    const navBrand = page.locator('#mainNav .nav-logo-text');
    await expect(navBrand).toHaveText('ShareDOM');

    // Assert hero section is visible
    const heroTitle = page.locator('.hero-inner h1');
    await expect(heroTitle).toBeVisible();

    // Assert Playground section exists
    const playground = page.locator('#playground');
    await expect(playground).toBeVisible();
  });

  test('2. Should capture DOM element and display high-res live result image', async ({ page }) => {
    const btnCapture = page.locator('#btnPlayCapture');
    const resultSection = page.locator('#playResultSection');
    const resultImg = page.locator('#playResultImg');

    // Result section should initially be hidden
    await expect(resultSection).toBeHidden();

    // Click Capture Snapshot
    await btnCapture.click();

    // Result section should become visible
    await expect(resultSection).toBeVisible();

    // Image src should be a valid Data URL
    await expect(resultImg).toHaveAttribute('src', /^data:image\/png;base64,/);

    // Image should have natural dimensions
    const naturalWidth = await resultImg.evaluate((img: HTMLImageElement) => img.naturalWidth);
    const naturalHeight = await resultImg.evaluate((img: HTMLImageElement) => img.naturalHeight);

    expect(naturalWidth).toBeGreaterThan(100);
    expect(naturalHeight).toBeGreaterThan(50);
  });

  test('3. Should support 1x, 2x (Retina), and 3x scale factors with proportional resolution', async ({ page }) => {
    const btnCapture = page.locator('#btnPlayCapture');
    const resultImg = page.locator('#playResultImg');

    // Test 1x Scale
    await page.locator('#scaleGroup .btn-opt[data-scale="1"]').click();
    await btnCapture.click();
    await page.waitForTimeout(300);

    const width1x = await resultImg.evaluate((img: HTMLImageElement) => img.naturalWidth);

    // Test 2x Scale (Retina)
    await page.locator('#scaleGroup .btn-opt[data-scale="2"]').click();
    await btnCapture.click();
    await page.waitForTimeout(300);

    const width2x = await resultImg.evaluate((img: HTMLImageElement) => img.naturalWidth);

    // 2x width should be approximately double the 1x width
    expect(width2x).toBeGreaterThan(width1x * 1.8);

    // Test 3x Scale
    await page.locator('#scaleGroup .btn-opt[data-scale="3"]').click();
    await btnCapture.click();
    await page.waitForTimeout(300);

    const width3x = await resultImg.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(width3x).toBeGreaterThan(width2x * 1.3);
  });

  test('4. Should support format switching between PNG, JPEG, and WebP', async ({ page }) => {
    const formatSelect = page.locator('#play-format');
    const qualityGroup = page.locator('#playQualityGroup');
    const btnCapture = page.locator('#btnPlayCapture');
    const resultImg = page.locator('#playResultImg');

    // Default PNG: Quality slider hidden
    await expect(qualityGroup).toBeHidden();

    // Select JPEG
    await formatSelect.selectOption('jpeg');
    await expect(qualityGroup).toBeVisible();
    await btnCapture.click();
    await page.waitForTimeout(300);
    await expect(resultImg).toHaveAttribute('src', /^data:image\/jpeg;base64,/);

    // Select WebP
    await formatSelect.selectOption('webp');
    await expect(qualityGroup).toBeVisible();
    await btnCapture.click();
    await page.waitForTimeout(300);
    await expect(resultImg).toHaveAttribute('src', /^data:image\/webp;base64,/);
  });

  test('5. Should trigger direct file download with correct sharedom naming pattern', async ({ page }) => {
    const btnDownload = page.locator('#btnPlayDownload');

    // Wait for the browser download event
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      btnDownload.click(),
    ]);

    const suggestedFilename = download.suggestedFilename();
    expect(suggestedFilename).toMatch(/^sharedom-\d+\.png$/);
  });

  test('6. Should switch language between ES and EN dynamically with title translation', async ({ page }) => {
    const langBtn = page.locator('#langSwitchBtn');

    // Default EN
    await expect(page).toHaveTitle(/ShareDOM — Screenshot anything in the browser & server/);
    await expect(langBtn).toHaveText('EN');

    // Switch to ES
    await langBtn.click();
    await expect(page).toHaveTitle(/ShareDOM — Captura cualquier elemento en el navegador y servidor/);
    await expect(langBtn).toHaveText('ES');

    // Switch back to EN
    await langBtn.click();
    await expect(page).toHaveTitle(/ShareDOM — Screenshot anything in the browser & server/);
    await expect(langBtn).toHaveText('EN');
  });

  test('7. Should copy installation command to clipboard upon click', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const copyBtn = page.locator('#copyNpmBtn');
    await copyBtn.click();

    const toast = page.locator('#toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('sharedom');
  });

  test('8. Should have valid NPM package links in navbar and footer', async ({ page }) => {
    const navNpmLink = page.locator('#mainNav .nav-links a[href*="npmjs.com"]');
    await expect(navNpmLink).toBeVisible();
    await expect(navNpmLink).toHaveAttribute('href', 'https://www.npmjs.com/package/sharedom');
    await expect(navNpmLink).toHaveAttribute('target', '_blank');

    const footerNpmLink = page.locator('footer .footer-links a[href*="npmjs.com"]');
    await expect(footerNpmLink).toBeVisible();
    await expect(footerNpmLink).toHaveAttribute('href', 'https://www.npmjs.com/package/sharedom');
    await expect(footerNpmLink).toHaveAttribute('target', '_blank');
  });

  test('9. Should capture console logs and display high-res result image', async ({ page }) => {
    const btnGenLogs = page.locator('#btnGenLogs');
    const btnCapLogs = page.locator('#btnCapLogs');
    const resultSection = page.locator('#telemetryResultSection');
    const resultImg = page.locator('#telemetryResultImg');

    await btnGenLogs.click();
    await page.waitForTimeout(100);

    await btnCapLogs.click();
    await expect(resultSection).toBeVisible();
    await expect(resultImg).toHaveAttribute('src', /^data:image\/png;base64,/);

    const naturalWidth = await resultImg.evaluate((img: HTMLImageElement) => img.naturalWidth);
    const naturalHeight = await resultImg.evaluate((img: HTMLImageElement) => img.naturalHeight);
    expect(naturalWidth).toBeGreaterThan(300);
    expect(naturalHeight).toBeGreaterThan(100);
  });

  test('10. Should capture network requests and display high-res result image', async ({ page }) => {
    const btnGenNetwork = page.locator('#btnGenNetwork');
    const btnCapNetwork = page.locator('#btnCapNetwork');
    const resultSection = page.locator('#telemetryResultSection');
    const resultImg = page.locator('#telemetryResultImg');

    await btnGenNetwork.click();
    await page.waitForTimeout(100);

    await btnCapNetwork.click();
    await expect(resultSection).toBeVisible();
    await expect(resultImg).toHaveAttribute('src', /^data:image\/png;base64,/);

    const naturalWidth = await resultImg.evaluate((img: HTMLImageElement) => img.naturalWidth);
    const naturalHeight = await resultImg.evaluate((img: HTMLImageElement) => img.naturalHeight);
    expect(naturalWidth).toBeGreaterThan(300);
    expect(naturalHeight).toBeGreaterThan(100);
  });

  test('11. Should programmatically support captureConsoleLogs and captureNetworkRequests with bilingual support', async ({ page }) => {
    const testResult = await page.evaluate(async () => {
      const sharedom = (window as any).sharedom;

      sharedom.setLanguage('es');
      const esLang = sharedom.getLanguage();

      const consoleDataUrl = await sharedom.captureConsoleLogs({
        logs: [
          { level: 'info', message: 'Iniciando servicio', timestamp: Date.now() },
          { level: 'error', message: 'Error de conexión HTTP 500', timestamp: Date.now() },
        ],
        language: 'es',
      });

      const networkDataUrl = await sharedom.captureNetworkRequests({
        requests: [
          {
            method: 'GET',
            url: 'https://api.example.com/usuarios',
            name: '/usuarios',
            status: 200,
            statusText: 'OK',
            type: 'fetch',
            duration: 120,
            timestamp: Date.now(),
          },
          {
            method: 'POST',
            url: 'https://api.example.com/auth',
            name: '/auth',
            status: 401,
            statusText: 'Unauthorized',
            type: 'fetch',
            duration: 85,
            timestamp: Date.now(),
          },
        ],
        language: 'es',
      });

      const consolePdfBlob = await sharedom.captureConsoleLogsPDF({
        logs: [{ level: 'warn', message: 'Advertencia de memoria', timestamp: Date.now() }],
        language: 'es',
      });

      const networkPdfBlob = await sharedom.captureNetworkRequestsPDF({
        requests: [{
          method: 'GET',
          url: 'https://api.example.com/health',
          name: '/health',
          status: 200,
          statusText: 'OK',
          timestamp: Date.now(),
        }],
        language: 'es',
      });

      return {
        esLang,
        consoleIsPng: consoleDataUrl.startsWith('data:image/png;base64,'),
        networkIsPng: networkDataUrl.startsWith('data:image/png;base64,'),
        consolePdfSize: consolePdfBlob.size,
        consolePdfType: consolePdfBlob.type,
        networkPdfSize: networkPdfBlob.size,
        networkPdfType: networkPdfBlob.type,
      };
    });

    expect(testResult.esLang).toBe('es');
    expect(testResult.consoleIsPng).toBe(true);
    expect(testResult.networkIsPng).toBe(true);
    expect(testResult.consolePdfSize).toBeGreaterThan(100);
    expect(testResult.consolePdfType).toBe('application/pdf');
    expect(testResult.networkPdfSize).toBeGreaterThan(100);
    expect(testResult.networkPdfType).toBe('application/pdf');
  });

  test('12. Should paginate large console logs and network requests into multiple image chunks and multi-page PDF', async ({ page }) => {
    const testResult = await page.evaluate(async () => {
      const sharedom = (window as any).sharedom;

      // Generate 55 log entries
      const logs = Array.from({ length: 55 }, (_, i) => ({
        level: (i % 5 === 0 ? 'error' : i % 3 === 0 ? 'warn' : 'info') as any,
        message: `Log entry #${i + 1} processing data batch`,
        timestamp: Date.now() - i * 1000,
      }));

      // Generate 55 network requests
      const requests = Array.from({ length: 55 }, (_, i) => ({
        method: (i % 2 === 0 ? 'GET' : 'POST') as any,
        url: `https://api.example.com/v1/items/${i + 1}`,
        name: `/v1/items/${i + 1}`,
        status: i % 10 === 0 ? 500 : 200,
        statusText: i % 10 === 0 ? 'Internal Server Error' : 'OK',
        type: 'fetch',
        duration: 50 + (i * 3) % 200,
        timestamp: Date.now() - i * 500,
      }));

      const logPages = await sharedom.captureConsoleLogsPages({
        logs,
        entriesPerPage: 25,
      });

      const reqPages = await sharedom.captureNetworkRequestsPages({
        requests,
        entriesPerPage: 25,
      });

      const multiPagePdfBlob = await sharedom.captureConsoleLogsPDF({
        logs,
        entriesPerPage: 25,
      });

      const multiPageNetPdfBlob = await sharedom.captureNetworkRequestsPDF({
        requests,
        entriesPerPage: 25,
      });

      return {
        logPageCount: logPages.length,
        logPagesAllPng: logPages.every((u: string) => u.startsWith('data:image/png;base64,')),
        reqPageCount: reqPages.length,
        reqPagesAllPng: reqPages.every((u: string) => u.startsWith('data:image/png;base64,')),
        multiPagePdfSize: multiPagePdfBlob.size,
        multiPagePdfType: multiPagePdfBlob.type,
        multiPageNetPdfSize: multiPageNetPdfBlob.size,
        multiPageNetPdfType: multiPageNetPdfBlob.type,
      };
    });

    // 55 entries with 25 per page = 3 pages (25 + 25 + 5)
    expect(testResult.logPageCount).toBe(3);
    expect(testResult.logPagesAllPng).toBe(true);
    expect(testResult.reqPageCount).toBe(3);
    expect(testResult.reqPagesAllPng).toBe(true);
    expect(testResult.multiPagePdfSize).toBeGreaterThan(1000);
    expect(testResult.multiPagePdfType).toBe('application/pdf');
    expect(testResult.multiPageNetPdfSize).toBeGreaterThan(1000);
    expect(testResult.multiPageNetPdfType).toBe('application/pdf');
  });

  test('13. Should create valid zero-dependency PKZip archive containing multiple page captures', async ({ page }) => {
    await page.goto('/');

    const zipResult = await page.evaluate(async () => {
      const sharedom = (window as any).sharedom;
      if (!sharedom) throw new Error('sharedom not found on window');

      // Create dummy log entries
      const logs = Array.from({ length: 30 }, (_, i) => ({
        level: 'info' as const,
        message: `Log line for zip testing ${i + 1}`,
        timestamp: Date.now() - (30 - i) * 1000,
        count: 1,
      }));

      // Capture into 2 pages (15 per page)
      const logPages = await sharedom.captureConsoleLogsPages({
        logs,
        entriesPerPage: 15,
      });

      // Package into ZIP using buildZip
      const zipFiles = logPages.map((url: string, idx: number) => ({
        name: `console-page-${idx + 1}.png`,
        data: url,
      }));

      const zipBytes = sharedom.buildZip(zipFiles);

      // Verify PK header signatures
      const hasPkLocalHeader = zipBytes[0] === 0x50 && zipBytes[1] === 0x4b && zipBytes[2] === 0x03 && zipBytes[3] === 0x04;
      
      // Look for EOCD signature PK\x05\x06 in trailing bytes
      let hasEocd = false;
      for (let i = zipBytes.length - 22; i < zipBytes.length - 3; i++) {
        if (zipBytes[i] === 0x50 && zipBytes[i+1] === 0x4b && zipBytes[i+2] === 0x05 && zipBytes[i+3] === 0x06) {
          hasEocd = true;
          break;
        }
      }

      return {
        pagesGenerated: logPages.length,
        zipByteLength: zipBytes.length,
        hasPkLocalHeader,
        hasEocd,
      };
    });

    expect(zipResult.pagesGenerated).toBe(2);
    expect(zipResult.zipByteLength).toBeGreaterThan(1000);
    expect(zipResult.hasPkLocalHeader).toBe(true);
    expect(zipResult.hasEocd).toBe(true);
  });
});

