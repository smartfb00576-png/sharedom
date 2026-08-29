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
});
