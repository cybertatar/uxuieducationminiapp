import { correctOption, trackById, type Question } from '../content';
import { REPORT_COMMENT_MAX, REPORT_REASONS, type ReportReason, type ReportRequest } from './api-types';

/** Сколько сообщений о неточностях человек может отправить за сутки: защита от спама в личку автору */
export const REPORTS_PER_DAY = 10;

export type ReportStatus = 'new' | 'fixed' | 'rejected';

export interface ReportRow {
  id: number;
  user_id: number;
  question_id: string;
  reason: ReportReason;
  comment: string | null;
  option: number | null;
  status: ReportStatus;
  created_at: number;
  resolved_at: number | null;
}

const isReason = (r: unknown): r is ReportReason => typeof r === 'string' && Object.hasOwn(REPORT_REASONS, r);

/** Проверяет тело запроса: вопрос существует, причина из списка, комментарий обрезан. null — запрос некорректный. */
export function parseReport(body: Partial<ReportRequest>, questionById: Map<string, Question>) {
  if (typeof body.questionId !== 'string' || !questionById.has(body.questionId) || !isReason(body.reason)) return null;
  const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, REPORT_COMMENT_MAX) : '';
  if (body.reason === 'other' && !comment) return null;
  const option = Number.isInteger(body.option) && body.option! >= 0 ? body.option! : null;
  return { questionId: body.questionId, reason: body.reason, comment: comment || null, option };
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Что человек ответил: текст варианта в обычных вопросах, «верно / неверно» в особых механиках */
function answerLine(q: Question, option: number | null): string | null {
  if (option === null) return null;
  const verdict = option === correctOption(q) ? 'верно' : 'неверно';
  if ((q.kind ?? 'choice') === 'choice' && 'options' in q && q.options[option] !== undefined) {
    return `Ответ: «${escape(q.options[option])}» — ${verdict}`;
  }
  return `Ответ: ${verdict}`;
}

const STATUS_LINE: Record<ReportStatus, string | null> = {
  new: null,
  fixed: '✅ Исправлено, автору сообщения сказали спасибо',
  rejected: '🙅 Не ошибка',
};

/**
 * Сообщение автору о неточности (HTML для Telegram). Тот же текст перерисовывается после «Исправлено» или «Не ошибка».
 * total — сколько всего сообщений пришло на этот вопрос: если много, вопрос стоит смотреть первым.
 */
export function reportText(r: ReportRow, q: Question, from: { first_name: string | null; username: string | null }, total: number): string {
  const track = trackById.get(q.track)!;
  const who = [from.first_name, from.username && `@${from.username}`].filter(Boolean).map((s) => escape(s!)).join(' ') || `id ${r.user_id}`;
  const lines = [
    `⚠️ <b>${REPORT_REASONS[r.reason]}</b> · <code>${q.id}</code>`,
    `${track.emoji} ${escape(track.title)} · ${escape(q.topic)}`,
  ];
  if (r.comment) lines.push('', `💬 ${escape(r.comment)}`);
  lines.push('', escape(q.text));
  const answer = answerLine(q, r.option);
  if (answer) lines.push(answer);
  lines.push('', `От: ${who}${total > 1 ? ` · всего сообщений о вопросе: ${total}` : ''}`);
  const status = STATUS_LINE[r.status];
  if (status) lines.push('', status);
  return lines.join('\n');
}
