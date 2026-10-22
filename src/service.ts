import { correctOption, optionCount, questionById } from '../content';
import { addActivity, addDailyAnswer, getAnswer, saveAnswer, updateUser, type UserRow } from './db';
import { applyAnswer } from './review';
import { applyActivity } from './streak';
import { addDays, localDate, nextOccurrence } from './time';

export const today = (user: UserRow, now: number) => localDate(user.tz, now);

/**
 * Записывает ответ и обновляет очередь повторения.
 * option — индекс в исходном массиве options (для «тапни на проблему»: 0 — попал, 1 — нет).
 */
export async function recordAnswer(db: D1Database, user: UserRow, questionId: string, option: number, now: number) {
  const question = questionById.get(questionId);
  if (!question || !Number.isInteger(option) || option < 0 || option >= optionCount(question)) return null;
  const correct = option === correctOption(question);
  const prev = await getAnswer(db, user.id, questionId);
  const date = today(user, now);
  await Promise.all([saveAnswer(db, user.id, questionId, applyAnswer(prev, correct, date), now), addDailyAnswer(db, user.id, date, correct)]);
  return { correct, question };
}

/** Засчитывает день в стрик (сессия в приложении или вопрос дня в боте). */
export async function recordActivity(db: D1Database, user: UserRow, now: number) {
  const date = today(user, now);
  const s = applyActivity(
    { current: user.streak_current, best: user.streak_best, lastActiveDate: user.last_active_date },
    date,
  );
  if (s.extended) {
    await updateUser(db, user.id, { streak_current: s.current, streak_best: s.best, last_active_date: date });
    await addActivity(db, user.id, date);
    Object.assign(user, { streak_current: s.current, streak_best: s.best, last_active_date: date });
  }
  return s;
}

/**
 * Пора ли предложить вопрос дня: один раз, после первого занятия, если бот может писать и вопрос дня ещё не включён.
 * На /start не предлагаем — второе сообщение выталкивало гайд по мини-аппу за экран.
 */
export const shouldOfferDaily = (user: UserRow) => user.can_message === 1 && user.daily_enabled === 0 && user.daily_offered === 0;

/** Пересчитывает, когда слать вопрос дня и проверять стрик. Вызывать после любой смены настроек. */
export function schedule(user: UserRow, now: number): Pick<UserRow, 'next_daily_at' | 'next_reminder_at'> {
  const active = user.can_message === 1;
  return {
    next_daily_at: active && user.daily_enabled ? nextOccurrence(user.tz, user.daily_time, now) : null,
    next_reminder_at: active && user.reminder_enabled ? nextOccurrence(user.tz, user.reminder_time, now) : null,
  };
}

/** Применяет изменения настроек и сразу пересчитывает расписание. */
export async function updateSettings(db: D1Database, user: UserRow, fields: Partial<UserRow>, now: number) {
  Object.assign(user, fields);
  const next = { ...fields, ...schedule(user, now) };
  Object.assign(user, next);
  await updateUser(db, user.id, next);
}

export const PAUSE_DAYS = 7;

export function isPaused(user: UserRow, now: number): boolean {
  return !!user.paused_until && today(user, now) < user.paused_until;
}

export function pauseUntil(user: UserRow, now: number): string {
  return addDays(today(user, now), PAUSE_DAYS);
}
