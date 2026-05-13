import { chromium } from 'playwright';

const base = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'docs/design-references/clone-home.png', fullPage: true });

  // step1
  await page.getByRole('button', { name: /QUIERO MI LUGAR/i }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'docs/design-references/clone-step1.png' });

  // step2
  await page.locator('input').first().fill('Juan Perez Test');
  await page.getByRole('button', { name: /SIGUIENTE PASO/i }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'docs/design-references/clone-step2.png' });

  // step3
  await page.locator('input[inputmode="numeric"]').fill('35123456');
  await page.locator('input[type="date"]').fill('1995-06-15');
  await page.getByRole('button', { name: /SIGUIENTE PASO/i }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'docs/design-references/clone-step3.png' });

  // step4
  await page.locator('select').selectOption('CABA');
  await page.getByRole('button', { name: /SIGUIENTE PASO/i }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'docs/design-references/clone-step4.png', fullPage: true });

  // success
  await page.locator('input[type="tel"]').fill('1112345678');
  await page.locator('input[type="email"]').fill('juan@test.com');
  await page.locator('input[type="password"]').first().fill('Password1!');
  await page.locator('input[type="password"]').nth(1).fill('Password1!');
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: /SUMARME/i }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'docs/design-references/clone-success.png', fullPage: true });

  // mobile
  await ctx.close();
  const m = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mp = await m.newPage();
  await mp.goto(base, { waitUntil: 'networkidle' });
  await mp.waitForTimeout(800);
  await mp.screenshot({ path: 'docs/design-references/clone-home-mobile.png', fullPage: true });

  await browser.close();
  console.log('done');
})();
