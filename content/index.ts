import { designSystemsQuestions } from './design-systems';
import { figmaAutoLayoutQuestions } from './figma-auto-layout';
import { figmaComponentsQuestions } from './figma-components';
import { figmaPropsQuestions } from './figma-props';
import { figmaVariablesQuestions } from './figma-variables';
import { heuristics } from './heuristics';
import { higQuestions } from './hig';
import { materialQuestions } from './material';
import { usabilityTestingQuestions } from './usability-testing';
import { visualDesignQuestions } from './visual-design';
import { wcagQuestions } from './wcag';
import { uxLaws } from './ux-laws';
import { uxWritingQuestions } from './ux-writing';
import type { ChoiceQuestion, ImageChoiceQuestion, Question, Section, Track, TrackId } from './types';

export { WARMUP_SHARE, warmupPool } from './warmup';
export type { ChoiceQuestion, HotspotQuestion, ImageChoiceQuestion, Link, MultiQuestion, OrderQuestion, Question, Section, SectionId, SpotQuestion, Track, TrackId } from './types';

export const tracks: Track[] = [
  {
    id: 'heuristics',
    title: 'Эвристики Нильсена',
    description: '10 принципов юзабилити Якоба Нильсена — база любого дизайн-ревью.',
    art: 'track-heuristics',
    emoji: '🧭',
  },
  {
    id: 'ux-laws',
    title: 'Законы UX',
    description: 'Психология и гештальт: Фиттс, Хик, Миллер, Якоб и другие.',
    art: 'track-ux-laws',
    emoji: '🧠',
  },
  {
    id: 'ux-writing',
    title: 'UX-райтинг',
    description: 'Тексты интерфейса: кнопки, ошибки, пустые экраны, тон и ясность.',
    art: 'track-ux-writing',
    emoji: '✍️',
  },
  {
    id: 'usability-testing',
    title: 'Юзабилити-тестирование',
    description: 'Задания, модерация, выборка, метрики SUS и SEQ, приоритеты проблем.',
    art: 'track-usability-testing',
    emoji: '🔬',
  },
  {
    id: 'visual-design',
    title: 'Визуальный дизайн',
    description: 'Типографика, иерархия, сетки и отступы, цвет, тёмная тема и кликабельность.',
    art: 'track-visual-design',
    emoji: '🖌️',
  },
  {
    id: 'hig',
    title: 'Apple HIG',
    description: 'Гайдлайны Apple для iOS: контролы, навигация, типографика, Liquid Glass.',
    art: 'track-hig',
    emoji: '🍏',
  },
  {
    id: 'material',
    title: 'Material Design 3',
    description: 'Гайдлайны Google для Android: компоненты, цвет, типографика, адаптивность.',
    art: 'track-material',
    emoji: '🤖',
  },
  {
    id: 'wcag',
    title: 'Доступность (WCAG)',
    description: 'WCAG 2.2, уровень AA: контраст, цвет, размеры целей, фокус, формы, анимации.',
    art: 'track-wcag',
    emoji: '♿',
  },
  {
    id: 'figma-components',
    title: 'Компоненты в Figma',
    description: 'Главный компонент и экземпляры, переопределения, вложенность и библиотеки.',
    art: 'track-figma-components',
    emoji: '💠',
  },
  {
    id: 'figma-props',
    title: 'Свойства и варианты',
    description: 'Boolean, text, instance swap и variant: как собрать удобный компонент.',
    art: 'track-figma-props',
    emoji: '🎛️',
  },
  {
    id: 'figma-auto-layout',
    title: 'Автолейаут',
    description: 'Hug, fill и fixed, отступы, перенос, Ignore auto layout и constraints.',
    art: 'track-figma-auto-layout',
    emoji: '📐',
  },
  {
    id: 'figma-variables',
    title: 'Переменные',
    description: 'Типы, коллекции и режимы, алиасы, scoping, стили и переменные в прототипах.',
    art: 'track-figma-variables',
    emoji: '🎨',
  },
  {
    id: 'design-systems',
    title: 'Дизайн-системы',
    description: 'Токены, компоненты, варианты и atomic design: как собрать систему и поддерживать её.',
    art: 'track-design-systems',
    emoji: '🧩',
  },
];

/** Разделы экрана «Темы». Каждый трек — ровно в одном разделе, порядок совпадает с tracks. */
export const sections: Section[] = [
  { id: 'ux', title: 'UX/UI', tracks: ['heuristics', 'ux-laws', 'ux-writing', 'usability-testing', 'visual-design'] },
  { id: 'guidelines', title: 'Гайдлайны', tracks: ['hig', 'material', 'wcag'] },
  { id: 'figma', title: 'Figma', tracks: ['figma-components', 'figma-props', 'figma-auto-layout', 'figma-variables', 'design-systems'] },
];

export const questions: Question[] = [
  ...heuristics,
  ...uxLaws,
  ...higQuestions,
  ...materialQuestions,
  ...wcagQuestions,
  ...designSystemsQuestions,
  ...uxWritingQuestions,
  ...usabilityTestingQuestions,
  ...visualDesignQuestions,
  ...figmaComponentsQuestions,
  ...figmaPropsQuestions,
  ...figmaAutoLayoutQuestions,
  ...figmaVariablesQuestions,
];

export const questionById = new Map(questions.map((q) => [q.id, q]));

export const questionsByTrack = (track: TrackId) => questions.filter((q) => q.track === track);

export const trackById = new Map(tracks.map((t) => [t.id, t]));

/** Вопрос с одним выбором из вариантов: ответ — индекс варианта. */
const isSingleChoice = (q: Question): q is ChoiceQuestion | ImageChoiceQuestion => q.kind === undefined || q.kind === 'choice' || q.kind === 'image-choice';

/**
 * Ответ кодируется индексом. В остальных механиках («тапни», «по порядку», «выбери все», «найди все»)
 * верность считает приложение: 0 — верно, 1 — нет.
 */
export const optionCount = (q: Question) => (isSingleChoice(q) ? q.options.length : 2);
export const correctOption = (q: Question) => (isSingleChoice(q) ? q.correct : 0);

/** Вопрос, который можно задать в чате с ботом: без картинок и особых механик, только текст. */
export const isTextOnly = (q: Question): q is ChoiceQuestion => (q.kind ?? 'choice') === 'choice' && !(q as ChoiceQuestion).image;
