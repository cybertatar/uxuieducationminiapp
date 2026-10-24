import { button, card, circle, field, icon, ill, lines, path, rect, screen, text, title, type Illustration } from './kit';

const tile = (w: number, h: number) => rect(0, 0, w, h, 'tile', 12);

/** Форма поиска из примера Брэда Фроста: подпись, поле и кнопка */
const searchForm = (x: number, y: number, w: number, label = true) =>
  field(x, y, w - 30, 24, { label: label ? 'Поиск по сайту' : undefined, placeholder: 'Найти…' }) + rect(x + w - 26, y, 26, 24, 'accent', 6) + icon('search', x + w - 20, y + 5, 14, 'stroke-on-accent');

/** Тарифы: три карточки с кнопками; у средней — «самодельная» кнопка или выделение средствами системы */
const plans = (rogue: boolean) =>
  screen(20, 10, 280, 210) +
  title(36, 38, 'Тарифы') +
  (['Базовый', 'Семейный', 'Премиум'] as const)
    .map((name, i) => {
      const y = 52 + i * 54;
      const popular = i === 1;
      const btn = popular && rogue
        ? `<rect x="206" y="${y + 10}" width="70" height="28" rx="14" fill="#9b51e0"/><text x="241" y="${y + 28}" font-size="12" font-weight="800" text-anchor="middle" fill="#ffffff">Выбрать!</text>`
        : button(206, y + 11, 70, 26, 'Выбрать');
      return (
        (popular && !rogue ? rect(32, y, 256, 46, 'tonal', 8) : card(32, y, 256, 46, 8)) +
        text(46, y + 20, name, { size: 12, weight: 700, cls: 'ink' }) +
        text(46, y + 36, ['199 ₽ в месяц', '349 ₽ в месяц', '599 ₽ в месяц'][i], { size: 10 }) +
        (popular && !rogue ? rect(124, y + 9, 64, 16, 'accent', 8) + text(156, y + 20.5, 'Популярный', { size: 8, weight: 600, cls: 'on-accent', anchor: 'middle' }) : '') +
        btn
      );
    })
    .join('');

/** Панель цветовых переменных; четвёртая — с неудачным именем или исправленным */
const tokensPanel = (fixed: boolean) =>
  screen(20, 10, 280, 220) +
  title(36, 36, 'Переменные: цвет') +
  path('M20 48H300', 'divider') +
  ([
    ['color/text/primary', 'ink-shape'],
    ['color/text/secondary', 'block'],
    ['color/bg/surface', 'field'],
    [fixed ? 'color/text/danger' : 'color/red2', 'danger'],
    ['color/border/default', 'field-focus'],
    ['color/action/primary', 'accent'],
  ] as const)
    .map(([name, cls], i) => {
      const y = 56 + i * 28;
      return rect(36, y + 4, 16, 16, cls, 4) + text(62, y + 16, name, { size: 11, cls: 'ink' });
    })
    .join('');

/** Поле ввода в одном из состояний — для спецификации компонента */
const stateField = (x: number, y: number, state: 'default' | 'focus' | 'error' | 'disabled') => {
  const label = { default: 'По умолчанию', focus: 'Фокус', error: 'Ошибка', disabled: 'Неактивно' }[state];
  if (state === 'disabled') return text(x, y - 5, label, { size: 9 }) + rect(x, y, 120, 24, 'block', 6) + text(x + 8, y + 16, 'Анна', { size: 11, cls: 'muted' });
  return field(x, y, 120, 24, {
    label,
    value: state === 'default' ? undefined : 'Анна',
    placeholder: state === 'default' ? 'Имя' : undefined,
    state: state === 'default' ? undefined : state,
    hint: state === 'error' ? 'Только буквы' : undefined,
  });
};

/** Полная спецификация или такая же по объёму, но из вариаций обычного вида и ошибки — без фокуса и неактивного */
const states = (full: boolean) =>
  screen(10, 10, 300, 170) +
  title(26, 36, 'Поле ввода · состояния', 12) +
  (full
    ? stateField(26, 64, 'default') + stateField(170, 64, 'focus') + stateField(26, 128, 'error') + stateField(170, 128, 'disabled')
    : stateField(26, 64, 'default') +
      field(170, 64, 120, 24, { label: 'Заполнено', value: 'Анна' }) +
      field(26, 128, 120, 24, { label: 'Ошибка · пусто', placeholder: 'Имя', state: 'error', hint: 'Обязательное поле' }) +
      stateField(170, 128, 'error'));

/** Экран в тёмной теме с фиксированными цветами; в «зашитом» варианте карточка и заголовок не перекрасились */
const darkScreen = (hardcoded: boolean) =>
  `<rect x="20" y="10" width="200" height="170" rx="14" fill="#1c1c1e"/>` +
  `<text x="34" y="38" font-size="13" font-weight="700" fill="${hardcoded ? '#1f1f1f' : '#f2f2f7'}">Мои заказы</text>` +
  `<rect x="32" y="52" width="176" height="56" rx="10" fill="${hardcoded ? '#ffffff' : '#2c2c2e'}"/>` +
  `<text x="44" y="74" font-size="11" font-weight="600" fill="${hardcoded ? '#1f1f1f' : '#f2f2f7'}">Заказ №1042</text>` +
  `<text x="44" y="92" font-size="9" fill="${hardcoded ? '#6b6b6b' : '#a1a1a6'}">Передан в доставку</text>` +
  `<rect x="32" y="118" width="176" height="20" rx="6" fill="#2c2c2e"/>` +
  `<rect x="40" y="126" width="110" height="4" rx="2" fill="#48484a"/>` +
  `<rect x="32" y="146" width="176" height="24" rx="8" fill="#4c8dff"/>` +
  `<text x="120" y="162" font-size="10" font-weight="600" text-anchor="middle" fill="#ffffff">Отследить</text>`;

/** Панель свойств выделенной кнопки, как в Dev Mode */
const inspectRow = (y: number, prop: string, value: string, linked: boolean) =>
  text(36, y, prop, { size: 10 }) +
  (linked ? rect(118, y - 12, 162, 18, 'tonal', 5) + icon('link', 124, y - 10, 12, 'stroke-accent') : '') +
  text(linked ? 142 : 124, y, value, { size: 10, weight: 600, cls: 'ink' });

const inspect = () =>
  screen(20, 10, 280, 200) +
  title(36, 36, 'Кнопка · primary', 12) +
  button(196, 22, 84, 24, 'Оплатить') +
  path('M20 56H300', 'divider') +
  inspectRow(80, 'Заливка', 'color/action/primary', true) +
  inspectRow(108, 'Текст', 'color/text/on-action', true) +
  inspectRow(136, 'Скругление', 'radius/m', true) +
  inspectRow(164, 'Отступы', 'spacing/s', true) +
  inspectRow(192, 'Обводка', '#3A7BD5', false);

/** Список семантических токенов: два названия описывают внешний вид, а не назначение */
const tokenNamesSpot = () =>
  screen(10, 10, 300, 200) +
  title(24, 34, 'Токены', 12) +
  path('M10 46H310', 'divider') +
  ['color/action/primary', 'color/text/red', 'color/bg/surface', 'spacing/md', 'button/blue/bg', 'radius/card']
    .map((n, i) => icon('sparkle', 24, 58 + i * 24, 12, 'stroke-muted') + text(44, 68 + i * 24, n, { size: 11, cls: 'ink' }))
    .join('');

/** Кривая анимации по контрольным точкам cubic-bezier в квадрате 100×100 */
const curve = (p: [number, number, number, number], label: string) => {
  const X = (v: number) => 40 + v * 170;
  const Y = (v: number) => 100 - v * 76;
  return (
    tile(240, 124) +
    path('M40 18V100H210', 'stroke-muted') +
    path(`M${X(0)} ${Y(0)}C${X(p[0])} ${Y(p[1])} ${X(p[2])} ${Y(p[3])} ${X(1)} ${Y(1)}`, 'stroke-accent-bold', 'fill="none"') +
    text(125, 116, 'время →', { size: 8, anchor: 'middle' }) +
    text(40, 13, `↑ ${label}`, { size: 8 })
  );
};

/** Доска инвентаризации: девять почти одинаковых синих кнопок с сайта */
const inventoryBoard = () =>
  card(10, 10, 300, 150, 10) +
  title(24, 32, 'Кнопки: что нашли на сайте', 11) +
  (
    [
      [6, 'Купить'],
      [10, 'Купить'],
      [2, 'КУПИТЬ'],
      [16, 'Купить'],
      [6, 'В корзину'],
      [0, 'Купить'],
      [8, 'Заказать'],
      [12, 'купить'],
      [4, 'Купить'],
    ] as const
  )
    .map(([r, l], i) => {
      const x = 24 + (i % 3) * 94;
      const y = 46 + Math.floor(i / 3) * 36;
      const w = [76, 70, 82][i % 3];
      return rect(x, y, w, 26 - (i % 2) * 4, i % 4 === 3 ? 'accent-soft' : 'accent', r) + text(x + w / 2, y + 17 - (i % 2) * 2, l, { size: 9, weight: i % 3 === 0 ? 700 : 500, cls: 'on-accent', anchor: 'middle' });
    })
    .join('');

export const systemsArt: Record<string, Illustration> = {
  'ds-atom': ill(140, 100, 'Отдельная кнопка «Найти»', tile(140, 100) + button(30, 38, 80, 26, 'Найти')),
  'ds-molecule': ill(140, 100, 'Форма поиска: подпись «Поиск по сайту», поле и кнопка с лупой', tile(140, 100) + searchForm(12, 44, 116)),
  'ds-organism': ill(
    140,
    100,
    'Шапка сайта: логотип, пункты меню и форма поиска',
    tile(140, 100) +
      card(8, 18, 124, 66, 8) +
      circle(22, 32, 7, 'accent') +
      [34, 56, 78].map((x) => rect(x, 29, 18, 5, 'block', 2.5)).join('') +
      searchForm(16, 50, 108, false),
  ),
  'ds-template': ill(
    140,
    100,
    'Раскладка страницы с серыми блоками-заглушками вместо контента',
    tile(140, 100) +
      rect(12, 12, 116, 14, 'block', 4) +
      rect(12, 32, 116, 26, 'block', 4) +
      [12, 52, 92].map((x) => rect(x, 64, 36, 24, 'block', 4)).join(''),
  ),
  'ds-token-chain': ill(
    320,
    104,
    'Цепочка токенов: примитив blue.600 (#2B6FD6) → семантический action.primary → компонентный button.bg → кнопка',
    (
      [
        [4, 'Примитив', 'blue.600'],
        [114, 'Семантика', 'action.primary'],
        [224, 'Компонент', 'button.bg'],
      ] as const
    )
      .map(([x, caption, name], i) =>
        text(x + 46, 18, caption, { size: 9, anchor: 'middle' }) +
        card(x, 26, 92, 32, 8) +
        (i === 0 ? `<rect x="${x + 7}" y="34" width="16" height="16" rx="4" fill="#2b6fd6"/>` : rect(x + 7, 34, 16, 16, 'accent', 4)) +
        text(x + 28, 46, name, { size: 9, weight: 600, cls: 'ink' }) +
        (i < 2 ? path(`M${x + 95} 42h14M${x + 105} 38l4 4-4 4`, 'stroke-accent', 'fill="none"') : ''),
      )
      .join('') +
      text(50, 74, '#2B6FD6', { size: 9, anchor: 'middle' }) +
      button(238, 68, 64, 26, 'Купить'),
  ),
  'ds-tokens-panel': ill(320, 240, 'Панель цветовых переменных: color/text/primary, color/text/secondary, color/bg/surface, color/red2, color/border/default, color/action/primary', tokensPanel(false), {
    token: [30, 136, 260, 28],
  }),
  'ds-tokens-panel-fixed': ill(320, 240, 'Та же панель: вместо color/red2 переменная color/text/danger', tokensPanel(true)),
  'ds-rogue': ill(320, 230, 'Тарифы: у трёх карточек кнопки «Выбрать», у средней кнопка своего фиолетового цвета, круглая и с восклицательным знаком', plans(true), {
    button: [200, 108, 82, 40],
  }),
  'ds-rogue-fixed': ill(320, 230, 'Те же тарифы: все кнопки одинаковые, средняя карточка выделена тональным фоном и бейджем «Популярный»', plans(false)),
  'ds-states-full': ill(320, 190, 'Спецификация поля ввода: состояния «по умолчанию», «фокус», «ошибка» с подсказкой и «неактивно»', states(true)),
  'ds-dark-tokens': ill(240, 190, 'Тёмная тема: фон, карточка заказа и текст перекрасились, всё читается', darkScreen(false)),
  'ds-dark-hardcoded': ill(240, 190, 'Тёмная тема: фон тёмный, но карточка заказа осталась белой, а заголовок «Мои заказы» — чёрным и почти не виден', darkScreen(true)),
  'ds-inspect': ill(
    320,
    220,
    'Свойства кнопки: заливка, текст, скругление и отступы связаны с переменными, а обводка задана значением #3A7BD5',
    inspect(),
    { hex: [30, 176, 260, 24] },
  ),
  'ds-card-product': ill(
    240,
    170,
    'Карточка: фото, название «Кеды Classic», цена 4 990 ₽ и кнопка «В корзину»',
    screen(10, 10, 220, 150) +
      card(60, 20, 120, 132, 10) +
      rect(68, 28, 104, 56, 'block', 6) +
      path('M84 74l18-22 14 16 10-10 14 16', 'stroke-muted', 'fill="none"') +
      text(70, 100, 'Кеды Classic', { size: 10, weight: 600, cls: 'ink' }) +
      text(70, 114, '4 990 ₽', { size: 10 }) +
      button(70, 122, 100, 22, 'В корзину'),
  ),
  'ds-states-partial': ill(320, 190, 'Спецификация поля ввода: «по умолчанию», «заполнено» и две ошибки — пустое поле и неверный формат', states(false)),
  'ds-names-spot': ill(
    320,
    220,
    'Список токенов: color/action/primary, color/text/red, color/bg/surface, spacing/md, button/blue/bg, radius/card',
    tokenNamesSpot(),
    { red: [18, 80, 200, 22], blue: [18, 152, 200, 22] },
  ),
  'ds-curve-decel': ill(240, 124, 'Кривая: быстро набирает значение в начале и плавно замедляется к концу', curve([0, 0, 0.5, 1], 'значение')),
  'ds-curve-accel': ill(240, 124, 'Кривая: медленно стартует и резко ускоряется к концу', curve([0.5, 0, 1, 1], 'значение')),
  'ds-inventory': ill(320, 170, 'Доска инвентаризации: девять синих кнопок с разными скруглениями, размерами, регистром и подписями «Купить», «В корзину», «Заказать»', inventoryBoard()),
};

export const systemsTrackArt: Record<string, Illustration> = {
  'track-design-systems': ill(
    320,
    112,
    '',
    circle(40, 56, 14, 'accent') +
      path('M64 56h16M76 52l4 4-4 4', 'stroke-bold', 'fill="none"') +
      searchForm(92, 44, 86, false) +
      path('M188 56h16M200 52l4 4-4 4', 'stroke-bold', 'fill="none"') +
      card(214, 18, 92, 76, 10) +
      circle(228, 32, 6, 'accent') +
      [240, 262].map((x) => rect(x, 30, 16, 5, 'block', 2.5)).join('') +
      lines(224, 48, [70, 52], 9) +
      button(224, 68, 72, 18, ''),
  ),
};
