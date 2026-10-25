// Снимает картинки «Поделиться» с dev-страницы /share.html в web/public/share/*.jpg (1280×720).
// Нужны запущенный `npm run dev:web` и Playwright с Chromium. Telegram принимает для фото только JPEG.
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url = process.env.SHARE_URL ?? 'http://localhost:5173/share.html';
await mkdir('web/public/share', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
await page.goto(url);
await page.waitForSelector('.share-card');
await page.evaluate(() => document.fonts.ready);
const cards = await page.locator('.share-card').all();
for (const card of cards) {
  const name = await card.getAttribute('data-name');
  await card.screenshot({ path: `web/public/share/${name}.jpg`, type: 'jpeg', quality: 88 });
}
console.log(`Готово: ${cards.length} картинки в web/public/share/`);
await browser.close();
