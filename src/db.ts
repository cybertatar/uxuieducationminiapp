import type { AnswerState } from './review';

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
}

/** Поля, которые можно менять через updateUser. */
type Writable = Partial<Omit<UserRow, 'id' | 'created_at'>>;

export async function getUser(db: D1Database, id: number): Promise<UserRow | null> {
  return db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<UserRow>();
}

export async function upsertUser(
  db: D1Database,
  u: { id: number; first_name?: string; username?: string },
  now: number,
): Promise<UserRow> {
  const row = await db
    .prepare(
      `INSERT INTO users (id, first_name, username, created_at) VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(id) DO UPDATE SET first_name = ?2, username = ?3
       RETURNING *`,
    )
    .bind(u.id, u.first_name ?? null, u.username ?? null, now)
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

export async function addActivity(db: D1Database, userId: number, date: string) {
  await db.prepare('INSERT OR IGNORE INTO activity (user_id, date) VALUES (?, ?)').bind(userId, date).run();
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
