import { Api, Bot, GrammyError, InlineKeyboard, type Context } from 'grammy';
import { isTextOnly, questionById, questions, questionsByTrack, sections, trackById, type ChoiceQuestion, type Question } from '../content';
import { DONATE_AMOUNTS, DONATE_LINKS } from './api-types';
import {
  addDonation,
  deleteShareImagesBefore,
  findMessageableUser,
  getAnswer,
  getAnswers,
  getConfig,
  getReport,
  getSuggestion,
  getUser,
  moveSuggestion,
  parseSource,
  questionStats,
  reportsForQuestion,
  resolveReport,
  setConfig,
  suggestionCounts,
  supportPinCounts,
  upsertUser,
  updateUser,
  usersDue,
  usersWithoutSupportPin,
  type UserRow,
} from './db';
import type { Env } from './env';
import { reportText, type ReportRow } from './reports';
import { pickDailyQuestion } from './select';
import { authorName, nextQuestionId, questionSnippet, suggestionText, type SuggestionRow, type SuggestionStatus } from './suggestions';
import { isPaused, pauseUntil, recordActivity, recordAnswer, schedule, shouldOfferDaily, today, updateSettings } from './service';
import { streakAtRisk } from './streak';
import { ONBOARDING_VERSION } from './onboarding-version';
import { appHintText, donateText, supportPinText, welcomeText } from './texts';

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

/**
 * Автор бота (тот же, что в подписи на главной): только он может подключить канал для карточек «Поделиться»,
 * и ему бот присылает сообщения о проблемах в вопросах.
 */
export const OWNER_USERNAME = 'everlastinghate';

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

// ---------- Сообщения о проблемах в вопросах ----------

const reportKeyboard = (id: number) => new InlineKeyboard().text('✅ Исправлено', `r:fix:${id}`).text('🙅 Не ошибка', `r:no:${id}`);

const shorten = (s: string, max = 80) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

/** Текст сообщения автору: к словам человека бот добавляет его историю с вопросом и статистику ответов всех */
async function reportMessage(db: D1Database, report: ReportRow, q: Question, from: Pick<UserRow, 'first_name' | 'username'>) {
  const [history, stats, reports] = await Promise.all([getAnswer(db, report.user_id, q.id), questionStats(db, q.id), reportsForQuestion(db, q.id)]);
  return reportText(report, q, { from, history, stats, reports });
}

/** Пересылает сообщение о проблеме автору. Если автор ещё не писал боту, сообщение остаётся только в таблице reports. */
export async function notifyOwnerAboutReport(db: D1Database, api: Api, report: ReportRow, from: UserRow) {
  const q = questionById.get(report.question_id);
  const owner = await findMessageableUser(db, OWNER_USERNAME);
  if (!q || !owner) return;
  try {
    await api.sendMessage(owner.id, await reportMessage(db, report, q, from), {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      reply_markup: reportKeyboard(report.id),
    });
  } catch (err) {
    await handleSendError(db, owner, err);
  }
}

// ---------- Предложенные вопросы ----------

/** Кнопки по статусу: новый можно принять или отклонить, принятый — отметить опубликованным */
function suggestionKeyboard(r: SuggestionRow) {
  if (r.status === 'new') return new InlineKeyboard().text('✅ Принять', `sg:ok:${r.id}`).text('🙅 Отклонить', `sg:no:${r.id}`);
  if (r.status === 'accepted') return new InlineKeyboard().text('🎉 Опубликован', `sg:pub:${r.id}`);
  return undefined;
}

/** Текст сообщения автору: к вопросу бот добавляет опыт человека в этой теме и сколько он уже предлагал */
async function suggestionMessage(db: D1Database, r: SuggestionRow, from: Pick<UserRow, 'first_name' | 'username'>) {
  const [answers, counts] = await Promise.all([getAnswers(db, r.user_id), suggestionCounts(db, r.user_id)]);
  const states = questionsByTrack(r.track)
    .map((q) => answers.get(q.id))
    .filter((a) => a !== undefined);
  const track = {
    answered: states.length,
    attempts: states.reduce((n, a) => n + a.attempts, 0),
    correct: states.reduce((n, a) => n + a.correctTotal, 0),
  };
  return suggestionText(r, { from, track, ...counts });
}

/** Пересылает предложенный вопрос автору. Если автор ещё не писал боту, вопрос остаётся только в таблице suggestions. */
export async function notifyOwnerAboutSuggestion(db: D1Database, api: Api, r: SuggestionRow, from: UserRow) {
  const owner = await findMessageableUser(db, OWNER_USERNAME);
  if (!owner) return;
  try {
    await api.sendMessage(owner.id, await suggestionMessage(db, r, from), {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      reply_markup: suggestionKeyboard(r),
    });
  } catch (err) {
    await handleSendError(db, owner, err);
  }
}

/** Что бот пишет тому, кто предложил вопрос, при каждом решении автора */
function suggestionNews(status: SuggestionStatus, trackTitle: string, author: string): string {
  if (status === 'accepted') {
    return `Твой вопрос по теме «${escape(trackTitle)}» принят 🎉 Скоро он появится в тренажёре с подписью «Автор вопроса: ${escape(author)}».`;
  }
  if (status === 'published') return `Твой вопрос по теме «${escape(trackTitle)}» теперь в тренажёре 🐈 Спасибо, что помогаешь другим учиться!`;
  return `Спасибо за вопрос по теме «${escape(trackTitle)}»! В этот раз он не вошёл в тренажёр, но присылай ещё: автор читает каждый.`;
}

// ---------- Поддержка звёздами ----------

/** В payload счёта — кто и сколько: по нему pre_checkout_query отличает наши счета от чужих */
const DONATE_PAYLOAD = /^donate:\d+:\d+$/;

const stars = (n: number) => `${n} ${plural(n, 'звезда', 'звезды', 'звёзд')}`;

const INVOICE_TITLE = 'Поддержать UX-тренажёр';
const INVOICE_DESCRIPTION = 'Тренажёр бесплатный и без рекламы. Звёзды помогают автору делать новые уроки, вопросы и темы.';
const invoicePrices = (amount: number) => [{ label: 'Поддержка проекта', amount }];

/** Счёт на поддержку проекта в звёздах Telegram (XTR) для Mini App: provider_token для звёзд пустой */
export function donationInvoice(api: Api, userId: number, amount: number): Promise<string> {
  return api.createInvoiceLink(INVOICE_TITLE, INVOICE_DESCRIPTION, `donate:${userId}:${amount}`, '', 'XTR', invoicePrices(amount));
}

/** /donate: суммы в звёздах, ниже — другие способы ссылками и вход в приложение */
function donateKeyboard(webApp: { url: string }) {
  const kb = new InlineKeyboard();
  for (const a of DONATE_AMOUNTS) kb.text(`${a} ⭐`, `d:${a}`);
  for (const link of DONATE_LINKS) kb.row().url(`💳 ${link.title}`, link.url);
  return kb.row().webApp('Открыть тренажёр', webApp);
}

/** Автору — о каждой поддержке: кто и сколько */
async function notifyOwnerAboutDonation(db: D1Database, api: Api, from: UserRow, amount: number) {
  const owner = await findMessageableUser(db, OWNER_USERNAME);
  if (!owner) return;
  const who = escape(from.first_name ?? 'Без имени') + (from.username ? ` (@${escape(from.username)})` : '');
  try {
    await api.sendMessage(owner.id, `⭐ ${who} поддерживает проект: ${stars(amount)}`, { parse_mode: 'HTML' });
  } catch (err) {
    await handleSendError(db, owner, err);
  }
}

/** Новым пользователям закреп приходит не сразу: сначала пусть освоятся */
const PIN_AFTER_MS = 86_400_000;
/** Сколько закрепов раздаём за минуту: с запасом от лимитов Telegram на рассылки */
const PINS_PER_RUN = 20;

/**
 * Присылает без звука сообщение «Поддержать проект» с кнопками и закрепляет его в чате.
 * id запоминаем, чтобы не закрепить дважды; при ошибке ставим 0 и больше не пробуем.
 */
async function pinSupport(db: D1Database, api: Api, user: UserRow, webApp: { url: string }) {
  try {
    const msg = await api.sendMessage(user.id, supportPinText, { reply_markup: donateKeyboard(webApp), disable_notification: true });
    await api.pinChatMessage(user.id, msg.message_id, { disable_notification: true });
    await updateUser(db, user.id, { support_pin_id: msg.message_id });
  } catch (err) {
    await updateUser(db, user.id, { support_pin_id: 0 });
    await handleSendError(db, user, err);
  }
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

  bot.command('donate', async (ctx) => {
    await loadUser(ctx);
    await ctx.reply(donateText, { reply_markup: donateKeyboard(webApp) });
  });

  // Сумма из /donate: присылаем счёт прямо в чат
  bot.callbackQuery(/^d:(\d+)$/, async (ctx) => {
    const amount = Number(ctx.match[1]);
    await ctx.answerCallbackQuery();
    if (!(DONATE_AMOUNTS as readonly number[]).includes(amount)) return;
    await ctx.replyWithInvoice(INVOICE_TITLE, INVOICE_DESCRIPTION, `donate:${ctx.from.id}:${amount}`, 'XTR', invoicePrices(amount));
  });

  /**
   * Закреп «Поддержать проект» для всех — только по команде автора:
   * test — прислать себе, on — раздавать понемногу каждую минуту, off — остановить, status — сколько раздано.
   */
  bot.command('pinsupport', async (ctx) => {
    if (ctx.from?.username?.toLowerCase() !== OWNER_USERNAME) return;
    const user = await loadUser(ctx);
    const arg = ctx.match.trim();
    if (arg === 'test') return pinSupport(db, ctx.api, user, webApp);
    if (arg === 'on' || arg === 'off') {
      await setConfig(db, 'support_pin', arg === 'on' ? 'on' : null);
      return ctx.reply(arg === 'on' ? `Раздача включена: по ${PINS_PER_RUN} человек в минуту, новым — через сутки после прихода.` : 'Раздача остановлена.');
    }
    const c = await supportPinCounts(db);
    const on = (await getConfig(db, 'support_pin')) === 'on';
    await ctx.reply(`Раздача ${on ? 'включена' : 'выключена'}. Закреплено: ${c.pinned}, не получилось: ${c.failed}, ждут: ${c.waiting}.\n\n/pinsupport test | on | off`);
  });

  // Правила Telegram для оплаты звёздами: у бота должна быть команда поддержки по платежам
  bot.command('paysupport', (ctx) =>
    ctx.reply(
      'Если с оплатой звёздами что-то пошло не так или ты хочешь вернуть звёзды, напиши автору: @' +
        OWNER_USERNAME +
        '. Звёзды вернутся на твой счёт в Telegram.',
    ),
  );

  // Перед оплатой Telegram спрашивает, принимаем ли счёт: на ответ есть 10 секунд
  bot.on('pre_checkout_query', async (ctx) => {
    const q = ctx.preCheckoutQuery;
    // Ссылкой на счёт могли поделиться: платит тот, кто платит, и записываем поддержку на него
    const ok = DONATE_PAYLOAD.test(q.invoice_payload) && q.currency === 'XTR' && (DONATE_AMOUNTS as readonly number[]).includes(q.total_amount);
    await ctx.answerPreCheckoutQuery(ok, ok ? undefined : { error_message: 'Этот счёт устарел. Открой «Поддержать проект» в тренажёре ещё раз.' });
  });

  bot.on('message:successful_payment', async (ctx) => {
    const user = await loadUser(ctx);
    const p = ctx.message.successful_payment;
    if (!(await addDonation(db, user.id, p.total_amount, p.telegram_payment_charge_id, Date.now()))) return;
    await ctx.reply(`Спасибо за ${stars(p.total_amount)} ⭐ Это правда помогает делать тренажёр дальше. Кегль мурлычет 🐈`);
    await notifyOwnerAboutDonation(db, ctx.api, user, p.total_amount);
  });

  bot.command('help', (ctx) =>
    ctx.reply(
      '/question — получить вопрос прямо сейчас\n' +
        '/settings — вопрос дня, напоминания, часовой пояс, пауза\n' +
        '/donate — поддержать проект ⭐\n\n' +
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

  // Автор разобрал сообщение о проблеме. Если исправил — говорим спасибо тому, кто сообщил.
  bot.callbackQuery(/^r:(fix|no):(\d+)$/, async (ctx) => {
    if (ctx.from.username?.toLowerCase() !== OWNER_USERNAME) return ctx.answerCallbackQuery();
    const id = Number(ctx.match[2]);
    const status = ctx.match[1] === 'fix' ? 'fixed' : 'rejected';
    const changed = await resolveReport(db, id, status, Date.now());
    const report = await getReport(db, id);
    const q = report && questionById.get(report.question_id);
    if (!changed || !report || !q) return ctx.answerCallbackQuery({ text: changed ? 'Готово' : 'Уже разобрано' });

    const reporter = await getUser(db, report.user_id);
    await ctx.editMessageText(await reportMessage(db, report, q, reporter ?? { first_name: null, username: null }), {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    });
    if (status === 'fixed' && reporter?.can_message) {
      try {
        await ctx.api.sendMessage(
          reporter.id,
          `Спасибо за сообщение о проблеме 🐈 Вопрос «${escape(shorten(q.text))}» поправили.`,
          { parse_mode: 'HTML', reply_markup: new InlineKeyboard().webApp('Открыть тренажёр', webApp) },
        );
      } catch (err) {
        await handleSendError(db, reporter, err);
      }
    }
    await ctx.answerCallbackQuery({ text: status === 'fixed' ? 'Отмечено как исправленное' : 'Отмечено: не ошибка' });
  });

  // Автор решил судьбу предложенного вопроса: обновляем сообщение и рассказываем тому, кто его прислал
  bot.callbackQuery(/^sg:(ok|no|pub):(\d+)$/, async (ctx) => {
    if (ctx.from.username?.toLowerCase() !== OWNER_USERNAME) return ctx.answerCallbackQuery();
    const id = Number(ctx.match[2]);
    const [from, to] = ({ ok: ['new', 'accepted'], no: ['new', 'rejected'], pub: ['accepted', 'published'] } as const)[ctx.match[1] as 'ok' | 'no' | 'pub'];
    const changed = await moveSuggestion(db, id, from, to, Date.now());
    const r = await getSuggestion(db, id);
    if (!changed || !r) return ctx.answerCallbackQuery({ text: 'Уже разобрано' });

    const sender = await getUser(db, r.user_id);
    const who = sender ?? { first_name: null, username: null };
    const author = authorName(who);
    await ctx.editMessageText(await suggestionMessage(db, r, who), {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      reply_markup: suggestionKeyboard(r),
    });
    // Заготовка для content/*.ts — ответом на карточку, чтобы её было удобно скопировать
    if (to === 'accepted') {
      const snippet = questionSnippet(r, nextQuestionId(r.track, questions), author);
      await ctx.reply(`<pre><code class="language-ts">${escape(snippet)}</code></pre>`, {
        parse_mode: 'HTML',
        reply_parameters: { message_id: ctx.callbackQuery.message!.message_id },
      });
    }
    if (sender?.can_message) {
      try {
        await ctx.api.sendMessage(sender.id, suggestionNews(to, trackById.get(r.track)!.title, author), {
          parse_mode: 'HTML',
          reply_markup: new InlineKeyboard().webApp('Открыть тренажёр', webApp),
        });
      } catch (err) {
        await handleSendError(db, sender, err);
      }
    }
    await ctx.answerCallbackQuery({ text: { accepted: 'Принят', rejected: 'Отклонён', published: 'Опубликован' }[to as 'accepted' | 'rejected' | 'published'] });
  });

  // Всё, что не команда и не кнопка: подсказываем, где живёт тренажёр. Регистрируется последним.
  /**
   * Канал для карточек «Поделиться»: автор добавляет бота админом в закрытый канал, бот запоминает его сам.
   * Чужие каналы бот покидает: иначе кто угодно мог бы перехватить карточки или сломать шеринг.
   */
  bot.on('my_chat_member', async (ctx) => {
    const { chat, from, new_chat_member: member } = ctx.myChatMember;
    if (chat.type !== 'channel') return;
    const current = await getConfig(db, 'share_chat');
    if (member.status === 'administrator') {
      if (from.username?.toLowerCase() !== OWNER_USERNAME) {
        await ctx.api.leaveChat(chat.id).catch(() => {});
        return;
      }
      await setConfig(db, 'share_chat', String(chat.id));
      await ctx.api
        .sendMessage(chat.id, 'Готово 🐈 Сюда буду класть картинки карточек «Поделиться», чтобы отправлять их обычным фото. Не удаляйте меня из админов.')
        .catch((err) => console.error('share chat greeting failed', err));
    } else if (String(chat.id) === current) {
      // Бота убрали из канала или сняли права — шеринг вернётся к ссылкам на картинку
      await setConfig(db, 'share_chat', null);
    }
  });

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

  if ((await getConfig(db, 'support_pin')) === 'on') {
    for (const user of await usersWithoutSupportPin(db, now - PIN_AFTER_MS, PINS_PER_RUN)) await pinSupport(db, api, user, webApp);
  }

  // Карточки «Поделиться» Telegram уже скачал — старше двух дней не нужны
  await deleteShareImagesBefore(db, now - 2 * 86_400_000).catch((err) => console.error('share images cleanup failed', err));
}
