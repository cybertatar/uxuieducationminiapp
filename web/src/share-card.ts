/**
 * Картинка для «Поделиться», нарисованная по данным человека: счёт и ответы, стрик за неделю, урок.
 * Рисуем на canvas прямо в Mini App и отправляем воркеру JPEG — Telegram принимает для фото только его.
 * Кодируем сами (jpeg-js), а не canvas.toDataURL: iPhone пишет JPEG с маркерами перезапуска (DRI/RST),
 * и Telegram при обработке такого фото обрывает его серой полосой, хотя файл по стандарту целый.
 * Палитра — светлая, как у карусели и поста, чтобы карточка узнавалась в любой теме чата.
 */
import { sprite, SPARKS, type CatMood } from './Cat';

export type ShareCardData =
  | { kind: 'result'; tag: string; score: string; headline: string; answers: boolean[]; mood: CatMood }
  | { kind: 'streak'; current: number; best: number; week: { label: string; active: boolean; isToday: boolean }[] }
  | { kind: 'lesson'; tag: string; title: string; description: string; meta: string };

const W = 1280;
const H = 720;
const PAD = 80;
const TEXT_W = 760;

const C = {
  bg: '#efeff4',
  surface: '#ffffff',
  text: '#17171c',
  hint: '#6b6b76',
  accent: '#2481cc',
  flame: '#ff8a00',
  success: '#2f9e44',
  danger: '#e5484d',
};

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Roboto, 'Segoe UI', sans-serif";
const font = (weight: number, size: number) => `${weight} ${size}px ${FONT}`;

const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};
const daysWord = (n: number) => plural(n, 'день', 'дня', 'дней');

/** Рисует карточку и возвращает JPEG в base64 (без префикса data:) */
export async function renderShareCard(data: ShareCardData): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Фон с мягким пятном за котом: голубым, а у стрика — тёплым
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.8, H * 0.72, 0, W * 0.8, H * 0.72, W * 0.55);
  glow.addColorStop(0, data.kind === 'streak' ? '#ffe2bf' : '#cfe5f7');
  glow.addColorStop(1, 'rgba(239, 239, 244, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.textBaseline = 'alphabetic';
  if (data.kind === 'result') drawResult(ctx, data);
  else if (data.kind === 'streak') drawStreak(ctx, data);
  else drawLesson(ctx, data);

  ctx.font = font(700, 24);
  ctx.fillStyle = C.accent;
  ctx.fillText('t.me/uxuitrainer_bot', PAD, H - 72);

  return encodeJpeg(ctx.getImageData(0, 0, W, H), 88);
}

/**
 * Обычный baseline JPEG без маркеров перезапуска — одинаковый на любом устройстве.
 * Кодировщик грузим, только когда делятся: основному экрану он не нужен.
 */
async function encodeJpeg(image: ImageData, quality: number): Promise<string> {
  const { default: encode } = await import('jpeg-js/lib/encoder.js');
  // jpeg-js писался для Node и в конце зовёт Buffer.from — в браузере подставляем Uint8Array на время вызова
  const g = globalThis as { Buffer?: unknown };
  const shim = g.Buffer === undefined;
  if (shim) g.Buffer = { from: (bytes: number[]) => Uint8Array.from(bytes) };
  let bytes: Uint8Array;
  try {
    bytes = encode({ data: image.data, width: image.width, height: image.height }, quality).data;
  } finally {
    if (shim) delete g.Buffer;
  }
  // btoa принимает строку; собираем её кусками, чтобы не упереться в лимит аргументов
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

function drawResult(ctx: CanvasRenderingContext2D, d: Extract<ShareCardData, { kind: 'result' }>) {
  let y = tag(ctx, d.tag, 72);
  ctx.fillStyle = C.text;
  ctx.font = font(800, 150);
  y += 150;
  ctx.fillText(d.score, PAD - 6, y);
  ctx.font = font(700, 48);
  y += 72;
  ctx.fillText(d.headline, PAD, y);

  // Ответы по порядку — те же квадратики, что на экране итогов
  const n = d.answers.length;
  const gap = 12;
  const size = Math.min(44, Math.floor((TEXT_W - gap * (n - 1)) / n));
  y += 48;
  d.answers.forEach((ok, i) => {
    ctx.fillStyle = ok ? C.success : C.danger;
    roundRect(ctx, PAD + i * (size + gap), y, size, size, 7);
    ctx.fill();
  });
  drawCat(ctx, d.mood);
}

function drawStreak(ctx: CanvasRenderingContext2D, d: Extract<ShareCardData, { kind: 'streak' }>) {
  let y = tag(ctx, 'Стрик', 72);
  y += 160;
  ctx.fillStyle = C.text;
  ctx.font = font(800, 170);
  const num = String(d.current);
  ctx.fillText(num, PAD - 8, y);
  const numW = ctx.measureText(num).width;
  ctx.font = font(700, 56);
  ctx.fillText(`${daysWord(d.current)} подряд`, PAD + numW + 20, y);

  ctx.font = font(500, 32);
  ctx.fillStyle = C.hint;
  y += 62;
  ctx.fillText(d.best > d.current ? `Рекорд — ${d.best} ${daysWord(d.best)}` : d.current > 1 ? 'Это мой рекорд!' : 'Первый день — начало стрика', PAD, y);

  // Неделя с понедельника: дни с занятиями — оранжевые с галочкой, как на главной
  y += 46;
  const r = 28;
  d.week.forEach((day, i) => {
    const cx = PAD + r + i * (r * 2 + 16);
    const cy = y + r;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = day.active ? C.flame : C.surface;
    ctx.fill();
    if (day.isToday && !day.active) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = C.flame;
      ctx.stroke();
    }
    if (day.active) {
      ctx.beginPath();
      ctx.moveTo(cx - 11, cy);
      ctx.lineTo(cx - 3, cy + 8);
      ctx.lineTo(cx + 12, cy - 8);
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
    ctx.font = font(day.isToday ? 800 : 600, 22);
    ctx.fillStyle = day.isToday ? C.text : C.hint;
    ctx.textAlign = 'center';
    ctx.fillText(day.label, cx, cy + r + 32);
    ctx.textAlign = 'left';
  });
  drawCat(ctx, 'happy');
}

function drawLesson(ctx: CanvasRenderingContext2D, d: Extract<ShareCardData, { kind: 'lesson' }>) {
  let y = tag(ctx, d.tag, 72);
  // Длинное название уменьшаем, чтобы оно влезло в три строки
  let size = 84;
  let lines: string[] = [];
  for (; size >= 52; size -= 8) {
    ctx.font = font(800, size);
    lines = wrap(ctx, d.title, TEXT_W);
    if (lines.length <= 3) break;
  }
  lines = clamp(ctx, lines, 3, TEXT_W);
  ctx.fillStyle = C.text;
  y += 28;
  for (const line of lines) {
    y += size * 1.12;
    ctx.fillText(line, PAD - 4, y);
  }

  ctx.font = font(500, 30);
  ctx.fillStyle = C.hint;
  y += 24;
  for (const line of clamp(ctx, wrap(ctx, d.description, TEXT_W), 2, TEXT_W)) {
    y += 40;
    ctx.fillText(line, PAD, y);
  }
  ctx.font = font(700, 26);
  ctx.fillStyle = C.accent;
  ctx.fillText(d.meta, PAD, Math.min(y + 60, H - 130));
  drawCat(ctx, 'idle');
}

/** Пилюля-метка сверху; возвращает её нижний край */
function tag(ctx: CanvasRenderingContext2D, text: string, top: number) {
  ctx.font = font(700, 22);
  const w = Math.min(ctx.measureText(text).width, TEXT_W - 40) + 40;
  ctx.fillStyle = C.surface;
  roundRect(ctx, PAD, top, w, 44, 22);
  ctx.fill();
  ctx.fillStyle = C.accent;
  ctx.fillText(clamp(ctx, [text], 1, TEXT_W - 40)[0], PAD + 20, top + 30);
  return top + 44;
}

const PX: Record<string, string> = { K: C.text, W: C.surface, O: C.flame, E: C.text, B: C.accent, M: C.text, S: C.hint, T: C.text };

/** Кот Кегль из того же спрайта, что в приложении: один символ — один квадрат */
function drawCat(ctx: CanvasRenderingContext2D, mood: CatMood) {
  const px = 9;
  const rows = sprite(mood);
  const x0 = W - PAD - rows[0].length * px + 40;
  const y0 = H - 56 - rows.length * px;
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (!PX[ch]) return;
      ctx.fillStyle = PX[ch];
      ctx.fillRect(x0 + x * px, y0 + y * px, px, px);
    }),
  );
  if (mood !== 'celebrate') return;
  ctx.fillStyle = C.flame;
  for (const [sx, sy] of SPARKS) {
    ctx.fillRect(x0 + (sx + 1) * px, y0 + sy * px, px, px * 3);
    ctx.fillRect(x0 + sx * px, y0 + (sy + 1) * px, px * 3, px);
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxW) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Не больше max строк; если текст не влез, последнюю обрезаем с многоточием */
function clamp(ctx: CanvasRenderingContext2D, lines: string[], max: number, maxW: number): string[] {
  const kept = lines.slice(0, max);
  const i = kept.length - 1;
  if (lines.length <= max && ctx.measureText(kept[i]).width <= maxW) return kept;
  let last = kept[i];
  while (last.length > 1 && ctx.measureText(`${last}…`).width > maxW) last = last.slice(0, -1);
  kept[i] = `${last.trimEnd()}…`;
  return kept;
}
