import { describe, expect, it } from 'vitest';
import { getBot } from '../src/bot';
import type { Env } from '../src/env';

/** D1 на минималках: пользователь — автор, конфиг в памяти, остальное пусто */
function fakeDb() {
  const config = new Map<string, string>();
  const owner = { id: 1, username: 'everlastinghate', first_name: 'Даниил', can_message: 1, support_pin_id: null };
  const db = {
    prepare(sql: string) {
      let args: unknown[] = [];
      const stmt = {
        bind: (...a: unknown[]) => ((args = a), stmt),
        first: async () => {
          if (sql.includes('FROM config')) return config.has(args[0] as string) ? { value: config.get(args[0] as string) } : null;
          if (sql.includes('INSERT INTO users')) return owner;
          if (sql.includes('SUM(support_pin_id')) return { pinned: 0, failed: 0, waiting: 3 };
          return null;
        },
        run: async () => {
          if (sql.includes('config') && sql.includes('INSERT')) config.set(args[0] as string, args[1] as string);
          if (sql.includes('DELETE FROM config')) config.delete(args[0] as string);
          return { meta: { changes: 1 } };
        },
        all: async () => ({ results: [] }),
      };
      return stmt;
    },
  };
  return { db: db as unknown as D1Database, config };
}

// getBot кэширует бота на всю жизнь воркера, поэтому база, бот и перехват запросов к Telegram — общие на все тесты
const { db, config } = fakeDb();
const bot = getBot({ DB: db, BOT_TOKEN: '1:test', WEBHOOK_SECRET: 's', WEBAPP_URL: 'https://example.com' } as Env);
bot.botInfo = { id: 99, is_bot: true, first_name: 'Bot', username: 'uxuitrainer_bot' } as typeof bot.botInfo;
let calls: { method: string; payload: Record<string, unknown> }[] = [];
bot.api.config.use(async (_prev, method, payload) => {
  calls.push({ method, payload: payload as Record<string, unknown> });
  return { ok: true, result: { message_id: 5 } } as never;
});

async function send(update: object) {
  calls = [];
  config.clear();
  await bot.handleUpdate({ update_id: 1, ...update } as never);
  return { calls, config };
}

const chat = { id: 1, type: 'private' as const, first_name: 'Даниил' };
const owner = { id: 1, is_bot: false, first_name: 'Даниил', username: 'everlastinghate' };

describe('бот', () => {
  it('не отвечает подсказкой на служебное «бот закрепил сообщение»', async () => {
    const { calls } = await send({
      message: { message_id: 6, date: 0, chat, from: { id: 99, is_bot: true, first_name: 'Bot' }, pinned_message: { message_id: 5, date: 0, chat } },
    });
    expect(calls).toEqual([]);
  });

  it('понимает скопированную /pinsupport on без отметки «команда» и отвечает панелью', async () => {
    const { calls, config } = await send({ message: { message_id: 7, date: 0, chat, from: owner, text: '/pinsupport on', entities: [{ type: 'code', offset: 0, length: 14 }] } });
    expect(config.get('support_pin')).toBe('on');
    const reply = calls.find((c) => c.method === 'sendMessage')!;
    expect(reply.payload.text).toContain('Включил раздачу');
  });

  it('чужая /pinsupport не работает', async () => {
    const { calls, config } = await send({ message: { message_id: 8, date: 0, chat, from: { ...owner, username: 'someone' }, text: '/pinsupport on' } });
    expect(config.has('support_pin')).toBe(false);
    expect(calls).toEqual([]);
  });
});
