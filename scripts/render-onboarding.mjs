// Снимает анимацию-гайд с dev-страницы /onboarding.html в web/public/onboarding.mp4 (800×960, 30 fps).
// Нужны запущенный `npm run dev:web`, Playwright с Chromium и ffmpeg.
// Файл раздаётся как статика по адресу /onboarding.mp4 и уходит в приветствие бота на /start.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const url = process.env.ONBOARDING_URL ?? 'http://localhost:5173/onboarding.html?t=0';
const FPS = 30;
const DURATION = 7000; // как в web/src/onboarding/Onboarding.tsx

const dir = mkdtempSync(join(tmpdir(), 'onboarding-'));
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 440, height: 520 }, deviceScaleFactor: 2 });
await page.goto(url);
await page.waitForSelector('.ob__app .streak');
await page.evaluate(() => document.fonts.ready);
const frame = page.locator('.ob');
const total = (DURATION / 1000) * FPS;
for (let i = 0; i < total; i++) {
  await page.evaluate((t) => window.setFrame(t), (i * 1000) / FPS);
  await frame.screenshot({ path: join(dir, `${String(i).padStart(4, '0')}.png`) });
}
await browser.close();

// H.264 без звука: так Telegram показывает файл как GIF — автоплей по кругу
execFileSync('ffmpeg', [
  '-loglevel', 'error', '-y', '-framerate', String(FPS), '-i', join(dir, '%04d.png'),
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-preset', 'slow', '-movflags', '+faststart', '-an',
  'web/public/onboarding.mp4',
]);
rmSync(dir, { recursive: true });

// Telegram кеширует файлы, скачанные по ссылке, поэтому бот добавляет к ней версию — хеш видео
const version = createHash('sha256').update(readFileSync('web/public/onboarding.mp4')).digest('hex').slice(0, 10);
writeFileSync(
  'src/onboarding-version.ts',
  `// Генерирует scripts/render-onboarding.mjs: хеш web/public/onboarding.mp4, чтобы Telegram не показывал закешированную старую версию\nexport const ONBOARDING_VERSION = '${version}';\n`,
);
console.log(`Готово: ${total} кадров → web/public/onboarding.mp4, версия ${version}`);
