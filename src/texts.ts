import { questions, tracks } from '../content';

/** «больше 130» — круглое число вопросов вниз до десятка, чтобы текст не устаревал с каждым новым вопросом */
const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

const questionsRounded = () => Math.floor(questions.length / 10) * 10;

/** Названия тем внутри фразы: «эвристики Нильсена», но «Apple HIG» остаётся как есть */
const topicList = () => {
  const titles = tracks.map((t) => (/^[А-ЯЁ]/.test(t.title) ? t.title[0].toLowerCase() + t.title.slice(1) : t.title));
  return `${titles.slice(0, -1).join(', ')} и ${titles.at(-1)}`;
};

const themes = (n: number) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return `${n} тема`;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} темы`;
  return `${n} тем`;
};

/** Описание в пустом чате с ботом (до 512 символов) */
export const botDescription = () =>
  [
    'Тренажёр для UX/UI-дизайнеров с котом Кеглем 🐈',
    '',
    `📚 ${capitalize(topicList())} — больше ${questionsRounded()} вопросов`,
    '🖼 Задания на макетах: найди проблему, выбери лучший вариант',
    '💡 Разбор каждой ошибки и ссылки на первоисточники',
    '🔁 Повторение ошибок и стрик 🔥',
    '📬 Вопрос дня в чате — по желанию',
  ].join('\n');

/** Короткое описание в профиле бота (до 120 символов) */
export const botShortDescription = () => 'Тесты для UX/UI-дизайнеров: эвристики, законы UX, Apple HIG, Material 3 и WCAG. С разбором ошибок 🐈';

/** Приветствие на /start */
export const welcomeText = (name: string) =>
  `Привет, ${name}! 👋 Я Кегль, кот-тренажёр для UX/UI-дизайнеров 🐈\n\n` +
  `Внутри ${themes(tracks.length)}: ${topicList()}. Это больше ${questionsRounded()} вопросов, ` +
  'многие — на макетах: найти проблему, выбрать лучший вариант, узнать паттерн.\n\n' +
  'Ошибёшься — покажу короткий разбор и ссылку на первоисточник. Ошибки вернутся на повторение, чтобы точно запомнились.';
