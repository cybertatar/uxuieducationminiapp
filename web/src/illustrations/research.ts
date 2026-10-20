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
