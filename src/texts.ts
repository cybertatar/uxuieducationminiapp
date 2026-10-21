import { questions, sections, trackById, tracks } from '../content';

/** «больше 130» — круглое число вопросов вниз до десятка, чтобы текст не устаревал с каждым новым вопросом */
const questionsRounded = () => Math.floor((questions.length - 1) / 10) * 10;

/** Названия внутри фразы: «эвристики Нильсена», но «Apple HIG» и «UX» остаются как есть */
const lower = (t: string) => (/^[А-ЯЁ]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t);

const joinAnd = (items: string[]) => `${items.slice(0, -1).join(', ')} и ${items.at(-1)}`;

/** «UX — эвристики Нильсена, законы UX…; гайдлайны — …; Figma — …» */
const sectionList = () =>
  sections.map((s) => `${lower(s.title)} — ${joinAnd(s.tracks.map((id) => lower(trackById.get(id)!.title)))}`).join('; ');

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
    `📚 ${joinAnd(sections.map((s) => lower(s.title)))}: ${themes(tracks.length)}, больше ${questionsRounded()} вопросов`,
    '🖼 Задания на макетах: найди проблему, выбери лучший вариант',
    '💡 Разбор после каждого ответа и ссылки на первоисточники',
    '🔁 Повторение ошибок и стрик 🔥',
    '📬 Вопрос дня в чате — по желанию',
  ].join('\n');

/** Короткое описание в профиле бота (до 120 символов) */
export const botShortDescription = () => 'Тесты для UX/UI: эвристики, законы UX, HIG, Material, WCAG, Figma, дизайн-системы, UX-райтинг 🐈';

/** Приветствие на /start */
export const welcomeText = (name: string) =>
  `Привет, ${name}! 👋 Я Кегль, кот-тренажёр для UX/UI-дизайнеров 🐈\n\n` +
  `Внутри ${themes(tracks.length)} в трёх разделах: ${sectionList()}. Это больше ${questionsRounded()} вопросов, ` +
  'многие — на макетах: найти проблему, выбрать лучший вариант, узнать паттерн.\n\n' +
  'После каждого ответа покажу разбор и ссылку на первоисточник — и при ошибке, и при верном ответе. А ошибки вернутся на повторение, чтобы точно запомнились.';
