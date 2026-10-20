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

const states = (full: boolean) =>
  screen(10, 10, 300, 170) +
  title(26, 36, 'Поле ввода · состояния', 12) +
  stateField(26, 64, 'default') +
  stateField(170, 64, full ? 'focus' : 'error') +
  (full ? stateField(26, 128, 'error') + stateField(170, 128, 'disabled') : '');

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
  'ds-states-partial': ill(320, 190, 'Спецификация поля ввода: только состояния «по умолчанию» и «ошибка»', states(false)),
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
