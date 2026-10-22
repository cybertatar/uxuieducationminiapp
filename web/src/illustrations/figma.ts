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

/* ---------- Компоненты ---------- */

/** Строка слоя с произвольным началом — для нескольких панелей рядом */
const layerAt = (x: number, y: number, glyph: (x: number, y: number) => string, name: string, cls: 'ink' | 'accent' | 'text' = 'ink', size = 11) =>
  glyph(x, y) + text(x + 22, y + 12, name, { size, weight: cls === 'accent' ? 600 : 400, cls });

/** Кнопка произвольного цвета: синяя — акцент, зелёная — success */
const tintedButton = (x: number, y: number, w: number, h: number, label: string, green: boolean) =>
  rect(x, y, w, h, green ? 'success' : 'accent', 8) + text(x + w / 2, y + h / 2 + 4, label, { size: 11, weight: 600, cls: 'on-accent', anchor: 'middle' });

/** Плитка ответа: экземпляр кнопки с подписью и цветом */
const overrideTile = (label: string, green: boolean) => rect(0, 0, 140, 100, 'tile', 12) + instanceGlyph(14, 14) + text(36, 26, 'Экземпляр', { size: 9 }) + tintedButton(24, 48, 92, 30, label, green);

const overrideSetup = () =>
  card(14, 14, 140, 92, 10) +
  mainGlyph(26, 24) +
  text(48, 36, 'Главный', { size: 10, cls: 'ink', weight: 600 }) +
  tintedButton(38, 56, 92, 30, 'Купить', false) +
  path('M162 60h20M178 56l4 4-4 4', 'stroke-bold', 'fill="none"') +
  card(190, 14, 116, 92, 10) +
  instanceGlyph(202, 24) +
  text(224, 36, 'Экземпляр', { size: 10, cls: 'ink', weight: 600 }) +
  tintedButton(202, 56, 92, 30, 'Оплатить', false) +
  text(248, 100, 'текст переопределён', { size: 8, anchor: 'middle' });

/** Меню экземпляра; строки — по 30px */
const MENU_ITEMS = ['Go to main component', 'Reset all changes', 'Push changes to main component', 'Detach instance'];
const instanceMenu = () =>
  screen(20, 10, 280, 176) +
  instanceGlyph(34, 22) +
  title(56, 35, 'Button · экземпляр', 12) +
  path('M20 48H300', 'divider') +
  card(36, 58, 248, 120, 10) +
  MENU_ITEMS.map((s, i) => text(52, 79 + i * 28, s, { size: 11, cls: i === 3 ? 'danger' : 'ink' }) + (i < 3 ? path(`M44 ${87 + i * 28}H276`, 'divider') : '')).join('');

const swapNames = () =>
  [
    [14, 'Button/Primary', 'Label'],
    [166, 'Button/Outline', 'Text'],
  ]
    .map(
      ([x, name, label]) =>
        card(x as number, 14, 140, 96, 10) +
        layerAt((x as number) + 10, 24, mainGlyph, name as string, 'accent', 10) +
        layerAt((x as number) + 26, 52, frameGlyph, 'Icon', 'ink', 10) +
        layerAt((x as number) + 26, 78, textGlyph, label as string, 'ink', 10),
    )
    .join('');

const nested = () =>
  card(14, 20, 110, 70, 10) +
  layerAt(22, 28, mainGlyph, 'Button', 'accent', 10) +
  rect(30, 56, 78, 24, 'accent', 8) +
  path('M128 68C160 68 170 70 196 70', 'dash-accent', 'fill="none"') +
  card(190, 14, 116, 102, 10) +
  layerAt(198, 22, mainGlyph, 'Карточка', 'accent', 10) +
  rect(202, 44, 92, 28, 'block', 6) +
  instanceGlyph(204, 78) +
  rect(222, 78, 72, 24, 'accent', 8);

/** Три экземпляра карточки: в слоте у каждого свой контент */
const slots = () =>
  [0, 1, 2]
    .map((i) => {
      const x = 12 + i * 102;
      const slot = path(`M${x + 8} 46h82v58h-82z`, 'dash-accent', 'fill="none"');
      const content = [
        lines(x + 16, 56, [60, 48, 64, 40], 11),
        rect(x + 16, 54, 66, 42, 'block', 6) + path(`M${x + 24} 90l14-16 10 10 8-7 14 13`, 'stroke-muted', 'fill="none"'),
        field(x + 14, 54, 70, 18, { placeholder: 'Email' }) + rect(x + 14, 78, 70, 18, 'accent', 6),
      ][i];
      return card(x, 14, 98, 100, 10) + instanceGlyph(x + 8, 22) + rect(x + 28, 26, 50, 6, 'block', 3) + slot + content;
    })
    .join('');

const library = () =>
  card(100, 8, 120, 50, 10) +
  icon('folder', 112, 18, 18, 'stroke-accent') +
  text(136, 31, 'Библиотека', { size: 10, weight: 600, cls: 'ink' }) +
  text(112, 50, 'кнопки, поля, иконки', { size: 8 }) +
  ['Приложение', 'Сайт', 'Админка']
    .map((s, i) => {
      const x = 14 + i * 104;
      return path(`M160 60C160 76 ${x + 46} 70 ${x + 46} 86`, 'dash-accent', 'fill="none"') + card(x, 86, 92, 32, 8) + icon('file', x + 10, 94, 16) + text(x + 32, 106, s, { size: 9, cls: 'ink' });
    })
    .join('');

const chevronDown = (x: number, y: number) => path(`M${x} ${y}l4 4 4-4`, 'stroke', 'fill="none"');
const folderGlyph = (x: number, y: number) => icon('folder', x, y, 16);
const assets = () =>
  screen(20, 10, 280, 170) +
  title(36, 36, 'Ассеты', 12) +
  path('M20 48H300', 'divider') +
  chevronDown(38, 64) +
  layerAt(50, 58, folderGlyph, 'Icon') +
  chevronDown(56, 90) +
  layerAt(68, 84, folderGlyph, 'Arrow') +
  layerAt(86, 110, mainGlyph, 'Left', 'accent') +
  layerAt(86, 134, mainGlyph, 'Right', 'accent') +
  layerAt(68, 158, mainGlyph, 'Close', 'accent');

const publishList = () =>
  screen(20, 10, 280, 176) +
  title(36, 36, 'Компоненты в файле', 12) +
  path('M20 48H300', 'divider') +
  ['Button', '.base/button', 'Input', 'Icon/Close'].map((s, i) => layerAt(40, 60 + i * 30, mainGlyph, s, 'accent')).join('');

/* ---------- Свойства и варианты ---------- */

const stateButtons = () =>
  (
    [
      ['default', 'accent'],
      ['hover', 'accent-soft'],
      ['pressed', 'ink-shape'],
      ['disabled', 'block'],
    ] as const
  )
    .map(([s, cls], i) => {
      const x = 14 + i * 76;
      return rect(x, 30, 68, 30, cls, 8) + text(x + 34, 49, 'Купить', { size: 10, weight: 600, cls: s === 'disabled' ? 'muted' : 'on-accent', anchor: 'middle' }) + text(x + 34, 78, s, { size: 9, anchor: 'middle' });
    })
    .join('');

const variantNames = () =>
  screen(20, 10, 280, 178) +
  layerAt(36, 22, mainGlyph, 'Button', 'accent') +
  path('M20 48H300', 'divider') +
  ['Size=Small, State=Default', 'Size=Small, State=Hover', 'Large / Hover', 'Size=Large, State=Default'].map((s, i) => layerAt(54, 58 + i * 30, mainGlyph, s, 'ink', 10.5)).join('');

/** Набор вариантов: два типа, в каждом 3 размера × 4 состояния */
const variantGrid = () =>
  path('M10 10h300v116h-300z', 'dash-accent', 'fill="none"') +
  [0, 1]
    .map(
      (t) =>
        text(84 + t * 148, 120, t === 0 ? 'primary' : 'secondary', { size: 9, anchor: 'middle' }) +
        [0, 1, 2]
          .map((sz) =>
            [0, 1, 2, 3]
              .map((st) => {
                const w = [18, 24, 29][sz];
                const h = [10, 13, 16][sz];
                const x = 24 + t * 148 + st * 33 + (29 - w) / 2;
                const y = 22 + sz * 30 + (16 - h) / 2;
                const cls = t === 0 ? ['accent', 'accent-soft', 'ink-shape', 'block'][st] : st === 3 ? 'block' : 'field';
                return rect(x, y, w, h, cls, 4);
              })
              .join(''),
          )
          .join(''),
    )
    .join('');

const interactive = () =>
  path('M10 14h300v92h-300z', 'dash-accent', 'fill="none"') +
  text(56, 34, 'default', { size: 9, anchor: 'middle' }) +
  tintedButton(20, 44, 72, 30, 'Купить', false) +
  text(262, 34, 'hover', { size: 9, anchor: 'middle' }) +
  rect(226, 44, 72, 30, 'accent-soft', 8) +
  text(262, 63, 'Купить', { size: 11, weight: 600, cls: 'on-accent', anchor: 'middle' }) +
  circle(94, 59, 4, 'accent') +
  path('M98 59C150 59 170 59 220 59M214 54l6 5-6 5', 'stroke-accent', 'fill="none"') +
  rect(118, 76, 84, 20, 'tonal', 6) +
  text(160, 90, 'On hover → Change to', { size: 8, weight: 600, cls: 'ink', anchor: 'middle' });

const swapMenu = () =>
  screen(20, 10, 280, 186) +
  text(36, 34, 'Icon', { size: 11 }) +
  rect(140, 18, 144, 26, 'field-focus', 6) +
  text(166, 35, 'Arrow right', { size: 11, cls: 'ink' }) +
  instanceGlyph(146, 23) +
  card(100, 52, 184, 136, 10) +
  text(114, 72, 'Preferred', { size: 9, weight: 600 }) +
  ['back', 'chevron', 'plus', 'close', 'check', 'search', 'heart', 'star']
    .map((n, i) => rect(114 + (i % 4) * 40, 80 + Math.floor(i / 4) * 40, 32, 32, 'block', 6) + icon(n, 122 + (i % 4) * 40, 88 + Math.floor(i / 4) * 40, 16))
    .join('') +
  field(114, 162, 156, 20, { placeholder: 'Все библиотеки…' });

const exposedPanel = () =>
  screen(20, 10, 280, 200) +
  instanceGlyph(34, 22) +
  title(56, 35, 'Card', 12) +
  path('M20 48H300', 'divider') +
  propLabel(56, 'Title') +
  field(140, 56, 144, 26, { value: 'Кеды Classic' }) +
  propLabel(88, 'Show badge') +
  toggle(88) +
  path('M36 124H284', 'divider') +
  instanceGlyph(36, 130) +
  text(58, 143, 'Button', { size: 11, weight: 600, cls: 'accent' }) +
  propLabel(150, 'Size') +
  dropdown(150, 'Large') +
  text(36, 199, '↑ свойства вложенной кнопки', { size: 9 });

/** Кнопка с автолейаутом после скрытия иконки: всё сжалось или осталась дыра */
const hiddenIcon = (collapsed: boolean) =>
  collapsed
    ? tintedButton(76, 30, 88, 36, 'Купить', false)
    : rect(54, 30, 132, 36, 'accent', 8) + text(142, 52, 'Купить', { size: 11, weight: 600, cls: 'on-accent', anchor: 'middle' });

/* ---------- Автолейаут ---------- */

/** Телефон с карточкой: заголовок переносится или растягивает карточку за край экрана */
const titleCard = (wraps: boolean) =>
  screen(70, 8, 100, 118, 12) +
  (wraps
    ? card(80, 22, 80, 92, 8) + rect(86, 28, 68, 32, 'block', 4) + text(86, 74, 'Кеды Classic', { size: 9, weight: 700, cls: 'ink' }) + text(86, 86, 'на каждый день', { size: 9, weight: 700, cls: 'ink' }) + rect(86, 96, 44, 5, 'block', 2.5)
    : card(80, 22, 158, 60, 8) + rect(86, 28, 68, 22, 'block', 4) + text(86, 64, 'Кеды Classic на каждый день', { size: 9, weight: 700, cls: 'ink' }) + rect(86, 70, 44, 5, 'block', 2.5));

/** Кнопка с иконкой: паддинги по краям и gap между иконкой и текстом подсвечены */
const paddingGap = () =>
  rect(40, 30, 240, 72, 'accent', 12) +
  [
    [40, 30, 240, 16],
    [40, 86, 240, 16],
    [40, 46, 32, 40],
    [248, 46, 32, 40],
  ]
    .map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="wf-on-accent-soft"/>`)
    .join('') +
  `<rect x="96" y="46" width="24" height="40" class="wf-on-accent-soft"/>` +
  path('M96 46v40M120 46v40', 'stroke-on-accent-thin', 'stroke-dasharray="3 3"') +
  path('M72 46h176v40H72z', 'stroke-on-accent-thin', 'stroke-dasharray="3 3" fill="none"') +
  icon('cart', 76, 58, 18, 'stroke-on-accent') +
  text(184, 72, 'В корзину', { size: 15, weight: 700, cls: 'on-accent', anchor: 'middle' });

/** Цена и подпись: на одной базовой линии или подпись опущена, как при выравнивании по низу рамок */
const baseline = (aligned: boolean) =>
  path('M28 62H138', 'dash-accent') +
  text(36, 62, '4 990', { size: 34, weight: 700, cls: 'ink' }) +
  text(146, aligned ? 62 : 69, 'в месяц', { size: 15, cls: 'text' });

const maxWidth = () =>
  screen(10, 10, 300, 130, 10) +
  rect(10, 10, 300, 18, 'block', 10) +
  [20, 30, 40].map((x) => circle(x, 19, 3, 'card')).join('') +
  card(22, 40, 276, 88, 10) +
  title(36, 62, 'Как выбрать размер кед', 12) +
  lines(36, 74, [252, 248, 252, 140], 10, 5);

const avatarStack = () =>
  [0, 1, 2, 3, 4]
    .map((i) => {
      const cx = 70 + i * 40;
      return circle(cx, 56, 26, 'card') + circle(cx, 56, 23, ['accent', 'success', 'warning-shape', 'danger', 'ink-shape'][i]) + icon('user', cx - 9, 47, 18, 'stroke-on-accent');
    })
    .reverse()
    .join('');

/** Две кнопки вплотную: внешняя обводка первой выходит за её рамку и наезжает на вторую */
const strokeOverlap = () =>
  rect(0, 0, 320, 100, 'tile', 12) +
  rect(30, 34, 128, 36, 'field', 8) +
  text(94, 57, 'Отмена', { size: 12, weight: 600, cls: 'ink', anchor: 'middle' }) +
  rect(162, 34, 128, 36, 'accent', 8) +
  text(226, 57, 'Сохранить', { size: 12, weight: 600, cls: 'on-accent', anchor: 'middle' }) +
  `<rect x="26" y="30" width="136" height="44" rx="12" fill="none" class="wf-stroke" style="stroke-width:6"/>` +
  path('M30 18v68M158 18v68M162 18v68M290 18v68', 'dash-accent') +
  text(160, 96, 'рамки слоёв в автолейауте', { size: 9, anchor: 'middle' });

const gallery = () =>
  screen(10, 10, 300, 156, 10) +
  rect(22, 22, 182, 60, 'tonal', 8) +
  text(34, 46, 'Распродажа', { size: 12, weight: 700, cls: 'ink' }) +
  text(34, 62, 'до −50% на кеды', { size: 9 }) +
  [
    [212, 22],
    [22, 90],
    [117, 90],
    [212, 90],
  ]
    .map(([x, y]) => card(x, y, 87, 60, 8) + rect(x + 6, y + 6, 75, 30, 'block', 5) + rect(x + 6, y + 42, 50, 5, 'block', 2.5))
    .join('');

/** Фрейм до и после ресайза: кнопка с Left & Right тянется вместе с ним */
const leftRight = () =>
  text(64, 18, 'До', { size: 9, anchor: 'middle' }) +
  screen(14, 26, 100, 90, 10) +
  button(26, 76, 76, 26, 'Купить') +
  path('M14 89h12M102 89h12', 'stroke-accent-bold') +
  arrow(122, 70) +
  text(226, 18, 'После', { size: 9, anchor: 'middle' }) +
  screen(146, 26, 160, 90, 10) +
  button(158, 76, 136, 26, 'Купить') +
  path('M146 89h12M294 89h12', 'stroke-accent-bold');

const scaleFrames = () =>
  screen(14, 20, 100, 70, 8) +
  rect(14, 48, 70, 14, 'accent', 3) +
  text(49, 104, 'кадр 100 · слой 70', { size: 9, anchor: 'middle' }) +
  arrow(122, 55) +
  screen(146, 20, 160, 70, 8) +
  path('M146 55h112', 'dash-accent') +
  text(226, 104, 'кадр 200 · слой ?', { size: 9, anchor: 'middle' });

/* ---------- Переменные ---------- */

/** Панель свойств кнопки: заливка, скругление, текст, прозрачность */
const bindPanel = () =>
  screen(20, 10, 280, 176) +
  instanceGlyph(34, 22) +
  title(56, 35, 'Button', 12) +
  path('M20 48H300', 'divider') +
  propLabel(56, 'Заливка') +
  rect(140, 56, 144, 26, 'field', 6) +
  `<rect x="146" y="62" width="14" height="14" rx="3" fill="#2b6fd6"/>` +
  text(168, 73, '2B6FD6', { size: 11, cls: 'ink' }) +
  propLabel(88, 'Скругление') +
  field(140, 88, 144, 26, { value: '12' }) +
  propLabel(120, 'Текст') +
  field(140, 120, 144, 26, { value: 'Купить' }) +
  propLabel(152, 'Прозрачность') +
  field(140, 152, 144, 26, { value: '100%' });

const gradientBanner = () =>
  `<defs><linearGradient id="fv-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7b5cff"/><stop offset="1" stop-color="#2bb3ff"/></linearGradient></defs>` +
  screen(60, 10, 200, 130, 12) +
  `<rect x="72" y="24" width="176" height="72" rx="10" fill="url(#fv-grad)"/>` +
  text(86, 52, 'Premium', { size: 14, weight: 700, cls: 'on-accent' }) +
  text(86, 70, 'месяц бесплатно', { size: 10, cls: 'on-accent' }) +
  lines(72, 108, [140, 100], 12);

const languages = () =>
  (
    [
      ['RU', 'Корзина', 'Оформить заказ'],
      ['EN', 'Cart', 'Check out'],
      ['DE', 'Warenkorb', 'Zur Kasse gehen'],
    ] as const
  )
    .map(([code, head, cta], i) => {
      const x = 12 + i * 102;
      return text(x + 49, 16, code, { size: 9, weight: 600, anchor: 'middle' }) + screen(x, 22, 98, 104, 10) + text(x + 10, 42, head, { size: 10, weight: 700, cls: 'ink' }) + lines(x + 10, 52, [70, 56, 64], 10) + rect(x + 8, 94, 82, 22, 'accent', 6) + text(x + 49, 108.5, cta, { size: 8.5, weight: 600, cls: 'on-accent', anchor: 'middle' });
    })
    .join('');

const modeChip = (x: number, y: number, s: string, auto: boolean) =>
  rect(x, y, 52, 18, auto ? 'block' : 'tonal', 9) + text(x + 26, y + 12.5, s, { size: 9, weight: 600, cls: 'ink', anchor: 'middle' });

const inherit = () =>
  screen(20, 10, 280, 120) +
  title(36, 36, 'Слои', 12) +
  path('M20 48H300', 'divider') +
  layerAt(40, 58, frameGlyph, 'Экран') +
  modeChip(232, 57, 'Dark', false) +
  layerAt(58, 82, frameGlyph, 'Карточка') +
  modeChip(232, 81, 'Auto', true) +
  layerAt(76, 106, instanceGlyph, 'Кнопка', 'accent') +
  modeChip(232, 105, 'Auto', true);

const collections = () =>
  (
    [
      ['Theme', ['Light', 'Dark']],
      ['Density', ['Compact', 'Regular']],
    ] as const
  )
    .map(([name, modes], i) => {
      const x = 14 + i * 150;
      return card(x, 18, 142, 84, 10) + title(x + 12, 40, name, 12) + modes.map((m, j) => modeChip(x + 12 + j * 62, 56, m, false)).join('') + lines(x + 12, 84, [90], 10);
    })
    .join('');

const checkbox = (x: number, y: number, on: boolean) =>
  on ? rect(x, y, 16, 16, 'accent', 4) + icon('check', x + 1, y + 1, 14, 'stroke-on-accent') : rect(x, y, 16, 16, 'field', 4);

const scoping = () =>
  screen(20, 10, 280, 170) +
  title(36, 36, 'color/bg/surface · где показывать', 11) +
  path('M20 48H300', 'divider') +
  (
    [
      ['Заливка фрейма', true],
      ['Заливка фигуры', true],
      ['Цвет текста', false],
      ['Обводка', false],
    ] as const
  )
    .map(([s, on], i) => checkbox(36, 60 + i * 28, on) + text(62, 72 + i * 28, s, { size: 11, cls: 'ink' }))
    .join('');

const codeSyntax = () =>
  `<rect x="20" y="10" width="280" height="110" rx="12" fill="#1e1e24"/>` +
  `<text x="36" y="36" font-size="10" fill="#8a8aa0">Dev Mode · CSS</text>` +
  `<text x="36" y="64" font-size="11" font-family="monospace" fill="#e7e7f0">.card {</text>` +
  `<text x="50" y="82" font-size="11" font-family="monospace" fill="#e7e7f0">background: <tspan fill="#7cc4ff">var(--color-bg-surface)</tspan>;</text>` +
  `<text x="36" y="100" font-size="11" font-family="monospace" fill="#e7e7f0">}</text>`;

const counter = () =>
  screen(20, 10, 280, 100) +
  rect(36, 30, 56, 56, 'block', 8) +
  text(104, 50, 'Кеды Classic', { size: 12, weight: 700, cls: 'ink' }) +
  text(104, 68, '4 990 ₽', { size: 11 }) +
  rect(196, 44, 88, 30, 'block', 15) +
  icon('minus', 206, 51, 16) +
  text(240, 64, '2', { size: 13, weight: 700, cls: 'ink', anchor: 'middle' }) +
  circle(268, 59, 13, 'accent') +
  icon('plus', 260, 51, 16, 'stroke-on-accent');

const conditional = () =>
  screen(20, 10, 280, 150) +
  title(36, 36, 'Кнопка «Оформить» · On tap', 11) +
  path('M20 48H300', 'divider') +
  rect(36, 58, 248, 26, 'tonal', 6) +
  text(48, 75, 'if  count == 0', { size: 11, weight: 600, cls: 'ink' }) +
  text(60, 102, '→ Navigate to «Корзина пуста»', { size: 10, cls: 'ink' }) +
  rect(36, 114, 248, 22, 'block', 6) +
  text(48, 129, 'else', { size: 11, weight: 600, cls: 'ink' }) +
  text(60, 152, '→ Navigate to «Оформление»', { size: 10, cls: 'ink' });

const themeToggle = () =>
  screen(60, 10, 200, 120, 12) +
  title(76, 36, 'Настройки', 13) +
  card(72, 48, 176, 34, 8) +
  text(84, 69, 'Тёмная тема', { size: 11, cls: 'ink' }) +
  rect(206, 56, 32, 18, 'accent', 9) +
  circle(229, 65, 6.5, 'card') +
  card(72, 88, 176, 34, 8) +
  text(84, 109, 'Уведомления', { size: 11, cls: 'ink' });


/* ---------- Новые сюжеты: панель автолейаута, подписи размеров, отвязка, вложенные свойства, группы переменных ---------- */

/** Сегмент переключателя направления автолейаута */
const segment = (x: number, y: number, active: boolean, glyph: string) => rect(x, y, 40, 26, active ? 'tonal' : 'field', 6) + glyph;
const arrowDown = (x: number, y: number) => path(`M${x + 20} ${y + 7}v12M${x + 15} ${y + 14}l5 5 5-5`, 'stroke', 'fill="none"');
const arrowRight = (x: number, y: number) => path(`M${x + 13} ${y + 13}h14M${x + 22} ${y + 8}l5 5-5 5`, 'stroke-accent', 'fill="none"');
const wrapArrow = (x: number, y: number) => path(`M${x + 12} ${y + 8}h14v8h-12M${x + 18} ${y + 12}l-4 4 4 4`, 'stroke', 'fill="none"');

/** Сетка выравнивания 3×3, активна верхняя левая точка */
const alignGrid = (x: number, y: number) =>
  rect(x, y, 56, 56, 'field', 6) +
  [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => (r === 0 && c === 0 ? rect(x + 8, y + 8, 12, 4, 'accent', 2) : circle(x + 14 + c * 14, y + 14 + r * 14, 1.8, 'block')))).join('');

const autoLayoutPanel = () =>
  screen(20, 10, 280, 204) +
  title(36, 36, 'Auto layout', 12) +
  path('M20 48H300', 'divider') +
  propLabel(56, 'Направление') +
  segment(140, 56, false, arrowDown(140, 56)) +
  segment(184, 56, true, arrowRight(184, 56)) +
  segment(228, 56, false, wrapArrow(228, 56)) +
  text(36, 109, 'W', { size: 11, weight: 600 }) +
  rect(52, 94, 100, 24, 'field', 6) +
  text(60, 110, 'Fill', { size: 11, cls: 'ink' }) +
  icon('chevron', 134, 100, 12, 'stroke') +
  text(168, 109, 'H', { size: 11, weight: 600 }) +
  rect(184, 94, 100, 24, 'field', 6) +
  text(192, 110, 'Fixed 180', { size: 11, cls: 'ink' }) +
  icon('chevron', 266, 100, 12, 'stroke') +
  alignGrid(36, 132) +
  text(108, 146, 'Gap', { size: 10 }) +
  field(108, 152, 76, 24, { value: '12' }) +
  text(196, 146, 'Padding', { size: 10 }) +
  field(196, 152, 88, 24, { value: '16' });

/** Подпись размеров, как Figma показывает её под выделенным слоем */
const sizeLabel = (cx: number, y: number, s: string) => {
  const w = s.length * 5.6 + 12;
  return rect(cx - w / 2, y, w, 16, 'accent', 4) + text(cx, y + 11.5, s, { size: 9, weight: 600, cls: 'on-accent', anchor: 'middle' });
};
const selection = (x: number, y: number, w: number, h: number) => path(`M${x} ${y}h${w}v${h}h-${w}z`, 'stroke-accent', 'fill="none"');

const sizeLabels = () =>
  card(20, 14, 280, 152, 12) +
  selection(34, 26, 252, 56) +
  rect(38, 30, 244, 48, 'block', 8) +
  sizeLabel(160, 86, 'Fill × Fixed') +
  selection(34, 112, 136, 14) +
  lines(34, 116, [136], 10, 6) +
  sizeLabel(102, 130, 'Fill × Hug') +
  selection(210, 108, 76, 26) +
  button(212, 110, 72, 22, 'Купить') +
  sizeLabel(248, 140, 'Hug × Hug');

/** Карточка товара с описанием: до — текст на пять строк, после — две строки и многоточие */
const truncCard = (x: number, full: boolean) =>
  card(x, 26, 136, full ? 148 : 112, 10) +
  rect(x + 10, 36, 116, 40, 'block', 6) +
  text(x + 10, 92, 'Кеды Classic', { size: 11, weight: 700, cls: 'ink' }) +
  (full
    ? lines(x + 10, 102, [112, 108, 114, 104, 70], 10)
    : lines(x + 10, 102, [112, 100], 10) + text(x + 114, 117, '…', { size: 11, weight: 700, cls: 'ink' }));
const truncate = () => caption(80, 'Сейчас') + truncCard(12, true) + arrow(152, 100) + caption(240, 'Нужно') + truncCard(172, false);

/** Плитка со строкой слоя «Button» — вариант ответа */
const rectGlyph = (x: number, y: number) => path(`M${x + 3} ${y + 3}h10v10h-10z`, 'stroke', 'fill="none"');
const layerTile = (glyph: (x: number, y: number) => string) => rect(0, 0, 160, 64, 'tile', 12) + layerAt(30, 24, glyph, 'Button', 'ink', 13);

/** Дерево слоёв карточки: кнопка — экземпляр или нарисованная вручную */
const cardTree = (instance: boolean) =>
  rect(0, 0, 240, 130, 'tile', 12) +
  layerAt(16, 14, frameGlyph, 'Карточка', 'ink', 11) +
  layerAt(34, 40, groupGlyph, 'Фото', 'ink', 10) +
  layerAt(34, 64, textGlyph, 'Кеды Classic', 'ink', 10) +
  (instance
    ? layerAt(34, 88, instanceGlyph, 'Button', 'accent', 10)
    : layerAt(34, 88, rectGlyph, 'Rectangle 12', 'ink', 10) + layerAt(52, 108, textGlyph, 'Купить', 'ink', 10));

/** Свойства экземпляра карточки; ниже — свойства вложенной кнопки */
const nestedPanel = () =>
  screen(20, 10, 280, 214) +
  instanceGlyph(34, 22) +
  title(56, 35, 'Card', 12) +
  path('M20 48H300', 'divider') +
  propLabel(54, 'Title') +
  field(140, 54, 144, 26, { value: 'Новинка' }) +
  propLabel(86, 'Show badge') +
  toggle(86) +
  path('M36 124H284', 'divider') +
  instanceGlyph(36, 132) +
  text(58, 144, 'Button', { size: 11, weight: 600, cls: 'ink' }) +
  propLabel(154, 'Size') +
  dropdown(154, 'Small') +
  propLabel(186, 'Label') +
  field(140, 186, 144, 26, { value: 'Купить' });

/** Панель свойств с понятными или безымянными названиями */
const namesPanel = (good: boolean) =>
  rect(0, 0, 240, 120, 'tile', 12) +
  instanceGlyph(14, 12) +
  text(36, 24, 'Button', { size: 11, weight: 600, cls: 'ink' }) +
  (good ? ['Size', 'State', 'Show icon'] : ['Property 1', 'Property 2', 'Property 3'])
    .map((l, i) => text(14, 54 + i * 26, l, { size: 10 }) + rect(110, 41 + i * 26, 116, 20, 'field', 5) + text(118, 55 + i * 26, (good ? ['Large', 'Hover', 'true'] : ['Variant2', 'Default', 'true'])[i], { size: 10, cls: 'ink' }))
    .join('');

/** 20 иконок: набор из вариантов или одна кнопка со свойством instance swap */
const ICON_NAMES = ['plus', 'search', 'cart', 'heart', 'star', 'trash', 'bell', 'user'];
const iconVariants = () =>
  rect(0, 0, 240, 130, 'tile', 12) +
  path('M10 10h220v86h-220z', 'dash-accent', 'fill="none"') +
  ICON_NAMES.map((n, i) => {
    const x = 18 + (i % 4) * 52;
    const y = 18 + Math.floor(i / 4) * 38;
    return rect(x, y, 44, 28, 'accent', 7) + icon(n, x + 15, y + 7, 14, 'stroke-on-accent');
  }).join('') +
  text(120, 116, 'Icon=Plus, Icon=Search… · 20 вариантов', { size: 9, anchor: 'middle' });
const iconSwap = () =>
  rect(0, 0, 240, 130, 'tile', 12) +
  rect(20, 22, 76, 30, 'accent', 8) +
  icon('plus', 30, 30, 14, 'stroke-on-accent') +
  text(70, 41, 'Add', { size: 10, weight: 600, cls: 'on-accent', anchor: 'middle' }) +
  text(20, 82, 'Icon', { size: 10 }) +
  rect(70, 68, 152, 22, 'field', 6) +
  instanceGlyph(76, 71) +
  text(98, 83, 'Plus', { size: 10, cls: 'ink' }) +
  icon('chevron', 204, 73, 12, 'stroke') +
  text(120, 116, '1 компонент · свойство instance swap', { size: 9, anchor: 'middle' });

/** Список переменных: плоский или разложенный по группам через слэш */
const varRow = (x: number, y: number, fill: string, name: string) => `<rect x="${x}" y="${y}" width="12" height="12" rx="3" fill="${fill}" class="wf-swatch"/>` + text(x + 18, y + 10, name, { size: 9.5, cls: 'ink' });
const VARS: [string, string][] = [
  ['#ffffff', 'surface'], ['#1c1c1e', 'textPrimary'], ['#2b6fd6', 'primaryBtn'], ['#f2f2f7', 'bg2'],
  ['#8e8e93', 'secondaryText'], ['#e5484d', 'errorRed'], ['#4c8dff', 'linkBlue'], ['#2f9e44', 'ok'],
];
const varsFlat = () => rect(0, 0, 240, 150, 'tile', 12) + VARS.map(([c, n], i) => varRow(16 + (i % 2) * 112, 16 + Math.floor(i / 2) * 32, c, n)).join('');
const varsGrouped = () =>
  rect(0, 0, 240, 150, 'tile', 12) +
  (
    [
      [0, 'color/bg', [['#ffffff', 'surface'], ['#f2f2f7', 'secondary']]],
      [1, 'color/text', [['#1c1c1e', 'primary'], ['#8e8e93', 'secondary']]],
      [2, 'color/action', [['#2b6fd6', 'primary'], ['#e5484d', 'danger']]],
    ] as [number, string, [string, string][]][]
  )
    .map(([i, group, rows]) => {
      const y = 14 + i * 44;
      return icon('folder', 14, y, 13) + text(32, y + 10, group, { size: 9.5, weight: 700, cls: 'ink' }) + rows.map(([c, n], j) => varRow(32 + j * 100, y + 20, c, n)).join('');
    })
    .join('');

/** Цепочка алиасов: заливка кнопки → семантическая переменная → примитив */
const aliasNode = (x: number, name: string, value: string, primitive = false) =>
  card(x, 40, 92, 52, 10) + text(x + 46, 60, name, { size: 9, weight: 700, cls: 'ink', anchor: 'middle' }) +
  (primitive ? `<rect x="${x + 22}" y="68" width="14" height="14" rx="3" fill="#2b6fd6" class="wf-swatch"/>` + text(x + 42, 79, value, { size: 9, cls: 'ink' }) : rect(x + 14, 67, 64, 16, 'tonal', 5) + icon('link', x + 18, 69, 12, 'stroke-accent') + text(x + 34, 79, value, { size: 8.5, cls: 'ink' }));
const aliasChain = () =>
  aliasNode(4, 'button/bg', 'action') + arrow(97, 66) + aliasNode(114, 'color/action', 'blue/500') + arrow(207, 66) + aliasNode(224, 'blue/500', '2B6FD6', true) + text(160, 118, 'заливка кнопки → семантика → палитра', { size: 9, anchor: 'middle' });

export const figmaArt: Record<string, Illustration> = {
  'fc-ov-setup': ill(320, 116, 'Главный компонент — синяя кнопка «Купить»; его экземпляр — синяя кнопка, текст в которой переопределён на «Оплатить»', overrideSetup()),
  'fc-ov-a': ill(140, 100, 'Экземпляр: зелёная кнопка «Оплатить»', overrideTile('Оплатить', true)),
  'fc-ov-b': ill(140, 100, 'Экземпляр: зелёная кнопка «Заказать»', overrideTile('Заказать', true)),
  'fc-ov-c': ill(140, 100, 'Экземпляр: синяя кнопка «Оплатить»', overrideTile('Оплатить', false)),
  'fc-ov-d': ill(140, 100, 'Экземпляр: синяя кнопка «Заказать»', overrideTile('Заказать', false)),
  'fc-menu': ill(320, 196, 'Меню экземпляра Button: Go to main component, Reset all changes, Push changes to main component, Detach instance', instanceMenu(), {
    reset: [40, 92, 240, 28],
    push: [40, 120, 240, 28],
  }),
  'fc-swap-names': ill(320, 124, 'Два компонента: в Button/Primary слои Icon и Label, в Button/Outline — Icon и Text', swapNames()),
  'fc-nested': ill(320, 124, 'Главный компонент Button связан пунктиром с экземпляром кнопки внутри главного компонента «Карточка»', nested()),
  'fc-slot': ill(320, 124, 'Три экземпляра одной карточки: в выделенной пунктиром области у первой список, у второй картинка, у третьей поле и кнопка', slots()),
  'fc-library': ill(320, 126, 'Файл «Библиотека» с компонентами связан с тремя файлами: «Приложение», «Сайт», «Админка»', library()),
  'fc-assets': ill(320, 190, 'Панель ассетов: папка Icon, в ней папка Arrow с компонентами Left и Right, и компонент Close', assets()),
  'fc-publish': ill(320, 196, 'Компоненты в файле: Button, .base/button, Input, Icon/Close', publishList(), { base: [30, 84, 260, 28] }),
  'fp-states': ill(320, 92, 'Четыре кнопки «Купить»: default, hover, pressed и disabled', stateButtons()),
  'fp-variant-names': ill(320, 198, 'Набор вариантов Button: Size=Small, State=Default; Size=Small, State=Hover; Large / Hover; Size=Large, State=Default', variantNames(), {
    wrong: [44, 114, 246, 28],
  }),
  'fp-grid': ill(320, 136, 'Набор вариантов кнопки: два блока, primary и secondary, в каждом три размера по четыре состояния', variantGrid()),
  'fp-interactive': ill(320, 116, 'Набор вариантов: от default к hover идёт прототипная связь On hover → Change to', interactive()),
  'fp-swap-menu': ill(320, 206, 'Меню замены иконки: сверху раздел Preferred с восемью иконками, ниже поиск по всем библиотекам', swapMenu()),
  'fp-exposed': ill(320, 216, 'Панель экземпляра Card: Title, Show badge, а ниже — свойства вложенной кнопки Button, Size: Large', exposedPanel()),
  'fp-hide-a': ill(240, 96, 'Кнопка «Купить»: поля слева и справа одинаковые', hiddenIcon(true)),
  'fp-hide-b': ill(240, 96, 'Кнопка «Купить»: слева от текста пустое место размером с иконку', hiddenIcon(false)),
  'fl-title-wrap': ill(240, 134, 'Карточка в экране телефона: заголовок «Кеды Classic на каждый день» перенесён на две строки', titleCard(true)),
  'fl-title-stretch': ill(240, 134, 'Карточка в экране телефона: заголовок в одну строку растянул карточку за правый край экрана', titleCard(false)),
  'fl-padding-gap': ill(320, 132, 'Кнопка «В корзину» с иконкой: подсвечены поля по краям и промежуток между иконкой и текстом', paddingGap(), {
    gap: [94, 44, 28, 44],
    padding: [40, 30, 240, 16],
  }),
  'fl-baseline-a': ill(240, 90, 'Цена 4 990 и подпись «в месяц» стоят на одной линии', baseline(true)),
  'fl-baseline-b': ill(240, 90, 'Цена 4 990 и подпись «в месяц»: подпись опущена ниже линии цены', baseline(false)),
  'fl-max-width': ill(320, 150, 'Окно браузера на всю ширину: карточка растянута, строки текста очень длинные', maxWidth()),
  'fl-avatars': ill(320, 112, 'Пять аватаров в ряд, каждый наезжает на следующий, левый — сверху', avatarStack()),
  'fl-stroke': ill(320, 100, 'Кнопки «Отмена» и «Сохранить» вплотную; толстая внешняя обводка «Отмены» заходит на «Сохранить»', strokeOverlap()),
  'fl-grid': ill(320, 176, 'Галерея: баннер «Распродажа» занимает две колонки, остальные карточки — по одной в сетке из трёх колонок', gallery()),
  'fl-left-right': ill(320, 124, 'Узкий фрейм с кнопкой «Купить» и тот же фрейм шире: кнопка растянулась, отступы слева и справа те же', leftRight()),
  'fl-scale': ill(320, 112, 'Фрейм шириной 100 со слоем 70, затем фрейм шириной 200 со слоем неизвестной ширины', scaleFrames()),
  'fv-bind-panel': ill(320, 196, 'Панель кнопки: заливка 2B6FD6, скругление 12, текст «Купить», прозрачность 100%', bindPanel(), {
    text: [30, 116, 260, 34],
  }),
  'fv-gradient': ill(320, 150, 'Экран с баннером Premium: фон баннера — градиент от фиолетового к голубому', gradientBanner()),
  'fv-languages': ill(320, 132, 'Три одинаковых экрана на русском, английском и немецком: «Оформить заказ», «Check out», «Zur Kasse gehen»', languages()),
  'fv-collections': ill(320, 120, 'Две коллекции: Theme с режимами Light и Dark, Density с режимами Compact и Regular', collections()),
  'fv-inherit': ill(320, 140, 'Слои: Экран в режиме Dark, внутри Карточка в режиме Auto, внутри Кнопка в режиме Auto', inherit()),
  'fv-scoping': ill(320, 190, 'Настройка color/bg/surface: отмечены заливка фрейма и заливка фигуры, не отмечены цвет текста и обводка', scoping()),
  'fv-code-syntax': ill(320, 130, 'Сниппет Dev Mode: .card { background: var(--color-bg-surface); }', codeSyntax()),
  'fv-counter': ill(320, 120, 'Товар в корзине со счётчиком: минус, 2, плюс', counter()),
  'fv-conditional': ill(320, 170, 'Взаимодействие кнопки «Оформить»: if count == 0 — переход на «Корзина пуста», else — на «Оформление»', conditional()),
  'fv-theme-toggle': ill(320, 140, 'Экран прототипа «Настройки» с переключателем «Тёмная тема»', themeToggle()),

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
  'fl-panel': ill(
    320,
    224,
    'Панель Auto layout: направление — вниз, вправо (выбрано) и с переносом; W — Fill, H — Fixed 180; сетка выравнивания, Gap 12, Padding 16',
    autoLayoutPanel(),
    { wrap: [224, 52, 48, 34], height: [164, 90, 124, 32] },
  ),
  'fl-labels': ill(
    320,
    176,
    'Карточка в режиме выделения: картинка с подписью Fill × Fixed, строка текста с подписью Fill × Hug и кнопка «Купить» с подписью Hug × Hug',
    sizeLabels(),
    { hug: [204, 104, 88, 56] },
  ),
  'fl-truncate': ill(
    320,
    184,
    'Карточка «Кеды Classic» с описанием на пять строк, а рядом та же карточка, где описание сокращено до двух строк с многоточием',
    truncate(),
  ),
  'fc-glyph-instance': ill(160, 64, 'Слой Button со значком ромба-контура', layerTile(instanceGlyph)),
  'fc-glyph-frame': ill(160, 64, 'Слой Button со значком фрейма — решёткой', layerTile(frameGlyph)),
  'fc-glyph-main': ill(160, 64, 'Слой Button со значком из четырёх ромбов', layerTile(mainGlyph)),
  'fc-glyph-group': ill(160, 64, 'Слой Button со значком группы — пунктирным квадратом', layerTile(groupGlyph)),
  'fc-tree-instance': ill(240, 130, 'Слои карточки: Фото, текст «Кеды Classic» и экземпляр Button', cardTree(true)),
  'fc-tree-drawn': ill(240, 130, 'Слои карточки: Фото, текст «Кеды Classic», прямоугольник Rectangle 12 и отдельный текст «Купить»', cardTree(false)),
  'fp-nested-panel': ill(
    320,
    234,
    'Панель экземпляра Card: Title — «Новинка», Show badge — включено; ниже раздел Button со свойствами Size — Small и Label — «Купить»',
    nestedPanel(),
    { nested: [28, 126, 264, 92] },
  ),
  'fp-names-good': ill(240, 120, 'Свойства кнопки: Size — Large, State — Hover, Show icon — true', namesPanel(true)),
  'fp-names-bad': ill(240, 120, 'Свойства кнопки: Property 1 — Variant2, Property 2 — Default, Property 3 — true', namesPanel(false)),
  'fp-icons-variants': ill(240, 130, 'Набор из 20 вариантов кнопки, по одному на каждую иконку: Icon=Plus, Icon=Search и так далее', iconVariants()),
  'fp-icons-swap': ill(240, 130, 'Одна кнопка Add и свойство Icon с выпадающим списком, где выбрана иконка Plus', iconSwap()),
  'fv-vars-flat': ill(240, 150, 'Плоский список переменных: surface, textPrimary, primaryBtn, bg2, secondaryText, errorRed, linkBlue, ok', varsFlat()),
  'fv-vars-grouped': ill(240, 150, 'Переменные по группам: color/bg — surface и secondary, color/text — primary и secondary, color/action — primary и danger', varsGrouped()),
  'fv-alias-chain': ill(
    320,
    128,
    'Цепочка: переменная button/bg ссылается на color/action, та — на blue/500 со значением 2B6FD6',
    aliasChain(),
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
