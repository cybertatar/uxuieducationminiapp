// Снимает превью для профиля бота с dev-страницы /previews.html в brand/telegram/previews/*.png (1170×2532).
// Нужны запущенный `npm run dev:web` и Playwright, как для render-carousel.mjs.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const url = process.env.PREVIEWS_URL ?? 'http://localhost:5173/previews.html';
mkdirSync('brand/telegram/previews', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 2200, height: 1000 }, deviceScaleFactor: 3, reducedMotion: 'reduce' });
await page.goto(url);
await page.waitForSelector('.preview img');
await page.evaluate(() => document.fonts.ready);
const previews = await page.locator('.preview').all();
for (const [i, el] of previews.entries()) {
  const name = await el.getAttribute('data-name');
  await el.locator('.mock__screen').screenshot({ path: `brand/telegram/previews/${i + 1}-${name}.png` });
}
console.log(`Готово: ${previews.length} превью в brand/telegram/previews/`);
await browser.close();
