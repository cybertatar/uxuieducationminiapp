// Снимает слайды с dev-страницы /carousel.html в brand/instagram/*.png (1080×1350).
// Нужны запущенный `npm run dev:web` и Playwright: `npx playwright install chromium` или глобальная установка.
import { chromium } from 'playwright';

const url = process.env.CAROUSEL_URL ?? 'http://localhost:5173/carousel.html';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1400 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
await page.goto(url);
await page.waitForSelector('.qr svg');
await page.evaluate(() => document.fonts.ready);
// Проверка отступов: контент не должен заходить в нижнее поле с нумерацией (последние 112 px)
const overflow = await page.evaluate(() =>
  [...document.querySelectorAll('.slide')].flatMap((slide, i) => {
    const limit = slide.getBoundingClientRect().bottom - 112;
    return [...slide.children]
      .filter((el) => !el.matches('.slide__footer, .swipe') && el.getBoundingClientRect().bottom > limit + 0.5)
      .map((el) => `слайд ${i + 1}: .${el.className.split(' ')[0] || el.tagName} заходит в нижнее поле`);
  }),
);
if (overflow.length) console.warn(overflow.join('\n'));

const slides = await page.locator('.slide').all();
for (const [i, slide] of slides.entries()) {
  await slide.screenshot({ path: `brand/instagram/slide-${String(i + 1).padStart(2, '0')}.png` });
}
console.log(`Готово: ${slides.length} слайдов в brand/instagram/`);
await browser.close();
