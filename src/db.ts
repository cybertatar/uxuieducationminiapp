import type { AnswerState } from './review';
import type { QuestionStats, ReportRow } from './reports';
import type { SuggestionRow, SuggestionStatus } from './suggestions';

export interface UserRow {
  id: number;
  first_name: string | null;
  username: string | null;
  tz: string;
  created_at: number;
  can_message: number;
  daily_enabled: number;
  daily_time: string;
  reminder_enabled: number;
  reminder_time: string;
  paused_until: string | null;
  next_daily_at: number | null;
  next_reminder_at: number | null;
  streak_current: number;
  streak_best: number;
  last_active_date: string | null;
  /** Предложение вопроса дня уже отправлено */
  daily_offered: number;
  /** Метка из ссылки, по которой пользователь пришёл впервые */
  source: string | null;
  /** Тема последнего теста — для «Продолжить» на главной */
  last_track: string | null;
}

/** Поля, которые можно менять через updateUser. */
type Writable = Partial<Omit<UserRow, 'id' | 'created_at' | 'source'>>;

/** Метка источника из ссылки: Telegram пропускает только A-Z, a-z, 0-9, _ и -, не длиннее 64 символов. */
export function parseSource(raw: string | null | undefined): string | null {
  const s = raw?.trim().toLowerCase() ?? '';
  return /^[a-z0-9_-]{1,64}$/.test(s) ? s : null;
}

export async function getUser(db: D1Database, id: number): Promise<UserRow | null> {
  return db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<UserRow>();
}

export async function upsertUser(
  db: D1Database,
  u: { id: number; first_name?: string; username?: string },
  now: number,
  source: string | null = null,
): Promise<UserRow> {
  // Источник пишется только при создании: считаем первое касание, а не последнюю ссылку
  const row = await db
    .prepare(
      `INSERT INTO users (id, first_name, username, created_at, source) VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT(id) DO UPDATE SET first_name = ?2, username = ?3
       RETURNING *`,
    )
    .bind(u.id, u.first_name ?? null, u.username ?? null, now, source)
    .first<UserRow>();
  return row!;
}

export async function updateUser(db: D1Database, id: number, fields: Writable): Promise<void> {
  const keys = Object.keys(fields) as (keyof Writable)[];
  if (keys.length === 0) return;
  const set = keys.map((k, i) => `${k} = ?${i + 2}`).join(', ');
  await db
    .prepare(`UPDATE users SET ${set} WHERE id = ?1`)
    .bind(id, ...keys.map((k) => fields[k] ?? null))
    .run();
}

interface AnswerRow {
  question_id: string;
  attempts: number;
  correct_total: number;
  last_correct: number;
  box: number;
  due_date: string | null;
}

export async function getAnswers(db: D1Database, userId: number): Promise<Map<string, AnswerState>> {
  const { results } = await db
    .prepare('SELECT question_id, attempts, correct_total, last_correct, box, due_date FROM answers WHERE user_id = ?')
    .bind(userId)
    .all<AnswerRow>();
  return new Map(
    results.map((r) => [
      r.question_id,
      {
        attempts: r.attempts,
        correctTotal: r.correct_total,
        lastCorrect: r.last_correct === 1,
        box: r.box,
        dueDate: r.due_date,
      },
    ]),
  );
}

export async function getAnswer(db: D1Database, userId: number, questionId: string): Promise<AnswerState | null> {
  const r = await db
    .prepare('SELECT question_id, attempts, correct_total, last_correct, box, due_date FROM answers WHERE user_id = ? AND question_id = ?')
    .bind(userId, questionId)
    .first<AnswerRow>();
  if (!r) return null;
  return { attempts: r.attempts, correctTotal: r.correct_total, lastCorrect: r.last_correct === 1, box: r.box, dueDate: r.due_date };
}

export async function saveAnswer(db: D1Database, userId: number, questionId: string, a: AnswerState, now: number) {
  await db
    .prepare(
      `INSERT INTO answers (user_id, question_id, attempts, correct_total, last_correct, box, due_date, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
       ON CONFLICT(user_id, question_id) DO UPDATE SET
         attempts = ?3, correct_total = ?4, last_correct = ?5, box = ?6, due_date = ?7, updated_at = ?8`,
    )
    .bind(userId, questionId, a.attempts, a.correctTotal, a.lastCorrect ? 1 : 0, a.box, a.dueDate, now)
    .run();
}

export async function logAnswer(
  db: D1Database,
  userId: number,
  questionId: string,
  option: number,
  correct: boolean,
  via: 'app' | 'chat',
  now: number,
) {
  await db
    .prepare('INSERT INTO answer_log (user_id, question_id, option, correct, via, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(userId, questionId, option, correct ? 1 : 0, via, now)
    .run();
}

export async function addActivity(db: D1Database, userId: number, date: string) {
  await db.prepare('INSERT OR IGNORE INTO activity (user_id, date) VALUES (?, ?)').bind(userId, date).run();
}

export async function addDailyAnswer(db: D1Database, userId: number, date: string, correct: boolean) {
  await db
    .prepare(
      `INSERT INTO daily_stats (user_id, date, answers, correct) VALUES (?1, ?2, 1, ?3)
       ON CONFLICT(user_id, date) DO UPDATE SET answers = answers + 1, correct = correct + ?3`,
    )
    .bind(userId, date, correct ? 1 : 0)
    .run();
}

/** Все дни с занятиями или ответами начиная с fromDate: засчитан ли день в стрик и сколько было ответов */
export async function history(db: D1Database, userId: number, fromDate: string) {
  const [active, stats] = await Promise.all([
    db.prepare('SELECT date FROM activity WHERE user_id = ? AND date >= ?').bind(userId, fromDate).all<{ date: string }>(),
    db
      .prepare('SELECT date, answers, correct FROM daily_stats WHERE user_id = ? AND date >= ?')
      .bind(userId, fromDate)
      .all<{ date: string; answers: number; correct: number }>(),
  ]);
  const days = new Map<string, { date: string; active: boolean; answers: number; correct: number }>();
  for (const r of stats.results) days.set(r.date, { date: r.date, active: false, answers: r.answers, correct: r.correct });
  for (const r of active.results) {
    const d = days.get(r.date);
    if (d) d.active = true;
    else days.set(r.date, { date: r.date, active: true, answers: 0, correct: 0 });
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function activityCount(db: D1Database, userId: number): Promise<number> {
  const row = await db.prepare('SELECT COUNT(*) AS n FROM activity WHERE user_id = ?').bind(userId).first<{ n: number }>();
  return row?.n ?? 0;
}

export async function activityDates(db: D1Database, userId: number, fromDate: string): Promise<Set<string>> {
  const { results } = await db
    .prepare('SELECT date FROM activity WHERE user_id = ? AND date >= ?')
    .bind(userId, fromDate)
    .all<{ date: string }>();
  return new Set(results.map((r) => r.date));
}

export async function usersDue(
  db: D1Database,
  column: 'next_daily_at' | 'next_reminder_at',
  now: number,
  limit = 100,
): Promise<UserRow[]> {
  const { results } = await db
    .prepare(`SELECT * FROM users WHERE ${column} IS NOT NULL AND ${column} <= ? LIMIT ?`)
    .bind(now, limit)
    .all<UserRow>();
  return results;
}

export async function lessonsRead(db: D1Database, userId: number): Promise<string[]> {
  const { results } = await db.prepare('SELECT lesson_id FROM lesson_reads WHERE user_id = ?').bind(userId).all<{ lesson_id: string }>();
  return results.map((r) => r.lesson_id);
}

/** Запоминает только первое прочтение: повторные не перезаписывают дату */
export async function markLessonRead(db: D1Database, userId: number, lessonId: string, now: number) {
  await db.prepare('INSERT OR IGNORE INTO lesson_reads (user_id, lesson_id, read_at) VALUES (?, ?, ?)').bind(userId, lessonId, now).run();
}

/** Сохраняет оплату звёздами. false — этот платёж уже записан: Telegram мог прислать обновление повторно */
export async function addDonation(db: D1Database, userId: number, amount: number, chargeId: string, now: number): Promise<boolean> {
  const res = await db
    .prepare('INSERT OR IGNORE INTO donations (user_id, amount, charge_id, created_at) VALUES (?, ?, ?, ?)')
    .bind(userId, amount, chargeId, now)
    .run();
  return res.meta.changes > 0;
}

/** Сколько звёзд человек отправил всего: 0 — ещё не поддерживал */
export async function donatedTotal(db: D1Database, userId: number): Promise<number> {
  const row = await db.prepare('SELECT COALESCE(SUM(amount), 0) AS total FROM donations WHERE user_id = ?').bind(userId).first<{ total: number }>();
  return row?.total ?? 0;
}

export async function saveShareImage(db: D1Database, id: string, data: Uint8Array, now: number, client: string | null = null): Promise<void> {
  await db.prepare('INSERT INTO share_images (id, data, created_at, client) VALUES (?, ?, ?, ?)').bind(id, data, now, client).run();
}

export async function getShareImage(db: D1Database, id: string): Promise<Uint8Array | null> {
  const row = await db.prepare('SELECT data FROM share_images WHERE id = ?').bind(id).first<{ data: ArrayBuffer | number[] }>();
  // D1 отдаёт BLOB массивом чисел или ArrayBuffer — Uint8Array понимает оба
  return row ? new Uint8Array(row.data) : null;
}

export async function deleteShareImagesBefore(db: D1Database, before: number): Promise<void> {
  await db.prepare('DELETE FROM share_images WHERE created_at < ?').bind(before).run();
}

export async function getConfig(db: D1Database, key: string): Promise<string | null> {
  const row = await db.prepare('SELECT value FROM config WHERE key = ?').bind(key).first<{ value: string }>();
  return row?.value ?? null;
}

export async function setConfig(db: D1Database, key: string, value: string | null): Promise<void> {
  if (value === null) await db.prepare('DELETE FROM config WHERE key = ?').bind(key).run();
  else await db.prepare('INSERT INTO config (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = ?2').bind(key, value).run();
}

export async function addReport(
  db: D1Database,
  userId: number,
  r: { questionId: string; reason: string; comment: string | null; answer: object | null; context: object | null },
  now: number,
): Promise<ReportRow> {
  const row = await db
    .prepare('INSERT INTO reports (user_id, question_id, reason, comment, answer, context, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *')
    .bind(userId, r.questionId, r.reason, r.comment, r.answer && JSON.stringify(r.answer), r.context && JSON.stringify(r.context), now)
    .first<ReportRow>();
  return row!;
}

/** Как на вопрос отвечают все по журналу ответов: для сообщения автору о проблеме с вопросом */
export async function questionStats(db: D1Database, questionId: string): Promise<QuestionStats> {
  const { results } = await db
    .prepare('SELECT option, correct, COUNT(*) AS n FROM answer_log WHERE question_id = ? GROUP BY option, correct')
    .bind(questionId)
    .all<{ option: number; correct: number; n: number }>();
  const wrong = results.filter((r) => !r.correct).sort((a, b) => b.n - a.n)[0];
  return {
    answers: results.reduce((n, r) => n + r.n, 0),
    correct: results.filter((r) => r.correct).reduce((n, r) => n + r.n, 0),
    topWrong: wrong ? { option: wrong.option, n: wrong.n } : null,
  };
}

export async function getReport(db: D1Database, id: number): Promise<ReportRow | null> {
  return db.prepare('SELECT * FROM reports WHERE id = ?').bind(id).first<ReportRow>();
}

export async function reportsSince(db: D1Database, userId: number, since: number): Promise<number> {
  const row = await db.prepare('SELECT COUNT(*) AS n FROM reports WHERE user_id = ? AND created_at >= ?').bind(userId, since).first<{ n: number }>();
  return row?.n ?? 0;
}

export async function reportsForQuestion(db: D1Database, questionId: string): Promise<number> {
  const row = await db.prepare('SELECT COUNT(*) AS n FROM reports WHERE question_id = ?').bind(questionId).first<{ n: number }>();
  return row?.n ?? 0;
}

/** Меняет статус, только пока сообщение новое: повторное нажатие кнопки ничего не делает. false — уже разобрано. */
export async function resolveReport(db: D1Database, id: number, status: 'fixed' | 'rejected', now: number): Promise<boolean> {
  const res = await db.prepare("UPDATE reports SET status = ?, resolved_at = ? WHERE id = ? AND status = 'new'").bind(status, now, id).run();
  return res.meta.changes > 0;
}

/** Автор бота по нику: ему уходят сообщения о проблемах в вопросах. null — автор ещё не писал боту или заблокировал его. */
export async function findMessageableUser(db: D1Database, username: string): Promise<UserRow | null> {
  return db.prepare('SELECT * FROM users WHERE lower(username) = ? AND can_message = 1').bind(username.toLowerCase()).first<UserRow>();
}

export async function addSuggestion(
  db: D1Database,
  userId: number,
  s: { track: string; text: string; correct: string; wrong: string[]; explanation: string; source: string | null; screen: string | null },
  now: number,
): Promise<SuggestionRow> {
  const row = await db
    .prepare(
      `INSERT INTO suggestions (user_id, track, text, correct, wrong, explanation, source, screen, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    )
    .bind(userId, s.track, s.text, s.correct, JSON.stringify(s.wrong), s.explanation, s.source, s.screen, now)
    .first<SuggestionRow>();
  return row!;
}

export async function getSuggestion(db: D1Database, id: number): Promise<SuggestionRow | null> {
  return db.prepare('SELECT * FROM suggestions WHERE id = ?').bind(id).first<SuggestionRow>();
}

export async function suggestionsSince(db: D1Database, userId: number, since: number): Promise<number> {
  const row = await db.prepare('SELECT COUNT(*) AS n FROM suggestions WHERE user_id = ? AND created_at >= ?').bind(userId, since).first<{ n: number }>();
  return row?.n ?? 0;
}

/** Сколько вопросов человек предложил и сколько из них принято или уже опубликовано */
export async function suggestionCounts(db: D1Database, userId: number): Promise<{ suggested: number; accepted: number }> {
  const row = await db
    .prepare("SELECT COUNT(*) AS suggested, COALESCE(SUM(status IN ('accepted', 'published')), 0) AS accepted FROM suggestions WHERE user_id = ?")
    .bind(userId)
    .first<{ suggested: number; accepted: number }>();
  return row ?? { suggested: 0, accepted: 0 };
}

/** Переводит предложение в новый статус, только если оно сейчас в from: повторное нажатие кнопки ничего не делает */
export async function moveSuggestion(db: D1Database, id: number, from: SuggestionStatus, to: SuggestionStatus, now: number): Promise<boolean> {
  const res = await db.prepare('UPDATE suggestions SET status = ?, resolved_at = ? WHERE id = ? AND status = ?').bind(to, now, id, from).run();
  return res.meta.changes > 0;
}
