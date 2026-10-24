import { button, card, circle, icon, ill, lines, path, rect, screen, scrim, text, title, type Illustration } from './kit';

const tile = (w: number, h: number) => rect(0, 0, w, h, 'tile', 12);

// ---------- iOS ----------

/** iOS-алерт: заголовок, текст и ряд из двух кнопок-текстов с разделителями */
const iosAlert = (x: number, y: number, w: number, heading: string, body: string, left: [string, string], right: [string, string]) => {
  const h = body ? 96 : 80;
  const by = y + h - 30;
  return (
    card(x, y, w, h, 14) +
    text(x + w / 2, y + 26, heading, { size: 12, weight: 700, cls: 'ink', anchor: 'middle' }) +
    (body ? text(x + w / 2, y + 44, body, { size: 10, anchor: 'middle' }) : '') +
    path(`M${x} ${by}H${x + w}M${x + w / 2} ${by}V${y + h}`, 'divider') +
    text(x + w / 4, by + 19, left[0], { size: 11, weight: 600, cls: left[1] as never, anchor: 'middle' }) +
    text(x + (3 * w) / 4, by + 19, right[0], { size: 11, weight: 600, cls: right[1] as never, anchor: 'middle' })
  );
};

const backdrop = (w: number, h: number) => screen(10, 10, w - 20, h - 20) + lines(26, 28, [120, 160, 140, 170, 120], 14, 6) + scrim(10, 10, w - 20, h - 20);

/** Таб-бар iOS: иконки с подписями */
const iosTabbar = (x: number, y: number, w: number, items: [string, string][], active = 0) => {
  const step = w / items.length;
  return (
    rect(x, y, w, 40, 'card', 0) +
    path(`M${x} ${y}H${x + w}`, 'divider') +
    items
      .map(([ic, label], i) => {
        const cx = x + step * i + step / 2;
        return icon(ic, cx - 7, y + 6, 14, i === active ? 'stroke-accent' : 'stroke') + text(cx, y + 33, label, { size: 8, cls: i === active ? 'accent' : 'text', anchor: 'middle' });
      })
      .join('')
  );
};

/** Переключатель iOS */
const iosSwitch = (x: number, y: number, on = true) => rect(x, y, 34, 20, on ? 'success' : 'block', 10) + circle(on ? x + 24 : x + 10, y + 10, 8, 'card');

const sheetRow = (x: number, y: number, w: number, label: string, cls: string, weight = 400) =>
  text(x + w / 2, y + 20, label, { size: 11, weight, cls: cls as never, anchor: 'middle' });

/** Значок «облако, солнце, дождь» из трёх слоёв — для вопроса о режимах SF Symbols */
const weather = (cloud: string, sun: string, rain: string) =>
  `<g transform="translate(30 14)">` +
  `<circle cx="38" cy="20" r="11" class="wf-${sun}"/>` +
  `<path d="M22 50h36a12 12 0 0 0 0-24 16 16 0 0 0-30-4 12 12 0 0 0-6 28z" class="wf-${cloud}"/>` +
  `<path d="M28 58l-3 8M42 58l-3 8M56 58l-3 8" class="wf-${rain}"/>` +
  `</g>`;

// ---------- Material ----------

/** Нижняя навигация Material с индикатором-«таблеткой» у активного пункта */
const mdNavbar = (x: number, y: number, w: number, items: [string, string][], active = 0) => {
  const step = w / items.length;
  return (
    // Нижние углы панели повторяют скругление экрана (13 = радиус экрана минус обводка)
    path(`M${x} ${y}H${x + w}V${y + 31}a13 13 0 0 1-13 13H${x + 13}a13 13 0 0 1-13-13z`, 'surface-container') +
    items
      .map(([ic, label], i) => {
        const cx = x + step * i + step / 2;
        return (
          (i === active ? rect(cx - 16, y + 5, 32, 18, 'tonal', 9) : '') +
          icon(ic, cx - 6, y + 8, 12, i === active ? 'stroke-on-tonal' : 'stroke') +
          text(cx, y + 36, label, { size: 7.5, cls: i === active ? 'ink' : 'text', anchor: 'middle' })
        );
      })
      .join('')
  );
};

const fab = (x: number, y: number, size = 40) => rect(x, y, size, size, 'tonal', size * 0.3) + icon('plus', x + size / 2 - 8, y + size / 2 - 8, 16, 'stroke-on-tonal');

const chip = (x: number, y: number, w: number, label: string, opts: { lead?: 'icon' | 'check' | 'avatar'; close?: boolean; selected?: boolean } = {}) => {
  let out = rect(x, y, w, 28, opts.selected ? 'tonal' : 'field', 8);
  let tx = x + 12;
  if (opts.lead === 'icon') {
    out += icon('calendar', x + 8, y + 7, 14, 'stroke-accent');
    tx = x + 28;
  }
  if (opts.lead === 'check') {
    out += icon('check', x + 8, y + 7, 14, 'stroke-on-tonal');
    tx = x + 28;
  }
  if (opts.lead === 'avatar') {
    out += circle(x + 15, y + 14, 9, 'accent') + text(x + 15, y + 17.5, 'А', { size: 9, weight: 700, cls: 'on-accent', anchor: 'middle' });
    tx = x + 30;
  }
  out += text(tx, y + 18, label, { size: 10, weight: 500, cls: opts.selected ? ('on-tonal' as never) : 'ink' });
  if (opts.close) out += icon('close', x + w - 20, y + 8, 12, 'stroke');
  return out;
};

const mdTopBar = (x: number, y: number, w: number, heading: string) =>
  icon('back', x + 10, y + 12, 14) + path(`M${x + 11} ${y + 19}h12`, 'stroke') + title(x + 38, y + 24, heading) + circle(x + w - 16, y + 13, 1.6, 'ink-shape') + circle(x + w - 16, y + 19, 1.6, 'ink-shape') + circle(x + w - 16, y + 25, 1.6, 'ink-shape');

// ---------- Новые сценарии ----------

/** Системный запрос разрешения iOS: заголовок, пояснение и две кнопки */
const iosPermission = (x: number, y: number, heading: string, purpose: string) =>
  card(x, y, 180, 104, 14) +
  text(x + 90, y + 24, heading, { size: 10, weight: 700, cls: 'ink', anchor: 'middle' }) +
  text(x + 90, y + 38, 'к камере', { size: 10, weight: 700, cls: 'ink', anchor: 'middle' }) +
  text(x + 90, y + 56, purpose, { size: 8.5, anchor: 'middle' }) +
  path(`M${x} ${y + 72}H${x + 180}M${x + 90} ${y + 72}V${y + 104}`, 'divider') +
  text(x + 45, y + 92, 'Не разрешать', { size: 10, cls: 'accent', anchor: 'middle' }) +
  text(x + 135, y + 92, 'Разрешить', { size: 10, weight: 600, cls: 'accent', anchor: 'middle' });

/** Строка настроек крупным шрифтом Dynamic Type: переносится или обрезается */
const bigRow = (y: number, label: string[], truncated: string | null) =>
  (truncated
    ? text(36, y + 22, truncated, { size: 16, cls: 'ink' })
    : label.map((l, i) => text(36, y + 22 + i * 20, l, { size: 16, cls: 'ink' })).join('')) +
  icon('chevron', 196, y + 10 + (truncated ? 0 : (label.length - 1) * 10), 14);

/** Экран заметок в iOS: крупный заголовок, список, таб-бар */
const iosNotes = (extra: string) =>
  screen(20, 10, 200, 200) +
  text(34, 52, 'Заметки', { size: 18, weight: 800, cls: 'ink' }) +
  [66, 94, 122].map((y) => lines(34, y, [150, 100], 9, 5) + path(`M34 ${y + 22}H206`, 'divider')).join('') +
  iosTabbar(21, 168, 198, [['folder', 'Папки'], ['search', 'Поиск'], ['gear', 'Настройки']]) +
  extra;

/** Снэкбар Material: одна или две строки, одно или два действия */
const snack = (x: number, y: number, w: number, msg: string, actions: string[], second?: string) => {
  // Длинный снэкбар: текст в две строки, действия — отдельным рядом под ним
  const h = second ? 56 : 28;
  return (
    rect(x, y, w, h, 'toast', 4) +
    text(x + 10, y + 18, msg, { size: 10, cls: 'inverse' }) +
    (second ? text(x + 10, y + 32, second, { size: 10, cls: 'inverse' }) : '') +
    actions.map((a, i) => text(x + w - 10 - i * 64, y + (second ? 49 : 18), a, { size: 10, weight: 700, cls: 'accent-inverse', anchor: 'end' })).join('')
  );
};

const inbox = () => screen(20, 10, 200, 150) + mdTopBar(20, 10, 200, 'Входящие') + [44, 72, 100].map((y) => circle(38, y + 8, 8) + lines(54, y + 2, [90, 140])).join('');

/** Диалог Material поверх списка с двумя текстовыми кнопками */
const mdDialog = (heading: string, left: string, right: string) =>
  screen(20, 10, 200, 150) +
  [44, 72, 100].map((y) => circle(38, y + 8, 8) + lines(54, y + 2, [90, 140])).join('') +
  scrim(20, 10, 200, 150) +
  card(40, 38, 160, 94, 20) +
  text(56, 64, heading, { size: 12, weight: 600, cls: 'ink' }) +
  text(56, 82, 'Это действие нельзя отменить.', { size: 9 }) +
  text(128, 116, left, { size: 11, weight: 700, cls: 'accent', anchor: 'end' }) +
  text(184, 116, right, { size: 11, weight: 700, cls: 'accent', anchor: 'end' });

/** Галерея фото: под системными панелями или в чёрных рамках */
const gallery = (edge: boolean) => {
  const photos = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    .map((i) => rect(22 + (i % 3) * 52, (edge ? 12 : 34) + Math.floor(i / 3) * 52, 50, 50, i % 2 ? 'accent-soft' : 'tonal', 2))
    .join('');
  const bars = edge ? '' : rect(21, 11, 158, 22, 'toast', 0) + rect(21, 196, 158, 23, 'toast', 0);
  const ink = edge ? 'ink' : 'inverse';
  return (
    screen(20, 10, 160, 210) +
    `<clipPath id="g${edge ? 1 : 0}"><rect x="21" y="11" width="158" height="208" rx="13"/></clipPath><g clip-path="url(#g${edge ? 1 : 0})">` +
    photos +
    bars +
    '</g>' +
    text(34, 26, '12:30', { size: 9, weight: 600, cls: ink }) +
    rect(150, 19, 16, 8, edge ? 'ink-shape' : 'card', 2) +
    rect(76, 208, 48, 4, edge ? 'ink-shape' : 'card', 2)
  );
};

/* ---------- HIG: таб-бар с нарушениями, контекстное меню, тулбар шита, page control, уведомления ---------- */

/** Таб-бар: вкладка-действие «+», приглушённая вкладка и вкладка без подписи */
const tabbarSpot = () => {
  const xs = [48, 104, 160, 216, 272];
  return (
    screen(20, 10, 280, 182) +
    title(36, 36, 'Лента') +
    lines(36, 50, [200, 160, 220], 12, 6) +
    rect(36, 92, 248, 44, 'block', 8) +
    rect(20, 146, 280, 46, 'card', 0) +
    path('M20 146H300', 'divider') +
    icon('home', xs[0] - 7, 154, 14, 'stroke-accent') + text(xs[0], 182, 'Главная', { size: 8, cls: 'accent', anchor: 'middle' }) +
    icon('search', xs[1] - 7, 154, 14) + text(xs[1], 182, 'Поиск', { size: 8, anchor: 'middle' }) +
    circle(xs[2], 166, 14, 'accent') + icon('plus', xs[2] - 7, 159, 14, 'stroke-on-accent') +
    `<g opacity="0.35">${icon('heart', xs[3] - 7, 154, 14)}${text(xs[3], 182, 'Избранное', { size: 8, anchor: 'middle' })}</g>` +
    icon('user', xs[4] - 8, 158, 16)
  );
};

/** Контекстное меню письма: «Удалить» в конце или в начале списка */
const contextMenu = (deleteLast: boolean) => {
  const items: [string, string, boolean][] = [
    ['back', 'Ответить', false],
    ['chevron', 'Переслать', false],
    ['star', 'Пометить', false],
  ];
  const all = deleteLast ? [...items, ['trash', 'Удалить', true] as [string, string, boolean]] : [['trash', 'Удалить', true] as [string, string, boolean], ...items];
  return (
    tile(240, 176) +
    card(40, 10, 160, 40, 10) +
    lines(52, 22, [100, 70], 10, 5) +
    card(40, 58, 160, 108, 12) +
    all
      .map(([ic, label, danger], i) => {
        const y = 58 + i * 27;
        return (i ? path(`M40 ${y}H200`, 'divider') : '') + text(54, y + 18, label, { size: 11, cls: danger ? 'danger' : 'ink' }) + icon(ic, 176, y + 7, 13, danger ? 'stroke-danger' : 'stroke');
      })
      .join('')
  );
};

/** Шапка шита «Новое событие»: где стоят «Отмена» и выделенная «Готово» */
const sheetToolbar = (doneTrailing: boolean) => {
  const plain = (x: number, anchor: 'start' | 'end') => text(x, 47, 'Отмена', { size: 11, cls: 'accent', anchor });
  const done = (x: number) => rect(x, 32, 60, 24, 'accent', 12) + text(x + 30, 48, 'Готово', { size: 10, weight: 700, cls: 'on-accent', anchor: 'middle' });
  return (
    tile(240, 96) +
    card(8, 14, 224, 74, 14) +
    rect(104, 20, 32, 4, 'block', 2) +
    text(120, 47, 'Событие', { size: 11, weight: 700, cls: 'ink', anchor: 'middle' }) +
    (doneTrailing ? plain(20, 'start') + done(160) : done(20) + plain(220, 'end')) +
    lines(20, 68, [140, 100], 8, 4)
  );
};

/** Онбординг с 15 точками page control */
const manyDots = () =>
  screen(80, 10, 160, 150) +
  rect(96, 28, 128, 66, 'block', 10) +
  lines(104, 106, [112, 90], 10, 5) +
  Array.from({ length: 15 }, (_, i) => circle(118 + i * 6, 142, 2, i === 6 ? 'ink-shape' : 'line-shape')).join('');

/** Уведомление банка на экране блокировки */
const bankNotification = (detailed: boolean) =>
  tile(240, 96) +
  rect(8, 16, 224, 64, 'glass', 14) +
  rect(18, 26, 26, 26, 'accent', 7) +
  text(31, 44, '₽', { size: 13, weight: 700, cls: 'on-accent', anchor: 'middle' }) +
  text(52, 34, detailed ? 'Перевод 25 000 ₽' : 'Новое поступление', { size: 10, weight: 700, cls: 'ink' }) +
  text(222, 34, 'сейчас', { size: 8, anchor: 'end' }) +
  text(52, 50, detailed ? 'От Анны К. на карту *4521.' : 'На вашу карту пришёл перевод.', { size: 9.5, cls: 'ink' }) +
  (detailed ? text(52, 65, 'Баланс 142 300 ₽. Код входа: 4821', { size: 9.5, cls: 'ink' }) : '');

export const platformsArt: Record<string, Illustration> = {
  // ---------- HIG ----------
  'a-alert-order-good': ill(240, 150, 'Алерт «Удалить фото?»: «Отменить» слева, «Удалить» красным справа', backdrop(240, 150) + iosAlert(26, 28, 188, 'Удалить фото?', 'Это действие нельзя отменить.', ['Отменить', 'accent'], ['Удалить', 'danger'])),
  'a-alert-order-bad': ill(240, 150, 'Алерт «Удалить фото?»: «Удалить» слева, «Отменить» справа', backdrop(240, 150) + iosAlert(26, 28, 188, 'Удалить фото?', 'Это действие нельзя отменить.', ['Удалить', 'danger'], ['Отменить', 'accent'])),
  'a-alert-title-bad': ill(
    240,
    150,
    'Алерт с заголовком «Ошибка 329347» и кнопкой OK',
    backdrop(240, 150) +
      card(40, 36, 160, 80, 14) +
      text(120, 66, 'Ошибка 329347', { size: 12, weight: 700, cls: 'ink', anchor: 'middle' }) +
      path('M40 86H200', 'divider') +
      text(120, 105, 'OK', { size: 11, weight: 600, cls: 'accent', anchor: 'middle' }),
  ),
  'a-alert-title-good': ill(240, 150, 'Алерт «Не удалось отправить фото» с кнопками «Отменить» и «Повторить»', backdrop(240, 150) + iosAlert(26, 28, 188, 'Не удалось отправить фото', 'Проверьте подключение к сети.', ['Отменить', 'accent'], ['Повторить', 'accent'])),
  'a-tabbar-sections': ill(
    240,
    160,
    'Таб-бар с разделами: Главная, Поиск, Профиль',
    screen(20, 10, 200, 140) + lines(34, 26, [120, 170, 150, 170], 14, 6) + iosTabbar(21, 108, 198, [['home', 'Главная'], ['search', 'Поиск'], ['user', 'Профиль']]),
  ),
  'a-tabbar-actions': ill(
    240,
    160,
    'Таб-бар с действиями: Поделиться, Удалить, Добавить',
    screen(20, 10, 200, 140) + lines(34, 26, [120, 170, 150, 170], 14, 6) + iosTabbar(21, 108, 198, [['link', 'Поделиться'], ['trash', 'Удалить'], ['plus', 'Добавить']], -1),
  ),
  'a-tabbar-more': ill(
    320,
    150,
    'Таб-бар из пяти вкладок, последняя — «Ещё» со списком остальных разделов',
    screen(20, 10, 280, 130) + lines(36, 26, [160, 230, 200], 14, 6) + iosTabbar(21, 98, 278, [['home', 'Главная'], ['search', 'Поиск'], ['folder', 'Файлы'], ['bell', 'События'], ['menu', 'Ещё']], 4),
  ),
  'a-switch-list': ill(
    240,
    150,
    'Список настроек: в строках «Уведомления» и «Звук» справа переключатели',
    screen(20, 10, 200, 130) +
      title(34, 34, 'Настройки', 12) +
      card(30, 46, 180, 80, 10) +
      text(42, 70, 'Уведомления', { size: 11, cls: 'ink' }) +
      iosSwitch(166, 57) +
      path('M42 86H210', 'divider') +
      text(42, 110, 'Звук', { size: 11, cls: 'ink' }) +
      iosSwitch(166, 97, false),
  ),
  'a-switch-loose': ill(
    240,
    150,
    'Экран писем: переключатель «Непрочитанные» стоит сам по себе в панели над списком',
    screen(20, 10, 200, 130) +
      text(168, 32, 'Непрочитанные', { size: 9, anchor: 'end' }) +
      iosSwitch(174, 20) +
      title(34, 58, 'Входящие', 14) +
      [70, 98].map((y) => circle(42, y + 8, 8) + lines(58, y + 2, [100, 140])).join(''),
  ),
  'a-sheet-good': ill(
    240,
    190,
    'Action sheet: сверху красная «Удалить черновик», затем «Сохранить черновик», отдельно внизу «Отменить»',
    backdrop(240, 190) +
      card(24, 64, 192, 78, 12) +
      sheetRow(24, 64, 192, 'Удалить черновик', 'danger') +
      path('M24 103H216', 'divider') +
      sheetRow(24, 103, 192, 'Сохранить черновик', 'accent') +
      card(24, 148, 192, 36, 12) +
      sheetRow(24, 156, 192, 'Отменить', 'accent', 700),
  ),
  'a-sheet-bad': ill(
    240,
    190,
    'Action sheet: сверху «Отменить», затем «Сохранить черновик», в самом низу красная «Удалить черновик»',
    backdrop(240, 190) +
      card(24, 64, 192, 78, 12) +
      sheetRow(24, 64, 192, 'Отменить', 'accent', 700) +
      path('M24 103H216', 'divider') +
      sheetRow(24, 103, 192, 'Сохранить черновик', 'accent') +
      card(24, 148, 192, 36, 12) +
      sheetRow(24, 156, 192, 'Удалить черновик', 'danger'),
  ),
  'a-sym-mono': ill(140, 100, 'Значок погоды целиком одним цветом', tile(140, 100) + weather('sym-ink', 'sym-ink', 'sym-ink-stroke')),
  'a-sym-hier': ill(140, 100, 'Значок погоды одним цветом с разной прозрачностью слоёв', tile(140, 100) + weather('sym-accent', 'sym-accent-60', 'sym-accent-stroke-35')),
  'a-sym-palette': ill(140, 100, 'Значок погоды двумя заданными цветами: облако одним, солнце и капли другим', tile(140, 100) + weather('sym-accent', 'sym-ink', 'sym-ink-stroke')),
  'a-sym-multi': ill(140, 100, 'Значок погоды в естественных цветах: жёлтое солнце, белое облако, синие капли', tile(140, 100) + weather('sym-white', 'sym-yellow', 'sym-blue-stroke')),
  'a-contrast': ill(
    320,
    190,
    'Карточка тарифа: заголовок, описание, кнопка и почти невидимая светло-серая ссылка «Условия и ограничения»',
    screen(20, 10, 280, 170) +
      title(36, 38, 'Тариф «Команда»', 14) +
      lines(36, 52, [230, 200]) +
      button(36, 84, 248, 34, 'Подключить') +
      text(160, 146, 'Условия и ограничения тарифа', { size: 10, cls: 'faint' as never, anchor: 'middle' }),
    { faint: [80, 132, 160, 20] },
  ),
  'a-segmented-8': ill(
    320,
    120,
    'Сегментированный контрол из восьми сегментов: Все, Пн, Вт, Ср, Чт, Пт, Сб, Вс',
    screen(10, 10, 300, 100) +
      rect(22, 40, 276, 26, 'block', 8) +
      rect(24, 42, 32, 22, 'card', 6) +
      ['Все', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d, i) => text(40 + i * 34.5, 57, d, { size: 9, weight: i === 0 ? 700 : 400, cls: 'ink', anchor: 'middle' })).join(''),
  ),
  'a-sheet-detent': ill(
    200,
    250,
    'Экран карты, снизу шит на половину высоты с маленькой полоской-ручкой сверху',
    screen(20, 10, 160, 230) +
      rect(20, 10, 160, 230, 'block', 14) +
      path('M40 60l40 30 30-20 50 40', 'stroke-muted', 'fill="none"') +
      card(20, 120, 160, 120, 14) +
      rect(88, 128, 24, 4, 'line-shape', 2) +
      title(34, 156, 'Кафе рядом', 12) +
      lines(34, 168, [130, 100, 120], 12),
  ),
  'a-ios-navbar': ill(
    240,
    110,
    'Верхняя панель: слева шеврон «‹» в круглой кнопке, заголовок по центру',
    screen(10, 10, 220, 90) + circle(32, 30, 13, 'glass') + icon('back', 25, 23, 14, 'stroke-accent') + text(120, 34, 'Профиль', { size: 12, weight: 700, cls: 'ink', anchor: 'middle' }) + lines(24, 60, [190, 150]),
  ),
  'a-md-topbar': ill(240, 110, 'Верхняя панель: стрелка назад, заголовок слева, меню из трёх точек справа', screen(10, 10, 220, 90) + mdTopBar(10, 10, 220, 'Профиль') + lines(24, 60, [190, 150])),

  // ---------- Material ----------
  'm-btn-filled': ill(130, 90, 'Залитая кнопка цвета primary', tile(130, 90) + rect(20, 29, 90, 32, 'accent', 16) + text(65, 49, 'Кнопка', { size: 11, weight: 600, cls: 'on-accent', anchor: 'middle' })),
  'm-btn-tonal': ill(130, 90, 'Кнопка с мягкой тональной заливкой', tile(130, 90) + rect(20, 29, 90, 32, 'tonal', 16) + text(65, 49, 'Кнопка', { size: 11, weight: 600, cls: 'on-tonal' as never, anchor: 'middle' })),
  'm-btn-outlined': ill(130, 90, 'Кнопка с обводкой без заливки', tile(130, 90) + rect(20, 29, 90, 32, 'field', 16) + text(65, 49, 'Кнопка', { size: 11, weight: 600, cls: 'accent', anchor: 'middle' })),
  'm-btn-text': ill(130, 90, 'Кнопка-текст без фона и обводки', tile(130, 90) + text(65, 49, 'Кнопка', { size: 11, weight: 600, cls: 'accent', anchor: 'middle' })),
  'm-snackbar': ill(
    240,
    170,
    'Список писем, внизу тёмная плашка «Письмо удалено» с действием «Отменить»',
    screen(20, 10, 200, 150) + mdTopBar(20, 10, 200, 'Входящие') + [44, 72, 100].map((y) => circle(38, y + 8, 8) + lines(54, y + 2, [90, 140])).join('') + rect(28, 124, 184, 28, 'toast', 4) + text(38, 142, 'Письмо удалено', { size: 10, cls: 'inverse' }) + text(204, 142, 'Отменить', { size: 10, weight: 700, cls: 'accent-inverse', anchor: 'end' }),
  ),
  'm-dialog-deleted': ill(
    240,
    170,
    'Поверх списка модальный диалог «Письмо удалено» с кнопкой OK',
    screen(20, 10, 200, 150) +
      [44, 72, 100].map((y) => circle(38, y + 8, 8) + lines(54, y + 2, [90, 140])).join('') +
      scrim(20, 10, 200, 150) +
      card(44, 46, 152, 76, 20) +
      text(60, 74, 'Письмо удалено', { size: 12, weight: 600, cls: 'ink' }) +
      text(180, 108, 'OK', { size: 11, weight: 700, cls: 'accent', anchor: 'end' }),
  ),
  'm-navbar-3': ill(
    200,
    200,
    'Нижняя навигация из трёх пунктов с подписями',
    screen(20, 10, 160, 180) + lines(34, 28, [100, 130, 110, 130], 14, 6) + mdNavbar(21, 145, 158, [['home', 'Главная'], ['search', 'Поиск'], ['user', 'Профиль']]),
  ),
  'm-navbar-7': ill(
    200,
    200,
    'Нижняя навигация из семи тесных пунктов',
    screen(20, 10, 160, 180) +
      lines(34, 28, [100, 130, 110, 130], 14, 6) +
      mdNavbar(21, 145, 158, [['home', 'Глав.'], ['search', 'Поиск'], ['folder', 'Файлы'], ['bell', 'Увед.'], ['star', 'Избр.'], ['heart', 'Лайки'], ['user', 'Я']]),
  ),
  'm-fab-one': ill(200, 200, 'Список заметок и одна плавающая кнопка «+» в правом нижнем углу', screen(20, 10, 160, 180) + lines(34, 28, [120, 90, 120, 100, 120, 80], 18, 6) + fab(126, 140)),
  'm-fab-many': ill(200, 200, 'Список заметок и три плавающие кнопки в разных углах', screen(20, 10, 160, 180) + lines(34, 28, [120, 90, 120, 100, 120, 80], 18, 6) + fab(126, 140) + fab(34, 140) + fab(126, 86)),
  'm-chip-assist': ill(150, 80, 'Чип с иконкой календаря и подписью «В календарь»', tile(150, 80) + chip(22, 26, 106, 'В календарь', { lead: 'icon' })),
  'm-chip-filter': ill(150, 80, 'Выбранный чип с галочкой и подписью «Без мяса»', tile(150, 80) + chip(28, 26, 94, 'Без мяса', { lead: 'check', selected: true })),
  'm-chip-input': ill(150, 80, 'Чип с аватаром «Анна» и крестиком удаления', tile(150, 80) + chip(34, 26, 82, 'Анна', { lead: 'avatar', close: true })),
  'm-chip-suggestion': ill(150, 80, 'Чип с подписью «Спасибо!» без иконок', tile(150, 80) + chip(40, 26, 70, 'Спасибо!')),
  'm-tablet-navbar': ill(
    320,
    200,
    'Планшет в альбомной ориентации, внизу растянутая на всю ширину нижняя навигация',
    screen(10, 10, 300, 180) + [0, 1, 2].map((i) => rect(28 + i * 92, 28, 80, 80, 'block', 10)).join('') + lines(28, 120, [200, 160]) + mdNavbar(11, 145, 298, [['home', 'Главная'], ['search', 'Поиск'], ['user', 'Профиль']]),
  ),
  'm-tablet-rail': ill(
    320,
    200,
    'Планшет в альбомной ориентации, навигация вертикальной полосой у левого края',
    screen(10, 10, 300, 180) +
      path('M24 11H67V189H24a13 13 0 0 1-13-13V24a13 13 0 0 1 13-13z', 'surface-container') +
      fab(19, 22, 40) +
      [['home', 'Главная'], ['search', 'Поиск'], ['user', 'Профиль']]
        .map(([ic, label], i) => {
          const y = 82 + i * 36;
          return (i === 0 ? rect(23, y - 3, 32, 18, 'tonal', 9) : '') + icon(ic, 33, y, 12, i === 0 ? 'stroke-on-tonal' : 'stroke') + text(39, y + 25, label, { size: 7, cls: 'text', anchor: 'middle' });
        })
        .join('') +
      [0, 1, 2].map((i) => rect(80 + i * 76, 28, 66, 80, 'block', 10)).join('') +
      lines(80, 122, [200, 160]),
  ),
  'm-onprimary': ill(
    320,
    130,
    'Залитая кнопка «Сохранить»: стрелка к фону подписана «primary», стрелка к тексту — «?»',
    screen(10, 10, 300, 110) +
      rect(100, 46, 120, 40, 'accent', 20) +
      text(160, 71, 'Сохранить', { size: 12, weight: 600, cls: 'on-accent', anchor: 'middle' }) +
      path('M104 54L70 38', 'stroke-muted') +
      text(26, 34, 'фон: primary', { size: 10, cls: 'ink' }) +
      path('M196 68L232 92', 'stroke-muted') +
      text(294, 104, 'текст: ?', { size: 10, weight: 700, cls: 'ink', anchor: 'end' }),
  ),
  // ---------- HIG: новые ----------
  'a-btn-hierarchy-good': ill(
    240,
    170,
    'Предложение подписки: одна залитая кнопка «Подписаться» и под ней текстовая кнопка «Не сейчас»',
    screen(20, 10, 200, 150) + text(120, 46, 'Пробный месяц бесплатно', { size: 12, weight: 700, cls: 'ink', anchor: 'middle' }) + lines(50, 58, [140, 110], 10, 5) + button(36, 94, 168, 30, 'Подписаться', 'primary', 15) + button(36, 128, 168, 24, 'Не сейчас', 'ghost'),
  ),
  'a-btn-hierarchy-bad': ill(
    240,
    170,
    'То же предложение: две одинаковые залитые кнопки «Подписаться» и «Не сейчас»',
    screen(20, 10, 200, 150) + text(120, 46, 'Пробный месяц бесплатно', { size: 12, weight: 700, cls: 'ink', anchor: 'middle' }) + lines(50, 58, [140, 110], 10, 5) + button(36, 88, 168, 28, 'Подписаться', 'primary', 14) + button(36, 122, 168, 28, 'Не сейчас', 'primary', 14),
  ),
  'a-perm-launch': ill(
    240,
    200,
    'Первый запуск: поверх экрана «Добро пожаловать» сразу появляется системный запрос доступа к камере без объяснения зачем',
    screen(20, 10, 200, 180) + text(120, 50, 'Добро пожаловать!', { size: 13, weight: 700, cls: 'ink', anchor: 'middle' }) + scrim(20, 10, 200, 180) + iosPermission(30, 66, '«Кошелёк» запрашивает доступ', 'Приложение использует камеру.'),
  ),
  'a-perm-context': ill(
    240,
    200,
    'Пользователь нажал «Оплатить по QR» — и только тогда появляется запрос доступа к камере с понятным объяснением',
    screen(20, 10, 200, 180) + text(120, 50, 'Оплатить по QR', { size: 13, weight: 700, cls: 'ink', anchor: 'middle' }) + scrim(20, 10, 200, 180) + iosPermission(30, 66, '«Кошелёк» запрашивает доступ', 'Чтобы считать QR-код счёта.'),
  ),
  'a-dyntype-wrap': ill(
    240,
    200,
    'Настройки крупным шрифтом: длинные названия пунктов переносятся на вторую строку и читаются целиком',
    screen(20, 10, 200, 180) +
      bigRow(20, ['Уведомления'], null) +
      path('M36 52H206', 'divider') +
      bigRow(56, ['Пароли', 'и безопасность'], null) +
      path('M36 110H206', 'divider') +
      bigRow(114, ['Экранное время'], null),
  ),
  'a-dyntype-truncate': ill(
    240,
    200,
    'Те же настройки крупным шрифтом: названия обрезаны многоточием — «Пароли и без…», «Экранное вре…»',
    screen(20, 10, 200, 180) +
      bigRow(20, [], 'Уведомления') +
      path('M36 52H206', 'divider') +
      bigRow(56, [], 'Пароли и без…') +
      path('M36 88H206', 'divider') +
      bigRow(92, [], 'Экранное вре…'),
  ),
  'a-ios-fab': ill(
    240,
    220,
    'iOS-приложение заметок с таб-баром, над которым в правом нижнем углу висит круглая плавающая кнопка «+»',
    iosNotes(circle(184, 140, 18, 'accent') + icon('plus', 176, 132, 16, 'stroke-on-accent')),
    { fab: [162, 118, 44, 44] },
  ),
  'a-ios-add-toolbar': ill(
    240,
    220,
    'То же iOS-приложение: кнопка новой заметки — иконка в правом верхнем углу, рядом с заголовком',
    iosNotes(circle(194, 36, 13, 'glass') + icon('plus', 187, 29, 14, 'stroke-accent')),
  ),
  // ---------- Material: новые ----------
  'm-snack-one': ill(240, 170, 'Снэкбар «Письмо в архиве» с одним действием «Отменить»', inbox() + snack(28, 124, 184, 'Письмо в архиве', ['Отменить'])),
  'm-snack-two': ill(
    240,
    170,
    'Снэкбар в две строки с двумя действиями «Отменить» и «Настройки» и крестиком',
    inbox() + snack(28, 98, 184, 'Письмо в архиве. Архив', ['Настройки', 'Отменить'], 'очищается раз в 30 дней') + icon('close', 194, 106, 10, 'stroke-on-accent'),
  ),
  'm-fab-extended': ill(130, 90, 'Кнопка с иконкой карандаша и подписью «Написать», скругление 16 dp', tile(130, 90) + rect(16, 23, 98, 44, 'tonal', 14) + icon('plus', 28, 37, 16, 'stroke-on-tonal') + text(52, 49.5, 'Написать', { size: 11, weight: 600, cls: 'on-tonal' as never })),
  'm-fab-regular': ill(130, 90, 'Квадратная кнопка со скруглёнными углами и иконкой «+» без подписи', tile(130, 90) + fab(43, 23, 44)),
  'm-dialog-yesno': ill(240, 170, 'Диалог «Удалить черновик?» с кнопками «Нет» и «Да»', mdDialog('Удалить черновик?', 'Нет', 'Да')),
  'm-dialog-named': ill(240, 170, 'Диалог «Удалить черновик?» с кнопками «Отмена» и «Удалить»', mdDialog('Удалить черновик?', 'Отмена', 'Удалить')),
  'm-snack-over-fab': ill(
    240,
    200,
    'Список заметок с плавающей кнопкой «+» в правом нижнем углу; снэкбар «Заметка удалена» появился поверх неё и закрыл её',
    screen(20, 10, 200, 180) + mdTopBar(20, 10, 200, 'Заметки') + lines(34, 50, [150, 110, 160, 120, 140, 100], 16, 6) + fab(164, 142) + snack(28, 150, 184, 'Заметка удалена', ['Отменить']),
    { snack: [28, 146, 184, 36] },
  ),
  'm-snack-above-fab': ill(
    240,
    200,
    'Тот же экран: снэкбар «Заметка удалена» показан над плавающей кнопкой и не перекрывает её',
    screen(20, 10, 200, 180) + mdTopBar(20, 10, 200, 'Заметки') + lines(34, 50, [150, 110, 160, 120, 140, 100], 16, 6) + fab(164, 142) + snack(28, 106, 184, 'Заметка удалена', ['Отменить']),
  ),
  'm-edge-to-edge': ill(200, 230, 'Галерея фото на весь экран: снимки видны и под прозрачной строкой состояния, и под полоской жестов внизу', gallery(true)),
  'm-edge-boxed': ill(200, 230, 'Та же галерея в рамках: сверху и снизу глухие чёрные полосы системных панелей', gallery(false)),
  'a-tabbar-spot': ill(
    320,
    202,
    'Экран «Лента» с таб-баром: Главная, Поиск, круглая синяя кнопка «плюс» посередине, бледная вкладка Избранное и вкладка с иконкой профиля без подписи',
    tabbarSpot(),
    { action: [145, 150, 30, 38], dimmed: [201, 150, 30, 38], unlabeled: [257, 150, 30, 38] },
  ),
  'a-ctx-last': ill(240, 176, 'Контекстное меню письма: Ответить, Переслать, Пометить, а последним — красный пункт Удалить', contextMenu(true)),
  'a-ctx-first': ill(240, 176, 'Контекстное меню письма: первым идёт красный пункт Удалить, за ним Ответить, Переслать и Пометить', contextMenu(false)),
  'a-sheet-done-trailing': ill(240, 96, 'Шапка шита: слева текстовая кнопка «Отмена», в центре заголовок, справа выделенная кнопка «Готово»', sheetToolbar(true)),
  'a-sheet-done-leading': ill(240, 96, 'Шапка шита: слева выделенная кнопка «Готово», в центре заголовок, справа текстовая кнопка «Отмена»', sheetToolbar(false)),
  'a-many-dots': ill(320, 170, 'Экран онбординга, внизу пятнадцать точек page control, текущая — седьмая', manyDots()),
  'a-notif-detailed': ill(240, 96, 'Уведомление банка: «Перевод 25 000 ₽. От Анны К. на карту *4521. Баланс 142 300 ₽. Код входа: 4821»', bankNotification(true)),
  'a-notif-brief': ill(240, 96, 'Уведомление банка: «Новое поступление. На вашу карту пришёл перевод.»', bankNotification(false)),
};

export const platformTrackArt: Record<string, Illustration> = {
  'track-hig': ill(
    320,
    112,
    '',
    screen(118, 6, 84, 104, 16) +
      rect(146, 12, 28, 8, 'ink-shape', 4) +
      lines(128, 30, [50, 64, 40], 10, 5) +
      rect(128, 78, 64, 22, 'glass', 11) +
      [0, 1, 2].map((i) => circle(141 + i * 19, 89, 3.5, i === 0 ? 'accent' : 'ink-shape')).join('') +
      iosSwitch(36, 46) +
      text(54, 86, 'SF', { size: 20, weight: 800, cls: 'ink', anchor: 'middle' }) +
      rect(236, 38, 60, 36, 'card', 10) +
      text(266, 61, 'Cancel', { size: 9, cls: 'accent', anchor: 'middle' }),
  ),
  'track-material': ill(
    320,
    112,
    '',
    fab(40, 36, 44) +
      rect(116, 30, 90, 56, 'tonal', 28) +
      circle(161, 58, 14, 'accent') +
      rect(230, 24, 30, 30, 'accent', 4) +
      rect(268, 24, 30, 30, 'accent-soft', 15) +
      rect(230, 62, 30, 30, 'tonal', 10) +
      path('M268 92l15-30 15 30z', 'warning-shape') +
      text(161, 104, 'Material 3', { size: 9, anchor: 'middle' }),
  ),
};
