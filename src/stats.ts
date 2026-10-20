/** Статистика на главной: уровни и сильные/слабые темы. Чистая логика, общая для воркера и фронтенда. */
import type { TrackId } from '../content';

export interface Level {
  title: string;
  emoji: string;
  /** Сколько освоенных вопросов нужно для уровня */
  from: number;
}

export const LEVELS: Level[] = [
  { title: 'Стажёр', emoji: '🌱', from: 0 },
  { title: 'Джун', emoji: '🐣', from: 10 },
  { title: 'Мидл', emoji: '🛠️', from: 40 },
  { title: 'Сеньор', emoji: '🎯', from: 100 },
  { title: 'Лид', emoji: '🧭', from: 200 },
  { title: 'Арт-директор', emoji: '👑', from: 300 },
];

/** Текущий уровень, следующий и доля пути до него (0..1). */
export function levelFor(mastered: number) {
  let i = 0;
  while (i + 1 < LEVELS.length && mastered >= LEVELS[i + 1].from) i++;
  const level = LEVELS[i];
  const next = LEVELS[i + 1] ?? null;
  const progress = next ? (mastered - level.from) / (next.from - level.from) : 1;
  return { level, next, left: next ? next.from - mastered : 0, progress };
}

export interface TrackScore {
  id: TrackId;
  attempts: number;
  correct: number;
}

/** Доля верных ответов или null, если отвечать ещё не начинали. */
export const accuracy = (s: { attempts: number; correct: number }) => (s.attempts > 0 ? s.correct / s.attempts : null);

/** Сколько ответов в теме нужно, чтобы судить о силе или слабости */
export const MIN_ATTEMPTS = 10;

/**
 * Самая сильная и самая слабая тема по доле верных ответов.
 * Учитываются только темы с MIN_ATTEMPTS ответов; если такая тема одна или все равны — сравнивать не с чем.
 */
export function trackHighlights(tracks: TrackScore[]) {
  const scored = tracks
    .filter((t) => t.attempts >= MIN_ATTEMPTS)
    .map((t) => ({ id: t.id, accuracy: t.correct / t.attempts }))
    .sort((a, b) => b.accuracy - a.accuracy);
  if (scored.length < 2 || scored[0].accuracy === scored.at(-1)!.accuracy) return { strongest: null, weakest: null };
  return { strongest: scored[0], weakest: scored.at(-1)! };
}
