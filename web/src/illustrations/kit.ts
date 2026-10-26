/**
 * Набор деталей для вайрфреймов. Иллюстрации вставляются в страницу как inline SVG,
 * а цвета задаются классами wf-* (см. styles.css), поэтому они подстраиваются под тему Telegram.
 */

export interface Illustration {
  /** Ширина и высота viewBox */
  w: number;
  h: number;
  body: string;
  /** Зоны для вопросов «тапни на проблему»: [x, y, w, h] в координатах viewBox */
  zones?: Record<string, [number, number, number, number]>;
  /** Текстовое описание для скринридеров */
  alt: string;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const ill = (w: number, h: number, alt: string, body: string, zones?: Illustration['zones']): Illustration => ({
  w,
  h,
  alt,
  body,
  zones,
});

export function toSvg(i: Illustration) {
  return `<svg viewBox="0 0 ${i.w} ${i.h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(i.alt)}">${i.body}</svg>`;
}

type Cls =
  | 'screen' | 'block' | 'field' | 'card' | 'tile'
  | 'accent' | 'danger' | 'success' | 'warning'
  | 'ink' | 'text' | 'muted' | 'on-accent' | 'inverse' | 'accent-inverse';

export const rect = (x: number, y: number, w: number, h: number, cls: Cls | string = 'block', r = 6) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" class="wf-${cls}"/>`;

/** Экран телефона или окна */
export const screen = (x: number, y: number, w: number, h: number, r = 14) => rect(x, y, w, h, 'screen', r);

/** Карточка внутри экрана */
export const card = (x: number, y: number, w: number, h: number, r = 8) => rect(x, y, w, h, 'card', r);

/** Серые строки-заглушки текста */
export function lines(x: number, y: number, widths: number[], gap = 10, h = 5) {
  return widths.map((w, i) => rect(x, y + i * gap, w, h, 'block', h / 2)).join('');
}

interface TextOpts {
  size?: number;
  weight?: number;
  cls?: Cls;
  anchor?: 'start' | 'middle' | 'end';
}

export const text = (x: number, y: number, s: string, { size = 11, weight = 400, cls = 'text', anchor = 'start' }: TextOpts = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" class="wf-t-${cls}">${esc(s)}</text>`;

export const title = (x: number, y: number, s: string, size = 13) => text(x, y, s, { size, weight: 700, cls: 'ink' });

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'disabled' | 'outline';

export function button(x: number, y: number, w: number, h: number, label: string, variant: ButtonVariant = 'primary', r = 8) {
  const bg = {
    primary: rect(x, y, w, h, 'accent', r),
    danger: rect(x, y, w, h, 'danger', r),
    secondary: rect(x, y, w, h, 'block', r),
    disabled: rect(x, y, w, h, 'block', r),
    ghost: '',
    outline: rect(x, y, w, h, 'field', r),
  }[variant];
  const cls: Cls = variant === 'primary' || variant === 'danger' ? 'on-accent' : variant === 'disabled' ? 'muted' : variant === 'ghost' || variant === 'outline' ? 'accent' : 'ink';
  const size = Math.min(12, h * 0.42);
  return bg + text(x + w / 2, y + h / 2 + size * 0.36, label, { size, weight: 600, cls, anchor: 'middle' });
}

interface FieldOpts {
  label?: string;
  value?: string;
  placeholder?: string;
  state?: 'error' | 'focus' | 'success';
  hint?: string;
  /** Курсор в начале пустого поля: видно, что сейчас печатают именно сюда */
  caret?: boolean;
}

export function field(x: number, y: number, w: number, h = 26, { label, value, placeholder, state, hint, caret }: FieldOpts = {}) {
  let out = '';
  if (label) out += text(x, y - 5, label, { size: 9 });
  const cls = state === 'error' ? 'field-error' : state === 'focus' ? 'field-focus' : state === 'success' ? 'field-success' : 'field';
  out += rect(x, y, w, h, cls, 6);
  const tx = caret ? x + 12 : x + 8;
  if (caret) out += rect(x + 8, y + h / 2 - 7, 1.5, 14, 'accent', 0.75);
  if (value) out += text(tx, y + h / 2 + 4, value, { size: 11, cls: 'ink' });
  else if (placeholder) out += text(tx, y + h / 2 + 4, placeholder, { size: 11, cls: 'muted' });
  if (hint) out += text(x, y + h + 11, hint, { size: 9, cls: state === 'error' ? 'danger' : 'text' });
  return out;
}

export const circle = (cx: number, cy: number, r: number, cls: Cls | string = 'block') =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" class="wf-${cls}"/>`;

export const path = (d: string, cls = 'stroke', extra = '') => `<path d="${d}" class="wf-${cls}" ${extra}/>`;

export const group = (x: number, y: number, inner: string, scale = 1) =>
  `<g transform="translate(${x} ${y})${scale !== 1 ? ` scale(${scale})` : ''}">${inner}</g>`;

/** Затемнение под модальным окном */
export const scrim = (x: number, y: number, w: number, h: number, r = 14) => rect(x, y, w, h, 'scrim', r);

/** Палец, тапающий в точку (x, y) — кончик пальца в этой точке */
export const finger = (x: number, y: number, s = 1) =>
  group(
    x - 7 * s,
    y - 2 * s,
    `<path d="M7 2c2 0 3 1.4 3 3v8.5l5.2 1.1c2 .4 3.2 2.3 2.8 4.3l-1.4 7.1c-.3 1.4-1.5 2.4-3 2.4H6.4c-1 0-1.9-.5-2.4-1.3L.6 21.6c-.6-1 0-2.4 1.2-2.6l2.2-.4V5c0-1.6 1.3-3 3-3z" class="wf-finger"/>`,
    s,
  );

/** Курсор мыши с остриём в точке (x, y) */
export const cursor = (x: number, y: number, s = 1) =>
  group(x, y, `<path d="M0 0l0 16 4.2-3.6 2.8 6.4 2.6-1.1-2.8-6.3 5.6-.2z" class="wf-cursor"/>`, s);

/** Простые иконки в квадрате 16×16 с началом в (x, y) */
export function icon(name: string, x: number, y: number, size = 16, cls = 'stroke') {
  const s = size / 16;
  const d: Record<string, string> = {
    trash: 'M3 4h10M6.5 4V2.5h3V4M4.5 4l.7 9.5h5.6l.7-9.5M7 6.5v5M9 6.5v5',
    close: 'M4 4l8 8M12 4l-8 8',
    check: 'M3 8.5l3 3 7-7',
    plus: 'M8 3v10M3 8h10',
    minus: 'M3 8h10',
    search: 'M7 2.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zM10.3 10.3L14 14',
    cart: 'M1.5 2h2l1.6 8h7.4l1.5-5.5H4.3M6 13.2a.8.8 0 1 0 0 .1M12 13.2a.8.8 0 1 0 0 .1',
    home: 'M2.5 7.5L8 3l5.5 4.5V13h-3.5V9.5H6V13H2.5z',
    user: 'M8 2.5a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6zM2.8 14c.6-2.6 2.7-4 5.2-4s4.6 1.4 5.2 4',
    gear: 'M8 5.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4',
    bell: 'M4 11V7.5a4 4 0 0 1 8 0V11l1.2 1.5H2.8zM6.6 14h2.8',
    folder: 'M1.5 4.5V12.5h13V5.5H7.5L6 3.5H1.5z',
    back: 'M10 3L5 8l5 5',
    chevron: 'M6 3l5 5-5 5',
    heart: 'M8 13.5S2 10 2 6.2A3 3 0 0 1 8 5a3 3 0 0 1 6 1.2C14 10 8 13.5 8 13.5z',
    bolt: 'M9 1.5L3.5 9H8l-1 5.5L12.5 7H8z',
    xcircle: 'M8 1.8a6.2 6.2 0 1 1 0 12.4A6.2 6.2 0 0 1 8 1.8zM5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4',
    upload: 'M8 11V3M4.5 6.5L8 3l3.5 3.5M3 13h10',
    file: 'M4 1.5h5.5L12.5 4.5V14.5H4zM9.5 1.5v3h3',
    star: 'M8 1.8l1.9 4 4.3.5-3.2 2.9.9 4.3L8 11.3l-3.9 2.2.9-4.3L1.8 6.3l4.3-.5z',
    menu: 'M2.5 4h11M2.5 8h11M2.5 12h11',
    link: 'M6.5 9.5l3-3M5 8l-1.3 1.3a2.3 2.3 0 0 0 3.2 3.2L8.2 11M11 8l1.3-1.3a2.3 2.3 0 0 0-3.2-3.2L7.8 4.8',
    info: 'M8 1.8a6.2 6.2 0 1 1 0 12.4A6.2 6.2 0 0 1 8 1.8zM8 7v4.5M8 4.6v.4',
    calendar: 'M2.5 3.5h11v10h-11zM2.5 6.5h11M5.5 2v3M10.5 2v3',
    puzzle: 'M3 3h3a1.5 1.5 0 0 1 3 0h3v3a1.5 1.5 0 0 1 0 3v3H9a1.5 1.5 0 0 0-3 0H3V9a1.5 1.5 0 0 0 0-3z',
    sparkle: 'M8 2v4M8 10v4M2 8h4M10 8h4',
  };
  return `<path d="${d[name] ?? ''}" transform="translate(${x} ${y}) scale(${s})" class="wf-${cls}" vector-effect="non-scaling-stroke"/>`;
}

/** Таб-бар с иконками */
export function tabbar(x: number, y: number, w: number, icons: string[], active = 0) {
  const step = w / icons.length;
  return (
    path(`M${x} ${y}H${x + w}`, 'divider') +
    icons.map((n, i) => icon(n, x + step * i + step / 2 - 7, y + 8, 14, i === active ? 'stroke-accent' : 'stroke')).join('')
  );
}

/** Подпись-бейдж A / B над вариантом */
export const badge = (x: number, y: number, s: string) => circle(x, y, 9, 'block') + text(x, y + 3.6, s, { size: 10, weight: 700, cls: 'ink', anchor: 'middle' });
