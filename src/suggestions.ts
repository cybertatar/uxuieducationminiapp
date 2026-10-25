import { trackById, type Question, type TrackId } from '../content';
import { SUGGEST_LIMITS, type SuggestRequest } from './api-types';

/** Сколько вопросов человек может предложить за сутки: защита от спама в личку автору */
export const SUGGESTIONS_PER_DAY = 5;

export type SuggestionStatus = 'new' | 'accepted' | 'rejected' | 'published';

/** Строка таблицы suggestions: wrong лежит там JSON-строкой */
export interface SuggestionRow {
  id: number;
  user_id: number;
  track: TrackId;
  text: string;
  correct: string;
  wrong: string;
  explanation: string;
  source: string | null;
  screen: string | null;
  status: SuggestionStatus;
  created_at: number;
  resolved_at: number | null;
}

/** Пробелы по краям убираем, переносы строк внутри оставляем: в вопросе и разборе они бывают нужны */
const clean = (s: unknown) => (typeof s === 'string' ? s.trim() : '');
const fits = (s: string, [min, max]: readonly [number, number]) => s.length >= min && s.length <= max;

function parseSource(s: unknown): string | null {
  const raw = clean(s);
  if (!raw || raw.length > SUGGEST_LIMITS.source) return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

/**
 * Проверяет форму: тема существует, тексты нужной длины, неправильных вариантов 1–3 и они не повторяют верный.
 * Пустые поля неправильных вариантов отбрасываются. null — форма некорректная.
 */
export function parseSuggestion(body: Partial<SuggestRequest>) {
  const track = body.track;
  if (typeof track !== 'string' || !trackById.has(track)) return null;
  const text = clean(body.text);
  const correct = clean(body.correct);
  const explanation = clean(body.explanation);
  const wrong = (Array.isArray(body.wrong) ? body.wrong : []).map(clean).filter(Boolean);
  if (!fits(text, SUGGEST_LIMITS.text) || !fits(correct, SUGGEST_LIMITS.option) || !fits(explanation, SUGGEST_LIMITS.explanation)) return null;
  if (wrong.length < 1 || wrong.length > SUGGEST_LIMITS.wrong || !wrong.every((w) => fits(w, SUGGEST_LIMITS.option))) return null;
  const all = [correct, ...wrong].map((o) => o.toLowerCase());
  if (new Set(all).size !== all.length) return null;
  const screen = clean(body.screen).slice(0, SUGGEST_LIMITS.screen);
  return { track, text, correct, wrong, explanation, source: parseSource(body.source), screen: screen || null };
}

/** Подпись автора в разборе: ник, а без ника — имя */
export function authorName(u: { first_name: string | null; username: string | null }): string {
  return u.username ? `@${u.username}` : (u.first_name ?? 'участник');
}

/** Следующий свободный id в треке: h-093 → h-094. Префикс берём у самого частого в треке. */
export function nextQuestionId(track: TrackId, questions: Question[]): string {
  const counts = new Map<string, number[]>();
  for (const q of questions) {
    const m = q.track === track ? /^(.*-)(\d+)$/.exec(q.id) : null;
    if (m) counts.set(m[1], [...(counts.get(m[1]) ?? []), Number(m[2])]);
  }
  const [prefix, nums] = [...counts.entries()].sort((a, b) => b[1].length - a[1].length)[0] ?? [`${track}-`, [0]];
  return `${prefix}${String(Math.max(...nums) + 1).padStart(3, '0')}`;
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const percent = (part: number, total: number) => `${Math.round((part / total) * 100)}%`;
/** Строка в одинарных кавычках, как в content/*.ts */
const tsString = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;

const wrongOf = (r: SuggestionRow): string[] => {
  try {
    return JSON.parse(r.wrong) as string[];
  } catch {
    return [];
  }
};

const STATUS_LINE: Record<SuggestionStatus, string | null> = {
  new: null,
  accepted: '✅ Принят — автору вопроса сообщили. Когда вопрос выйдет, нажмите «Опубликован»',
  rejected: '🙅 Отклонён — автору вопроса сообщили',
  published: '🎉 Опубликован — автор вопроса знает, что вопрос в тренажёре',
};

export interface SuggestionDetails {
  from: { first_name: string | null; username: string | null };
  /** Опыт человека в этой теме: сколько вопросов он видел и сколько ответов верных */
  track: { answered: number; attempts: number; correct: number };
  /** Сколько вопросов он уже предлагал и сколько из них принято или опубликовано */
  suggested: number;
  accepted: number;
}

/** Сообщение автору о предложенном вопросе (HTML для Telegram). Тот же текст перерисовывается при смене статуса. */
export function suggestionText(r: SuggestionRow, d: SuggestionDetails): string {
  const track = trackById.get(r.track)!;
  const who = [d.from.first_name, d.from.username && `@${d.from.username}`].filter(Boolean).map((s) => escape(s!)).join(' ');
  const lines = [
    `💡 <b>Предложен вопрос</b> · ${track.emoji} ${escape(track.title)}`,
    '',
    `<b>${escape(r.text)}</b>`,
    `✅ ${escape(r.correct)}`,
    ...wrongOf(r).map((w) => `❌ ${escape(w)}`),
    '',
    `<b>Почему так:</b> ${escape(r.explanation)}`,
  ];
  if (r.source) lines.push(`<b>Источник:</b> ${escape(r.source)}`);
  if (r.screen) lines.push(`<b>Экран:</b> ${escape(r.screen)}`);
  const experience = d.track.attempts
    ? `вопросов темы ${d.track.answered}, верно ${percent(d.track.correct, d.track.attempts)}`
    : 'в этой теме ответов нет';
  lines.push(
    '',
    `🤖 От: ${who ? `${who} ` : ''}(id ${r.user_id})`,
    `Опыт: ${experience}`,
    `Предложено вопросов: ${d.suggested}, принято: ${d.accepted}`,
  );
  const status = STATUS_LINE[r.status];
  if (status) lines.push('', status);
  return lines.join('\n');
}

/**
 * Заготовка вопроса для content/<трек>.ts: остаётся выбрать тему, написать суть и название ссылки.
 * Варианты — как прислали, верный первым (при показе они перемешиваются).
 */
export function questionSnippet(r: SuggestionRow, id: string, author: string): string {
  const options = [r.correct, ...wrongOf(r)].map(tsString).join(', ');
  return [
    '{',
    `  id: '${id}',`,
    `  track: '${r.track}',`,
    `  topic: '', // тема из вопросов трека`,
    `  text: ${tsString(r.text)},`,
    `  options: [${options}],`,
    '  correct: 0,',
    `  summary: '', // суть в одну строку`,
    `  explanation: ${tsString(r.explanation)},`,
    `  links: [{ title: '', url: ${tsString(r.source ?? '')} }],`,
    `  author: ${tsString(author)},`,
    '},',
  ].join('\n');
}
