import { button, card, circle, cursor, field, finger, icon, ill, lines, path, rect, screen, tabbar, text, title, type Illustration } from './kit';

const phone = (x: number, y: number, w: number, h: number, heading: string) =>
  screen(x, y, w, h) + icon('back', x + 10, y + 12, 14) + title(x + 32, y + 24, heading);

const tile = (w: number, h: number) => rect(0, 0, w, h, 'tile', 12);

/** Сетка точек 3×3 с заданными шагами по x и y */
const dots = (x: number, y: number, xs: number[], ys: number[], r = 5) =>
  ys.map((cy) => xs.map((cx) => circle(x + cx, y + cy, r, 'ink-shape')).join('')).join('');

const proximityForm = (good: boolean) => {
  // Плохая форма: подпись одинаково далеко от своего поля и от поля сверху.
  // Хорошая: подпись прижата к своему полю, а между группами больше воздуха.
  const gap = good ? 6 : 16;
  const block = good ? 58 : 64;
  return ['Город', 'Улица и дом', 'Квартира']
    .map((label, i) => {
      const y = 54 + i * block;
      return text(36, y, label, { size: 10 }) + rect(36, y + gap, 168, 24, 'field', 6);
    })
    .join('');
};

/** Зона, до которой удобно дотянуться большим пальцем правой руки */
const thumbZone = () =>
  path('M50 240A130 130 0 0 1 180 110V226a14 14 0 0 1-14 14z', 'thumb-zone') + text(150, 160, 'зона пальца', { size: 8, cls: 'success', anchor: 'middle' });

/** Пилюля-метка: обводкой — нажимается, заливкой — просто информация */
const pill = (x: number, y: number, w: number, label: string, kind: 'action' | 'info' | 'same') =>
  (kind === 'info' ? rect(x, y, w, 20, 'block', 10) : rect(x, y, w, 20, 'field', 10)) +
  text(x + w / 2, y + 13.5, label, { size: 9, weight: kind === 'info' ? 400 : 600, cls: kind === 'info' ? 'text' : 'accent', anchor: 'middle' });

/** Карточка товара с метками и фильтрами */
const tagsCard = (same: boolean) =>
  phone(20, 10, 280, 180, 'Кроссовки') +
  rect(36, 44, 76, 76, 'block', 8) +
  text(124, 58, 'Беговые Air 2', { size: 11, weight: 600, cls: 'ink' }) +
  text(124, 74, '8 490 ₽', { size: 11, weight: 700, cls: 'ink' }) +
  pill(124, 86, 64, 'Новинка', same ? 'same' : 'info') +
  pill(194, 86, 46, 'Хит', same ? 'same' : 'info') +
  text(36, 140, 'Выберите', { size: 9 }) +
  pill(36, 150, 76, 'Размер ▾', 'action') +
  pill(118, 150, 66, 'Цвет ▾', 'action');

/** Анкета: последний вопрос и, при желании, индикатор прогресса */
const survey = (progress: boolean) =>
  phone(10, 10, 220, 160, 'Опрос') +
  (progress
    ? text(24, 54, 'Вопрос 9 из 10', { size: 9 }) + rect(24, 60, 192, 6, 'block', 3) + rect(24, 60, 173, 6, 'success', 3)
    : text(24, 54, 'Вопрос 9', { size: 9 }) + text(24, 68, 'Спасибо, что помогаете нам стать лучше!', { size: 8, cls: 'muted' })) +
  text(24, 88, 'Как часто вы пользуетесь', { size: 11, cls: 'ink' }) +
  text(24, 103, 'приложением?', { size: 11, cls: 'ink' }) +
  button(24, 114, 92, 22, 'Каждый день', 'outline') +
  button(124, 114, 92, 22, 'Реже', 'outline') +
  button(24, 142, 192, 22, 'Далее');

export const lawsArt: Record<string, Illustration> = {
  'l-tiny-close': ill(
    320,
    220,
    'Рекламный баннер на весь экран; крестик закрытия крошечный и прижат к углу',
    rect(20, 10, 280, 200, 'accent', 14) +
      text(160, 92, '−70%', { size: 40, weight: 800, cls: 'on-accent', anchor: 'middle' }) +
      text(160, 118, 'на всё до конца недели', { size: 12, cls: 'on-accent', anchor: 'middle' }) +
      rect(70, 150, 180, 36, 'card', 18) +
      text(160, 173, 'Хочу скидку', { size: 12, weight: 700, cls: 'accent', anchor: 'middle' }) +
      icon('close', 285, 15, 7, 'stroke-on-accent-thin'),
    { close: [278, 10, 22, 22] },
  ),
  'l-big-close': ill(
    320,
    220,
    'Тот же баннер, но у крестика тач-зона 44×44 pt',
    rect(20, 10, 280, 200, 'accent', 14) +
      text(160, 92, '−70%', { size: 40, weight: 800, cls: 'on-accent', anchor: 'middle' }) +
      text(160, 118, 'на всё до конца недели', { size: 12, cls: 'on-accent', anchor: 'middle' }) +
      rect(70, 150, 180, 36, 'card', 18) +
      text(160, 173, 'Хочу скидку', { size: 12, weight: 700, cls: 'accent', anchor: 'middle' }) +
      circle(272, 38, 20, 'on-accent-soft') +
      icon('close', 264, 30, 16, 'stroke-on-accent') +
      text(272, 72, '44 pt', { size: 9, cls: 'on-accent', anchor: 'middle' }),
  ),
  'l-proximity-bad': ill(
    240,
    240,
    'Форма доставки: подписи стоят одинаково далеко от своего и от соседнего поля',
    screen(20, 10, 200, 220) + title(36, 30, 'Доставка', 12) + proximityForm(false),
  ),
  'l-proximity-good': ill(
    240,
    240,
    'Форма доставки: каждая подпись прижата к своему полю, между группами больше воздуха',
    screen(20, 10, 200, 220) + title(36, 30, 'Доставка', 12) + proximityForm(true),
  ),
  'l-phone-chunk': ill(
    320,
    130,
    'Один и тот же номер: 79123456789 сплошной строкой и +7 912 345-67-89 с разбивкой на группы',
    screen(20, 10, 280, 110) +
      text(36, 40, 'Слитно', { size: 9 }) +
      text(36, 60, '79123456789', { size: 16, weight: 600, cls: 'ink' }) +
      path('M36 74H284', 'divider') +
      text(36, 92, 'С разбивкой', { size: 9 }) +
      text(36, 112, '+7 912 345-67-89', { size: 16, weight: 600, cls: 'ink' }),
  ),
  'l-store-header': ill(
    320,
    150,
    'Шапка интернет-магазина: логотип слева, поиск по центру, профиль и корзина справа',
    screen(10, 10, 300, 130, 10) +
      rect(24, 24, 44, 18, 'ink-shape', 4) +
      field(84, 22, 140, 22, { placeholder: 'Поиск' }) +
      icon('user', 238, 25, 16) +
      icon('cart', 268, 25, 16) +
      circle(284, 25, 6, 'danger') +
      text(284, 28, '2', { size: 8, weight: 700, cls: 'on-accent', anchor: 'middle' }) +
      path('M10 54H310', 'divider') +
      [0, 1, 2].map((i) => rect(24 + i * 96, 66, 84, 56, 'block', 8)).join(''),
  ),
  'l-card-region': ill(
    320,
    170,
    'Две карточки товаров: фото, название и цена каждой собраны на общем фоне',
    screen(10, 10, 300, 150) +
      [0, 1].map((i) => card(26 + i * 140, 24, 128, 122, 10) + rect(36 + i * 140, 34, 108, 56, 'block', 6) + lines(36 + i * 140, 100, [90, 60]) + text(36 + i * 140, 136, '1 290 ₽', { size: 11, weight: 700, cls: 'ink' })).join(''),
  ),
  'l-stepper-line': ill(
    320,
    110,
    'Четыре шага онбординга, соединённые линией',
    screen(10, 10, 300, 90) +
      path('M54 46H266', 'stroke-muted') +
      path('M54 46H124', 'stroke-accent-bold') +
      [54, 124, 194, 266].map((cx, i) => circle(cx, 46, 9, i < 2 ? 'accent' : 'field')).join('') +
      ['Аккаунт', 'Профиль', 'Команда', 'Готово'].map((s, i) => text([54, 124, 194, 266][i], 76, s, { size: 9, anchor: 'middle' })).join(''),
  ),
  'l-loyalty': ill(
    320,
    150,
    'Карта лояльности кофейни на 10 штампов, 2 уже проставлены',
    card(30, 14, 260, 122, 14) +
      title(48, 40, 'Кофейня «Зерно»') +
      Array.from({ length: 10 }, (_, i) => {
        const cx = 62 + (i % 5) * 49;
        const cy = 70 + Math.floor(i / 5) * 34;
        return circle(cx, cy, 13, i < 2 ? 'accent' : 'field') + (i < 2 ? icon('check', cx - 7, cy - 7, 14, 'stroke-on-accent') : '');
      }).join('') +
      text(48, 128, 'Ещё 8 — и кофе в подарок', { size: 10 }),
  ),
  'l-profile-progress': ill(
    320,
    190,
    'Профиль заполнен на 60%: три пункта отмечены, два ещё нет',
    phone(20, 10, 280, 170, 'Профиль') +
      text(36, 58, 'Профиль заполнен на 60%', { size: 11, weight: 600, cls: 'ink' }) +
      rect(36, 66, 248, 6, 'block', 3) +
      rect(36, 66, 149, 6, 'accent', 3) +
      ['Фото', 'Должность', 'Город', 'Навыки', 'Портфолио'].map((s, i) => {
        const y = 90 + i * 17;
        return (i < 3 ? icon('check', 36, y - 9, 12, 'stroke-success') : circle(42, y - 3, 5, 'field')) + text(56, y, s, { size: 10, cls: i < 3 ? 'muted' : 'ink' });
      }).join(''),
  ),
  'l-tiny-buy': ill(
    320,
    240,
    'Карточка товара: крупное фото и описание, а «Купить» — мелкая ссылка в правом верхнем углу',
    phone(20, 10, 280, 220, 'Кроссовки') +
      text(284, 24, 'Купить', { size: 8, cls: 'accent', anchor: 'end' }) +
      rect(36, 40, 248, 100, 'block', 10) +
      text(36, 162, '8 990 ₽', { size: 15, weight: 700, cls: 'ink' }) +
      lines(36, 176, [248, 220, 180]) +
      tabbar(20, 204, 280, ['home', 'search', 'cart', 'user']),
    { buy: [252, 14, 40, 16] },
  ),
  'l-big-buy': ill(
    320,
    240,
    'Кнопка «Купить» на всю ширину внизу экрана, в зоне большого пальца',
    phone(20, 10, 280, 220, 'Кроссовки') +
      rect(36, 40, 248, 90, 'block', 10) +
      text(36, 150, '8 990 ₽', { size: 15, weight: 700, cls: 'ink' }) +
      lines(36, 162, [248, 200]) +
      button(36, 186, 248, 34, 'Купить'),
  ),
  'l-ambiguous-price': ill(
    320,
    220,
    'Список товаров без разделителей; цена стоит ровно посередине между первым и вторым товаром',
    phone(20, 10, 280, 200, 'Каталог') +
      rect(36, 44, 56, 56, 'block', 8) +
      lines(104, 52, [140, 100]) +
      text(104, 129, '2 490 ₽', { size: 12, weight: 700, cls: 'ink' }) +
      rect(36, 144, 56, 56, 'block', 8) +
      lines(104, 152, [140, 100]),
    { price: [100, 114, 70, 22] },
  ),
  'l-clear-price': ill(
    320,
    220,
    'У каждого товара своя карточка, цена внутри неё',
    phone(20, 10, 280, 200, 'Каталог') +
      card(30, 40, 260, 76, 10) +
      rect(40, 50, 56, 56, 'block', 8) +
      lines(108, 58, [140, 100]) +
      text(108, 98, '2 490 ₽', { size: 12, weight: 700, cls: 'ink' }) +
      card(30, 124, 260, 76, 10) +
      rect(40, 134, 56, 56, 'block', 8) +
      lines(108, 142, [140, 100]) +
      text(108, 182, '3 190 ₽', { size: 12, weight: 700, cls: 'ink' }),
  ),
  'l-hick-many': ill(
    240,
    190,
    'Выбор тарифа: 12 одинаковых вариантов без рекомендации',
    screen(10, 10, 220, 170) +
      title(24, 32, 'Выберите тариф', 12) +
      Array.from({ length: 12 }, (_, i) => button(24 + (i % 3) * 66, 46 + Math.floor(i / 3) * 32, 60, 26, `Тариф ${i + 1}`, 'outline', 6)).join(''),
  ),
  'l-hick-few': ill(
    240,
    190,
    'Выбор тарифа: три варианта, средний отмечен как рекомендуемый',
    screen(10, 10, 220, 170) +
      title(24, 32, 'Выберите тариф', 12) +
      button(24, 50, 192, 30, 'Базовый', 'outline', 8) +
      rect(24, 88, 192, 38, 'field-focus', 8) +
      text(120, 104, 'Команда', { size: 11, weight: 700, cls: 'ink', anchor: 'middle' }) +
      text(120, 118, 'Рекомендуем', { size: 9, weight: 600, cls: 'accent', anchor: 'middle' }) +
      button(24, 134, 192, 30, 'Бизнес', 'outline', 8),
  ),
  'l-thumb-top': ill(
    200,
    250,
    'Главная кнопка «Отправить» вверху экрана, вне зоны досягаемости большого пальца',
    screen(20, 10, 160, 230) +
      thumbZone() +
      button(32, 24, 136, 28, 'Отправить') +
      lines(32, 70, [136, 110, 136, 90]),
  ),
  'l-thumb-bottom': ill(
    200,
    250,
    'Главная кнопка «Отправить» внизу экрана, в зоне большого пальца',
    screen(20, 10, 160, 230) +
      thumbZone() +
      lines(32, 30, [136, 110, 136, 90]) +
      button(32, 198, 136, 28, 'Отправить'),
  ),
  'l-region-floating': ill(
    240,
    170,
    'Фото, названия и цены двух товаров стоят на одинаковом расстоянии без фона',
    screen(10, 10, 220, 150) +
      [0, 1].map((i) => rect(24 + i * 104, 26, 88, 56, 'block', 6) + lines(24 + i * 104, 96, [80, 54]) + text(24 + i * 104, 136, '1 290 ₽', { size: 10, weight: 700, cls: 'ink' })).join(''),
  ),
  'l-region-cards': ill(
    240,
    170,
    'Каждый товар — отдельная карточка с фоном',
    screen(10, 10, 220, 150) +
      [0, 1].map((i) => card(20 + i * 104, 20, 96, 128, 10) + rect(28 + i * 104, 28, 80, 52, 'block', 6) + lines(28 + i * 104, 92, [72, 50]) + text(28 + i * 104, 132, '1 290 ₽', { size: 10, weight: 700, cls: 'ink' })).join(''),
  ),
  ...Object.fromEntries(
    ([20, 28, 44, 32] as const).map((pt) => [
      `l-target-${pt}`,
      ill(
        120,
        110,
        `Кнопка ${pt}×${pt} pt рядом с пальцем`,
        tile(120, 110) + rect(60 - pt / 2, 46 - pt / 2, pt, pt, 'accent', 8) + finger(60, 46, 0.9) + text(60, 100, `${pt} pt`, { size: 11, weight: 700, cls: 'ink', anchor: 'middle' }),
      ),
    ]),
  ),
  'l-dots-even': ill(120, 110, 'Точки 3×3 на одинаковом расстоянии', tile(120, 110) + dots(0, 0, [36, 60, 84], [31, 55, 79])),
  'l-dots-columns': ill(120, 110, 'Точки сгруппированы в три вертикальных столбца', tile(120, 110) + dots(0, 0, [24, 60, 96], [41, 55, 69])),
  'l-dots-rows': ill(120, 110, 'Точки сгруппированы в три горизонтальные строки', tile(120, 110) + dots(0, 0, [46, 60, 74], [21, 55, 89])),
  'l-dots-random': ill(
    120,
    110,
    'Девять точек, разбросанных хаотично',
    tile(120, 110) + [[30, 30], [52, 72], [88, 24], [70, 50], [26, 80], [96, 84], [44, 46], [80, 70], [60, 22]].map(([x, y]) => circle(x, y, 5, 'ink-shape')).join(''),
  ),
  'l-row-same': ill(120, 110, 'Пять одинаковых серых квадратов', tile(120, 110) + [0, 1, 2, 3, 4].map((i) => rect(14 + i * 19, 46, 16, 16, 'ink-shape', 3)).join('')),
  'l-row-outlier': ill(
    120,
    110,
    'Пять квадратов, один из них цветной',
    tile(120, 110) + [0, 1, 2, 3, 4].map((i) => rect(14 + i * 19, 46, 16, 16, i === 3 ? 'accent' : 'ink-shape', 3)).join(''),
  ),
  'l-row-all-different': ill(
    120,
    110,
    'Пять фигур, все разные по цвету и форме',
    tile(120, 110) +
      rect(14, 46, 16, 16, 'accent', 3) +
      circle(41, 54, 8, 'danger') +
      rect(52, 46, 16, 16, 'success', 8) +
      path('M79 62l8-16 8 16z', 'warning-shape') +
      rect(98, 46, 16, 16, 'ink-shape', 0),
  ),
  'l-row-two': ill(
    120,
    110,
    'Пять квадратов, два из них цветные разными цветами',
    tile(120, 110) + [0, 1, 2, 3, 4].map((i) => rect(14 + i * 19, 46, 16, 16, i === 1 ? 'accent' : i === 3 ? 'danger' : 'ink-shape', 3)).join(''),
  ),
  'l-pragnanz': ill(
    320,
    140,
    'Контуры квадрата и круга, наложенные друг на друга',
    screen(20, 10, 280, 120) + rect(118, 34, 60, 60, 'outline-shape', 2) + circle(186, 80, 34, 'outline-shape'),
  ),
  'l-pragnanz-simple': ill(
    120,
    110,
    'Отдельные квадрат и круг',
    tile(120, 110) + rect(18, 34, 38, 38, 'outline-shape', 2) + circle(84, 53, 20, 'outline-shape'),
  ),
  'l-pragnanz-pieces': ill(
    120,
    110,
    'Три странные фигуры, на которые можно разрезать рисунок',
    tile(120, 110) +
      path('M14 30h34v22c-8 2-14 8-16 16H14z', 'outline-shape') +
      path('M54 52c2-6 6-10 12-12v22H54z', 'outline-shape') +
      path('M74 40c18 2 30 16 28 32-2 14-14 24-28 24-14 0-24-8-28-20h28z', 'outline-shape'),
  ),
  'l-pragnanz-blob': ill(
    120,
    110,
    'Одна сложная слитная фигура',
    tile(120, 110) + path('M24 24h40v20c14-4 34 6 34 26 0 18-14 28-28 28-16 0-26-10-28-24H24z', 'outline-shape'),
  ),
  'l-pragnanz-moons': ill(
    120,
    110,
    'Два полумесяца',
    tile(120, 110) + path('M50 28A27 27 0 1 0 50 82A34 34 0 0 1 50 28Z', 'outline-shape') + path('M70 28A27 27 0 1 1 70 82A34 34 0 0 0 70 28Z', 'outline-shape'),
  ),
  'l-cursor-target': ill(
    320,
    120,
    'Схема закона Фиттса: курсор и цель; путь до большой близкой цели короче, чем до маленькой дальней',
    screen(20, 10, 280, 100) +
      cursor(44, 48) +
      path('M62 58C110 40 140 40 168 54', 'dash-accent', 'fill="none"') +
      circle(190, 58, 20, 'accent') +
      path('M62 64C140 96 220 96 272 66', 'dash-muted', 'fill="none"') +
      circle(278, 62, 5, 'ink-shape') +
      text(190, 94, 'близко и крупно', { size: 9, anchor: 'middle', cls: 'accent' }) +
      text(278, 46, 'далеко и мелко', { size: 9, anchor: 'end' }),
  ),
  'l-tags-distinct': ill(
    320,
    200,
    'Карточка кроссовок: метки «Новинка» и «Хит» — серые плашки, а кнопки «Размер» и «Цвет» — с обводкой и цветным текстом',
    tagsCard(false),
  ),
  'l-tags-same': ill(
    320,
    200,
    'Та же карточка: метки «Новинка» и «Хит» выглядят точно так же, как кнопки «Размер» и «Цвет»',
    tagsCard(true),
  ),
  'l-phone-strict': ill(
    320,
    170,
    'Поле «Телефон» со значением «+7 (912) 345-67-89» обведено красным, под ним ошибка «Только цифры, без пробелов и скобок»',
    phone(20, 10, 280, 150, 'Доставка') +
      field(36, 66, 248, 28, { label: 'Телефон', value: '+7 (912) 345-67-89', state: 'error', hint: 'Только цифры, без пробелов и скобок' }) +
      button(36, 118, 248, 30, 'Продолжить', 'disabled'),
    { phone: [36, 58, 248, 50] },
  ),
  'l-phone-tolerant': ill(
    320,
    170,
    'То же поле принимает номер со скобками и пробелами и показывает, как его сохранят: +7 912 345-67-89',
    phone(20, 10, 280, 150, 'Доставка') +
      field(36, 66, 248, 28, { label: 'Телефон', value: '+7 (912) 345-67-89', state: 'success', hint: 'Сохраним как +7 912 345-67-89' }) +
      button(36, 118, 248, 30, 'Продолжить'),
  ),
  'l-goal-progress': ill(240, 180, 'Опрос: над вопросом надпись «Вопрос 9 из 10» и почти заполненная полоса прогресса', survey(true)),
  'l-goal-none': ill(240, 180, 'Тот же опрос: вместо индикатора надпись «Вопрос 9» и благодарность, сколько вопросов осталось — непонятно', survey(false)),
  'l-chunk-wall': ill(
    240,
    180,
    'Статья сплошным текстом: двенадцать одинаковых строк без заголовков и отступов',
    phone(10, 10, 220, 160, 'Как вернуть заказ') + lines(24, 48, [190, 192, 186, 192, 180, 192, 188, 190, 176, 192, 184, 120], 9, 4),
  ),
  'l-chunk-sections': ill(
    240,
    180,
    'Та же статья разбита на три шага: у каждого короткий жирный заголовок и одна-две строки текста',
    phone(10, 10, 220, 160, 'Как вернуть заказ') +
      ['1. Оформите заявку', '2. Упакуйте товар', '3. Сдайте в пункт'].map((s, i) => text(24, 54 + i * 38, s, { size: 10, weight: 700, cls: 'ink' }) + lines(24, 60 + i * 38, i === 1 ? [180] : [186, 120], 8, 4)).join(''),
  ),
  'l-end-plain': ill(
    240,
    180,
    'Экран после покупки билетов: галочка, «Операция выполнена», «Код транзакции 8F3A-22C1» и кнопка OK',
    screen(10, 10, 220, 160) +
      circle(120, 50, 18, 'block') +
      icon('check', 108, 38, 24, 'stroke') +
      text(120, 92, 'Операция выполнена', { size: 14, weight: 700, cls: 'ink', anchor: 'middle' }) +
      text(120, 110, 'Код транзакции 8F3A-22C1', { size: 9, anchor: 'middle' }) +
      button(24, 130, 192, 26, 'OK'),
  ),
  'l-end-good': ill(
    240,
    180,
    'Экран после покупки: большая зелёная галочка, «Билеты ваши!», «Отправили их на почту» и кнопка «Открыть билеты»',
    screen(10, 10, 220, 160) +
      circle(120, 50, 18, 'success') +
      icon('check', 108, 38, 24, 'stroke-on-accent') +
      text(120, 92, 'Билеты ваши!', { size: 14, weight: 700, cls: 'ink', anchor: 'middle' }) +
      text(120, 110, 'Отправили их на почту. Хорошего концерта!', { size: 9, anchor: 'middle' }) +
      button(24, 130, 192, 26, 'Открыть билеты'),
  ),
};
