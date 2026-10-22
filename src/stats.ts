/** Статистика: точность и сильные/слабые темы. Чистая логика, общая для воркера и фронтенда. */
import type { Link, Question, TrackId } from '../content';

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

/** Тема, в которой пользователь чаще всего ошибался, и статья, чтобы в ней разобраться */
export interface WeakTopic {
  track: TrackId;
  topic: string;
  mistakes: number;
  link: Link;
}

/** Сколько тем показывать в списке «Что почитать» */
export const WEAK_TOPICS_LIMIT = 5;

/**
 * Темы с наибольшим числом ошибок за всё время. При равенстве выше та, где ниже точность.
 * Статья — основная ссылка вопросов, на которых ошибались; чаще встречающаяся важнее.
 * Одна статья не показывается дважды: если все статьи темы уже в списке, тема пропускается.
 */
export function weakTopics(
  pool: Question[],
  answers: Map<string, { attempts: number; correctTotal: number }>,
  limit = WEAK_TOPICS_LIMIT,
): WeakTopic[] {
  const groups = new Map<string, { track: TrackId; topic: string; mistakes: number; attempts: number; links: Map<string, { link: Link; weight: number }> }>();
  for (const q of pool) {
    const a = answers.get(q.id);
    const mistakes = a ? a.attempts - a.correctTotal : 0;
    if (!a || mistakes <= 0) continue;
    const key = `${q.track}|${q.topic}`;
    const g = groups.get(key) ?? { track: q.track, topic: q.topic, mistakes: 0, attempts: 0, links: new Map() };
    g.mistakes += mistakes;
    g.attempts += a.attempts;
    const link = q.links[0];
    const l = g.links.get(link.url) ?? { link, weight: 0 };
    l.weight += mistakes;
    g.links.set(link.url, l);
    groups.set(key, g);
  }

  const ranked = [...groups.values()].sort((x, y) => y.mistakes - x.mistakes || y.mistakes / y.attempts - x.mistakes / x.attempts);
  const shown = new Set<string>();
  const result: WeakTopic[] = [];
  for (const g of ranked) {
    if (result.length >= limit) break;
    const best = [...g.links.values()].filter((l) => !shown.has(l.link.url)).sort((x, y) => y.weight - x.weight)[0];
    if (!best) continue;
    shown.add(best.link.url);
    result.push({ track: g.track, topic: g.topic, mistakes: g.mistakes, link: best.link });
  }
  return result;
}
