import { button, card, circle, field, icon, ill, lines, path, rect, screen, text, title, type Illustration } from './kit';

/** Значки слоёв в квадрате 16×16 с началом в (x, y) */
const frameGlyph = (x: number, y: number) => path(`M${x + 5} ${y + 2}v12M${x + 11} ${y + 2}v12M${x + 2} ${y + 5}h12M${x + 2} ${y + 11}h12`, 'stroke');
const groupGlyph = (x: number, y: number) => path(`M${x + 2} ${y + 2}h12v12h-12z`, 'dash-muted', 'fill="none"');
const textGlyph = (x: number, y: number) => text(x + 8, y + 13, 'T', { size: 13, weight: 700, cls: 'ink', anchor: 'middle' });
const diamond = (cx: number, cy: number, r: number) => `M${cx} ${cy - r}l${r} ${r}-${r} ${r}-${r}-${r}z`;
/** Экземпляр: ромб контуром */
const instanceGlyph = (x: number, y: number) => path(diamond(x + 8, y + 8, 6), 'stroke-accent');
/** Главный компонент: четыре ромба */
const mainGlyph = (x: number, y: number) =>
  path([diamond(x + 8, y + 3.5, 3), diamond(x + 3.5, y + 8, 3), diamond(x + 12.5, y + 8, 3), diamond(x + 8, y + 12.5, 3)].join(''), 'accent');

const layerRow = (y: number, depth: number, glyph: (x: number, y: number) => string, name: string, accent = false) =>
  glyph(40 + depth * 18, y) + text(64 + depth * 18, y + 12, name, { size: 11, weight: accent ? 600 : 400, cls: accent ? 'accent' : 'ink' });

const layers = () =>
  screen(20, 10, 280, 196) +
  title(36, 36, 'Слои', 12) +
  path('M20 48H300', 'divider') +
  layerRow(60, 0, frameGlyph, 'Карточка товара') +
  layerRow(86, 1, groupGlyph, 'Фото') +
  layerRow(112, 1, textGlyph, 'Кеды Classic') +
  layerRow(138, 1, instanceGlyph, 'Button', true) +
  layerRow(170, 0, mainGlyph, 'Button', true);

/** Строка панели свойств: подпись слева, контрол справа */
const propLabel = (y: number, s: string) => text(36, y + 17, s, { size: 11 });

const dropdown = (y: number, value: string) =>
  rect(140, y, 144, 26, 'field', 6) + text(150, y + 17, value, { size: 11, cls: 'ink' }) + icon('chevron', 264, y + 7, 12, 'stroke');

const toggle = (y: number) => rect(244, y + 3, 40, 22, 'accent', 11) + circle(273, y + 14, 8, 'card');

const propsPanel = () =>
  screen(20, 10, 280, 190) +
  instanceGlyph(34, 22) +
  title(56, 35, 'Button', 12) +
  path('M20 48H300', 'divider') +
  propLabel(58, 'Size') +
  dropdown(58, 'Medium') +
  propLabel(92, 'Show icon') +
  toggle(92) +
  propLabel(126, 'Label') +
  field(140, 126, 144, 26, { value: 'Купить' }) +
  propLabel(160, 'Icon') +
  rect(140, 160, 144, 26, 'field', 6) +
  rect(146, 165, 16, 16, 'block', 4) +
  instanceGlyph(146, 165) +
  text(170, 177, 'Arrow right', { size: 11, cls: 'ink' }) +
  icon('chevron', 264, 167, 12, 'stroke');

/** Карточка с кнопкой во всю ширину */
const fillCard = (x: number, w: number) =>
  card(x, 30, w, 112, 10) + rect(x + 12, 42, w - 24, 36, 'block', 6) + lines(x + 12, 88, [w * 0.6, w * 0.4]) + button(x + 12, 110, w - 24, 22, 'Купить');

const caption = (x: number, s: string) => text(x, 20, s, { size: 9, anchor: 'middle' });
const arrow = (x: number, y: number) => path(`M${x} ${y}h16M${x + 12} ${y - 4}l4 4-4 4`, 'stroke-bold', 'fill="none"');

/** Шапка: логотип слева и иконки справа, свободное место — посередине */
const header = (x: number, y: number, w: number) =>
  card(x, y, w, 36, 8) +
  circle(x + 18, y + 18, 8, 'accent') +
  text(x + 32, y + 22, 'Shop', { size: 11, weight: 700, cls: 'ink' }) +
  icon('search', x + w - 56, y + 10, 16) +
  icon('cart', x + w - 30, y + 10, 16) +
  path(`M${x + 66} ${y + 18}H${x + w - 64}`, 'dash-accent');

const chip = (x: number, y: number, label: string, active = false) => {
  const w = label.length * 6.4 + 22;
  return rect(x, y, w, 24, active ? 'accent' : 'block', 12) + text(x + w / 2, y + 16, label, { size: 10, weight: 600, cls: active ? 'on-accent' : 'ink', anchor: 'middle' });
};

/** Чипы раскладываются по строкам слева направо и переносятся, когда кончается ширина */
const chips = (x: number, y: number, w: number, labels: string[]) => {
  let cx = x;
  let cy = y;
  return labels
    .map((l, i) => {
      const cw = l.length * 6.4 + 22;
      if (cx + cw > x + w) {
        cx = x;
        cy += 32;
      }
      const out = chip(cx, cy, l, i === 0);
      cx += cw + 8;
      return out;
    })
    .join('');
};

/** Строка чата: аватар, имя, превью и время; на аватаре — бейдж со счётчиком */
const chatRow = () =>
  screen(20, 10, 280, 120) +
  card(36, 40, 248, 60, 10) +
  path('M44 46v48M276 46v48', 'dash-muted') +
  circle(72, 70, 18, 'block') +
  icon('user', 64, 62, 16) +
  lines(102, 60, [110, 80], 14, 6) +
  text(268, 64, '12:40', { size: 9, anchor: 'end' }) +
  circle(86, 54, 9, 'danger') +
  text(86, 57.5, '3', { size: 10, weight: 700, cls: 'on-accent', anchor: 'middle' });

const swatch = (x: number, y: number, fill: string, hex: string) =>
  `<rect x="${x}" y="${y}" width="14" height="14" rx="3" fill="${fill}" class="wf-swatch"/>` + text(x + 20, y + 11, hex, { size: 10, cls: 'ink' });

const alias = (x: number, y: number, name: string) => rect(x, y - 2, 72, 18, 'tonal', 5) + icon('link', x + 4, y + 1, 12, 'stroke-accent') + text(x + 20, y + 11, name, { size: 10, weight: 600, cls: 'ink' });

const modesTable = () =>
  screen(10, 10, 300, 176) +
  title(24, 34, 'Коллекция: Theme', 12) +
  path('M10 46H310', 'divider') +
  text(24, 64, 'Название', { size: 9 }) +
  text(152, 64, 'Light', { size: 9 }) +
  text(232, 64, 'Dark', { size: 9 }) +
  path('M10 72H310', 'divider') +
  (
    [
      ['color/bg/surface', swatch(152, 86, '#ffffff', 'FFFFFF'), alias(232, 86, 'gray/900')],
      ['color/text/primary', swatch(152, 118, '#1c1c1e', '1C1C1E'), swatch(232, 118, '#f2f2f7', 'F2F2F7')],
      ['color/action/primary', swatch(152, 150, '#2b6fd6', '2B6FD6'), swatch(232, 150, '#4c8dff', '4C8DFF')],
    ] as const
  )
    .map(([name, light, dark], i) => text(24, 97 + i * 32, name, { size: 10, cls: 'ink' }) + light + dark)
    .join('');

export const figmaArt: Record<string, Illustration> = {
  'fc-layers': ill(
    320,
    216,
    'Панель слоёв: фрейм «Карточка товара», внутри группа «Фото», текст «Кеды Classic» и слой Button с ромбом-контуром; ниже на верхнем уровне — Button со значком из четырёх ромбов',
    layers(),
    { instance: [30, 132, 260, 28] },
  ),
  'fp-panel': ill(
    320,
    210,
    'Панель свойств экземпляра Button: Size — выпадающий список Medium, Show icon — включённый переключатель, Label — поле «Купить», Icon — превью компонента Arrow right',
    propsPanel(),
    { boolean: [30, 88, 260, 30], swap: [30, 156, 260, 34] },
  ),
  'fl-resize-fill': ill(
    320,
    150,
    'Узкая карточка с кнопкой «Купить» во всю ширину и та же карточка шире — кнопка растянулась вместе с ней',
    caption(64, 'До') + fillCard(14, 100) + arrow(122, 86) + caption(226, 'После') + fillCard(146, 160),
  ),
  'fl-hug': ill(
    320,
    96,
    'Кнопка «Купить», а после замены текста — более широкая кнопка «Оформить заказ» с теми же полями',
    caption(70, 'До') + button(38, 40, 64, 30, 'Купить') + arrow(130, 55) + caption(226, 'После') + button(166, 40, 120, 30, 'Оформить заказ'),
  ),
  'fl-space-between': ill(
    320,
    130,
    'Две шапки разной ширины: логотип Shop прижат к левому краю, поиск и корзина — к правому, между ними растягивается свободное место',
    header(14, 20, 200) + header(14, 76, 292),
  ),
  'fl-wrap': ill(
    320,
    120,
    'Контейнер с чипами фильтров: «Все», «Кроссовки», «Кеды», «Ботинки» в первой строке, «Сандалии» и «Слипоны» перенеслись во вторую',
    card(14, 20, 292, 88, 10) + chips(26, 34, 270, ['Все', 'Кроссовки', 'Кеды', 'Ботинки', 'Сандалии', 'Слипоны']),
  ),
  'fl-badge': ill(
    320,
    140,
    'Строка чата в автолейауте: аватар, имя с превью и время; красный бейдж «3» наложен на верхний правый угол аватара',
    chatRow(),
    { badge: [74, 42, 24, 24] },
  ),
  'fv-modes': ill(
    320,
    196,
    'Таблица переменных с режимами Light и Dark: color/bg/surface — FFFFFF и ссылка на gray/900, color/text/primary — 1C1C1E и F2F2F7, color/action/primary — 2B6FD6 и 4C8DFF',
    modesTable(),
    { alias: [226, 78, 80, 30] },
  ),
};

export const figmaTrackArt: Record<string, Illustration> = {
  'track-figma-components': ill(
    320,
    112,
    '',
    card(24, 22, 92, 68, 10) +
      mainGlyph(32, 30) +
      button(38, 56, 64, 22, 'Купить') +
      [0, 1, 2].map((i) => path(`M120 56C150 56 156 ${24 + i * 32} 186 ${24 + i * 32}`, 'dash-accent', 'fill="none"')).join('') +
      [0, 1, 2]
        .map((i) => card(190, 12 + i * 32, 104, 26, 8) + instanceGlyph(196, 17 + i * 32) + button(220, 16 + i * 32, 66, 18, ['Купить', 'Оплатить', 'Купить'][i]))
        .join(''),
  ),
  'track-figma-props': ill(
    320,
    112,
    '',
    card(24, 14, 272, 86, 10) +
      text(40, 36, 'Size', { size: 10 }) +
      rect(112, 22, 96, 20, 'field', 5) +
      text(120, 36, 'Large', { size: 10, cls: 'ink' }) +
      text(40, 64, 'Show icon', { size: 10 }) +
      rect(112, 52, 34, 18, 'accent', 9) +
      circle(137, 61, 6.5, 'card') +
      text(40, 90, 'Label', { size: 10 }) +
      rect(112, 78, 96, 18, 'field', 5) +
      text(120, 91, 'Купить', { size: 10, cls: 'ink' }) +
      button(222, 44, 62, 28, 'Купить'),
  ),
  'track-figma-auto-layout': ill(
    320,
    112,
    '',
    rect(40, 22, 240, 68, 'tonal', 10) +
      [0, 1, 2].map((i) => rect(56 + i * 74, 36, 60, 40, 'card', 8)).join('') +
      [0, 1].map((i) => path(`M${118 + i * 74} 56h10`, 'stroke-accent-bold')).join('') +
      path('M40 56h14', 'stroke-accent') +
      path('M266 56h14', 'stroke-accent') +
      text(160, 106, 'gap · padding · fill', { size: 9, anchor: 'middle' }),
  ),
  'track-figma-variables': ill(
    320,
    112,
    '',
    card(24, 14, 272, 86, 10) +
      text(40, 34, 'Light', { size: 10, weight: 600, cls: 'ink' }) +
      text(176, 34, 'Dark', { size: 10, weight: 600, cls: 'ink' }) +
      path('M24 42H296', 'divider') +
      [0, 1].map((i) => swatch(40, 52 + i * 24, ['#ffffff', '#2b6fd6'][i], ['bg/surface', 'action'][i])).join('') +
      [0, 1].map((i) => swatch(176, 52 + i * 24, ['#1c1c1e', '#4c8dff'][i], ['bg/surface', 'action'][i])).join(''),
  ),
};
