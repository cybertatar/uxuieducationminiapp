import { button, card, circle, field, icon, ill, lines, path, rect, screen, scrim, text, title, type Illustration } from './kit';

const tile = (w: number, h: number) => rect(0, 0, w, h, 'tile', 12);

/**
 * Кнопка с фиксированными цветами — для вопроса про контраст цвета не должны зависеть от темы.
 * Коэффициенты посчитаны по формуле WCAG: #2b6fd6 — 4.83:1, #e5484d — 3.91:1, #4ca3ff — 2.63:1, #ff9500 — 2.2:1.
 */
const swatch = (bg: string) =>
  ill(
    130,
    90,
    `Кнопка «Купить»: белый текст на фоне ${bg}`,
    tile(130, 90) + `<rect x="20" y="27" width="90" height="36" rx="10" fill="${bg}"/>` + `<text x="65" y="50" font-size="13" font-weight="600" text-anchor="middle" fill="#ffffff">Купить</text>`,
  );

/** Простой линейный график из двух серий */
const chart = (labeled: boolean) =>
  screen(10, 10, 220, 140) +
  title(24, 32, 'Продажи по кварталам', 11) +
  path('M30 126H214M30 46V126', 'divider') +
  path('M34 112L80 96L126 104L172 76L210 64', 'stroke-accent-bold', 'fill="none"') +
  path('M34 100L80 104L126 86L172 92L210 82', labeled ? 'stroke-danger-dash' : 'stroke-danger-bold', 'fill="none"') +
  (labeled
    ? [34, 80, 126, 172, 210].map((x, i) => circle(x, [112, 96, 104, 76, 64][i], 3, 'accent')).join('') +
      [34, 80, 126, 172, 210].map((x, i) => rect(x - 3, [100, 104, 86, 92, 82][i] - 3, 6, 6, 'danger', 0)).join('') +
      text(214, 57, 'Онлайн', { size: 9, cls: 'accent', anchor: 'end' }) +
      text(214, 103, 'Офлайн', { size: 9, cls: 'danger', anchor: 'end' })
    : rect(24, 40, 8, 8, 'accent', 2) + rect(60, 40, 8, 8, 'danger', 2) + text(36, 47, '2024', { size: 8 }) + text(72, 47, '2025', { size: 8 }));

/** Поле поиска на белом фоне с заданным цветом рамки — для вопроса про контраст рамки (1.4.11) */
const borderForm = (border: string) =>
  `<rect x="0" y="0" width="300" height="170" rx="12" fill="#ffffff"/>` +
  `<text x="24" y="34" font-size="13" font-weight="700" fill="#1f1f1f">Подписка на новости</text>` +
  `<text x="24" y="60" font-size="9" fill="#595959">E-mail</text>` +
  `<rect x="24" y="66" width="252" height="30" rx="6" fill="#ffffff" stroke="${border}" stroke-width="1"/>` +
  `<text x="34" y="85" font-size="11" fill="#1f1f1f">anna@mail.ru</text>` +
  `<rect x="24" y="108" width="14" height="14" rx="3" fill="#ffffff" stroke="#595959" stroke-width="1.4"/>` +
  `<text x="46" y="119" font-size="10" fill="#1f1f1f">Согласен получать письма</text>` +
  `<rect x="24" y="132" width="252" height="28" rx="8" fill="#2b6fd6"/>` +
  `<text x="150" y="150" font-size="11" font-weight="600" text-anchor="middle" fill="#ffffff">Подписаться</text>`;

/** Телефон в альбомной ориентации */
const landscape = (inner: string) => screen(10, 10, 260, 140) + inner;

/** Банковский экран под диалогом про окончание сессии */
const sessionDialog = (heading: string, body: string, buttons: [string, 'primary' | 'outline'][]) =>
  screen(20, 10, 200, 170) +
  title(34, 34, 'Перевод', 12) +
  field(34, 56, 172, 22, { label: 'Сумма', value: '15 000 ₽' }) +
  scrim(20, 10, 200, 170) +
  card(32, 56, 176, 108, 14) +
  text(120, 82, heading, { size: 11, weight: 700, cls: 'ink', anchor: 'middle' }) +
  body.split('\n').map((l, i) => text(120, 100 + i * 13, l, { size: 9, anchor: 'middle' })).join('') +
  buttons.map(([label, v], i) => button(buttons.length === 1 ? 48 : 44 + i * 80, 130, buttons.length === 1 ? 144 : 72, 24, label, v)).join('');

/** Шапка сайта с меню из ссылок и статьёй под ней */
const siteHeader = (skip: boolean) =>
  screen(10, 10, 300, 170) +
  ([['Главная', 24], ['Каталог', 72], ['Акции', 120], ['Доставка', 158], ['Блог', 210], ['Контакты', 244]] as const).map(([s, x]) => text(x, 34, s, { size: 9, cls: 'accent' })).join('') +
  path('M10 46H310', 'divider') +
  title(24, 72, 'Как выбрать велосипед') +
  lines(24, 84, [260, 240, 250, 180], 11, 5) +
  (skip
    ? rect(16, 14, 150, 30, 'focus-ring', 10) + button(20, 18, 142, 22, 'Перейти к содержимому', 'secondary', 8)
    : rect(18, 22, 46, 18, 'focus-ring', 5) + text(296, 160, 'ещё 11 нажатий Tab до статьи', { size: 9, anchor: 'end' }));

/** Форма доставки с тремя проблемами: поле без подписи, ошибка только цветом, крошечный крестик */
const deliveryFormSpot = () =>
  screen(20, 10, 280, 236) +
  title(36, 38, 'Доставка') +
  icon('info', 252, 26, 14, 'stroke-muted') +
  icon('close', 270, 27, 11, 'stroke') +
  field(36, 66, 248, 28, { label: 'Имя', value: 'Анна' }) +
  field(36, 114, 248, 28, { placeholder: 'Телефон' }) +
  field(36, 174, 248, 28, { label: 'Индекс', value: '1010', state: 'error' }) +
  button(36, 214, 248, 24, 'Продолжить');

/** Карта: масштаб кнопками «+» и «−» или только жестом двумя пальцами */
const mapZoom = (buttons: boolean) =>
  tile(240, 150) +
  rect(14, 12, 212, 126, 'block', 10) +
  path('M14 70C60 50 90 96 140 74S200 40 226 56', 'stroke-muted', 'fill="none"') +
  path('M70 12V138M14 104H226', 'stroke-muted') +
  circle(120, 74, 7, 'danger') +
  (buttons
    ? rect(188, 64, 30, 60, 'card', 8) + icon('plus', 195, 70, 16) + path('M192 94H214', 'divider') + icon('minus', 195, 100, 16)
    : rect(30, 112, 180, 20, 'card', 10) + text(120, 126, 'Сведите два пальца для масштаба', { size: 8, cls: 'ink', anchor: 'middle' }));

export const wcagArt: Record<string, Illustration> = {
  'w-color-only': ill(
    320,
    220,
    'Форма регистрации: поле e-mail обведено красным без текста ошибки, остальные поля обычные',
    screen(20, 10, 280, 200) +
      title(36, 38, 'Регистрация') +
      field(36, 66, 248, 28, { label: 'Имя', value: 'Анна' }) +
      field(36, 116, 248, 28, { label: 'E-mail', value: 'anna@mail', state: 'error' }) +
      button(36, 162, 248, 32, 'Создать аккаунт'),
    { email: [36, 108, 248, 36] },
  ),
  'w-color-fixed': ill(
    320,
    220,
    'То же поле: красная рамка, иконка и текст ошибки «Добавьте домен, например anna@mail.ru»',
    screen(20, 10, 280, 200) +
      title(36, 38, 'Регистрация') +
      field(36, 66, 248, 28, { label: 'Имя', value: 'Анна' }) +
      field(36, 116, 248, 28, { label: 'E-mail', value: 'anna@mail', state: 'error' }) +
      icon('info', 36, 149, 10, 'stroke-danger') +
      text(50, 157, 'Добавьте домен, например anna@mail.ru', { size: 9, cls: 'danger' }) +
      button(36, 168, 248, 30, 'Создать аккаунт'),
  ),
  'w-label-above': ill(
    240,
    150,
    'Поля с подписями «Имя» и «Телефон» над полями, внутри поля — введённое значение',
    screen(10, 10, 220, 130) + title(24, 32, 'Контакты', 12) + field(24, 58, 192, 26, { label: 'Имя', value: 'Анна' }) + field(24, 104, 192, 26, { label: 'Телефон', placeholder: '+7 900 000-00-00' }),
  ),
  'w-placeholder-only': ill(
    240,
    150,
    'Форма «Контакты» с подзаголовком «Как с вами связаться»: у полей нет подписей, подсказка «Имя» исчезла после ввода, во втором поле серый плейсхолдер «Телефон»',
    screen(10, 10, 220, 130) +
      title(24, 32, 'Контакты', 12) +
      text(24, 48, 'Как с вами связаться', { size: 9 }) +
      field(24, 58, 192, 26, { value: 'Анна' }) +
      field(24, 104, 192, 26, { placeholder: 'Телефон' }),
  ),
  'w-contrast-a': swatch('#2b6fd6'),
  'w-contrast-b': swatch('#e5484d'),
  'w-contrast-c': swatch('#4ca3ff'),
  'w-contrast-d': swatch('#ff9500'),
  'w-focus-ring': ill(
    240,
    150,
    'Две кнопки «Отмена» и «Сохранить»; вокруг «Сохранить» заметная обводка фокуса',
    screen(10, 10, 220, 130) +
      title(24, 32, 'Настройки', 12) +
      lines(24, 46, [170, 140]) +
      button(24, 80, 90, 32, 'Отмена', 'outline') +
      rect(119, 75, 100, 42, 'focus-ring', 12) +
      button(124, 80, 90, 32, 'Сохранить') +
      text(120, 130, 'Tab ⇥', { size: 9, anchor: 'middle' }),
  ),
  'w-focus-none': ill(
    240,
    150,
    'Две кнопки «Отмена» и «Сохранить», ни одна не выделена — непонятно, где фокус',
    screen(10, 10, 220, 130) +
      title(24, 32, 'Настройки', 12) +
      lines(24, 46, [170, 140]) +
      button(24, 80, 90, 32, 'Отмена', 'outline') +
      button(124, 80, 90, 32, 'Сохранить') +
      text(120, 130, 'Tab ⇥', { size: 9, anchor: 'middle' }),
  ),
  'w-chart-color': ill(240, 160, 'График из двух линий, различающихся только цветом, с цветной легендой', chart(false)),
  'w-chart-labeled': ill(240, 160, 'График из двух линий: сплошная с кружками и пунктирная с квадратами, подписи прямо у линий', chart(true)),
  'w-drag-list': ill(
    320,
    200,
    'Список задач, который можно упорядочить только перетаскиванием за ручки ⋮⋮',
    screen(20, 10, 280, 180) +
      title(36, 36, 'Приоритеты') +
      ['Исследование', 'Прототип', 'Тестирование', 'Релиз']
        .map((s, i) => {
          const y = 50 + i * 32;
          return card(32, y, 256, 26, 6) + text(46, y + 17, s, { size: 11, cls: 'ink' }) + [0, 1, 2].map((r) => circle(268, y + 8 + r * 5, 1.4, 'ink-shape') + circle(274, y + 8 + r * 5, 1.4, 'ink-shape')).join('');
        })
        .join(''),
  ),
  'w-drag-buttons': ill(
    320,
    200,
    'Тот же список: у каждой задачи есть кнопки «вверх» и «вниз»',
    screen(20, 10, 280, 180) +
      title(36, 36, 'Приоритеты') +
      ['Исследование', 'Прототип', 'Тестирование', 'Релиз']
        .map((s, i) => {
          const y = 50 + i * 32;
          return card(32, y, 256, 26, 6) + text(46, y + 17, s, { size: 11, cls: 'ink' }) + path(`M238 ${y + 16}l5-6 5 6M260 ${y + 10}l5 6 5-6`, 'stroke-accent');
        })
        .join(''),
  ),
  'w-focus-obscured': ill(
    200,
    250,
    'Форма с фокусом на поле «Город», но поле полностью скрыто закреплённым баннером про cookie внизу экрана',
    screen(20, 10, 160, 230) +
      title(34, 34, 'Доставка', 12) +
      field(34, 56, 132, 24, { label: 'Улица', value: 'Ленина, 1' }) +
      field(34, 100, 132, 24, { label: 'Квартира', value: '12' }) +
      rect(30, 150, 140, 36, 'focus-ring', 8) +
      field(34, 154, 132, 28, { label: 'Город' }) +
      rect(21, 140, 158, 99, 'toast', 0) +
      text(32, 162, 'Мы используем cookie', { size: 10, weight: 600, cls: 'inverse' }) +
      text(32, 178, 'чтобы сайт работал лучше.', { size: 9, cls: 'inverse' }) +
      button(32, 196, 136, 28, 'Понятно'),
  ),
  'w-same-address': ill(
    320,
    190,
    'Оплата: отмеченный флажок «Совпадает с адресом доставки» вместо повторного ввода адреса',
    screen(20, 10, 280, 170) +
      title(36, 38, 'Адрес для чека') +
      rect(36, 56, 18, 18, 'accent', 4) +
      icon('check', 37, 57, 16, 'stroke-on-accent') +
      text(62, 70, 'Совпадает с адресом доставки', { size: 11, cls: 'ink' }) +
      card(36, 86, 248, 40, 8) +
      text(48, 103, 'ул. Ленина, 1, кв. 12', { size: 10, cls: 'ink' }) +
      text(48, 118, 'Казань, 420000', { size: 9 }) +
      button(36, 138, 248, 30, 'Оплатить'),
  ),
  'w-border-faint': ill(
    300,
    170,
    'Форма подписки на белом фоне: рамка поля e-mail очень светло-серая и почти не видна, у чекбокса и кнопки контраст нормальный',
    borderForm('#e0e0e0'),
    { field: [20, 62, 260, 38] },
  ),
  'w-border-ok': ill(300, 170, 'Та же форма: рамка поля e-mail тёмно-серая (#767676) и хорошо видна на белом', borderForm('#767676')),
  'w-orient-lock': ill(
    280,
    160,
    'Телефон в альбомной ориентации: вместо контента экран «Поверните устройство вертикально»',
    landscape(path('M126 52h28v44h-28z', 'outline-shape') + path('M168 60a20 20 0 0 1 0 28', 'stroke-accent', 'fill="none"') + text(140, 120, 'Поверните устройство вертикально', { size: 10, cls: 'ink', anchor: 'middle' })),
  ),
  'w-orient-ok': ill(
    280,
    160,
    'Телефон в альбомной ориентации: приложение перестроилось в две колонки — список слева, детали справа',
    landscape(
      title(24, 34, 'Счета', 12) +
        [44, 72, 100].map((y, i) => (i === 0 ? rect(20, y, 100, 24, 'tonal', 6) : '') + lines(28, y + 6, [70, 46], 8, 4)).join('') +
        path('M130 20V140', 'divider') +
        title(144, 34, 'Основной счёт', 12) +
        text(144, 60, '48 200 ₽', { size: 16, weight: 700, cls: 'ink' }) +
        lines(144, 74, [110, 90], 10, 5) +
        button(144, 104, 110, 26, 'Перевести'),
    ),
  ),
  'w-timeout-warn': ill(
    240,
    190,
    'Диалог «Сессия скоро закончится»: осталось 1:45, кнопки «Выйти» и «Продлить»',
    sessionDialog('Сессия скоро закончится', 'Осталось 1:45. Продлить, чтобы\nне потерять введённые данные?', [
      ['Выйти', 'outline'],
      ['Продлить', 'primary'],
    ]),
  ),
  'w-timeout-expired': ill(
    240,
    190,
    'Диалог «Сессия истекла»: введённые данные не сохранены, единственная кнопка «Войти заново»',
    sessionDialog('Сессия истекла', 'Вы были неактивны 5 минут.\nВведённые данные не сохранены.', [['Войти заново', 'primary']]),
  ),
  'w-link-vague': ill(
    320,
    200,
    'Раздел «Полезное»: ссылки «Как подключить автоплатёж», «Тарифы для бизнеса» и «Нажмите здесь»',
    screen(20, 10, 280, 180) +
      title(36, 38, 'Полезное') +
      ['Как подключить автоплатёж', 'Тарифы для бизнеса', 'Нажмите здесь']
        .map((s, i) => {
          const y = 52 + i * 42;
          return card(32, y, 256, 34, 8) + icon('link', 44, y + 9, 14, 'stroke-accent') + text(66, y + 21, s, { size: 11, cls: 'accent' }) + icon('chevron', 266, y + 11, 12);
        })
        .join(''),
    { link: [32, 136, 256, 34] },
  ),
  'w-link-clear': ill(
    320,
    200,
    'Тот же раздел: третья ссылка называется «Условия акции „Кешбэк 5%“»',
    screen(20, 10, 280, 180) +
      title(36, 38, 'Полезное') +
      ['Как подключить автоплатёж', 'Тарифы для бизнеса', 'Условия акции «Кешбэк 5%»']
        .map((s, i) => {
          const y = 52 + i * 42;
          return card(32, y, 256, 34, 8) + icon('link', 44, y + 9, 14, 'stroke-accent') + text(66, y + 21, s, { size: 11, cls: 'accent' }) + icon('chevron', 266, y + 11, 12);
        })
        .join(''),
  ),
  'w-skip-link': ill(320, 190, 'Первое нажатие Tab показывает поверх меню кнопку «Перейти к содержимому» с обводкой фокуса', siteHeader(true)),
  'w-skip-none': ill(320, 190, 'Первое нажатие Tab ставит фокус на первую ссылку меню; до статьи ещё 11 нажатий', siteHeader(false)),
  'w-form-spot': ill(
    320,
    256,
    'Форма «Доставка»: справа вверху маленькие иконки «i» и крестик вплотную; поле «Имя» с подписью; поле, где серым написано только «Телефон»; поле «Индекс» с красной рамкой без текста ошибки; кнопка «Продолжить»',
    deliveryFormSpot(),
    { close: [262, 20, 28, 26], phone: [36, 114, 248, 28], zip: [36, 166, 248, 36] },
  ),
  'w-map-buttons': ill(240, 150, 'Карта с кнопками «плюс» и «минус» для масштаба', mapZoom(true)),
  'w-map-pinch': ill(240, 150, 'Карта без кнопок масштаба, только подсказка «Сведите два пальца для масштаба»', mapZoom(false)),
};

export const wcagTrackArt: Record<string, Illustration> = {
  'track-wcag': ill(
    320,
    112,
    '',
    `<rect x="24" y="22" width="72" height="72" rx="14" fill="#17171c"/><text x="60" y="68" font-size="30" font-weight="800" text-anchor="middle" fill="#ffffff">Aa</text>` +
      text(60, 108, '17.9 : 1', { size: 9, anchor: 'middle' }) +
      rect(122, 40, 84, 36, 'focus-ring', 14) +
      button(127, 45, 74, 26, 'Tab ⇥', 'primary', 10) +
      circle(260, 58, 30, 'card') +
      path('M236 58c8-12 40-12 48 0-8 12-40 12-48 0z', 'stroke-bold', 'fill="none"') +
      circle(260, 58, 6, 'ink-shape'),
  ),
};
