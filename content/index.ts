import { heuristics } from './heuristics';
import { uxLaws } from './ux-laws';
import type { Question, Track, TrackId } from './types';

export type { Link, Question, Track, TrackId } from './types';

export const tracks: Track[] = [
  {
    id: 'heuristics',
    title: 'Эвристики Нильсена',
    description: '10 принципов юзабилити Якоба Нильсена — база любого дизайн-ревью.',
    emoji: '🧭',
  },
  {
    id: 'ux-laws',
    title: 'Законы UX',
    description: 'Психология и гештальт: Фиттс, Хик, Миллер, Якоб и другие.',
    emoji: '🧠',
  },
];

export const questions: Question[] = [...heuristics, ...uxLaws];

export const questionById = new Map(questions.map((q) => [q.id, q]));

export const questionsByTrack = (track: TrackId) => questions.filter((q) => q.track === track);

export const trackById = new Map(tracks.map((t) => [t.id, t]));
