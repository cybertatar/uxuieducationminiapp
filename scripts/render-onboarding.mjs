// Снимает анимацию-гайд с dev-страницы /onboarding.html в два файла (30 fps):
// - web/public/onboarding.mp4 (800×960) — уходит в приветствие бота на /start, раздаётся по адресу /onboarding.mp4;
// - brand/onboarding-description.mp4 и .gif (640×360) — картинка описания бота, ставится вручную в @BotFather.
// Нужны запущенный `npm run dev:web`, Playwright с Chromium и ffmpeg.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const base = process.env.ONBOARDING_URL ?? 'http://localhost:5173/onboarding.html';
const FPS = 30;

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

/** Снимает кадры варианта layout в PNG и возвращает папку с ними */
async function frames(layout, scale) {
  const dir = mkdtempSync(join(tmpdir(), `onboarding-${layout}-`));
  const page = await browser.newPage({ viewport: { width: 520, height: 540 }, deviceScaleFactor: scale });
  await page.goto(`${base}?t=0&layout=${layout}`);
  await page.waitForSelector('.ob__app .streak');
  await page.evaluate(() => document.fonts.ready);
  const frame = page.locator('.ob');
  // У каждого варианта своя длина цикла: страница сообщает её сама
  const duration = await page.evaluate(() => window.obDuration);
  for (let i = 0; i < Math.round((duration / 1000) * FPS); i++) {
    await page.evaluate((t) => window.setFrame(t), (i * 1000) / FPS);
    await frame.screenshot({ path: join(dir, `${String(i).padStart(4, '0')}.png`) });
  }
  await page.close();
  return dir;
}

const ffmpeg = (...args) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args]);
// H.264 без звука: так Telegram показывает файл как GIF — автоплей по кругу
const mp4 = (dir, out) =>
  ffmpeg('-framerate', String(FPS), '-i', join(dir, '%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-preset', 'slow', '-movflags', '+faststart', '-an', out);

// Приветствие: 400×480 × 2
const chat = await frames('chat', 2);
mp4(chat, 'web/public/onboarding.mp4');
rmSync(chat, { recursive: true });

// Описание бота: 480×270 × 4/3 = 640×360, как просит BotFather. GIF — на случай, если MP4 не примут
const wide = await frames('wide', 4 / 3);
mp4(wide, 'brand/onboarding-description.mp4');
ffmpeg(
  '-framerate', String(FPS), '-i', join(wide, '%04d.png'),
  '-vf', 'fps=20,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4',
  '-loop', '0', 'brand/onboarding-description.gif',
);
rmSync(wide, { recursive: true });
await browser.close();

// Telegram кеширует файлы, скачанные по ссылке, поэтому бот добавляет к ней версию — хеш видео
const version = createHash('sha256').update(readFileSync('web/public/onboarding.mp4')).digest('hex').slice(0, 10);
writeFileSync(
  'src/onboarding-version.ts',
  `// Генерирует scripts/render-onboarding.mjs: хеш web/public/onboarding.mp4, чтобы Telegram не показывал закешированную старую версию\nexport const ONBOARDING_VERSION = '${version}';\n`,
);
console.log(`Готово: web/public/onboarding.mp4 (версия ${version}), brand/onboarding-description.mp4 и .gif`);
