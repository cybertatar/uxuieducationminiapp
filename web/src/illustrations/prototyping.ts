import { card, circle, icon, ill, lines, path, rect, screen, text, title, type Illustration } from './kit';

/** Строка панели: подпись слева, значение в выпадающем списке справа */
const row = (y: number, label: string, value: string) =>
  text(36, y + 16, label, { size: 10 }) + rect(128, y, 156, 24, 'field', 6) + text(138, y + 16, value, { size: 10, cls: 'ink' }) + path(`M${270} ${y + 10}l4 4 4-4`, 'stroke', 'fill="none"');

const checkRow = (y: number, label: string, on: boolean) =>
  rect(36, y, 14, 14, on ? 'accent' : 'field', 3) + (on ? icon('check', 37, y + 1, 12, 'stroke-on-accent') : '') + text(58, y + 11, label, { size: 10, cls: 'ink' });

/** Панель Interaction details: открыть оверлей со Smart animate */
const overlayPanel = () =>
  screen(20, 10, 280, 270) +
  title(36, 36, 'Interaction details', 12) +
  row(50, 'Trigger', 'On click') +
  row(82, 'Action', 'Open overlay') +
  row(114, 'Destination', 'Меню') +
  text(36, 160, 'Overlay', { size: 10, weight: 700, cls: 'ink' }) +
  row(168, 'Position', 'Bottom center') +
  checkRow(200, 'Close when clicking outside', true) +
  text(36, 236, 'Animation', { size: 10, weight: 700, cls: 'ink' }) +
  row(244, 'Transition', 'Smart animate');

/** Слои двух фреймов: карточка во втором называется иначе */
const layerCol = (x: number, frame: string, names: string[], bad = -1) =>
  card(x, 30, 128, 176, 10) +
  text(x + 12, 52, frame, { size: 10, weight: 700, cls: 'ink' }) +
  names.map((n, i) => {
    const y = 66 + i * 26;
    return (i === bad ? rect(x + 6, y, 116, 22, 'danger-soft', 5) : '') + rect(x + 14 + (i > 0 ? 10 : 0), y + 6, 10, 10, 'block', 2) + text(x + 30 + (i > 0 ? 10 : 0), y + 15, n, { size: 10, cls: 'ink' });
  }).join('');
const layersMismatch = () =>
  layerCol(20, 'Каталог', ['Content', 'Header', 'Card', 'Button', 'Tab bar']) +
  path('M154 105h12M162 101l4 4-4 4', 'stroke-bold', 'fill="none"') +
  layerCol(172, 'Каталог / Open', ['Content', 'Header', 'Card copy', 'Button', 'Tab bar'], 2) +
  text(160, 224, 'Переход: Smart animate', { size: 9, anchor: 'middle' });

/** Кривые easing: график время → прогресс */
const curve = (d: string, label: string) =>
  screen(10, 8, 140, 124, 12) +
  path('M30 112H130M30 112V22', 'divider') +
  path(d, 'stroke-accent-bold', 'fill="none"') +
  circle(30, 112, 3, 'accent') +
  circle(130, 22, 3, 'accent') +
  text(80, 126, label, { size: 8, anchor: 'middle' });
const CURVES: Record<string, string> = {
  out: 'M30 112C45 40 80 22 130 22',
  in: 'M30 112C80 112 115 94 130 22',
  linear: 'M30 112L130 22',
  inout: 'M30 112C70 112 90 22 130 22',
};

/** Два потока на холсте: один фрейм входит в оба */
const mini = (x: number, y: number, label: string, cls = 'card') => rect(x, y, 52, 70, cls, 8) + lines(x + 8, y + 12, [36, 28, 32], 9, 4) + text(x + 26, y + 88, label, { size: 8, anchor: 'middle' });
const flag = (x: number, y: number, name: string) => rect(x, y, 66, 16, 'accent', 8) + text(x + 33, y + 11, name, { size: 8, weight: 600, cls: 'on-accent', anchor: 'middle' });
const noodle = (x1: number, y1: number, x2: number, y2: number) => path(`M${x1} ${y1}C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}`, 'stroke-accent', 'fill="none"') + circle(x2, y2, 2.5, 'accent');
const flows = () =>
  flag(14, 18, 'Регистрация') +
  mini(20, 40, 'Приветствие') +
  mini(96, 40, 'Код из СМС') +
  flag(14, 146, 'Покупка') +
  mini(20, 168, 'Каталог') +
  mini(96, 168, 'Корзина') +
  mini(176, 96, 'Профиль') +
  mini(252, 96, 'Адрес') +
  noodle(72, 75, 96, 75) +
  noodle(148, 75, 176, 125) +
  noodle(72, 203, 96, 203) +
  noodle(148, 203, 176, 140) +
  noodle(228, 131, 252, 131);

/** Липкий заголовок: экран посреди прокрутки */
const sticky = () =>
  screen(80, 8, 160, 210, 16) +
  rect(86, 14, 148, 26, 'block', 10) +
  text(160, 28, '9:41', { size: 10, weight: 700, cls: 'ink', anchor: 'middle' }) +
  lines(92, 46, [130, 110, 136], 10, 5) +
  rect(80, 82, 160, 24, 'accent-soft', 0) +
  text(92, 98, 'Напитки', { size: 11, weight: 700, cls: 'ink' }) +
  [0, 1, 2].map((i) => card(92, 114 + i * 32, 136, 26, 6) + lines(100, 122 + i * 32, [80], 8, 5)).join('') +
  path('M252 60v120M248 172l4 8 4-8', 'stroke-muted', 'fill="none"') +
  text(258, 120, 'скролл', { size: 8 });

/** Два действия на одном триггере: условие проверяется до присваивания */
const actionsOrder = () =>
  screen(20, 10, 280, 160) +
  title(36, 36, 'On click', 12) +
  card(36, 50, 248, 46, 8) +
  text(46, 68, '1. Conditional', { size: 10, weight: 700, cls: 'ink' }) +
  text(46, 86, 'if step == 2 → Navigate to «Оплата»', { size: 10, cls: 'ink' }) +
  card(36, 104, 248, 46, 8) +
  text(46, 122, '2. Set variable', { size: 10, weight: 700, cls: 'ink' }) +
  text(46, 140, 'step = 2', { size: 10, cls: 'ink' }) +
  text(160, 166, 'До клика step = 1', { size: 9, anchor: 'middle' });

export const prototypingArt: Record<string, Illustration> = {
  'pr-overlay-panel': ill(
    320,
    290,
    'Панель Interaction details: Trigger On click, Action Open overlay, Destination «Меню», Position Bottom center, включено Close when clicking outside, Transition Smart animate',
    overlayPanel(),
    { transition: [36, 236, 248, 34] },
  ),
  'pr-layers-mismatch': ill(
    320,
    234,
    'Панели слоёв двух фреймов. «Каталог»: Content, Header, Card, Button, Tab bar. «Каталог / Open»: Content, Header, Card copy, Button, Tab bar. Переход Smart animate',
    layersMismatch(),
    { mismatch: [178, 116, 116, 22] },
  ),
  'pr-curve-out': ill(160, 140, 'График: кривая резко поднимается в начале и плавно выходит на конец', curve(CURVES.out, '')),
  'pr-curve-in': ill(160, 140, 'График: кривая долго идёт почти горизонтально и резко поднимается в конце', curve(CURVES.in, '')),
  'pr-curve-linear': ill(160, 140, 'График: прямая линия от начала к концу', curve(CURVES.linear, '')),
  'pr-curve-inout': ill(160, 140, 'График: S-образная кривая — медленно в начале, быстро в середине, медленно в конце', curve(CURVES.inout, '')),
  'pr-flows': ill(
    320,
    272,
    'Холст с двумя потоками. «Регистрация»: Приветствие → Код из СМС → Профиль → Адрес. «Покупка»: Каталог → Корзина → Профиль → Адрес',
    flows(),
    { shared: [170, 90, 64, 96] },
  ),
  'pr-sticky': ill(
    320,
    226,
    'Экран меню кофейни посреди прокрутки: статус-бар сверху на месте, под ним заголовок раздела «Напитки» прижат к верху, карточки уезжают под него',
    sticky(),
  ),
  'pr-actions-order': ill(
    320,
    176,
    'Триггер On click с двумя действиями: 1. Conditional — если step == 2, перейти на «Оплата»; 2. Set variable — step = 2. До клика step = 1',
    actionsOrder(),
  ),
};

export const prototypingTrackArt: Record<string, Illustration> = {
  'track-figma-prototyping': ill(
    320,
    112,
    '',
    screen(28, 12, 64, 92, 10) +
      rect(38, 74, 44, 14, 'accent', 4) +
      screen(226, 12, 64, 92, 10) +
      lines(236, 28, [44, 36, 40], 10, 5) +
      path('M82 81C150 81 150 40 222 40', 'stroke-accent-bold', 'fill="none"') +
      circle(82, 81, 4, 'accent') +
      path('M216 35l7 5-7 5', 'stroke-accent-bold', 'fill="none"') +
      rect(124, 52, 72, 20, 'tonal', 10) +
      text(160, 66, 'On tap', { size: 9, weight: 600, cls: 'ink', anchor: 'middle' }),
  ),
};
