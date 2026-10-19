import { heuristics } from './heuristics';
import { uxLaws } from './ux-laws';
import type { ChoiceQuestion, Question, Track, TrackId } from './types';

export type { ChoiceQuestion, HotspotQuestion, ImageChoiceQuestion, Link, Question, Track, TrackId } from './types';

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
];

export const questions: Question[] = [...heuristics, ...uxLaws];

export const questionById = new Map(questions.map((q) => [q.id, q]));

export const questionsByTrack = (track: TrackId) => questions.filter((q) => q.track === track);

export const trackById = new Map(tracks.map((t) => [t.id, t]));

/**
 * Ответ кодируется индексом. Для вопросов «тапни на проблему» 0 — попал в зону, 1 — промахнулся.
 */
export const optionCount = (q: Question) => (q.kind === 'hotspot' ? 2 : q.options.length);
export const correctOption = (q: Question) => (q.kind === 'hotspot' ? 0 : q.correct);

/** Вопрос, который можно задать в чате с ботом: без картинок, только текст. */
export const isTextOnly = (q: Question): q is ChoiceQuestion => (q.kind ?? 'choice') === 'choice' && !(q as ChoiceQuestion).image;
