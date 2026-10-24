import { button, card, circle, cursor, field, icon, ill, lines, path, rect, screen, scrim, tabbar, text, title, type Illustration } from './kit';

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
    : text(160, 96, 'Готово', { size: 14, weight: 700, cls: 'ink', anchor: 'middle' }) +
      text(160, 116, 'Операция успешно выполнена', { size: 11, cls: 'ink', anchor: 'middle' }) +
      text(160, 132, 'Спасибо, что выбираете наш банк', { size: 9, anchor: 'middle' }) +
      button(36, 152, 248, 32, 'ОК'));

const privacySettings = (clear: boolean) =>
  screen(20, 10, 280, 190) +
  title(36, 38, 'Конфиденциальность') +
  setting(52, ['Звук уведомлений']) +
  path('M36 84H284', 'divider') +
  setting(92, clear ? ['Текст сообщений на экране', 'блокировки'] : ['Не скрывать текст сообщений', 'на экране блокировки'], undefined, false) +
  path('M36 138H284', 'divider') +
  setting(146, ['Показывать, что я в сети']);

/** Регистрация: требования к паролю списком под полем или спрятаны в тултип */
const passwordForm = (tooltip: boolean) =>
  screen(20, 10, 280, 200) +
  title(36, 38, 'Новый пароль') +
  field(36, 64, 248, 28, { label: 'Пароль', value: '••••••' }) +
  (tooltip
    ? icon('info', 262, 70, 16, 'stroke-muted') +
      rect(150, 98, 140, 52, 'toast', 8) +
      text(160, 115, 'От 8 символов, цифра', { size: 9, cls: 'inverse' }) +
      text(160, 128, 'и заглавная буква. Без', { size: 9, cls: 'inverse' }) +
      text(160, 141, 'пробелов', { size: 9, cls: 'inverse' }) +
      path('M262 92l-6 6h12z', 'stroke-muted', 'fill="none"') +
      cursor(266, 80)
    : ([['check', 'От 8 символов', true], ['close', 'Цифра', false], ['check', 'Заглавная буква', true]] as const)
        .map(([ic, label, ok], i) => icon(ic, 36, 100 + i * 16, 12, ok ? 'stroke-success' : 'stroke-danger') + text(54, 110 + i * 16, label, { size: 10, cls: ok ? 'text' : 'danger' }))
        .join('')) +
  button(36, 166, 248, 30, 'Сохранить');

const helpScreen = (structured: boolean) =>
  screen(20, 10, 280, 210) +
  title(36, 38, 'Возврат денег') +
  (structured
    ? [
        ['Сроки', 'До 10 рабочих дней на карту'],
        ['Как оформить', 'Заказы → Вернуть товар'],
        ['Деньги не пришли', 'Напишите в чат поддержки'],
      ]
        .map(([h, t], i) => {
          const y = 64 + i * 46;
          return text(36, y, h, { size: 11, weight: 700, cls: 'ink' }) + circle(40, y + 14, 2, 'ink-shape') + text(48, y + 18, t, { size: 10 }) + lines(48, y + 24, [150], 8, 4);
        })
        .join('')
    : [
        'Возврат денежных средств осуществляется после',
        'получения товара на склад и проведения проверки',
        'его состояния, после чего в течение срока, который',
        'может составлять до 10 рабочих дней в зависимости',
        'от банка, выпустившего карту, денежные средства',
        'будут зачислены. Для оформления возврата перейдите',
        'в раздел заказов и выберите соответствующий пункт,',
        'а если средства не поступили, обратитесь в службу',
        'поддержки через чат в приложении или по телефону.',
      ]
        .map((l, i) => text(36, 62 + i * 15, l, { size: 9, cls: 'ink' }))
        .join(''));

const transferError = (clear: boolean) =>
  screen(20, 10, 280, 190) +
  title(36, 38, 'Перевод') +
  field(36, 62, 248, 26, { label: 'Получатель', value: 'Анна К. · •• 4821' }) +
  field(36, 108, 248, 26, { label: 'Сумма', value: '5 000 ₽' }) +
  rect(36, 142, 248, 40, 'danger-soft', 8) +
  icon('xcircle', 44, 146, 14, 'stroke-danger') +
  (clear
    ? text(64, 157, 'Банк получателя не принял перевод.', { size: 9.5, cls: 'ink' }) + text(64, 171, 'Попробуйте позже или по номеру карты', { size: 9.5, cls: 'ink' })
    : text(64, 157, 'Ошибка 0x1F: транзакция отклонена', { size: 9.5, cls: 'ink' }) + text(64, 171, 'эквайером (RC 05, do not honor)', { size: 9.5, cls: 'ink' }));

/** Форма регистрации с тремя проблемами: поле без подписи, ошибка без объяснения и кнопка «ОК» */
const signupProblems = () =>
  screen(20, 10, 280, 272) +
  title(36, 40, 'Регистрация') +
  field(36, 68, 248, 28, { label: 'Имя', value: 'Анна' }) +
  field(36, 112, 248, 28, { placeholder: 'Email' }) +
  field(36, 172, 248, 28, { label: 'Пароль', value: '••••••', state: 'error', hint: 'Ошибка' }) +
  button(36, 238, 248, 32, 'ОК');

const wtile = (w: number, h: number) => rect(0, 0, w, h, 'tile', 12);

/** Экран блокировки с четырьмя уведомлениями: два полезных, два пустых */
const NOTIFS: [string, string, string][] = [
  ['Доставка', 'Заказ №4821 в пункте выдачи', 'Хранится до 12 ноября, ул. Ленина, 5'],
  ['Магазин', 'У нас для вас кое-что интересное!', 'Загляните скорее 👀'],
  ['Сообщения', 'Анна', 'Буду в 7, возьму билеты'],
  ['Банк', 'Откройте приложение', 'Чтобы узнать важную новость'],
];
const pushSpot = () =>
  screen(20, 10, 280, 256) +
  text(160, 40, '9:41', { size: 20, weight: 700, cls: 'ink', anchor: 'middle' }) +
  NOTIFS.map(([app, head, body], i) => {
    const y = 56 + i * 50;
    return rect(30, y, 260, 44, 'glass', 12) + rect(38, y + 8, 20, 20, 'accent', 5) + text(66, y + 15, app, { size: 8 }) + text(66, y + 28, head, { size: 10, weight: 700, cls: 'ink' }) + text(66, y + 40, body, { size: 9, cls: 'ink' });
  }).join('');

/** Форма, где обязательные поля отмечены звёздочкой или только фразой сверху */
const requiredForm = (asterisks: boolean) =>
  wtile(240, 200) +
  screen(16, 8, 208, 184, 12) +
  title(28, 32, 'Анкета', 12) +
  (asterisks ? '' : text(28, 46, 'Все поля обязательны, кроме отчества', { size: 8 })) +
  (
    [
      ['Фамилия', true],
      ['Имя', true],
      ['Отчество', false],
      ['Телефон', true],
    ] as const
  )
    .map(([label, req], i) => {
      const y = 70 + i * 31;
      return text(28, y - 4, label + (asterisks && req ? ' *' : '') + (asterisks && !req ? ' (необязательно)' : ''), { size: 8.5 }) + rect(28, y, 184, 14, 'field', 5);
    })
    .join('');

/** Ввод даты рождения: поле для ввода или календарь, который листают с текущего месяца */
const birthDate = (typed: boolean) =>
  wtile(240, 150) +
  screen(16, 8, 208, 134, 12) +
  text(28, 32, 'Дата рождения', { size: 9 }) +
  (typed
    ? field(28, 38, 184, 26, { value: '14.03.1987' }) + text(28, 78, 'Формат: дд.мм.гггг', { size: 8 })
    : rect(28, 38, 184, 96, 'card', 8) +
      icon('back', 36, 44, 12) + text(120, 54, 'Ноябрь 2026', { size: 9, weight: 700, cls: 'ink', anchor: 'middle' }) + icon('chevron', 196, 44, 12) +
      Array.from({ length: 21 }, (_, i) => text(44 + (i % 7) * 24, 76 + Math.floor(i / 7) * 18, String(i + 1), { size: 8, cls: 'ink', anchor: 'middle' })).join(''));

/** Попап подписки: отказ с упрёком или нейтральный */
const confirmshame = (shaming: boolean) =>
  wtile(240, 170) +
  card(24, 14, 192, 142, 14) +
  text(120, 42, 'Скидка 10% за подписку', { size: 11, weight: 700, cls: 'ink', anchor: 'middle' }) +
  text(120, 60, 'Раз в неделю — подборка акций', { size: 9, anchor: 'middle' }) +
  field(40, 72, 160, 24, { placeholder: 'Email' }) +
  button(40, 104, 160, 24, 'Подписаться') +
  text(120, 146, shaming ? 'Нет, я не люблю экономить' : 'Не сейчас', { size: 9, cls: 'accent', anchor: 'middle' });

export const writingArt: Record<string, Illustration> = {
  'uw-toggle-short': ill(320, 180, 'Настройки уведомлений: переключатель «Скидки и акции» с пояснением «Не чаще раза в неделю»', toggles(false)),
  'uw-toggle-long': ill(
    320,
    180,
    'Настройки уведомлений: переключатель с подписью в три строки «Если вы хотите получать уведомления о скидках и акциях, включите этот переключатель»',
    toggles(true),
  ),
  'uw-empty-bad': ill(
    320,
    230,
    'Поиск по запросу «кросовки»: иконка лупы, «Ничего не найдено», «Попробуйте изменить запрос» и кнопка «Сбросить поиск»',
    searchScreen(
      icon('search', 148, 72, 24, 'stroke-muted') +
        text(160, 120, 'Ничего не найдено', { size: 12, weight: 700, cls: 'ink', anchor: 'middle' }) +
        text(160, 136, 'Попробуйте изменить запрос', { size: 9, anchor: 'middle' }) +
        button(100, 146, 120, 26, 'Сбросить поиск', 'outline'),
    ),
  ),
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
  'uw-success-vague': ill(320, 210, 'Экран с галочкой: «Готово», «Операция успешно выполнена», «Спасибо, что выбираете наш банк» и кнопка «ОК»', transferResult(false)),
  'uw-pass-rules': ill(320, 220, 'Новый пароль: под полем список требований с отметками — от 8 символов (выполнено), цифра (нет), заглавная буква (выполнено)', passwordForm(false)),
  'uw-pass-tooltip': ill(320, 220, 'Новый пароль: требования спрятаны во всплывающей подсказке у иконки «i» и видны только при наведении', passwordForm(true)),
  'uw-help-structured': ill(320, 230, 'Справка «Возврат денег»: три подзаголовка — «Сроки», «Как оформить», «Деньги не пришли» — с короткими пунктами', helpScreen(true)),
  'uw-help-wall': ill(320, 230, 'Справка «Возврат денег»: один сплошной абзац из девяти строк канцелярского текста', helpScreen(false)),
  'uw-transfer-jargon': ill(
    320,
    210,
    'Экран перевода с ошибкой: «Ошибка 0x1F: транзакция отклонена эквайером (RC 05, do not honor)»',
    transferError(false),
    { error: [30, 136, 260, 52] },
  ),
  'uw-transfer-clear': ill(320, 210, 'Тот же экран: «Банк получателя не принял перевод. Попробуйте позже или по номеру карты»', transferError(true)),
  'uw-settings-negation': ill(
    320,
    210,
    'Настройки конфиденциальности: «Звук уведомлений», «Не скрывать текст сообщений на экране блокировки» (выключено), «Показывать, что я в сети»',
    privacySettings(false),
    { label: [30, 90, 260, 44] },
  ),
  'uw-settings-clear': ill(320, 210, 'Те же настройки: переключатель называется «Текст сообщений на экране блокировки»', privacySettings(true)),
  'uw-signup-spot': ill(
    320,
    292,
    'Форма регистрации: поле «Имя» с подписью; поле, где серым написано только Email; поле «Пароль» с красной рамкой и подписью «Ошибка»; кнопка «ОК»',
    signupProblems(),
    { placeholder: [36, 112, 248, 28], error: [36, 166, 248, 50], cta: [36, 238, 248, 32] },
  ),
  'uw-push-spot': ill(
    320,
    276,
    'Экран блокировки с четырьмя уведомлениями: «Заказ №4821 в пункте выдачи, хранится до 12 ноября»; «У нас для вас кое-что интересное! Загляните скорее»; «Анна: Буду в 7, возьму билеты»; «Откройте приложение, чтобы узнать важную новость»',
    pushSpot(),
    { teaser: [30, 106, 260, 44], openapp: [30, 206, 260, 44] },
  ),
  'uw-required-asterisk': ill(240, 200, 'Анкета: у полей Фамилия, Имя и Телефон звёздочки, у Отчества подпись «необязательно»', requiredForm(true)),
  'uw-required-top': ill(240, 200, 'Анкета: сверху мелко «Все поля обязательны, кроме отчества», у самих полей отметок нет', requiredForm(false)),
  'uw-date-typed': ill(240, 150, 'Поле «Дата рождения» с введённым значением 14.03.1987 и подсказкой формата', birthDate(true)),
  'uw-date-picker': ill(240, 150, 'Поле «Дата рождения» в виде календаря, открытого на ноябре 2026 года со стрелками по месяцам', birthDate(false)),
  'uw-shame': ill(240, 170, 'Попап «Скидка 10% за подписку» с полем email, кнопкой «Подписаться» и ссылкой отказа «Нет, я не люблю экономить»', confirmshame(true)),
  'uw-neutral': ill(240, 170, 'Попап «Скидка 10% за подписку» с полем email, кнопкой «Подписаться» и ссылкой отказа «Не сейчас»', confirmshame(false)),
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
