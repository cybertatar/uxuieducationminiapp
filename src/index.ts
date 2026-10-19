import { Hono } from 'hono';
import { webhookCallback } from 'grammy';
import { api } from './api';
import { getBot, runScheduled } from './bot';
import type { Env } from './env';

const app = new Hono<{ Bindings: Env }>();

app.route('/', api);

app.post('/bot/webhook', (c) =>
  webhookCallback(getBot(c.env), 'cloudflare-mod', { secretToken: c.env.WEBHOOK_SECRET })(c.req.raw),
);

/**
 * Одноразовая настройка бота после деплоя: вебхук, команды и кнопка меню.
 * Открыть в браузере: https://<домен>/bot/setup?secret=<WEBHOOK_SECRET>
 */
app.get('/bot/setup', async (c) => {
  if (c.req.query('secret') !== c.env.WEBHOOK_SECRET) return c.text('forbidden', 403);
  const bot = getBot(c.env);
  const origin = new URL(c.req.url).origin;
  await bot.api.setWebhook(`${origin}/bot/webhook`, {
    secret_token: c.env.WEBHOOK_SECRET,
    allowed_updates: ['message', 'callback_query'],
  });
  await bot.api.setMyCommands([
    { command: 'question', description: 'Вопрос прямо сейчас' },
    { command: 'settings', description: 'Вопрос дня, напоминания, пауза' },
    { command: 'help', description: 'Что умеет бот' },
  ]);
  await bot.api.setChatMenuButton({
    menu_button: { type: 'web_app', text: 'Тренажёр', web_app: { url: c.env.WEBAPP_URL } },
  });
  return c.text(`Готово: вебхук ${origin}/bot/webhook, команды и кнопка меню настроены.`);
});

export default {
  fetch: app.fetch,
  scheduled: (_event, env, ctx) => {
    ctx.waitUntil(runScheduled(env));
  },
} satisfies ExportedHandler<Env>;
