import { card, circle, finger, icon, ill, lines, path, rect, screen, text, title, type Illustration } from './kit';

/** Кривая Нильсена: доля найденных проблем 1 − (1 − 0.31)^n для n участников */
const found = (n: number) => 1 - Math.pow(1 - 0.31, n);
const cx = (n: number) => 52 + n * 16;
const cy = (p: number) => 156 - p * 120;

const curve = () =>
  path('M52 156H300M52 30V156', 'divider') +
  [0, 0.5, 1].map((p) => text(46, cy(p) + 3, `${p * 100}%`, { size: 8, anchor: 'end' })).join('') +
  [0, 5, 10, 15].map((n) => text(cx(n), 170, String(n), { size: 8, anchor: 'middle' })).join('') +
  text(300, 184, 'Участников', { size: 9, anchor: 'end' }) +
  text(56, 22, 'Найдено проблем', { size: 9 }) +
  path(
    'M' +
      Array.from({ length: 16 }, (_, n) => `${cx(n)} ${cy(found(n)).toFixed(1)}`).join('L'),
    'stroke-accent-bold',
    'fill="none"',
  ) +
  path(`M${cx(5)} ${cy(found(5))}V156`, 'dash-muted') +
  circle(cx(5), cy(found(5)), 5, 'accent') +
  text(cx(5) + 10, cy(found(5)) + 22, '5 человек — 85%', { size: 10, weight: 700, cls: 'ink' });

/** Карточка задания для участника */
const taskCard = (rows: string[]) =>
  screen(20, 10, 280, 150) +
  title(36, 38, 'Задание 2') +
  rows.map((r, i) => text(36, 66 + i * 18, r, { size: 11, cls: 'ink' })).join('');

/** Скрипт модератора: третий вопрос — наводящий или исправленный */
const script = (fixed: boolean) =>
  screen(20, 10, 280, 200) +
  title(36, 38, 'Скрипт модератора') +
  [
    '1. Как вы обычно покупаете билеты в кино?',
    '2. Найдите сеанс на эту субботу.',
    fixed ? '3. Как вы выбирали дату сеанса?' : '3. Правда, фильтр по дате удобный?',
    '4. Что было легко, а что — трудно?',
  ]
    .map((q, i) => {
      const y = 54 + i * 36;
      return card(32, y, 256, 28, 6) + text(42, y + 18, q, { size: 10, cls: 'ink' });
    })
    .join('');

const findings = [
  ['Не находят кнопку оплаты', 5],
  ['Код из СМС сбрасывается', 4],
  ['Путают «Сохранить» и «Готово»', 3],
  ['Мелкий шрифт в чеке', 2],
  ['Опечатка в подсказке', 1],
] as const;

const reportFlat = () =>
  screen(20, 10, 280, 200) +
  title(36, 38, 'Находки (23)') +
  [findings[3], findings[0], findings[4], findings[2], findings[1]]
    .map(([s], i) => {
      const y = 58 + i * 20;
      return circle(40, y - 3, 2.5, 'ink-shape') + text(50, y, s, { size: 10, cls: 'ink' });
    })
    .join('') +
  lines(50, 154, [180, 150, 200, 120], 10, 5) +
  text(284, 200, '…и ещё 14', { size: 9, anchor: 'end' });

const reportPrio = () => {
  const groups = [
    ['Критично', 'danger', [findings[0], findings[1]]],
    ['Серьёзно', 'warning-shape', [findings[2]]],
    ['Косметика', 'block', [findings[3], findings[4]]],
  ] as const;
  let y = 46;
  let out = screen(20, 10, 280, 200) + title(36, 34, 'Находки по серьёзности');
  for (const [name, cls, items] of groups) {
    y += 14;
    out += rect(36, y - 9, 8, 8, cls, 2) + text(50, y - 1, name, { size: 10, weight: 700, cls: 'ink' });
    for (const [s, n] of items) {
      y += 16;
      out += text(50, y, s, { size: 10, cls: 'ink' }) + text(284, y, `${n} из 5`, { size: 9, anchor: 'end' });
    }
    y += 6;
  }
  return out;
};

/** Шкала SEQ из 7 точек, отмечена оценка участника */
const seq = (picked: number) =>
  screen(20, 10, 280, 130) +
  text(160, 40, 'Насколько легко или трудно', { size: 11, weight: 600, cls: 'ink', anchor: 'middle' }) +
  text(160, 56, 'было выполнить задание?', { size: 11, weight: 600, cls: 'ink', anchor: 'middle' }) +
  Array.from({ length: 7 }, (_, i) => {
    const x = 58 + i * 34;
    return (i + 1 === picked ? circle(x, 84, 12, 'accent') : circle(x, 84, 12, 'field')) + text(x, 88, String(i + 1), { size: 10, weight: 600, cls: i + 1 === picked ? 'on-accent' : 'ink', anchor: 'middle' });
  }).join('') +
  text(46, 116, 'Очень трудно', { size: 9 }) +
  text(274, 116, 'Очень легко', { size: 9, anchor: 'end' });

/** Текстовое дерево навигации для tree testing, у пунктов — доля первых кликов */
const tree = () =>
  screen(20, 10, 280, 190) +
  title(36, 36, 'Где узнать цену подписки?', 12) +
  ([
    ['Каталог', 0, '8%', false],
    ['Поддержка', 0, '64%', true],
    ['Аккаунт', 0, '28%', false],
    ['Подписка и оплата', 1, '', false],
    ['Тарифы  ✓', 2, '', false],
  ] as const)
    .map(([label, depth, share, hot], i) => {
      const y = 58 + i * 26;
      const x = 40 + depth * 18;
      return (
        (hot ? rect(32, y - 14, 256, 22, 'danger-soft', 6) : '') +
        (depth ? path(`M${x - 10} ${y - 18}V${y - 4}H${x - 2}`, 'stroke-muted', 'fill="none"') : '') +
        text(x, y, label, { size: 11, weight: depth === 2 ? 700 : 400, cls: depth === 2 ? 'success' : 'ink' }) +
        (share ? text(278, y, share, { size: 10, weight: 600, cls: hot ? 'danger' : 'text', anchor: 'end' }) : '')
      );
    })
    .join('');

export const researchArt: Record<string, Illustration> = {
  'ut-curve': ill(320, 190, 'График: доля найденных проблем растёт быстро на первых участниках и выходит на плато; на 5 участниках — 85%', curve()),
  'ut-task-scenario': ill(
    320,
    170,
    'Задание: «В субботу вы хотите сходить в кино с другом. Найдите подходящий сеанс и купите два билета»',
    taskCard(['В субботу вы хотите сходить в кино', 'с другом. Найдите подходящий сеанс', 'и купите два билета.']),
  ),
  'ut-task-steps': ill(
    320,
    170,
    'Задание: «Нажмите на вкладку „Афиша“, выберите фильтр „Суббота“ и купите два билета»',
    taskCard(['Нажмите на вкладку «Афиша»,', 'выберите фильтр «Суббота»', 'и купите два билета.']),
  ),
  'ut-script': ill(
    320,
    220,
    'Скрипт модератора из четырёх вопросов; третий: «Правда, фильтр по дате удобный?»',
    script(false),
    { leading: [28, 122, 264, 36] },
  ),
  'ut-script-fixed': ill(320, 220, 'Тот же скрипт; третий вопрос: «Как вы выбирали дату сеанса?»', script(true)),
  'ut-seq': ill(320, 150, 'Вопрос SEQ «Насколько легко или трудно было выполнить задание?» со шкалой от 1 до 7; выбрана тройка', seq(3)),
  'ut-task-clue': ill(
    320,
    170,
    'Задание: «Откройте раздел „Тарифы“ и узнайте, сколько стоит подписка на год»',
    taskCard(['Откройте раздел «Тарифы» и узнайте,', 'сколько стоит подписка на год.']),
    { clue: [30, 50, 256, 22] },
  ),
  'ut-task-clue-fixed': ill(320, 170, 'Задание: «Вы думаете оформить подписку надолго. Узнайте, сколько стоит подписка на год»', taskCard(['Вы думаете оформить подписку надолго.', 'Узнайте, сколько стоит подписка на год.'])),
  'ut-tree': ill(
    320,
    210,
    'Тест дерева «Где узнать цену подписки?»: первые клики — Каталог 8%, Поддержка 64%, Аккаунт 28%; правильный путь — Аккаунт → Подписка и оплата → Тарифы',
    tree(),
  ),
  'ut-tree-task-short': ill(320, 170, 'Задание для теста дерева: «Вы хотите вернуть кроссовки, которые не подошли по размеру. Где вы будете это искать?»', taskCard(['Вы хотите вернуть кроссовки, которые', 'не подошли по размеру. Где вы будете', 'это искать?'])),
  'ut-tree-task-story': ill(
    320,
    170,
    'Задание для теста дерева: история про подарок подруге, опоздавшего курьера и неподошедший размер; цель — найти, где оформить возврат, — в конце',
    taskCard(['Подруге на день рождения вы заказали', 'кроссовки. Курьер опоздал, но привёз,', 'подруга примерила — размер не тот.', 'Найдите, где оформить возврат.']),
  ),
  'ut-report-flat': ill(320, 220, 'Отчёт «Находки (23)»: длинный список проблем вперемешку, без оценок и без числа участников', reportFlat()),
  'ut-report-prio': ill(
    320,
    220,
    'Отчёт «Находки по серьёзности»: группы «Критично», «Серьёзно», «Косметика», у каждой находки — сколько участников из 5 столкнулись',
    reportPrio(),
  ),
};

export const researchTrackArt: Record<string, Illustration> = {
  'track-usability-testing': ill(
    320,
    112,
    '',
    screen(24, 10, 64, 96, 10) +
      lines(34, 26, [44, 30]) +
      rect(34, 70, 44, 14, 'accent', 4) +
      finger(60, 78, 1.1) +
      card(104, 22, 76, 30, 12) +
      `<path d="M116 52l-6 10 14-10" class="wf-card"/>` +
      text(142, 41, 'Хм, где…', { size: 10, cls: 'ink', anchor: 'middle' }) +
      card(204, 14, 96, 86, 8) +
      [0, 1, 2].map((i) => icon(i < 2 ? 'check' : 'close', 212, 24 + i * 22, 14, i < 2 ? 'stroke-success' : 'stroke-danger') + rect(232, 29 + i * 22, [52, 40, 46][i], 5, 'block', 2.5)).join('') +
      text(252, 94, '5 из 5', { size: 9, anchor: 'middle' }),
  ),
};
