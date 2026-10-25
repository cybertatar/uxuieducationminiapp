import { Api, InlineKeyboard, InputFile } from 'grammy';
import type { InlineQueryResult } from 'grammy/types';
import { Hono } from 'hono';
import { lessonById, questionById, questions, questionsByTrack, trackById, type TrackId } from '../content';
import { DONATE_AMOUNTS, type CompleteResponse, type DonateResponse, type HistoryResponse, type Profile, type ReportRequest, type SessionRequest, type SettingsPatch, type ShareRequest, type ShareResponse, type SuggestRequest } from './api-types';
import { validateInitData, type TelegramUser } from './auth';
import { donationInvoice, notifyOwnerAboutReport, notifyOwnerAboutSuggestion, offerDailyQuestion } from './bot';
import {
  activityCount,
  activityDates,
  addReport,
  addSuggestion,
  donatedTotal,
  getAnswers,
  history,
  lastDonationAt,
  lessonsRead,
  getConfig,
  markLessonRead,
  parseSource,
  updateUser,
  reportsSince,
  saveShareImage,
  suggestionsSince,
  upsertUser,
  type UserRow,
} from './db';
import type { Env } from './env';
import { parseReport, REPORTS_PER_DAY } from './reports';
import { isDue } from './review';
import { parseSuggestion, SUGGESTIONS_PER_DAY } from './suggestions';
import { shouldOfferSupport } from './support';
import { pickReviewSession, pickTrackSession, pickWarmupSession } from './select';
import { decodeShareImage, shareCaption, shareContent, sharePlainText } from './share';
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
  const [active, activeDays, read, donated] = await Promise.all([
    activityDates(c.env.DB, user.id, monday),
    activityCount(c.env.DB, user.id),
    lessonsRead(c.env.DB, user.id),
    donatedTotal(c.env.DB, user.id),
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
    // Тему могли убрать из тренажёра — тогда и продолжать нечего
    lastTrack: user.last_track && trackById.has(user.last_track as TrackId) ? (user.last_track as TrackId) : null,
    supporter: donated > 0,
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
  if (user.last_track !== body.track) await updateUser(c.env.DB, user.id, { last_track: body.track });
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

/** «Сообщить о проблеме» с экрана вопроса: сохраняем и в фоне пересылаем автору вместе с данными об ответе */
api.post('/report', async (c) => {
  const user = c.get('user');
  const report = parseReport(await c.req.json<Partial<ReportRequest>>(), questionById);
  if (!report) return c.json({ error: 'bad report' }, 400);
  const now = Date.now();
  if ((await reportsSince(c.env.DB, user.id, now - 86_400_000)) >= REPORTS_PER_DAY) return c.json({ error: 'too many reports' }, 429);
  const row = await addReport(c.env.DB, user.id, report, now);
  c.executionCtx.waitUntil(notifyOwnerAboutReport(c.env.DB, new Api(c.env.BOT_TOKEN), row, user));
  return c.json({ ok: true });
});

/** «Предложить вопрос»: сохраняем и в фоне пересылаем автору */
api.post('/suggest', async (c) => {
  const user = c.get('user');
  const suggestion = parseSuggestion(await c.req.json<Partial<SuggestRequest>>());
  if (!suggestion) return c.json({ error: 'bad suggestion' }, 400);
  const now = Date.now();
  if ((await suggestionsSince(c.env.DB, user.id, now - 86_400_000)) >= SUGGESTIONS_PER_DAY) return c.json({ error: 'too many suggestions' }, 429);
  const row = await addSuggestion(c.env.DB, user.id, suggestion, now);
  c.executionCtx.waitUntil(notifyOwnerAboutSuggestion(c.env.DB, new Api(c.env.BOT_TOKEN), row, user));
  return c.json({ ok: true });
});

/** «Поддержать проект»: счёт в звёздах Telegram, Mini App открывает его через WebApp.openInvoice */
api.post('/donate', async (c) => {
  const { amount } = await c.req.json<{ amount: number }>();
  if (!(DONATE_AMOUNTS as readonly number[]).includes(amount)) return c.json({ error: 'bad amount' }, 400);
  const res: DonateResponse = { url: await donationInvoice(new Api(c.env.BOT_TOKEN), c.get('user').id, amount) };
  return c.json(res);
});

/** Предложение поддержать показано: больше не показываем */
api.post('/support/offered', async (c) => {
  await updateUser(c.env.DB, c.get('user').id, { support_offered_at: Date.now() });
  return c.json({ ok: true });
});

api.post('/session/complete', async (c) => {
  const user = c.get('user');
  const now = Date.now();
  const s = await recordActivity(c.env.DB, user, now);
  const sessionsDone = user.sessions_done + 1;
  const [donatedAt] = await Promise.all([lastDonationAt(c.env.DB, user.id), updateUser(c.env.DB, user.id, { sessions_done: sessionsDone })]);
  const offerSupport = shouldOfferSupport({ sessionsDone, offeredAt: user.support_offered_at, donatedAt }, now);
  // После первой сессии бот предлагает вопрос дня в чате — в фоне, чтобы не задерживать экран результатов
  c.executionCtx.waitUntil(offerDailyQuestion(c.env.DB, new Api(c.env.BOT_TOKEN), user));
  const res: CompleteResponse = { current: s.current, best: s.best, extended: s.extended, offerSupport };
  return c.json(res);
});

let botUsername: string | null = null;

/** Имя бота для ссылок t.me/<бот>?startapp=…: спрашиваем у Telegram один раз на жизнь воркера */
async function getBotUsername(env: Env): Promise<string> {
  botUsername ??= (await new Api(env.BOT_TOKEN).getMe()).username;
  return botUsername;
}

type PhotoCommon = Pick<Extract<InlineQueryResult, { type: 'photo' }>, 'caption' | 'parse_mode' | 'reply_markup'>;

/**
 * Карточка обычным фото Telegram: бот кладёт её в закрытый канал автора и берёт file_id.
 * Фото по ссылке Telegram на iPhone у отправителя сохранял обрезанным, а с file_id такого нет.
 * null — канал не подключён или отправка не удалась; тогда фото по ссылке.
 */
async function cachedPhoto(env: Env, tg: Api, image: Uint8Array, common: PhotoCommon): Promise<InlineQueryResult | null> {
  const chat = await getConfig(env.DB, 'share_chat');
  if (!chat) return null;
  try {
    const msg = await tg.sendPhoto(chat, new InputFile(image, 'card.jpg'), { disable_notification: true });
    const photo = msg.photo.at(-1)!;
    return { type: 'photo', id: `card-${msg.message_id}`, photo_file_id: photo.file_id, ...common };
  } catch (err) {
    console.error('share chat upload failed', err);
    return null;
  }
}

/** Фото по ссылке: своя карточка из share_images или общая картинка без цифр */
async function photoByUrl(env: Env, image: Uint8Array | null, fallback: string, common: PhotoCommon, client?: string): Promise<InlineQueryResult> {
  let url = `${env.WEBAPP_URL}/share/${fallback}.jpg`;
  if (image) {
    const id = crypto.randomUUID().replaceAll('-', '');
    await saveShareImage(env.DB, id, image, Date.now(), client ?? null);
    url = `${env.WEBAPP_URL}/share-img/${id}.jpg`;
  }
  return { type: 'photo', id: `url-${Date.now()}`, photo_url: url, thumbnail_url: url, ...common };
}

/**
 * Поделиться: карточка с картинкой и кнопкой, которую Mini App отправит через WebApp.shareMessage.
 * Если Telegram не сохранил сообщение (старый клиент, локальная разработка), отдаём текст и ссылку для t.me/share.
 */
api.post('/share', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<ShareRequest>();
  const date = today(user, Date.now());
  const streak = {
    current: visibleStreak({ current: user.streak_current, best: user.streak_best, lastActiveDate: user.last_active_date }, date),
    best: user.streak_best,
  };
  const content = shareContent(body, streak);
  if (!content) return c.json({ error: 'nothing to share' }, 400);

  let username = 'uxuitrainer_bot';
  try {
    username = await getBotUsername(c.env);
  } catch (err) {
    console.error('getMe failed', err);
  }
  const url = `https://t.me/${username}?startapp=${content.startParam}`;
  const res: ShareResponse = { id: null, text: sharePlainText(content), url };
  const custom = decodeShareImage(body.image);
  const common = { caption: shareCaption(content), parse_mode: 'HTML' as const, reply_markup: new InlineKeyboard().url(content.button, url) };
  try {
    const tg = new Api(c.env.BOT_TOKEN);
    const result = (custom && (await cachedPhoto(c.env, tg, custom, common))) || (await photoByUrl(c.env, custom, content.image, common, c.req.header('User-Agent')));
    const prepared = await tg.savePreparedInlineMessage(user.id, result, { allow_user_chats: true, allow_group_chats: true, allow_channel_chats: true });
    res.id = prepared.id;
  } catch (err) {
    console.error('savePreparedInlineMessage failed', err);
  }
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
