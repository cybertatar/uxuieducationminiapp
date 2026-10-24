import { Api } from 'grammy';
import { Hono } from 'hono';
import { lessonById, questionById, questions, questionsByTrack, trackById, type TrackId } from '../content';
import type { CompleteResponse, HistoryResponse, Profile, SessionRequest, SettingsPatch } from './api-types';
import { validateInitData, type TelegramUser } from './auth';
import { offerDailyQuestion } from './bot';
import { activityCount, activityDates, getAnswers, history, lessonsRead, markLessonRead, parseSource, upsertUser, type UserRow } from './db';
import type { Env } from './env';
import { isDue } from './review';
import { pickReviewSession, pickTrackSession, pickWarmupSession } from './select';
import { weakTopics } from './stats';
import { pauseUntil, recordActivity, recordAnswer, today, updateSettings } from './service';
import { visibleStreak } from './streak';
import { addDays, isValidTime, isValidTimeZone } from './time';

type Ctx = { Bindings: Env; Variables: { user: UserRow } };

export const api = new Hono<Ctx>().basePath('/api');

api.use('*', async (c, next) => {
  const auth = c.req.header('Authorization') ?? '';
  const initData = auth.startsWith('tma ') ? auth.slice(4) : '';
  let tgUser: TelegramUser | null = null;
  if (initData === 'dev' && c.env.DEV_AUTH === '1') {
    tgUser = { id: 1, first_name: 'Дизайнер' };
  } else if (initData) {
    tgUser = await validateInitData(initData, c.env.BOT_TOKEN);
  }
  if (!tgUser) return c.json({ error: 'unauthorized' }, 401);

  const now = Date.now();
  // start_param из ссылки t.me/<бот>?startapp=<метка> входит в подписанный initData
  const source = parseSource(new URLSearchParams(initData).get('start_param'));
  const user = await upsertUser(c.env.DB, tgUser, now, source);

  // Часовой пояс берём с устройства: так стрик и напоминания совпадают с реальными сутками пользователя.
  const tz = c.req.header('X-Timezone');
  if (tz && tz !== user.tz && isValidTimeZone(tz)) {
    await updateSettings(c.env.DB, user, { tz }, now);
  }

  c.set('user', user);
  await next();
});

api.get('/me', async (c) => {
  const user = c.get('user');
  const now = Date.now();
  const date = today(user, now);
  const answers = await getAnswers(c.env.DB, user.id);

  // Неделя с понедельника, как в календаре
  const weekday = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
  const monday = addDays(date, -weekday);
  const [active, activeDays, read] = await Promise.all([
    activityDates(c.env.DB, user.id, monday),
    activityCount(c.env.DB, user.id),
    lessonsRead(c.env.DB, user.id),
  ]);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i);
    return { date: d, active: active.has(d), isToday: d === date };
  });

  const streakState = { current: user.streak_current, best: user.streak_best, lastActiveDate: user.last_active_date };
  const profile: Profile = {
    firstName: user.first_name,
    streak: {
      current: visibleStreak(streakState, date),
      best: user.streak_best,
      todayDone: user.last_active_date === date,
      week,
      activeDays,
    },
    tracks: [...trackById.keys()].map((id) => {
      const pool = questionsByTrack(id);
      const states = pool.map((q) => answers.get(q.id)).filter((a) => a !== undefined);
      return {
        id,
        total: pool.length,
        answered: states.length,
        mastered: states.filter((a) => a.lastCorrect).length,
        attempts: states.reduce((n, a) => n + a.attempts, 0),
        correct: states.reduce((n, a) => n + a.correctTotal, 0),
      };
    }),
    reviewDue: questions.filter((q) => isDue(answers.get(q.id), date)).length,
    weakTopics: weakTopics(questions, answers),
    // Урок могли убрать из учебника — такие отметки не показываем
    lessonsRead: read.filter((id) => lessonById.has(id)),
    settings: {
      dailyEnabled: user.daily_enabled === 1,
      dailyTime: user.daily_time,
      reminderEnabled: user.reminder_enabled === 1,
      reminderTime: user.reminder_time,
      tz: user.tz,
      pausedUntil: user.paused_until && user.paused_until > date ? user.paused_until : null,
      canMessage: user.can_message === 1,
    },
  };
  return c.json(profile);
});

api.post('/session', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<SessionRequest>();
  const answers = await getAnswers(c.env.DB, user.id);
  const date = today(user, Date.now());
  if (body.mode === 'review') {
    return c.json({ questionIds: pickReviewSession(questions, answers, date) });
  }
  if (body.mode === 'warmup') {
    return c.json({ questionIds: pickWarmupSession(questionById, answers) });
  }
  if (body.mode === 'lesson') {
    const lesson = lessonById.get(body.lesson);
    if (!lesson) return c.json({ error: 'unknown lesson' }, 400);
    return c.json({ questionIds: lesson.practice });
  }
  if (!trackById.has(body.track)) return c.json({ error: 'unknown track' }, 400);
  return c.json({ questionIds: pickTrackSession(questionsByTrack(body.track as TrackId), answers, date) });
});

/** Календарь занятий: история за последние два года */
api.get('/history', async (c) => {
  const user = c.get('user');
  const date = today(user, Date.now());
  const res: HistoryResponse = { today: date, days: await history(c.env.DB, user.id, addDays(date, -730)) };
  return c.json(res);
});

api.post('/answer', async (c) => {
  const { questionId, option } = await c.req.json<{ questionId: string; option: number }>();
  const result = await recordAnswer(c.env.DB, c.get('user'), questionId, option, Date.now(), 'app');
  if (!result) return c.json({ error: 'bad answer' }, 400);
  return c.json({ correct: result.correct });
});

/** Урок прочитан: человек долистал до «Запомни главное» */
api.post('/lessons/read', async (c) => {
  const { lessonId } = await c.req.json<{ lessonId: string }>();
  if (!lessonById.has(lessonId)) return c.json({ error: 'unknown lesson' }, 400);
  await markLessonRead(c.env.DB, c.get('user').id, lessonId, Date.now());
  return c.json({ ok: true });
});

api.post('/session/complete', async (c) => {
  const user = c.get('user');
  const s = await recordActivity(c.env.DB, user, Date.now());
  // После первой сессии бот предлагает вопрос дня в чате — в фоне, чтобы не задерживать экран результатов
  c.executionCtx.waitUntil(offerDailyQuestion(c.env.DB, new Api(c.env.BOT_TOKEN), user));
  const res: CompleteResponse = { current: s.current, best: s.best, extended: s.extended };
  return c.json(res);
});

api.patch('/settings', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<SettingsPatch>();
  const now = Date.now();
  const fields: Partial<UserRow> = {};
  if (typeof body.dailyEnabled === 'boolean') fields.daily_enabled = body.dailyEnabled ? 1 : 0;
  if (typeof body.reminderEnabled === 'boolean') fields.reminder_enabled = body.reminderEnabled ? 1 : 0;
  if (body.dailyTime && isValidTime(body.dailyTime)) fields.daily_time = body.dailyTime;
  if (body.reminderTime && isValidTime(body.reminderTime)) fields.reminder_time = body.reminderTime;
  if (body.allowMessages === true) fields.can_message = 1;
  if (typeof body.pause === 'boolean') fields.paused_until = body.pause ? pauseUntil(user, now) : null;
  await updateSettings(c.env.DB, user, fields, now);
  return c.json({ ok: true });
});
