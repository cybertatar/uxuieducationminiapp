import { button, card, field, icon, ill, lines, path, rect, screen, scrim, tabbar, text, title, type Illustration } from './kit';

/** Переключатель во включённом состоянии */
const toggle = (x: number, y: number, on = true) => rect(x, y, 34, 20, on ? 'accent' : 'block', 10) + `<circle cx="${on ? x + 24 : x + 10}" cy="${y + 10}" r="8" class="wf-card"/>`;

/** Строка настройки: подпись (одна или несколько строк) и переключатель справа */
const setting = (y: number, label: string[], sub?: string, on = true) =>
  label.map((l, i) => text(36, y + 14 + i * 14, l, { size: 11, cls: 'ink' })).join('') +
  (sub ? text(36, y + 14 + label.length * 14, sub, { size: 9 }) : '') +
  toggle(250, y + 2, on);

const toggles = (long: boolean) =>
  screen(20, 10, 280, 160) +
  title(36, 38, 'Уведомления') +
  (long
    ? setting(52, ['Если вы хотите получать', 'уведомления о скидках и акциях,', 'включите этот переключатель'])
    : setting(52, ['Скидки и акции'], 'Не чаще раза в неделю')) +
  path(`M36 ${long ? 106 : 92}H284`, 'divider') +
  setting(long ? 114 : 100, ['Статус заказа'], 'Сборка, доставка, получение');

/** Экран поиска с запросом «кросовки» */
const searchScreen = (inner: string) =>
  screen(20, 10, 280, 210) +
  field(36, 24, 248, 28, { value: 'кросовки' }) +
  icon('search', 258, 30, 16, 'stroke-muted') +
  inner +
  tabbar(20, 188, 280, ['home', 'search', 'cart', 'user'], 1);

/** Диалог отмены подписки поверх экрана «Подписка» */
const subscriptionDialog = (buttons: string, h: number) =>
  screen(20, 10, 200, 200) +
  title(34, 34, 'Подписка', 12) +
  scrim(20, 10, 200, 200) +
  card(30, 52, 180, h, 14) +
  text(120, 78, 'Отменить подписку?', { size: 12, weight: 700, cls: 'ink', anchor: 'middle' }) +
  text(120, 96, 'Фильмы будут доступны', { size: 9, anchor: 'middle' }) +
  text(120, 109, 'до 12 ноября', { size: 9, anchor: 'middle' }) +
  buttons;

const transferResult = (clear: boolean) =>
  screen(20, 10, 280, 190) +
  `<circle cx="160" cy="54" r="20" class="wf-success"/>` +
  icon('check', 150, 44, 20, 'stroke-on-accent') +
  (clear
    ? text(160, 96, 'Перевод отправлен', { size: 14, weight: 700, cls: 'ink', anchor: 'middle' }) +
      text(160, 116, '5 000 ₽ · Анна К.', { size: 11, cls: 'ink', anchor: 'middle' }) +
      text(160, 132, 'Деньги придут в течение минуты', { size: 9, anchor: 'middle' }) +
      button(36, 152, 248, 32, 'На главную')
    : text(160, 104, 'Готово', { size: 14, weight: 700, cls: 'ink', anchor: 'middle' }) + button(36, 152, 248, 32, 'ОК'));

const privacySettings = (clear: boolean) =>
  screen(20, 10, 280, 190) +
  title(36, 38, 'Конфиденциальность') +
  setting(52, ['Звук уведомлений']) +
  path('M36 84H284', 'divider') +
  setting(92, clear ? ['Текст сообщений на экране', 'блокировки'] : ['Не скрывать текст сообщений', 'на экране блокировки'], undefined, false) +
  path('M36 138H284', 'divider') +
  setting(146, ['Показывать, что я в сети']);

export const writingArt: Record<string, Illustration> = {
  'uw-toggle-short': ill(320, 180, 'Настройки уведомлений: переключатель «Скидки и акции» с пояснением «Не чаще раза в неделю»', toggles(false)),
  'uw-toggle-long': ill(
    320,
    180,
    'Настройки уведомлений: переключатель с подписью в три строки «Если вы хотите получать уведомления о скидках и акциях, включите этот переключатель»',
    toggles(true),
  ),
  'uw-empty-bad': ill(320, 230, 'Поиск по запросу «кросовки»: на экране только серый текст «Ничего не найдено»', searchScreen(text(160, 118, 'Ничего не найдено', { size: 11, cls: 'muted', anchor: 'middle' }))),
  'uw-empty-good': ill(
    320,
    230,
    'Поиск по запросу «кросовки»: «Ничего не нашлось», вопрос «Может, вы искали кроссовки?» и кнопка «Показать кроссовки»',
    searchScreen(
      icon('search', 148, 66, 24, 'stroke-muted') +
        text(160, 112, 'По запросу «кросовки» ничего нет', { size: 11, weight: 600, cls: 'ink', anchor: 'middle' }) +
        text(160, 128, 'Может, вы искали «кроссовки»?', { size: 10, anchor: 'middle' }) +
        button(80, 142, 160, 28, 'Показать кроссовки'),
    ),
  ),
  'uw-cancel-ok': ill(
    240,
    220,
    'Диалог «Отменить подписку?» с кнопками «Отмена» и «ОК»',
    subscriptionDialog(button(42, 126, 76, 28, 'Отмена', 'outline') + button(122, 126, 76, 28, 'ОК'), 118),
    { buttons: [36, 120, 168, 40] },
  ),
  'uw-cancel-clear': ill(
    240,
    220,
    'Тот же диалог с кнопками «Отменить подписку» и «Оставить подписку» друг под другом',
    subscriptionDialog(button(42, 124, 156, 28, 'Отменить подписку', 'danger') + button(42, 158, 156, 28, 'Оставить подписку', 'outline'), 144),
  ),
  'uw-success-clear': ill(320, 210, 'Экран «Перевод отправлен»: 5 000 ₽, получатель Анна К., деньги придут в течение минуты, кнопка «На главную»', transferResult(true)),
  'uw-success-vague': ill(320, 210, 'Экран с галочкой, словом «Готово» и кнопкой «ОК»', transferResult(false)),
  'uw-settings-negation': ill(
    320,
    210,
    'Настройки конфиденциальности: «Звук уведомлений», «Не скрывать текст сообщений на экране блокировки» (выключено), «Показывать, что я в сети»',
    privacySettings(false),
    { label: [30, 90, 260, 44] },
  ),
  'uw-settings-clear': ill(320, 210, 'Те же настройки: переключатель называется «Текст сообщений на экране блокировки»', privacySettings(true)),
};

export const writingTrackArt: Record<string, Illustration> = {
  'track-ux-writing': ill(
    320,
    112,
    '',
    card(20, 18, 132, 58, 12) +
      `<path d="M44 76l-8 14 20-14" class="wf-card"/>` +
      text(34, 42, 'Не удалось оплатить', { size: 10, weight: 700, cls: 'ink' }) +
      lines(34, 52, [104, 80], 9) +
      field(170, 22, 130, 26, { value: 'Анна' }) +
      rect(204, 28, 1.6, 14, 'accent', 0) +
      button(170, 60, 130, 30, 'Оплатить 2 490 ₽'),
  ),
};
