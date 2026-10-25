import { Hono } from 'hono';
import { webhookCallback } from 'grammy';
import { api } from './api';
import { getBot, runScheduled } from './bot';
import { getShareImage } from './db';
import { byteRange } from './range';
import type { Env } from './env';
import { botDescription, botShortDescription } from './texts';

const app = new Hono<{ Bindings: Env }>();

app.route('/', api);

/**
 * Карточка «Поделиться», нарисованная в Mini App: отсюда её скачивает Telegram.
 * Отдаём и куски по Range, как статика Cloudflare: так файл корректно скачает любой клиент.
 */
app.get('/share-img/:file', async (c) => {
  const id = c.req.param('file').replace(/\.jpg$/, '');
  if (!/^[0-9a-f]{32}$/.test(id)) return c.notFound();
  const data = await getShareImage(c.env.DB, id);
  if (!data) return c.notFound();
  const headers: Record<string, string> = {
    'Content-Type': 'image/jpeg',
    'Cache-Control': 'public, max-age=172800, immutable',
    'Accept-Ranges': 'bytes',
    ETag: `"${id}"`,
  };
  const range = byteRange(c.req.header('Range'), data.length);
  if (range === 'invalid') return new Response(null, { status: 416, headers: { ...headers, 'Content-Range': `bytes */${data.length}` } });
  if (!range) return new Response(data, { headers: { ...headers, 'Content-Length': String(data.length) } });
  const [start, end] = range;
  return new Response(data.slice(start, end + 1), {
    status: 206,
    headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${data.length}`, 'Content-Length': String(end - start + 1) },
  });
});

app.post('/bot/webhook', (c) =>
  webhookCallback(getBot(c.env), 'cloudflare-mod', { secretToken: c.env.WEBHOOK_SECRET })(c.req.raw),
);

/**
 * Настройка бота после деплоя: вебхук, команды, описание и кнопка меню.
 * Открыть в браузере: https://<домен>/bot/setup?secret=<WEBHOOK_SECRET>
 */
app.get('/bot/setup', async (c) => {
  if (c.req.query('secret') !== c.env.WEBHOOK_SECRET) return c.text('forbidden', 403);
  const bot = getBot(c.env);
  const origin = new URL(c.req.url).origin;
  await bot.api.setWebhook(`${origin}/bot/webhook`, {
    secret_token: c.env.WEBHOOK_SECRET,
    allowed_updates: ['message', 'callback_query', 'my_chat_member', 'pre_checkout_query'],
  });
  await bot.api.setMyCommands([
    { command: 'question', description: 'Вопрос прямо сейчас' },
    { command: 'settings', description: 'Вопрос дня, напоминания, пауза' },
    { command: 'help', description: 'Что умеет бот' },
  ]);
  await bot.api.setMyDescription(botDescription());
  await bot.api.setMyShortDescription(botShortDescription());
  await bot.api.setChatMenuButton({
    menu_button: { type: 'web_app', text: 'Тренажёр', web_app: { url: c.env.WEBAPP_URL } },
  });
  return c.text(`Готово: вебхук ${origin}/bot/webhook, команды, описание и кнопка меню настроены.`);
});

export default {
  fetch: app.fetch,
  scheduled: (_event, env, ctx) => {
    ctx.waitUntil(runScheduled(env));
  },
} satisfies ExportedHandler<Env>;
