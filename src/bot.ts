import { Api, Bot, GrammyError, InlineKeyboard, type Context } from 'grammy';
import { isTextOnly, questionById, questions, sections, trackById, type ChoiceQuestion } from '../content';
import { getAnswers, parseSource, upsertUser, updateUser, usersDue, type UserRow } from './db';
import type { Env } from './env';
import { pickDailyQuestion } from './select';
import { isPaused, pauseUntil, recordActivity, recordAnswer, schedule, shouldOfferDaily, today, updateSettings } from './service';
import { streakAtRisk } from './streak';
import { ONBOARDING_VERSION } from './onboarding-version';
import { appHintText, welcomeText } from './texts';

const LETTERS = ['А', 'Б', 'В', 'Г', 'Д', 'Е'];
const DAILY_TIMES = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const REMINDER_TIMES = ['18:00', '19:00', '20:00', '21:00', '22:00'];

/** Часовые пояса, из которых можно выбрать в боте. В Mini App пояс определяется автоматически. */
export const TIME_ZONES: [string, string][] = [
  ['Europe/Kaliningrad', 'Калининград'],
  ['Europe/Moscow', 'Москва'],
  ['Europe/Samara', 'Самара'],
  ['Asia/Yekaterinburg', 'Екатеринбург'],
  ['Asia/Omsk', 'Омск'],
  ['Asia/Novosibirsk', 'Новосибирск'],
  ['Asia/Krasnoyarsk', 'Красноярск'],
  ['Asia/Irkutsk', 'Иркутск'],
  ['Asia/Yakutsk', 'Якутск'],
  ['Asia/Vladivostok', 'Владивосток'],
  ['Asia/Magadan', 'Магадан'],
  ['Asia/Kamchatka', 'Камчатка'],
  ['Europe/Minsk', 'Минск'],
  ['Europe/Kyiv', 'Киев'],
  ['Asia/Almaty', 'Алматы'],
  ['Asia/Tashkent', 'Ташкент'],
  ['Asia/Tbilisi', 'Тбилиси'],
  ['Asia/Yerevan', 'Ереван'],
  ['Europe/Belgrade', 'Белград'],
  ['Europe/Berlin', 'Берлин'],
];

const tzName = (tz: string) => TIME_ZONES.find(([id]) => id === tz)?.[1] ?? tz;

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

const days = (n: number) => `${n} ${plural(n, 'день', 'дня', 'дней')}`;

// ---------- Вопрос в чате ----------

function shuffledOrder(length: number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function questionText(q: ChoiceQuestion, order: number[], title: string) {
  const track = trackById.get(q.track)!;
  const options = order.map((orig, i) => `${LETTERS[i]}) ${escape(q.options[orig])}`).join('\n');
  return `<b>${title}</b> · ${track.emoji} ${escape(track.title)}\n\n${escape(q.text)}\n\n${options}`;
}

/** callback_data: a:<id вопроса>:<выбранный исходный индекс>:<порядок вариантов> */
function questionKeyboard(q: ChoiceQuestion, order: number[]) {
  const kb = new InlineKeyboard();
  order.forEach((orig, i) => kb.text(LETTERS[i], `a:${q.id}:${orig}:${order.join('')}`));
  return kb;
}

async function sendQuestion(api: Api, chatId: number, q: ChoiceQuestion, title: string) {
  const order = shuffledOrder(q.options.length);
  await api.sendMessage(chatId, questionText(q, order, title), {
    parse_mode: 'HTML',
    reply_markup: questionKeyboard(q, order),
  });
}

async function nextQuestionFor(db: D1Database, user: UserRow, now: number) {
  const answers = await getAnswers(db, user.id);
  return questionById.get(pickDailyQuestion(questions, answers, today(user, now))) as ChoiceQuestion;
}

// ---------- Настройки ----------

function settingsText(u: UserRow, now: number) {
  const lines = [
    '<b>Настройки уведомлений</b>',
    '',
    `📬 Вопрос дня: ${u.daily_enabled ? `каждый день в ${u.daily_time}` : 'выключен'}`,
    `🔥 Напоминание о стрике: ${u.reminder_enabled ? `в ${u.reminder_time}, только если стрик под угрозой` : 'выключено'}`,
    `🌍 Часовой пояс: ${escape(tzName(u.tz))}`,
  ];
  if (isPaused(u, now)) lines.push('', `⏸ Пауза до ${u.paused_until!.split('-').reverse().join('.')} — ничего не присылаю.`);
  return lines.join('\n');
}

function settingsKeyboard(u: UserRow, now: number) {
  return new InlineKeyboard()
    .text(u.daily_enabled ? '📬 Выключить вопрос дня' : '📬 Включить вопрос дня', 's:daily')
    .row()
    .text(`🕘 Время вопроса: ${u.daily_time}`, 's:dt')
    .row()
    .text(u.reminder_enabled ? '🔥 Выключить напоминание' : '🔥 Включить напоминание', 's:rem')
    .row()
    .text(`🕗 Время напоминания: ${u.reminder_time}`, 's:rt')
    .row()
    .text(`🌍 ${tzName(u.tz)}`, 's:tz')
    .row()
    .text(isPaused(u, now) ? '▶️ Снять паузу' : '⏸ Не беспокоить 7 дней', 's:pause');
}

function timeKeyboard(prefix: string, times: string[], current: string) {
  const kb = new InlineKeyboard();
  times.forEach((t, i) => {
    kb.text(t === current ? `• ${t} •` : t, `${prefix}:${t}`);
    if (i % 4 === 3) kb.row();
  });
  return kb.row().text('← Назад', 's:back');
}

function tzKeyboard(current: string) {
  const kb = new InlineKeyboard();
  TIME_ZONES.forEach(([id, name], i) => {
    kb.text(id === current ? `• ${name} •` : name, `s:tz:${i}`);
    if (i % 2 === 1) kb.row();
  });
  return kb.row().text('← Назад', 's:back');
}

// ---------- Бот ----------

/** file_id анимации-гайда: после первой отправки Telegram не скачивает файл заново */
let onboardingFileId: string | undefined;

let cachedBot: Bot | null = null;

/**
 * Предлагает присылать вопрос дня — один раз, после первого занятия (см. shouldOfferDaily).
 * Флаг ставим до отправки, чтобы два почти одновременных завершения сессии не прислали предложение дважды.
 */
export async function offerDailyQuestion(db: D1Database, api: Api, user: UserRow) {
  if (!shouldOfferDaily(user)) return;
  await updateUser(db, user.id, { daily_offered: 1 });
  user.daily_offered = 1;
  try {
    await api.sendMessage(
      user.id,
      'Первое занятие засчитано 🎉 Хочешь получать один вопрос в день прямо сюда? Ответ на него тоже сохраняет стрик 🔥\n\n' +
        'Время и часовой пояс потом можно поменять в /settings.',
      {
        reply_markup: new InlineKeyboard()
          .text('Утром, 9:00', 'o:09:00')
          .text('Днём, 13:00', 'o:13:00')
          .text('Вечером, 19:00', 'o:19:00')
          .row()
          .text('Пока не надо', 'o:no'),
      },
    );
  } catch (err) {
    await handleSendError(db, user, err);
  }
}

export function getBot(env: Env): Bot {
  if (cachedBot) return cachedBot;
  const bot = new Bot(env.BOT_TOKEN);
  const db = env.DB;
  const webApp = { url: env.WEBAPP_URL };

  /** Любое сообщение от пользователя значит, что бот может ему писать. */
  async function loadUser(ctx: Context, source: string | null = null): Promise<UserRow> {
    const from = ctx.from!;
    const now = Date.now();
    const user = await upsertUser(db, { id: from.id, first_name: from.first_name, username: from.username }, now, source);
    if (!user.can_message) await updateSettings(db, user, { can_message: 1 }, now);
    return user;
  }

  bot.command('start', async (ctx) => {
    // t.me/<бот>?start=vc приходит как «/start vc»: метка запоминается как источник нового пользователя
    const user = await loadUser(ctx, parseSource(ctx.match));
    const text = welcomeText(escape(user.first_name ?? 'дизайнер'));
    const options = { parse_mode: 'HTML' as const, reply_markup: new InlineKeyboard().webApp('Открыть тренажёр', webApp) };
    // Анимация показывает, где открыть мини-апп: без неё многие так и пишут боту в чат
    try {
      const msg = await ctx.replyWithAnimation(onboardingFileId ?? `${env.WEBAPP_URL}/onboarding.mp4?v=${ONBOARDING_VERSION}`, { caption: text, ...options });
      onboardingFileId = msg.animation?.file_id;
    } catch (err) {
      console.error('onboarding animation failed', err);
      await ctx.reply(text, options);
    }
  });

  bot.command('settings', async (ctx) => {
    const user = await loadUser(ctx);
    const now = Date.now();
    await ctx.reply(settingsText(user, now), { parse_mode: 'HTML', reply_markup: settingsKeyboard(user, now) });
  });

  bot.command('question', async (ctx) => {
    const user = await loadUser(ctx);
    await sendQuestion(ctx.api, ctx.chat.id, await nextQuestionFor(db, user, Date.now()), 'Вопрос');
  });

  bot.command('help', (ctx) =>
    ctx.reply(
      '/question — получить вопрос прямо сейчас\n' +
        '/settings — вопрос дня, напоминания, часовой пояс, пауза\n\n' +
        `Все темы (разделы ${sections.map((s) => s.title).join(', ')}), прогресс и повторение ошибок — в приложении.`,
      { reply_markup: new InlineKeyboard().webApp('Открыть тренажёр', webApp) },
    ),
  );

  // Онбординг: выбор времени вопроса дня
  bot.callbackQuery(/^o:(.+)$/, async (ctx) => {
    const user = await loadUser(ctx);
    const choice = ctx.match[1];
    const now = Date.now();
    if (choice === 'no') {
      await ctx.editMessageText('Хорошо, не буду писать. Если передумаешь — /settings.');
    } else {
      await updateSettings(db, user, { daily_enabled: 1, daily_time: choice }, now);
      await ctx.editMessageText(
        `Готово! Буду присылать вопрос каждый день в ${choice} (${tzName(user.tz)}).\n` +
          'Если стрик окажется под угрозой, вечером аккуратно напомню. Всё настраивается в /settings.',
      );
    }
    await ctx.answerCallbackQuery();
  });

  // Ответ на вопрос в чате
  bot.callbackQuery(/^a:([\w-]+):(\d+):(\d+)$/, async (ctx) => {
    const user = await loadUser(ctx);
    const [, questionId, chosenRaw, orderRaw] = ctx.match;
    const now = Date.now();
    const result = await recordAnswer(db, user, questionId, Number(chosenRaw), now, 'chat');
    if (!result || !isTextOnly(result.question)) return ctx.answerCallbackQuery({ text: 'Этот вопрос больше не доступен' });
    const { correct } = result;
    const q = result.question;
    const streak = await recordActivity(db, user, now);

    const order = [...orderRaw].map(Number);
    const letter = (orig: number) => LETTERS[order.indexOf(orig)];
    const verdict = correct
      ? '✅ <b>Верно!</b>'
      : `❌ <b>Неверно.</b> Правильный ответ: ${letter(q.correct)}) ${escape(q.options[q.correct])}`;
    const links = q.links.map((l) => `📖 <a href="${l.url}">${escape(l.title)}</a>`).join('\n');
    const streakLine = streak.extended ? `\n\n🔥 Стрик: ${days(streak.current)}` : '';

    await ctx.editMessageText(
      `${questionText(q, order, 'Вопрос')}\n\n${verdict}\n<b>${escape(q.summary)}</b>\n\n` +
        `${escape(q.explanation)}\n\n${links}${streakLine}`,
      {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: new InlineKeyboard().text('Ещё вопрос', 'q:next').webApp('Тренажёр', webApp),
      },
    );
    await ctx.answerCallbackQuery({ text: correct ? 'Верно!' : 'Неверно' });
    // Первый ответ в чате — тоже первое занятие: самое время предложить вопрос дня
    await offerDailyQuestion(db, ctx.api, user);
  });

  bot.callbackQuery('q:next', async (ctx) => {
    const user = await loadUser(ctx);
    await ctx.answerCallbackQuery();
    await sendQuestion(ctx.api, ctx.chat!.id, await nextQuestionFor(db, user, Date.now()), 'Вопрос');
  });

  // Настройки
  bot.callbackQuery(/^s:(.+)$/, async (ctx) => {
    const user = await loadUser(ctx);
    const now = Date.now();
    const [action, value] = [ctx.match[1].split(':')[0], ctx.match[1].split(':').slice(1).join(':')];

    const show = () =>
      ctx.editMessageText(settingsText(user, now), { parse_mode: 'HTML', reply_markup: settingsKeyboard(user, now) });

    switch (action) {
      case 'daily':
        await updateSettings(db, user, { daily_enabled: user.daily_enabled ? 0 : 1 }, now);
        await show();
        break;
      case 'rem':
        await updateSettings(db, user, { reminder_enabled: user.reminder_enabled ? 0 : 1 }, now);
        await show();
        break;
      case 'pause':
        await updateSettings(db, user, { paused_until: isPaused(user, now) ? null : pauseUntil(user, now) }, now);
        await show();
        break;
      case 'dt':
        if (value && DAILY_TIMES.includes(value)) {
          await updateSettings(db, user, { daily_time: value, daily_enabled: 1 }, now);
          await show();
        } else {
          await ctx.editMessageText('Во сколько присылать вопрос дня?', { reply_markup: timeKeyboard('s:dt', DAILY_TIMES, user.daily_time) });
        }
        break;
      case 'rt':
        if (value && REMINDER_TIMES.includes(value)) {
          await updateSettings(db, user, { reminder_time: value, reminder_enabled: 1 }, now);
          await show();
        } else {
          await ctx.editMessageText(
            'Во сколько напоминать о стрике? Напоминание приходит, только если сегодня ещё не было занятий.',
            { reply_markup: timeKeyboard('s:rt', REMINDER_TIMES, user.reminder_time) },
          );
        }
        break;
      case 'tz':
        if (value && TIME_ZONES[Number(value)]) {
          await updateSettings(db, user, { tz: TIME_ZONES[Number(value)][0] }, now);
          await show();
        } else {
          await ctx.editMessageText(
            'Выбери часовой пояс. Если откроешь приложение, он определится автоматически по телефону.',
            { reply_markup: tzKeyboard(user.tz) },
          );
        }
        break;
      default:
        await show();
    }
    await ctx.answerCallbackQuery();
  });

  // Всё, что не команда и не кнопка: подсказываем, где живёт тренажёр. Регистрируется последним.
  bot.on('message', async (ctx) => {
    await loadUser(ctx);
    await ctx.reply(appHintText, { reply_markup: new InlineKeyboard().webApp('Открыть тренажёр', webApp) });
  });

  bot.catch((err) => console.error('bot error', err.error));
  cachedBot = bot;
  return bot;
}

// ---------- Рассылки по расписанию ----------

/** Пользователь заблокировал бота — больше не пишем, пока он сам не вернётся. */
async function handleSendError(db: D1Database, user: UserRow, err: unknown) {
  if (err instanceof GrammyError && err.error_code === 403) {
    await updateUser(db, user.id, { can_message: 0, next_daily_at: null, next_reminder_at: null });
    return;
  }
  console.error('send failed', user.id, err);
}

export async function runScheduled(env: Env, now = Date.now()) {
  const db = env.DB;
  const api = new Api(env.BOT_TOKEN);
  const webApp = { url: env.WEBAPP_URL };

  for (const user of await usersDue(db, 'next_daily_at', now)) {
    // Сначала сдвигаем расписание, чтобы при ошибке не слать повторно каждую минуту
    await updateUser(db, user.id, { next_daily_at: schedule(user, now).next_daily_at });
    if (!user.daily_enabled || isPaused(user, now)) continue;
    try {
      await sendQuestion(api, user.id, await nextQuestionFor(db, user, now), 'Вопрос дня');
    } catch (err) {
      await handleSendError(db, user, err);
    }
  }

  for (const user of await usersDue(db, 'next_reminder_at', now)) {
    await updateUser(db, user.id, { next_reminder_at: schedule(user, now).next_reminder_at });
    if (!user.reminder_enabled || isPaused(user, now)) continue;
    const state = { current: user.streak_current, best: user.streak_best, lastActiveDate: user.last_active_date };
    if (!streakAtRisk(state, today(user, now))) continue;
    try {
      await api.sendMessage(
        user.id,
        `🔥 Твой стрик — ${days(user.streak_current)}. Ответь на один вопрос, чтобы он не сгорел в полночь.`,
        {
          reply_markup: new InlineKeyboard()
            .text('Ответить на вопрос', 'q:next')
            .webApp('Тренажёр', webApp)
            .row()
            .text('Настроить напоминания', 's:back'),
        },
      );
    } catch (err) {
      await handleSendError(db, user, err);
    }
  }
}
