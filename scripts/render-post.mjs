// Снимает картинку для анонса с dev-страницы /post.html в brand/telegram/post.png (2560×1440).
// Нужны запущенный `npm run dev:web` и Playwright, как для render-carousel.mjs.
import { chromium } from 'playwright';

const url = process.env.POST_URL ?? 'http://localhost:5173/post.html';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 820 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
await page.goto(url);
await page.waitForSelector('.post img');
await page.evaluate(() => document.fonts.ready);
await page.locator('.post').screenshot({ path: 'brand/telegram/post.png' });
console.log('Готово: brand/telegram/post.png');
await browser.close();
