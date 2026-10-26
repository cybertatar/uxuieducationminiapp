import {
  badge,
  button,
  card,
  circle,
  field,
  finger,
  icon,
  ill,
  lines,
  path,
  rect,
  screen,
  scrim,
  tabbar,
  text,
  title,
  type Illustration,
} from './kit';

const tile = (w: number, h: number) => rect(0, 0, w, h, 'tile', 12);

/** Экран телефона с заголовком и кнопкой «назад» */
const phone = (x: number, y: number, w: number, h: number, heading: string) =>
  screen(x, y, w, h) + icon('back', x + 10, y + 12, 14) + title(x + 32, y + 24, heading);

const spinner = (cx: number, cy: number, r: number, cls = 'stroke-on-accent') =>
  path(`M${cx + r} ${cy}A${r} ${r} 0 1 1 ${cx} ${cy - r}`, cls);

const toast = (x: number, y: number, w: number, msg: string, action: string) =>
  rect(x, y, w, 34, 'toast', 10) +
  text(x + 14, y + 21, msg, { size: 11, cls: 'inverse' }) +
  text(x + w - 14, y + 21, action, { size: 11, weight: 700, cls: 'accent-inverse', anchor: 'end' });

const settingsRow = (x: number, y: number, w: number, label: string, cls: 'ink' | 'accent' = 'ink') =>
  text(x + 12, y + 22, label, { size: 11, cls }) + icon('chevron', x + w - 22, y + 10, 12) + path(`M${x + 12} ${y + 34}H${x + w}`, 'divider');

/** Товар в корзине: превью, название, размер и цена */
const cartItem = (x: number, y: number) =>
  card(x, y, 256, 50, 8) + rect(x + 8, y + 8, 34, 34, 'block', 6) + text(x + 52, y + 22, 'Футболка оверсайз', { size: 11, cls: 'ink' }) + text(x + 52, y + 37, 'Размер M', { size: 9 }) + text(x + 244, y + 22, '1 990 ₽', { size: 11, weight: 700, cls: 'ink', anchor: 'end' });

/** Нижняя панель с иконками, с подписями или без */
const toolbar = (x: number, y: number, w: number, icons: string[], labels: string[]) => {
  const step = w / icons.length;
  return (
    path(`M${x} ${y}H${x + w}`, 'divider') +
    icons
      .map((n, i) => {
        const cx = x + step * i + step / 2;
        return labels[i]
          ? icon(n, cx - 7, y + 6, 14) + text(cx, y + 34, labels[i], { size: 8, anchor: 'middle' })
          : icon(n, cx - 8, y + 12, 16);
      })
      .join('')
  );
};

/** Степпер из трёх шагов: с подписями и галочками или безымянные точки */
const checkoutSteps = (x: number, y: number, labeled: boolean) =>
  labeled
    ? ['Доставка', 'Адрес', 'Оплата']
        .map((s, i) => {
          const cx = x + i * 70;
          const done = i < 2;
          return (
            circle(cx + 7, y + 7, 7, done ? 'success' : 'accent') +
            (done ? icon('check', cx + 1, y + 1, 12, 'stroke-on-accent') : text(cx + 7, y + 10.5, '3', { size: 9, weight: 700, cls: 'on-accent', anchor: 'middle' })) +
            text(cx + 18, y + 11, s, { size: 9, cls: done ? 'accent' : 'ink', weight: done ? 400 : 700 })
          );
        })
        .join('')
    : // Счётчик шагов: видно, где ты, но вернуться к прошлому шагу с него нельзя
      text(x, y + 6, 'Шаг 3 из 3', { size: 9 }) + [0, 1, 2].map((i) => rect(x + i * 65, y + 12, 61, 5, 'accent', 2.5)).join('');

/** Переписка: входящее сообщение и два исходящих, со статусами доставки или без */
const chatBubbles = (status: boolean) =>
  rect(22, 46, 120, 24, 'block', 10) +
  text(32, 62, 'Ты сегодня в офисе?', { size: 9, cls: 'ink' }) +
  rect(84, 78, 134, 24, 'accent', 10) +
  text(94, 94, 'Да, буду к обеду', { size: 9, cls: 'on-accent' }) +
  rect(114, 110, 104, 24, 'accent', 10) +
  text(124, 126, 'Захвачу кофе', { size: 9, cls: 'on-accent' }) +
  (status
    ? text(210, 94, '12:40 ✓✓', { size: 7, cls: 'on-accent', anchor: 'end' }) +
      // Часики «ещё отправляется»
      `<circle cx="205" cy="122" r="4" fill="none" class="wf-stroke-on-accent-thin"/>` +
      path('M205 119.5V122h2', 'stroke-on-accent-thin', 'fill="none"') +
      text(218, 148, 'отправляется…', { size: 8, cls: 'muted', anchor: 'end' })
    : // Только время: когда написано — видно, дошло ли — нет
      text(210, 94, '12:40', { size: 7, cls: 'on-accent', anchor: 'end' }) + text(210, 126, '12:41', { size: 7, cls: 'on-accent', anchor: 'end' }));

/** Корзина с тремя нарушениями: корзина-иконка вплотную к «+», промокод с кодом ошибки, итог без индикатора */
const cartSpot = () =>
  phone(20, 10, 280, 244, 'Корзина') +
  [0, 1].map((i) => {
    const y = 50 + i * 52;
    return (
      card(36, y, 248, 44, 8) + rect(44, y + 7, 30, 30, 'block', 6) + text(82, y + 19, i ? 'Кеды Classic' : 'Футболка', { size: 10, cls: 'ink' }) + text(82, y + 33, i ? '4 990 ₽' : '1 990 ₽', { size: 9 }) +
      rect(206, y + 12, 70, 22, 'block', 11) + icon('minus', 212, y + 16, 13) + text(234, y + 27, '1', { size: 10, weight: 700, cls: 'ink', anchor: 'middle' }) + icon('plus', 244, y + 16, 13) + icon('trash', 260, y + 16, 13, 'stroke-danger')
    );
  }).join('') +
  field(36, 164, 160, 26, { value: 'ЛЕТО25', state: 'error', hint: 'ERR_402' }) +
  button(204, 164, 80, 26, 'Применить', 'secondary') +
  text(36, 240, 'Итого:', { size: 12, cls: 'ink' }) +
  text(284, 240, '—', { size: 14, weight: 700, cls: 'ink', anchor: 'end' });

/** Настройки без кнопки «назад», с жаргоном и двумя кнопками с одним смыслом */
const settingsSpot = () =>
  screen(20, 10, 280, 214) +
  title(36, 38, 'Уведомления') +
  text(36, 72, 'Новые заказы', { size: 11, cls: 'ink' }) +
  rect(250, 60, 34, 20, 'accent', 10) + circle(274, 70, 8, 'card') +
  path('M36 88H284', 'divider') +
  text(36, 116, 'FCM push-токен', { size: 11, cls: 'ink' }) +
  rect(250, 104, 34, 20, 'block', 10) + circle(260, 114, 8, 'card') +
  path('M36 132H284', 'divider') +
  text(36, 160, 'Скидки и акции', { size: 11, cls: 'ink' }) +
  rect(250, 148, 34, 20, 'accent', 10) + circle(274, 158, 8, 'card') +
  button(36, 186, 118, 28, 'Применить', 'secondary') +
  button(166, 186, 118, 28, 'Сохранить');

/** Экран входа: только форма или форма в окружении баннеров и бейджей */
const loginScreen = (noisy: boolean) =>
  tile(240, 200) +
  screen(20, 8, 200, 184, 12) +
  (noisy
    ? rect(30, 16, 180, 30, 'warning-shape', 6) + text(120, 35, '−50% СЕГОДНЯ!', { size: 10, weight: 700, cls: 'ink', anchor: 'middle' }) +
      title(30, 64, 'Вход', 12) +
      rect(150, 52, 60, 16, 'danger', 8) + text(180, 63, 'НОВИНКА', { size: 7.5, weight: 700, cls: 'on-accent', anchor: 'middle' })
    : title(30, 44, 'Вход', 14)) +
  field(30, noisy ? 74 : 62, 180, 24, { placeholder: 'Email' }) +
  field(30, noisy ? 104 : 96, 180, 24, { placeholder: 'Пароль' }) +
  button(30, noisy ? 134 : 132, 180, 26, 'Войти') +
  (noisy
    ? rect(30, 164, 86, 22, 'block', 6) + text(73, 178, 'Скачай app', { size: 8, anchor: 'middle' }) + rect(124, 164, 86, 22, 'accent-soft', 6) + text(167, 178, 'Акции дня', { size: 8, cls: 'on-accent', anchor: 'middle' })
    : text(120, 176, 'Забыли пароль?', { size: 9, cls: 'accent', anchor: 'middle' }));

export const heuristicsArt: Record<string, Illustration> = {
  'h-pay-double': ill(
    320,
    210,
    'Экран оформления заказа. Пользователь дважды нажимает кнопку «Оплатить», но она никак не меняется',
    phone(20, 10, 280, 190, 'Оформление заказа') +
      lines(36, 52, [120, 90]) +
      text(36, 96, 'Итого', { size: 11 }) +
      text(284, 96, '4 990 ₽', { size: 13, weight: 700, cls: 'ink', anchor: 'end' }) +
      button(36, 132, 248, 36, 'Оплатить') +
      circle(222, 150, 22, 'ripple') +
      circle(222, 150, 32, 'ripple') +
      finger(222, 150) +
      badge(256, 124, '×2'),
  ),
  'h-pay-loading': ill(
    320,
    210,
    'Та же кнопка после нажатия: показывает спиннер и текст «Оплачиваем…» и не нажимается повторно',
    phone(20, 10, 280, 190, 'Оформление заказа') +
      lines(36, 52, [120, 90]) +
      text(36, 96, 'Итого', { size: 11 }) +
      text(284, 96, '4 990 ₽', { size: 13, weight: 700, cls: 'ink', anchor: 'end' }) +
      rect(36, 132, 248, 36, 'accent-soft', 8) +
      spinner(106, 150, 7) +
      text(166, 154, 'Оплачиваем…', { size: 12, weight: 600, cls: 'on-accent', anchor: 'middle' }),
  ),
  'h-stepper': ill(
    320,
    170,
    'Индикатор шагов оформления заказа: «Корзина» пройдена, сейчас «Доставка», впереди «Оплата» и «Готово»',
    screen(20, 10, 280, 150) +
      text(36, 34, 'Шаг 2 из 4', { size: 10 }) +
      title(36, 52, 'Доставка') +
      path('M58 84H262', 'stroke-muted') +
      path('M58 84H122', 'stroke-accent-bold') +
      circle(58, 84, 10, 'accent') +
      icon('check', 51, 77, 14, 'stroke-on-accent') +
      circle(126, 84, 10, 'field-focus') +
      circle(194, 84, 10, 'field') +
      circle(262, 84, 10, 'field') +
      text(58, 110, 'Корзина', { size: 9, anchor: 'middle' }) +
      text(126, 110, 'Доставка', { size: 9, weight: 700, cls: 'ink', anchor: 'middle' }) +
      text(194, 110, 'Оплата', { size: 9, anchor: 'middle' }) +
      text(262, 110, 'Готово', { size: 9, anchor: 'middle' }) +
      field(36, 124, 248, 24, { placeholder: 'Адрес доставки' }),
  ),
  'h-metaphors': ill(
    320,
    140,
    'Две иконки рабочего стола: папка «Документы» и корзина',
    screen(20, 10, 280, 120) +
      rect(70, 30, 64, 56, 'block', 12) +
      icon('folder', 82, 38, 40) +
      text(102, 108, 'Документы', { size: 11, anchor: 'middle', cls: 'ink' }) +
      rect(186, 30, 64, 56, 'block', 12) +
      icon('trash', 198, 38, 40) +
      text(218, 108, 'Корзина', { size: 11, anchor: 'middle', cls: 'ink' }),
  ),
  'h-jargon-menu': ill(
    320,
    230,
    'Экран настроек: Профиль, Уведомления, Конфигурация OAuth-токенов, Язык, Помощь',
    phone(20, 10, 280, 210, 'Настройки') +
      settingsRow(20, 40, 280, 'Профиль') +
      settingsRow(20, 74, 280, 'Уведомления') +
      settingsRow(20, 108, 280, 'Конфигурация OAuth-токенов') +
      settingsRow(20, 142, 280, 'Язык') +
      settingsRow(20, 176, 280, 'Помощь'),
    { jargon: [20, 108, 280, 34] },
  ),
  'h-plain-menu': ill(
    320,
    230,
    'Тот же экран настроек, но пункт называется «Связанные аккаунты»',
    phone(20, 10, 280, 210, 'Настройки') +
      settingsRow(20, 40, 280, 'Профиль') +
      settingsRow(20, 74, 280, 'Уведомления') +
      settingsRow(20, 108, 280, 'Связанные аккаунты', 'accent') +
      settingsRow(20, 142, 280, 'Язык') +
      settingsRow(20, 176, 280, 'Помощь'),
  ),
  'h-undo-toast': ill(
    320,
    200,
    'Список писем, внизу тост «Письмо отправлено» с кнопкой «Отменить»',
    phone(20, 10, 280, 180, 'Входящие') +
      [48, 84, 120].map((y) => circle(44, y + 10, 10) + lines(62, y + 2, [150, 190])).join('') +
      toast(32, 146, 256, 'Письмо отправлено', 'Отменить'),
  ),
  'h-modal-no-exit': ill(
    320,
    250,
    'Модальное окно «Не пропустите скидки!» с полем e-mail и кнопкой «Подписаться», без крестика и кнопки отмены',
    screen(20, 10, 280, 230) +
      lines(36, 30, [140, 240, 220, 240, 180, 240, 200], 16, 7) +
      scrim(20, 10, 280, 230) +
      card(44, 48, 232, 156, 14) +
      text(160, 78, 'Не пропустите скидки!', { size: 13, weight: 700, cls: 'ink', anchor: 'middle' }) +
      text(160, 98, 'Подпишитесь, чтобы продолжить', { size: 10, anchor: 'middle' }) +
      field(62, 114, 196, 28, { placeholder: 'Ваш e-mail' }) +
      button(62, 154, 196, 32, 'Подписаться'),
  ),
  'h-modal-exit': ill(
    320,
    250,
    'То же окно, но с крестиком в углу и кнопкой «Не сейчас»',
    screen(20, 10, 280, 230) +
      lines(36, 30, [140, 240, 220, 240, 180, 240, 200], 16, 7) +
      scrim(20, 10, 280, 230) +
      card(44, 36, 232, 186, 14) +
      icon('close', 248, 46, 14, 'stroke-accent') +
      text(160, 72, 'Не пропустите скидки!', { size: 13, weight: 700, cls: 'ink', anchor: 'middle' }) +
      text(160, 92, 'Раз в неделю — только лучшее', { size: 10, anchor: 'middle' }) +
      field(62, 106, 196, 28, { placeholder: 'Ваш e-mail' }) +
      button(62, 144, 196, 32, 'Подписаться') +
      button(62, 182, 196, 28, 'Не сейчас', 'ghost'),
  ),
  'h-inconsistent': ill(
    320,
    200,
    'Два экрана одного приложения: на первом «Сохранить» — синяя кнопка справа, на втором — серая слева',
    screen(8, 10, 148, 180) +
      title(20, 32, 'Профиль', 12) +
      field(20, 52, 124, 22, { label: 'Имя' }) +
      field(20, 96, 124, 22, { label: 'Телефон' }) +
      button(20, 150, 56, 26, 'Отмена', 'outline') +
      button(82, 150, 62, 26, 'Сохранить') +
      screen(164, 10, 148, 180) +
      title(176, 32, 'Адрес', 12) +
      field(176, 52, 124, 22, { label: 'Город' }) +
      field(176, 96, 124, 22, { label: 'Улица' }) +
      button(176, 150, 62, 26, 'Сохранить', 'secondary', 2) +
      button(244, 150, 56, 26, 'Отмена', 'outline', 2),
  ),
  'h-consistent': ill(
    320,
    200,
    'Оба экрана с одинаковыми кнопками: «Отмена» слева, синяя «Сохранить» справа',
    screen(8, 10, 148, 180) +
      title(20, 32, 'Профиль', 12) +
      field(20, 52, 124, 22, { label: 'Имя' }) +
      field(20, 96, 124, 22, { label: 'Телефон' }) +
      button(20, 150, 56, 26, 'Отмена', 'outline') +
      button(82, 150, 62, 26, 'Сохранить') +
      screen(164, 10, 148, 180) +
      title(176, 32, 'Адрес', 12) +
      field(176, 52, 124, 22, { label: 'Город' }) +
      field(176, 96, 124, 22, { label: 'Улица' }) +
      button(176, 150, 56, 26, 'Отмена', 'outline') +
      button(238, 150, 62, 26, 'Сохранить'),
  ),
  'h-disabled-buy': ill(
    320,
    240,
    'Карточка футболки: размеры S, M, L, XL не выбраны, кнопка «В корзину» неактивна',
    phone(20, 10, 280, 220, 'Футболка') +
      rect(36, 40, 248, 70, 'block', 10) +
      text(36, 130, '1 490 ₽', { size: 13, weight: 700, cls: 'ink' }) +
      text(36, 150, 'Размер', { size: 9 }) +
      ['S', 'M', 'L', 'XL'].map((s, i) => button(36 + i * 50, 156, 42, 24, s, 'outline')).join('') +
      button(36, 192, 248, 28, 'В корзину', 'disabled'),
  ),
  'h-date-field': ill(
    320,
    182,
    'Форма регистрации: поле «Дата рождения» в фокусе — пустое текстовое поле без подсказки формата',
    screen(20, 10, 280, 162) +
      title(36, 36, 'Регистрация') +
      field(36, 64, 248, 28, { label: 'Имя', value: 'Анна' }) +
      field(36, 116, 248, 28, { label: 'Дата рождения', state: 'focus' }),
  ),
  'h-date-mask': ill(
    320,
    182,
    'Поле даты с маской ДД.ММ.ГГГГ, иконкой календаря и примером под полем',
    screen(20, 10, 280, 162) +
      title(36, 36, 'Регистрация') +
      field(36, 64, 248, 28, { label: 'Имя', value: 'Анна' }) +
      field(36, 116, 248, 28, { label: 'Дата рождения', placeholder: 'ДД.ММ.ГГГГ', state: 'focus', hint: 'Например, 03.04.1995' }) +
      icon('calendar', 260, 122, 16, 'stroke-accent'),
  ),
  'h-search-suggest': ill(
    320,
    220,
    'Поиск: введено «диз», ниже подсказки «дизайн-система», «дизайн-ревью» и блок недавних запросов',
    screen(20, 10, 280, 200) +
      field(36, 24, 248, 28, { value: 'диз', state: 'focus' }) +
      icon('search', 260, 30, 16) +
      card(36, 58, 248, 140, 10) +
      ['дизайн-система', 'дизайн-ревью', 'дизайн-токены'].map((s, i) => icon('search', 48, 68 + i * 24, 12) + text(68, 78 + i * 24, s, { size: 11, cls: 'ink' })).join('') +
      text(48, 152, 'Недавние', { size: 9 }) +
      icon('back', 46, 160, 12) +
      text(68, 170, 'гайдлайны material', { size: 11, cls: 'ink' }),
  ),
  'h-cluttered-card': ill(
    320,
    250,
    'Перегруженная карточка товара: баннер «Акция», три бейджа, звёзды, мелкая цена и пять кнопок',
    screen(20, 10, 280, 230) +
      rect(32, 22, 256, 22, 'danger', 6) +
      text(160, 37, 'АКЦИЯ! ТОЛЬКО СЕГОДНЯ!', { size: 10, weight: 700, cls: 'on-accent', anchor: 'middle' }) +
      rect(32, 50, 256, 84, 'block', 8) +
      button(40, 58, 36, 16, 'ХИТ', 'primary', 4) +
      button(80, 58, 40, 16, '−30%', 'danger', 4) +
      button(124, 58, 40, 16, 'NEW', 'secondary', 4) +
      icon('heart', 262, 58, 14) +
      [0, 1, 2, 3, 4].map((i) => icon('star', 36 + i * 14, 142, 12, 'stroke-warning')).join('') +
      lines(110, 146, [120]) +
      lines(32, 164, [256, 200]) +
      text(32, 196, '2 990 ₽', { size: 9, cls: 'muted' }) +
      [0, 1, 2, 3, 4].map((i) => button(32 + i * 52, 206, 48, 22, ['Купить', '1 клик', 'Сравнить', 'Отложить', 'Подарок'][i], i % 2 ? 'outline' : 'primary', 5)).join(''),
  ),
  'h-error-code': ill(
    320,
    180,
    'Диалог «Ошибка» с текстом Error 0x80070057 и кнопкой OK',
    screen(20, 10, 280, 160) +
      card(60, 26, 200, 128, 14) +
      circle(160, 52, 12, 'danger-soft') +
      text(160, 57, '!', { size: 14, weight: 700, cls: 'danger', anchor: 'middle' }) +
      text(160, 84, 'Ошибка', { size: 13, weight: 700, cls: 'ink', anchor: 'middle' }) +
      text(160, 102, 'Error 0x80070057', { size: 10, anchor: 'middle' }) +
      path('M60 118H260', 'divider') +
      text(160, 140, 'OK', { size: 12, weight: 700, cls: 'accent', anchor: 'middle' }),
  ),
  'h-error-human': ill(
    320,
    180,
    'Диалог «Не удалось сохранить файл: на диске не хватает места» с кнопками «Отмена» и «Освободить»',
    screen(20, 10, 280, 160) +
      card(44, 22, 232, 136, 14) +
      text(160, 50, 'Не удалось сохранить файл', { size: 12, weight: 700, cls: 'ink', anchor: 'middle' }) +
      text(160, 70, 'На диске не хватает места.', { size: 10, anchor: 'middle' }) +
      text(160, 84, 'Освободите 20 МБ и попробуйте снова.', { size: 10, anchor: 'middle' }) +
      button(58, 108, 98, 30, 'Отмена', 'outline') +
      button(164, 108, 98, 30, 'Освободить'),
  ),
  'h-delete-save': ill(
    320,
    220,
    'Настройки профиля: внизу рядом две одинаковые синие кнопки — «Сохранить» и «Удалить аккаунт»',
    phone(20, 10, 280, 200, 'Профиль') +
      field(36, 62, 248, 26, { label: 'Имя', value: 'Анна' }) +
      field(36, 112, 248, 26, { label: 'E-mail', value: 'anna@mail.ru' }) +
      button(36, 166, 120, 32, 'Сохранить') +
      button(164, 166, 120, 32, 'Удалить аккаунт'),
    { delete: [164, 166, 120, 32] },
  ),
  'h-delete-separated': ill(
    320,
    220,
    'Кнопка «Сохранить» на всю ширину, а «Удалить аккаунт» — отдельно внизу красным текстом',
    phone(20, 10, 280, 200, 'Профиль') +
      field(36, 62, 248, 26, { label: 'Имя', value: 'Анна' }) +
      field(36, 112, 248, 26, { label: 'E-mail', value: 'anna@mail.ru' }) +
      button(36, 144, 248, 30, 'Сохранить') +
      path('M36 182H284', 'divider') +
      text(160, 199, 'Удалить аккаунт', { size: 11, weight: 600, cls: 'danger', anchor: 'middle' }),
  ),
  'h-upload-silent': ill(
    320,
    200,
    'Загрузка файлов: design.fig загружен, logo.svg — 70%, а у report.pdf нет никакого статуса',
    phone(20, 10, 280, 180, 'Загрузка') +
      icon('file', 36, 50, 18) +
      text(62, 63, 'design.fig', { size: 11, cls: 'ink' }) +
      icon('check', 262, 50, 16, 'stroke-success') +
      icon('file', 36, 94, 18) +
      text(62, 107, 'logo.svg', { size: 11, cls: 'ink' }) +
      rect(62, 114, 200, 4, 'block', 2) +
      rect(62, 114, 140, 4, 'accent', 2) +
      text(284, 107, '70%', { size: 9, anchor: 'end' }) +
      icon('file', 36, 138, 18) +
      text(62, 151, 'report.pdf', { size: 11, cls: 'ink' }),
    { silent: [28, 132, 264, 32] },
  ),
  'h-upload-status': ill(
    320,
    200,
    'У report.pdf появился статус «В очереди»',
    phone(20, 10, 280, 180, 'Загрузка') +
      icon('file', 36, 50, 18) +
      text(62, 63, 'design.fig', { size: 11, cls: 'ink' }) +
      icon('check', 262, 50, 16, 'stroke-success') +
      icon('file', 36, 94, 18) +
      text(62, 107, 'logo.svg', { size: 11, cls: 'ink' }) +
      rect(62, 114, 200, 4, 'block', 2) +
      rect(62, 114, 140, 4, 'accent', 2) +
      text(284, 107, '70%', { size: 9, anchor: 'end' }) +
      icon('file', 36, 138, 18) +
      text(62, 151, 'report.pdf', { size: 11, cls: 'ink' }) +
      text(284, 151, 'В очереди', { size: 9, cls: 'accent', anchor: 'end' }) +
      rect(62, 158, 200, 4, 'block', 2),
  ),
  'h-error-toast': ill(
    320,
    220,
    'Форма входа: сверху красный тост «Ошибка 400», поле e-mail подсвечено красным без пояснения',
    phone(20, 10, 280, 200, 'Вход') +
      rect(36, 40, 248, 30, 'danger', 8) +
      text(160, 59, 'Ошибка 400', { size: 11, weight: 700, cls: 'on-accent', anchor: 'middle' }) +
      field(36, 98, 248, 28, { label: 'E-mail', value: 'anna@mail', state: 'error' }) +
      field(36, 148, 248, 28, { label: 'Пароль', value: '••••••••' }),
    { toast: [36, 40, 248, 30] },
  ),
  'h-err-inline': ill(
    240,
    150,
    'Под полем пароля сообщение «Минимум 8 символов — сейчас 6»',
    screen(10, 10, 220, 130) +
      title(24, 34, 'Регистрация', 12) +
      field(24, 60, 192, 28, { label: 'Пароль', value: '••••••', state: 'error', hint: 'Минимум 8 символов — сейчас 6' }) +
      button(24, 110, 192, 22, 'Создать аккаунт'),
  ),
  'h-err-alert': ill(
    240,
    150,
    'Сверху системный alert «Неверный ввод», поле пароля просто красное',
    screen(10, 10, 220, 130) +
      title(24, 34, 'Регистрация', 12) +
      field(24, 60, 192, 28, { label: 'Пароль', value: '••••••', state: 'error' }) +
      button(24, 110, 192, 22, 'Создать аккаунт') +
      scrim(10, 10, 220, 130) +
      card(46, 46, 148, 62, 12) +
      text(120, 72, 'Неверный ввод', { size: 11, weight: 700, cls: 'ink', anchor: 'middle' }) +
      path('M46 84H194', 'divider') +
      text(120, 100, 'OK', { size: 11, weight: 700, cls: 'accent', anchor: 'middle' }),
  ),
  'h-archive-confirm': ill(
    240,
    150,
    'Диалог «Архивировать письмо?» с кнопками «Отмена» и «Да»',
    screen(10, 10, 220, 130) +
      [24, 54, 84].map((y) => circle(30, y + 8, 8) + lines(46, y + 2, [100, 150])).join('') +
      scrim(10, 10, 220, 130) +
      card(40, 40, 160, 70, 12) +
      text(120, 66, 'Архивировать письмо?', { size: 11, weight: 700, cls: 'ink', anchor: 'middle' }) +
      button(52, 78, 64, 22, 'Отмена', 'outline') +
      button(124, 78, 64, 22, 'Да'),
  ),
  'h-archive-undo': ill(
    240,
    150,
    'Письмо сразу уходит в архив, внизу тост «Письмо в архиве · Отменить»',
    screen(10, 10, 220, 130) +
      [24, 54].map((y) => circle(30, y + 8, 8) + lines(46, y + 2, [100, 150])).join('') +
      toast(20, 98, 200, 'Письмо в архиве', 'Отменить'),
  ),
  'h-empty-blank': ill(
    240,
    170,
    'Экран «Проекты» с иллюстрацией, текстом «Здесь пока пусто» и пояснением «Проекты появятся на этом экране», без кнопки',
    screen(10, 10, 220, 150) +
      title(24, 34, 'Проекты', 12) +
      circle(120, 62, 16, 'block') +
      icon('folder', 110, 52, 20) +
      text(120, 94, 'Здесь пока пусто', { size: 11, weight: 700, cls: 'ink', anchor: 'middle' }) +
      text(120, 112, 'Проекты появятся на этом экране', { size: 9, anchor: 'middle' }) +
      tabbar(10, 128, 220, ['home', 'folder', 'user'], 1),
  ),
  'h-empty-guided': ill(
    240,
    170,
    'Экран «Проекты» с иллюстрацией, текстом «Пока нет проектов» и кнопкой «Создать проект»',
    screen(10, 10, 220, 150) +
      title(24, 34, 'Проекты', 12) +
      circle(120, 62, 16, 'block') +
      icon('folder', 110, 52, 20) +
      text(120, 94, 'Пока нет проектов', { size: 11, weight: 700, cls: 'ink', anchor: 'middle' }) +
      button(66, 102, 108, 20, 'Создать проект', 'primary', 6) +
      tabbar(10, 128, 220, ['home', 'folder', 'user'], 1),
  ),
  'h-progress-spinner': ill(
    240,
    150,
    'Загрузка видео: только крутящийся спиннер и надпись «Загрузка…»',
    screen(10, 10, 220, 130) +
      title(24, 34, 'Загрузка видео', 12) +
      spinner(120, 74, 14, 'stroke-accent-bold') +
      text(120, 112, 'Загрузка…', { size: 11, anchor: 'middle' }),
  ),
  'h-progress-bar': ill(
    240,
    150,
    'Загрузка видео: полоса прогресса 45%, «осталось ~2 мин» и кнопка «Отменить»',
    screen(10, 10, 220, 130) +
      title(24, 34, 'Загрузка видео', 12) +
      rect(24, 66, 192, 8, 'block', 4) +
      rect(24, 66, 86, 8, 'accent', 4) +
      text(24, 92, '45%', { size: 11, weight: 700, cls: 'ink' }) +
      text(216, 92, 'осталось ~2 мин', { size: 10, anchor: 'end' }) +
      button(84, 104, 72, 22, 'Отменить', 'ghost'),
  ),
  'h-icon-trash': ill(120, 90, 'Иконка корзины', rect(0, 0, 120, 90, 'tile', 12) + icon('trash', 40, 25, 40)),
  'h-icon-xcircle': ill(120, 90, 'Иконка крестика в круге', rect(0, 0, 120, 90, 'tile', 12) + icon('xcircle', 40, 25, 40)),
  'h-icon-minus': ill(120, 90, 'Иконка минуса', rect(0, 0, 120, 90, 'tile', 12) + icon('minus', 40, 25, 40)),
  'h-icon-bolt': ill(120, 90, 'Иконка молнии', rect(0, 0, 120, 90, 'tile', 12) + icon('bolt', 40, 25, 40)),
  'h-stock-vague': ill(
    320,
    200,
    'Корзина с футболкой размера M. Внизу тост «Не удалось оформить заказ» без объяснения причины',
    phone(20, 10, 280, 180, 'Корзина') +
      cartItem(32, 44) +
      button(32, 104, 256, 30, 'Оформить заказ') +
      toast(32, 146, 256, 'Не удалось оформить заказ', 'OK'),
  ),
  'h-stock-clear': ill(
    320,
    200,
    'Корзина: под футболкой красная надпись «Размер M закончился» и кнопки «Выбрать другой» и «Удалить»',
    phone(20, 10, 280, 180, 'Корзина') +
      cartItem(32, 44) +
      icon('info', 32, 102, 11, 'stroke-danger') +
      text(48, 111, 'Размер M закончился', { size: 10, cls: 'danger' }) +
      button(32, 120, 124, 26, 'Выбрать другой', 'outline') +
      button(164, 120, 124, 26, 'Удалить', 'ghost') +
      button(32, 156, 256, 26, 'Оформить заказ', 'disabled'),
  ),
  'h-toolbar-icons': ill(
    320,
    150,
    'Панель редактора из пяти иконок без подписей: ссылка, звезда, пазл, искра, молния',
    phone(20, 10, 280, 130, 'Документ') + lines(36, 48, [220, 248, 190], 12, 6) + toolbar(20, 98, 280, ['link', 'star', 'puzzle', 'sparkle', 'bolt'], []),
  ),
  'h-toolbar-labeled': ill(
    320,
    150,
    'Та же панель, у каждой иконки подпись: Ссылка, Избранное, Плагины, ИИ, Действия',
    phone(20, 10, 280, 130, 'Документ') + lines(36, 48, [220, 248, 190], 12, 6) + toolbar(20, 98, 280, ['link', 'star', 'puzzle', 'sparkle', 'bolt'], ['Ссылка', 'Избранное', 'Плагины', 'ИИ', 'Действия']),
  ),
  'h-order-iso': ill(
    320,
    190,
    'Карточка заказа №4821: дата создания записана как 2026-10-19T21:39:56Z, статус «Доставляется»',
    phone(20, 10, 280, 170, 'Заказ №4821') +
      text(36, 64, 'Создан', { size: 9 }) +
      text(36, 80, '2026-10-19T21:39:56Z', { size: 11, cls: 'ink' }) +
      text(36, 104, 'Статус', { size: 9 }) +
      text(36, 120, 'Доставляется', { size: 11, cls: 'ink' }) +
      button(36, 136, 248, 30, 'Где мой заказ?', 'outline'),
    { date: [28, 66, 200, 22] },
  ),
  'h-order-human': ill(
    320,
    190,
    'Та же карточка заказа: дата создания записана как «19 октября в 21:39»',
    phone(20, 10, 280, 170, 'Заказ №4821') +
      text(36, 64, 'Создан', { size: 9 }) +
      text(36, 80, '19 октября в 21:39', { size: 11, cls: 'ink' }) +
      text(36, 104, 'Статус', { size: 9 }) +
      text(36, 120, 'Доставляется', { size: 11, cls: 'ink' }) +
      button(36, 136, 248, 30, 'Где мой заказ?', 'outline'),
  ),
  'h-steps-back': ill(
    240,
    170,
    'Третий шаг оформления «Оплата»: есть кнопка «назад», пройденные шаги «Доставка» и «Адрес» отмечены галочками и кликабельны',
    phone(10, 10, 220, 150, 'Оплата') + checkoutSteps(24, 48, true) + field(24, 92, 192, 24, { label: 'Номер карты', value: '4276 •••• 1234' }) + button(24, 126, 192, 26, 'Оплатить'),
  ),
  'h-steps-noback': ill(
    240,
    170,
    'Третий шаг оформления «Оплата»: вместо кнопки «назад» крестик, над формой надпись «Шаг 3 из 3» и заполненная полоса из трёх отрезков',
    screen(10, 10, 220, 150) + icon('close', 22, 22, 14) + title(44, 34, 'Оплата') + checkoutSteps(24, 48, false) + field(24, 92, 192, 24, { label: 'Номер карты', value: '4276 •••• 1234' }) + button(24, 126, 192, 26, 'Оплатить'),
  ),
  'h-chat-status': ill(
    240,
    170,
    'Чат: у отправленных сообщений справа время и две галочки «прочитано», у последнего — часики «отправляется»',
    phone(10, 10, 220, 150, 'Анна') + chatBubbles(true),
  ),
  'h-chat-nostatus': ill(
    240,
    170,
    'Тот же чат: у отправленных сообщений только время, отметок о доставке нет',
    phone(10, 10, 220, 150, 'Анна') + chatBubbles(false),
  ),
  'h-cart-spot': ill(
    320,
    264,
    'Корзина: у каждого товара счётчик «минус, 1, плюс» и сразу за плюсом красная иконка корзины; промокод ЛЕТО25 с красной рамкой и подписью ERR_402; внизу «Итого: —»',
    cartSpot(),
    { trash: [256, 60, 26, 74], promo: [30, 160, 170, 42], total: [30, 226, 260, 20] },
  ),
  'h-settings-spot': ill(
    320,
    234,
    'Экран «Уведомления» без кнопки назад: переключатели «Новые заказы», «FCM push-токен», «Скидки и акции» и внизу две кнопки «Применить» и «Сохранить»',
    settingsSpot(),
    { back: [20, 14, 60, 34], jargon: [30, 100, 160, 26], buttons: [30, 182, 260, 36] },
  ),
  'h-login-clean': ill(240, 200, 'Экран входа: заголовок, поля email и пароль, кнопка «Войти» и ссылка «Забыли пароль?»', loginScreen(false)),
  'h-login-noisy': ill(240, 200, 'Экран входа с жёлтым баннером «−50% сегодня!», бейджем «Новинка», полями и кнопкой, а внизу плашки «Скачай app» и «Акции дня»', loginScreen(true)),
};
