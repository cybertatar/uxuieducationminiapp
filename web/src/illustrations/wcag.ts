import { button, card, circle, field, icon, ill, lines, path, rect, screen, text, title, type Illustration } from './kit';

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
    'Поля без подписей: подсказка «Имя» исчезла после ввода, во втором поле серый плейсхолдер «Телефон»',
    screen(10, 10, 220, 130) + title(24, 32, 'Контакты', 12) + field(24, 50, 192, 26, { value: 'Анна' }) + field(24, 90, 192, 26, { placeholder: 'Телефон' }),
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
