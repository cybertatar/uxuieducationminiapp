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
