import { correctOption, lessonById, trackById, type Question } from '../content';
import { REPORT_COMMENT_MAX, REPORT_REASONS, type ReportAnswer, type ReportContext, type ReportReason, type ReportRequest } from './api-types';
import type { AnswerState } from './review';

/** Сколько сообщений о проблемах человек может отправить за сутки: защита от спама в личку автору */
export const REPORTS_PER_DAY = 10;

export type ReportStatus = 'new' | 'fixed' | 'rejected';

/** Строка таблицы reports: answer и context лежат там JSON-строками */
export interface ReportRow {
  id: number;
  user_id: number;
  question_id: string;
  reason: ReportReason;
  comment: string | null;
  answer: string | null;
  context: string | null;
  status: ReportStatus;
  created_at: number;
  resolved_at: number | null;
}

const isReason = (r: unknown): r is ReportReason => typeof r === 'string' && Object.hasOwn(REPORT_REASONS, r);
const isIndex = (n: unknown): n is number => Number.isInteger(n) && (n as number) >= 0 && (n as number) < 100;
const isCoord = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) < 10_000;
const isPoint = (p: unknown): p is [number, number] => Array.isArray(p) && p.length === 2 && p.every(isCoord);
const str = (s: unknown, max = 40) => (typeof s === 'string' && s.trim() ? s.trim().slice(0, max) : undefined);

function parseAnswer(a: unknown): ReportAnswer | null {
  if (!a || typeof a !== 'object') return null;
  const { option, checked, picks, points } = a as Partial<ReportAnswer>;
  if (!isIndex(option)) return null;
  const res: ReportAnswer = { option, checked: checked === true };
  if (Array.isArray(picks) && picks.length <= 10 && picks.every(isIndex)) res.picks = picks;
  if (Array.isArray(points) && points.length <= 10 && points.every(isPoint)) res.points = points.map(([x, y]) => [Math.round(x), Math.round(y)]);
  return res;
}

function parseContext(c: unknown): ReportContext | null {
  if (!c || typeof c !== 'object') return null;
  const raw = c as Record<string, unknown>;
  const res: ReportContext = {};
  const s = raw.session as ReportContext['session'];
  if (s?.mode === 'track' && trackById.has(s.track)) res.session = { mode: 'track', track: s.track };
  else if (s?.mode === 'lesson' && lessonById.has(s.lesson)) res.session = { mode: 'lesson', lesson: s.lesson };
  else if (s?.mode === 'review' || s?.mode === 'warmup') res.session = { mode: s.mode };
  if (isIndex(raw.position) && isIndex(raw.total)) Object.assign(res, { position: raw.position, total: raw.total });
  for (const key of ['app', 'platform', 'tgVersion', 'scheme', 'viewport'] as const) {
    const v = str(raw[key]);
    if (v) res[key] = v;
  }
  return res;
}

/** Проверяет тело запроса: вопрос существует, причина из списка, остальное обрезано и почищено. null — запрос некорректный. */
export function parseReport(body: Partial<ReportRequest>, questionById: Map<string, Question>) {
  if (typeof body.questionId !== 'string' || !questionById.has(body.questionId) || !isReason(body.reason)) return null;
  const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, REPORT_COMMENT_MAX) : '';
  if (body.reason === 'other' && !comment) return null;
  return {
    questionId: body.questionId,
    reason: body.reason,
    comment: comment || null,
    answer: parseAnswer(body.answer),
    context: parseContext(body.context),
  };
}

const json = <T>(s: string | null): T | null => {
  try {
    return s ? (JSON.parse(s) as T) : null;
  } catch {
    return null;
  }
};

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const shorten = (s: string, max = 70) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);
const quote = (s: string) => `«${escape(shorten(s))}»`;
const percent = (part: number, total: number) => `${Math.round((part / total) * 100)}%`;
const mark = (ok: boolean) => (ok ? '✅' : '❌');

/** Что человек ответил — в терминах самого вопроса: текст варианта, порядок шагов, отмеченные пункты, точки на картинке */
export function answerLines(q: Question, a: ReportAnswer | null): string[] {
  if (!a) return ['Ответ: ещё не выбран'];
  const ok = a.option === correctOption(q);
  const state = a.checked ? mark(ok) : '(выбран, но не проверен)';
  switch (q.kind) {
    case undefined:
    case 'choice':
      return [`Ответ: ${quote(q.options[a.option] ?? `вариант ${a.option}`)} ${state}`, ...(ok ? [] : [`Верный: ${quote(q.options[q.correct])}`])];
    case 'image-choice':
      return [`Ответ: картинка <code>${escape(q.options[a.option] ?? String(a.option))}</code> ${state}`, ...(ok ? [] : [`Верная: <code>${escape(q.options[q.correct])}</code>`])];
    case 'order': {
      const step = (i: number) => `«${escape(shorten(q.items[i], 40))}»`;
      const picks = a.picks?.filter((i) => i < q.items.length);
      return [`Ответ: ${picks?.length ? picks.map(step).join(' → ') : 'порядок не передан'} ${state}`, ...(ok ? [] : [`Верно: ${q.items.map((_, i) => step(i)).join(' → ')}`])];
    }
    case 'multi': {
      const label = (i: number) => (q.images ? `<code>${escape(q.options[i])}</code>` : quote(q.options[i]));
      const picks = a.picks?.filter((i) => i < q.options.length);
      return [`Отмечено: ${picks?.length ? picks.map(label).join(', ') : 'не передано'} ${state}`, `Верные: ${q.correct.map(label).join(', ')}`];
    }
    case 'hotspot':
      return [`Тап: ${a.points?.map(([x, y]) => `(${x}, ${y})`).join(', ') ?? 'точка не передана'} ${state}`, `Нужная зона: <code>${escape(q.zone)}</code> на <code>${escape(q.image)}</code>`];
    case 'spot':
      return [`Метки: ${a.points?.map(([x, y]) => `(${x}, ${y})`).join(', ') ?? 'не переданы'} ${state}`, `Зоны: ${q.zones.map((z) => `<code>${escape(z)}</code>`).join(', ')} на <code>${escape(q.image)}</code>`];
  }
}

function sessionLine(c: ReportContext | null): string | null {
  if (!c?.session) return null;
  const s = c.session;
  const name =
    s.mode === 'track'
      ? `тема «${escape(trackById.get(s.track)?.title ?? s.track)}»`
      : s.mode === 'lesson'
        ? `закрепление урока «${escape(lessonById.get(s.lesson)?.title ?? s.lesson)}»`
        : s.mode === 'review'
          ? 'повторение ошибок'
          : 'разминка';
  const place = c.position !== undefined && c.total ? `, вопрос ${c.position + 1} из ${c.total}` : '';
  return `Сессия: ${name}${place}`;
}

function deviceLine(c: ReportContext | null): string | null {
  if (!c) return null;
  const parts = [
    c.app && `приложение ${c.app}`,
    c.platform && `${c.platform}${c.tgVersion ? `, Telegram ${c.tgVersion}` : ''}`,
    c.scheme && (c.scheme === 'dark' ? 'тёмная тема' : 'светлая тема'),
    c.viewport,
  ].filter(Boolean);
  return parts.length ? `Устройство: ${escape(parts.join(' · '))}` : null;
}

/** Как отвечают на вопрос все: сколько раз, доля верных и самый частый неверный вариант (для вопросов с выбором) */
export interface QuestionStats {
  answers: number;
  correct: number;
  /** Самый частый неверный вариант: индекс и сколько раз выбрали */
  topWrong: { option: number; n: number } | null;
}

function statsLine(q: Question, s: QuestionStats): string {
  if (!s.answers) return 'Все пользователи: ответов ещё нет';
  let line = `Все пользователи: ответов ${s.answers}, верно ${percent(s.correct, s.answers)}`;
  if (s.topWrong && ((q.kind ?? 'choice') === 'choice' || q.kind === 'image-choice') && 'options' in q && q.options[s.topWrong.option] !== undefined) {
    const option = q.kind === 'image-choice' ? `<code>${escape(q.options[s.topWrong.option])}</code>` : quote(q.options[s.topWrong.option]);
    line += `; чаще всего ошибаются на ${option} (${percent(s.topWrong.n, s.answers)})`;
  }
  return line;
}

const STATUS_LINE: Record<ReportStatus, string | null> = {
  new: null,
  fixed: '✅ Исправлено, автору сообщения сказали спасибо',
  rejected: '🙅 Не ошибка',
};

export interface ReportDetails {
  from: { first_name: string | null; username: string | null };
  /** История этого человека с вопросом, null — ещё ни разу не отвечал */
  history: AnswerState | null;
  stats: QuestionStats;
  /** Сколько всего сообщений пришло на этот вопрос: если много, его стоит смотреть первым */
  reports: number;
}

/**
 * Сообщение автору (HTML для Telegram): что написал человек и что знает о ситуации бот.
 * Тот же текст перерисовывается после «Исправлено» или «Не ошибка».
 */
export function reportText(r: ReportRow, q: Question, d: ReportDetails): string {
  const track = trackById.get(q.track)!;
  const who = [d.from.first_name, d.from.username && `@${d.from.username}`].filter(Boolean).map((s) => escape(s!)).join(' ');
  const answer = json<ReportAnswer>(r.answer);
  const context = json<ReportContext>(r.context);
  const lines = [
    `🚩 <b>${REPORT_REASONS[r.reason]}</b> · <code>${q.id}</code>`,
    `${track.emoji} ${escape(track.title)} · ${escape(q.topic)}`,
    '',
    '💬 <b>Сообщение</b>',
    r.comment ? escape(r.comment) : 'Без комментария',
    '',
    '🤖 <b>Данные</b>',
    `Вопрос: ${quote(q.text)}`,
    ...answerLines(q, answer),
    d.history ? `Этот человек: попыток ${d.history.attempts}, верных ${d.history.correctTotal}` : 'Этот человек: ответов на вопрос ещё не было',
    statsLine(q, d.stats),
    sessionLine(context),
    deviceLine(context),
    `От: ${who ? `${who} ` : ''}(id ${r.user_id})${d.reports > 1 ? ` · сообщений о вопросе: ${d.reports}` : ''}`,
  ];
  const status = STATUS_LINE[r.status];
  if (status) lines.push('', status);
  return lines.filter((l) => l !== null).join('\n');
}
