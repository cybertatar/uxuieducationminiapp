import { describe, expect, it } from 'vitest';
import { getBot } from '../src/bot';
import type { Env } from '../src/env';

/** База из одной таблицы config — ровно то, что трогает подключение канала */
function fakeDb() {
  const config = new Map<string, string>();
  const db = {
    prepare: (sql: string) => ({
      bind: (...args: unknown[]) => ({
        first: async () => (sql.startsWith('SELECT value FROM config') && config.has(args[0] as string) ? { value: config.get(args[0] as string) } : null),
        run: async () => {
          if (sql.startsWith('INSERT INTO config')) config.set(args[0] as string, args[1] as string);
          if (sql.startsWith('DELETE FROM config')) config.delete(args[0] as string);
        },
      }),
    }),
  };
  return { db: db as unknown as D1Database, config };
}

const env = (db: D1Database) => ({ DB: db, BOT_TOKEN: '1:test', WEBHOOK_SECRET: 's', WEBAPP_URL: 'https://example.com' }) as Env;
const calls: { method: string; payload: Record<string, unknown> }[] = [];

// getBot кеширует бота вместе с базой, поэтому база и перехватчик Telegram API — одни на все тесты
const { db, config } = fakeDb();
const bot = getBot(env(db));
bot.api.config.use(async (_prev, method, payload) => {
  calls.push({ method, payload: payload as Record<string, unknown> });
  const result = method === 'getMe' ? { id: 1, is_bot: true, first_name: 'Кегль', username: 'uxuitrainer_bot' } : true;
  return { ok: true, result } as never;
});
await bot.init();

function setup() {
  config.clear();
  calls.length = 0;
  return { bot, config };
}

const update = (username: string, status: 'administrator' | 'left') => ({
  update_id: 1,
  my_chat_member: {
    chat: { id: -100123, type: 'channel', title: 'Карточки' },
    from: { id: 42, is_bot: false, first_name: 'Даниил', username },
    date: 0,
    old_chat_member: { status: 'left', user: { id: 1, is_bot: true, first_name: 'Кегль' } },
    new_chat_member: status === 'administrator'
      ? { status, user: { id: 1, is_bot: true, first_name: 'Кегль' }, can_be_edited: false, is_anonymous: false, can_manage_chat: true, can_delete_messages: true, can_manage_video_chats: false, can_restrict_members: false, can_promote_members: false, can_change_info: false, can_invite_users: false, can_post_messages: true, can_post_stories: false, can_edit_stories: false, can_delete_stories: false }
      : { status, user: { id: 1, is_bot: true, first_name: 'Кегль' } },
  },
});

describe('канал для карточек «Поделиться»', () => {
  it('автор добавил бота админом — канал запомнен, в канал ушло «Готово»', async () => {
    const { bot, config } = setup();
    await bot.handleUpdate(update('EverlastingHate', 'administrator') as never);
    expect(config.get('share_chat')).toBe('-100123');
    expect(calls.some((c) => c.method === 'sendMessage' && c.payload.chat_id === -100123)).toBe(true);
  });

  it('чужой канал бот покидает и не запоминает', async () => {
    const { bot, config } = setup();
    await bot.handleUpdate(update('stranger', 'administrator') as never);
    expect(config.has('share_chat')).toBe(false);
    expect(calls.some((c) => c.method === 'leaveChat')).toBe(true);
  });

  it('бота убрали из канала — канал забыт', async () => {
    const { bot, config } = setup();
    await bot.handleUpdate(update('everlastinghate', 'administrator') as never);
    await bot.handleUpdate(update('everlastinghate', 'left') as never);
    expect(config.has('share_chat')).toBe(false);
  });
});
