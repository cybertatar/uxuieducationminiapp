// Снимает слайды с dev-страницы /carousel.html в brand/instagram/*.png (1080×1350).
// Нужны запущенный `npm run dev:web` и Playwright: `npx playwright install chromium` или глобальная установка.
import { chromium } from 'playwright';

const url = process.env.CAROUSEL_URL ?? 'http://localhost:5173/carousel.html';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1400 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
await page.goto(url);
await page.waitForSelector('.qr svg');
await page.evaluate(() => document.fonts.ready);
const slides = await page.locator('.slide').all();
for (const [i, slide] of slides.entries()) {
  await slide.screenshot({ path: `brand/instagram/slide-${String(i + 1).padStart(2, '0')}.png` });
}
console.log(`Готово: ${slides.length} слайдов в brand/instagram/`);
await browser.close();
