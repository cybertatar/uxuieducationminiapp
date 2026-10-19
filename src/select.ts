import { isTextOnly, type Question } from '../content';
import { isDue, type AnswerState } from './review';

export const SESSION_SIZE = 10;
const MAX_REVIEWS_IN_TRACK_SESSION = 3;

type Answers = Map<string, AnswerState>;
type Rng = () => number;

function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Сессия по треку: немного вопросов, которые пора повторить, затем новые,
 * затем те, где пользователь ошибался, затем остальные.
 */
export function pickTrackSession(pool: Question[], answers: Answers, today: string, rng: Rng = Math.random): string[] {
  const due = shuffle(pool.filter((q) => isDue(answers.get(q.id), today)), rng).slice(0, MAX_REVIEWS_IN_TRACK_SESSION);
  const taken = new Set(due.map((q) => q.id));
  const rest = pool.filter((q) => !taken.has(q.id));
  const unseen = shuffle(rest.filter((q) => !answers.has(q.id)), rng);
  const wrong = shuffle(rest.filter((q) => answers.has(q.id) && !answers.get(q.id)!.lastCorrect), rng);
  const known = shuffle(rest.filter((q) => answers.get(q.id)?.lastCorrect), rng);
  return [...due, ...unseen, ...wrong, ...known].slice(0, SESSION_SIZE).map((q) => q.id);
}

/** Сессия повторения: только вопросы, у которых подошёл срок. */
export function pickReviewSession(pool: Question[], answers: Answers, today: string, rng: Rng = Math.random): string[] {
  return shuffle(pool.filter((q) => isDue(answers.get(q.id), today)), rng)
    .slice(0, SESSION_SIZE)
    .map((q) => q.id);
}

/** Вопрос дня для бота. Визуальные вопросы пропускаем: в чате их не показать. */
export function pickDailyQuestion(pool: Question[], answers: Answers, today: string, rng: Rng = Math.random): string {
  const textOnly = pool.filter(isTextOnly);
  const groups = [
    textOnly.filter((q) => isDue(answers.get(q.id), today)),
    textOnly.filter((q) => !answers.has(q.id)),
    textOnly.filter((q) => answers.has(q.id) && !answers.get(q.id)!.lastCorrect),
    textOnly,
  ];
  const group = groups.find((g) => g.length > 0)!;
  return group[Math.floor(rng() * group.length)].id;
}
