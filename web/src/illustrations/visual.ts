import { button, card, circle, field, icon, ill, lines, path, rect, screen, text, title, type Illustration } from './kit';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Текст с межбуквенным интервалом (em) — в kit.text его нет */
const tracked = (x: number, y: number, s: string, size: number, ls: number, weight = 700) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" style="letter-spacing:${ls}em" class="wf-t-ink">${esc(s)}</text>`;

/** Строки абзаца с заданным шагом */
const para = (x: number, y: number, rows: string[], step: number, size = 10, anchor: 'start' | 'middle' = 'start') =>
  rows.map((r, i) => text(x, y + i * step, r, { size, cls: 'ink', anchor })).join('');

/** Длина строки: абзац серыми полосами во всю ширину или в узкой колонке */
const measure = (long: boolean) => {
  const widths = long ? [276, 270, 276, 262, 276, 180] : [150, 144, 152, 138, 150, 96];
  const x = long ? 22 : 85;
  return screen(10, 10, 300, 130) + title(x, 34, 'Как выбрать велосипед', 12) + lines(x, 48, widths, 12, 5) + text(160, 128, long ? 'около 130 знаков в строке' : 'около 65 знаков в строке', { size: 9, anchor: 'middle' });
};

const LEADING = ['Заказ привезём в пункт', 'выдачи за три дня. Хранить', 'его будем неделю, потом', 'вернём продавцу.'];
const leading = (step: number) => screen(10, 8, 180, 114, 12) + para(24, 36, LEADING, step, 11);

/** Подпись капсом: с разрядкой или без */
const caps = (ls: number) => screen(12, 8, 216, 74, 12) + tracked(28, 40, 'НОВИНКИ НЕДЕЛИ', 12, ls) + lines(28, 54, [150, 110], 9, 4);

/** Цифры: каждый знак ставится вручную — табличные одной ширины, пропорциональные разной */
const AMOUNTS = ['1 111,10', '48 090,00', '7 711,71', '19 480,50'];
const advance = (c: string, tabular: boolean) => (c === ' ' ? 3.5 : c === ',' ? 3.5 : tabular ? 7 : c === '1' ? 4.2 : 7);
const amount = (right: number, y: number, s: string, tabular: boolean) => {
  let x = right;
  let out = '';
  for (const c of [...s].reverse()) {
    const a = advance(c, tabular);
    x -= a;
    out += text(x + a / 2, y, c, { size: 12, cls: 'ink', anchor: 'middle' });
  }
  return out;
};
const numbers = (tabular: boolean) =>
  screen(12, 8, 216, 134, 12) +
  text(28, 32, 'Заказ', { size: 9 }) +
  text(204, 32, 'Сумма, ₽', { size: 9, anchor: 'end' }) +
  AMOUNTS.map((s, i) => text(28, 56 + i * 22, `№ ${4810 + i * 7}`, { size: 11, cls: 'ink' }) + amount(204, 56 + i * 22, s, tabular)).join('');

/** Статья с тремя типографическими ошибками */
const typeSpot = () =>
  screen(20, 10, 280, 300) +
  title(36, 38, 'Как выбрать велосипед', 14) +
  para(36, 60, ['Начните с того, где будете кататься: город,', 'лесные тропы или шоссе. От этого зависит', 'всё остальное — рама, колёса и передачи.'], 14) +
  para(36, 112, ['НЕ ПОКУПАЙТЕ ВЕЛОСИПЕД, НЕ ПРОКАТИВШИСЬ', 'НА НЁМ ХОТЯ БЫ ПЯТЬ МИНУТ. РАЗМЕР РАМЫ', 'ПО ТАБЛИЦЕ ЕЩЁ НЕ ГАРАНТИЯ УДОБСТВА.'], 14, 9) +
  text(36, 170, 'Размер рамы', { size: 12, weight: 700, cls: 'ink' }) +
  para(160, 192, ['Встаньте над рамой: между ней', 'и телом должно оставаться', 'несколько сантиметров для городского', 'велосипеда.'], 13, 10, 'middle') +
  para(36, 268, ['Для горного запас нужен больше — около', 'ладони. Колени при посадке не должны', 'упираться в руль на поворотах.'], 9) +
  '';
const TYPE_ZONES: Illustration['zones'] = { caps: [30, 100, 260, 48], centered: [30, 180, 260, 50], tight: [30, 258, 260, 38] };

/** Карточка концерта: всё одинаковое или с иерархией */
const hierarchy = (clear: boolean) =>
  screen(12, 8, 216, 184, 12) +
  rect(26, 22, 188, 56, 'block', 8) +
  (clear
    ? text(28, 102, 'Концерт «Мельница»', { size: 15, weight: 700, cls: 'ink' }) +
      text(28, 120, 'Сб, 14 ноября · 19:00 · Дом культуры', { size: 9 }) +
      text(28, 146, 'от 1 800 ₽', { size: 13, weight: 700, cls: 'ink' }) +
      button(28, 156, 184, 26, 'Купить билет')
    : text(28, 98, 'КОНЦЕРТ «МЕЛЬНИЦА»', { size: 10, cls: 'ink' }) +
      text(28, 114, 'СБ, 14 НОЯБРЯ · 19:00', { size: 10, cls: 'ink' }) +
      text(28, 130, 'ДОМ КУЛЬТУРЫ', { size: 10, cls: 'ink' }) +
      text(28, 146, 'ОТ 1 800 ₽', { size: 10, cls: 'ink' }) +
      button(28, 156, 184, 26, 'КУПИТЬ БИЛЕТ', 'outline'));

/** Сетка 2 колонки: одна карточка уехала в поле и межколонник */
const COL = [40, 168];
const gridBreak = () =>
  screen(20, 10, 280, 210) +
  COL.map((x) => `<rect x="${x}" y="22" width="112" height="188" class="wf-accent-soft" opacity="0.4"/>`).join('') +
  [0, 1].flatMap((row) =>
    COL.map((x, c) => {
      const broken = row === 1 && c === 1;
      const cx = broken ? x + 14 : x;
      const cy = 30 + row * 90 + (broken ? 6 : 0);
      return card(cx, cy, 112, 80, 8) + rect(cx + 8, cy + 8, 96, 36, 'block', 6) + lines(cx + 8, cy + 52, [80, 50], 10, 5);
    }),
  ).join('');

/** Список новостей: расстояния внутри и между элементами */
const NEWS: [string, string][] = [
  ['Метро продлит работу', 'В выходные станции открыты до 2:00'],
  ['Открылся новый парк', 'Вход свободный, есть прокат лодок'],
  ['Ремонт моста', 'Объезд по набережной до декабря'],
];
const spacing = (clear: boolean) => {
  const inner = clear ? 14 : 24;
  const outer = clear ? 30 : 18;
  return (
    screen(12, 8, 216, 154, 12) +
    NEWS.map(([h, d], i) => {
      const y = 36 + i * (inner + outer);
      return text(28, y, h, { size: 12, weight: 700, cls: 'ink' }) + text(28, y + inner, d, { size: 10 });
    }).join('')
  );
};

/** Дашборд: шесть ярких цветов или нейтральная база с одним акцентом */
const colors = (calm: boolean) => {
  const tiles = calm ? ['card', 'card', 'card', 'card'] : ['accent', 'danger', 'success', 'warning-shape'];
  return (
    screen(12, 8, 216, 184, 12) +
    text(28, 34, 'Мои финансы', { size: 13, weight: 700, cls: calm ? 'ink' : 'danger' }) +
    tiles.map((cls, i) => rect(28 + (i % 2) * 94, 46 + Math.floor(i / 2) * 50, 88, 42, cls, 8) + lines(36 + (i % 2) * 94, 58 + Math.floor(i / 2) * 50, [44, 60], 10, 5)).join('') +
    (calm ? button(28, 152, 182, 26, 'Пополнить') : rect(28, 152, 88, 26, 'success', 8) + rect(122, 152, 88, 26, 'warning-shape', 8) + text(72, 169, 'Пополнить', { size: 10, weight: 600, cls: 'on-accent', anchor: 'middle' }) + text(166, 169, 'Вывести', { size: 10, weight: 600, cls: 'ink', anchor: 'middle' }))
  );
};

/** Редактирование профиля: «Сохранить» покрашена в красный */
const redSave = () =>
  screen(20, 10, 280, 200) +
  title(36, 38, 'Профиль') +
  field(36, 64, 248, 26, { label: 'Имя', value: 'Анна' }) +
  field(36, 112, 248, 26, { label: 'Город', value: 'Казань' }) +
  button(36, 152, 120, 30, 'Сохранить', 'danger') +
  button(164, 152, 120, 30, 'Отмена', 'secondary') +
  text(160, 200, 'Удалить аккаунт', { size: 9, anchor: 'middle' });

/** Тёмная тема с фиксированными цветами: одна картинка товара на белом фоне светится */
const DARK = { bg: '#000000', card: '#1c1c1e', fill: '#3a3a3c', text: '#f2f2f7', sub: '#98989f' };
const dk = (x: number, y: number, w: number, h: number, fill: string, r = 8) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
const dt = (x: number, y: number, s: string, size: number, fill: string, weight = 400) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
const darkGlow = () =>
  dk(20, 10, 280, 220, DARK.bg, 14) +
  dt(36, 38, 'Каталог', 14, DARK.text, 700) +
  [0, 1].map((c) => {
    const x = 36 + c * 128;
    const white = c === 1;
    return (
      dk(x, 50, 120, 164, DARK.card, 10) +
      dk(x + 8, 58, 104, 92, white ? '#ffffff' : DARK.fill, 8) +
      `<path d="M${x + 30} ${white ? 128 : 128}c10-16 26-20 44-14 8 3 14 8 14 14z" fill="${white ? '#d1d1d6' : '#636366'}"/>` +
      dt(x + 8, 170, c ? 'Кроссовки' : 'Кеды', 11, DARK.text, 600) +
      dt(x + 8, 186, c ? '6 490 ₽' : '3 990 ₽', 10, DARK.sub)
    );
  }).join('');

/** Экран с тремя обманками кликабельности */
const clickSpot = () =>
  screen(20, 10, 280, 250) +
  rect(36, 26, 132, 30, 'accent', 15) +
  text(102, 45, 'Акции недели', { size: 11, weight: 600, cls: 'on-accent', anchor: 'middle' }) +
  `<g>${text(36, 96, 'Бесплатная доставка от 2 000 ₽', { size: 11, cls: 'accent' })}${path('M36 99H210', 'stroke-accent')}</g>` +
  lines(36, 110, [240, 200], 10, 5) +
  card(36, 136, 248, 64, 10) +
  rect(44, 144, 48, 48, 'block', 8) +
  text(102, 160, 'Велосипед', { size: 11, weight: 600, cls: 'ink' }) +
  text(102, 176, '24 900 ₽', { size: 10 }) +
  button(204, 156, 72, 26, 'Купить') +
  rect(36, 214, 248, 34, 'block', 10) +
  icon('home', 52, 223, 16, 'stroke') +
  icon('search', 116, 223, 16, 'stroke') +
  icon('bolt', 180, 223, 16, 'stroke') +
  icon('user', 244, 223, 16, 'stroke');
const CLICK_ZONES: Illustration['zones'] = { fakebtn: [34, 24, 136, 34], fakelink: [34, 84, 180, 20], mystery: [172, 216, 34, 30] };

export const visualArt: Record<string, Illustration> = {
  'vd-measure-long': ill(320, 150, 'Абзац растянут почти на всю ширину экрана: около 130 знаков в строке', measure(true)),
  'vd-measure-ok': ill(320, 150, 'Тот же абзац в колонке посередине: около 65 знаков в строке', measure(false)),
  'vd-leading-110': ill(200, 130, 'Четыре строки текста почти вплотную друг к другу', leading(12)),
  'vd-leading-135': ill(200, 130, 'Четыре строки текста с умеренным расстоянием между строками', leading(15)),
  'vd-leading-180': ill(200, 130, 'Четыре строки текста с очень большим расстоянием между строками', leading(21)),
  'vd-caps-tracked': ill(240, 90, 'Подпись «НОВИНКИ НЕДЕЛИ» капсом с небольшой разрядкой между буквами', caps(0.1)),
  'vd-caps-tight': ill(240, 90, 'Подпись «НОВИНКИ НЕДЕЛИ» капсом без разрядки, буквы плотно', caps(-0.02)),
  'vd-nums-tabular': ill(240, 150, 'Таблица сумм: цифры одной ширины, разряды стоят друг под другом', numbers(true)),
  'vd-nums-proportional': ill(240, 150, 'Таблица сумм: цифры разной ширины, единицы уже остальных, разряды не совпадают по вертикали', numbers(false)),
  'vd-type-spot': ill(
    320,
    320,
    'Статья «Как выбрать велосипед»: обычный абзац; абзац целиком капсом; подзаголовок «Размер рамы»; абзац, выровненный по центру; абзац со строками почти вплотную',
    typeSpot(),
    TYPE_ZONES,
  ),
  'vd-hier-flat': ill(240, 200, 'Карточка концерта: название, дата, место и цена одним размером капсом, кнопка «Купить билет» контурная', hierarchy(false)),
  'vd-hier-clear': ill(240, 200, 'Карточка концерта: крупное жирное название, мелкие серые дата и место, жирная цена и заметная кнопка «Купить билет»', hierarchy(true)),
  'vd-grid-break': ill(
    320,
    230,
    'Сетка из двух колонок с четырьмя карточками товаров; нижняя правая карточка сдвинута вправо и вниз и заходит за край колонки',
    gridBreak(),
    { broken: [180, 124, 116, 84] },
  ),
  'vd-space-ambiguous': ill(240, 170, 'Три новости: между заголовком и его описанием расстояние больше, чем между новостями', spacing(false)),
  'vd-space-clear': ill(240, 170, 'Три новости: описание прижато к своему заголовку, между новостями заметный отступ', spacing(true)),
  'vd-color-chaos': ill(240, 200, 'Дашборд «Мои финансы»: красный заголовок, четыре плитки разных ярких цветов, зелёная и жёлтая кнопки', colors(false)),
  'vd-color-calm': ill(240, 200, 'Дашборд «Мои финансы»: нейтральные серые плитки и одна акцентная кнопка «Пополнить»', colors(true)),
  'vd-red-save': ill(
    320,
    214,
    'Экран «Профиль»: поля «Имя» и «Город», красная кнопка «Сохранить», серая «Отмена» и мелкая ссылка «Удалить аккаунт»',
    redSave(),
    { save: [36, 152, 120, 30] },
  ),
  'vd-dark-glow': ill(
    320,
    240,
    'Каталог в тёмной теме: у кед тёмная подложка, у кроссовок — ярко-белый фон фотографии',
    darkGlow(),
    { white: [164, 50, 120, 164] },
  ),
  'vd-click-spot': ill(
    320,
    270,
    'Экран магазина: заголовок «Акции недели» на синей плашке-пилюле; синий подчёркнутый текст «Бесплатная доставка от 2 000 ₽»; карточка товара «Велосипед» с кнопкой «Купить»; нижняя панель с иконками дома, поиска, молнии и профиля без подписей',
    clickSpot(),
    CLICK_ZONES,
  ),
};

export const visualTrackArt: Record<string, Illustration> = {
  'track-visual-design': ill(
    320,
    112,
    '',
    card(24, 14, 84, 84, 12) +
      text(66, 72, 'Aa', { size: 36, weight: 700, cls: 'ink', anchor: 'middle' }) +
      card(120, 14, 84, 84, 12) +
      ['accent', 'success', 'warning-shape', 'danger'].map((c, i) => circle(144 + (i % 2) * 36, 38 + Math.floor(i / 2) * 36, 12, c)).join('') +
      card(216, 14, 84, 84, 12) +
      [0, 1, 2].map((i) => rect(228 + i * 22, 26, 16, 60, 'accent-soft', 3)).join(''),
  ),
};
