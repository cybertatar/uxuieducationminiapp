import { describe, expect, it } from 'vitest';
import { createHmac } from 'node:crypto';
import { validateInitData } from '../src/auth';
import { applyAnswer } from '../src/review';
import { pickDailyQuestion, pickTrackSession } from '../src/select';
import { applyActivity, streakAtRisk, visibleStreak } from '../src/streak';
import { addDays, localDate, nextOccurrence, zonedToUtc } from '../src/time';
import { plural } from '../src/bot';
import { questionsByTrack } from '../content';

describe('time', () => {
  it('считает локальную дату в поясе пользователя', () => {
    const ms = Date.UTC(2026, 0, 1, 22, 30); // 22:30 UTC = 01:30 по Москве
    expect(localDate('Europe/Moscow', ms)).toBe('2026-01-02');
    expect(localDate('Europe/London', ms)).toBe('2026-01-01');
  });

  it('переводит локальное время в UTC с учётом летнего времени', () => {
    expect(zonedToUtc('2026-01-15', '10:00', 'Europe/Moscow')).toBe(Date.UTC(2026, 0, 15, 7, 0));
    expect(zonedToUtc('2026-01-15', '10:00', 'Europe/Berlin')).toBe(Date.UTC(2026, 0, 15, 9, 0));
    expect(zonedToUtc('2026-07-15', '10:00', 'Europe/Berlin')).toBe(Date.UTC(2026, 6, 15, 8, 0));
  });

  it('nextOccurrence: сегодня, если время ещё не наступило, иначе завтра', () => {
    const at9 = Date.UTC(2026, 0, 15, 6, 0); // 09:00 Москва
    expect(nextOccurrence('Europe/Moscow', '10:00', at9)).toBe(Date.UTC(2026, 0, 15, 7, 0));
    expect(nextOccurrence('Europe/Moscow', '08:00', at9)).toBe(Date.UTC(2026, 0, 16, 5, 0));
    expect(nextOccurrence('Europe/Moscow', '09:00', at9)).toBe(Date.UTC(2026, 0, 16, 6, 0));
  });

  it('addDays переходит через границы месяцев', () => {
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });
});

describe('streak', () => {
  const s = (current: number, lastActiveDate: string | null) => ({ current, best: current, lastActiveDate });

  it('растёт, если вчера был активен', () => {
    expect(applyActivity(s(3, '2026-05-09'), '2026-05-10')).toMatchObject({ current: 4, best: 4, extended: true });
  });
  it('не растёт дважды за день', () => {
    expect(applyActivity(s(3, '2026-05-10'), '2026-05-10')).toMatchObject({ current: 3, extended: false });
  });
  it('сбрасывается после пропуска, но лучший результат сохраняется', () => {
    expect(applyActivity({ current: 5, best: 5, lastActiveDate: '2026-05-07' }, '2026-05-10')).toMatchObject({
      current: 1,
      best: 5,
    });
  });
  it('сгоревший стрик показывается как 0', () => {
    expect(visibleStreak(s(5, '2026-05-08'), '2026-05-10')).toBe(0);
    expect(visibleStreak(s(5, '2026-05-09'), '2026-05-10')).toBe(5);
  });
  it('под угрозой — только если вчера был активен, а сегодня нет', () => {
    expect(streakAtRisk(s(5, '2026-05-09'), '2026-05-10')).toBe(true);
    expect(streakAtRisk(s(5, '2026-05-10'), '2026-05-10')).toBe(false);
    expect(streakAtRisk(s(0, null), '2026-05-10')).toBe(false);
  });
});

describe('review', () => {
  const today = '2026-05-10';
  it('ошибка ставит вопрос на повторение завтра', () => {
    expect(applyAnswer(null, false, today)).toMatchObject({ box: 0, dueDate: '2026-05-11', lastCorrect: false });
  });
  it('верный ответ с первого раза не попадает в повторение', () => {
    expect(applyAnswer(null, true, today)).toMatchObject({ dueDate: null, lastCorrect: true });
  });
  it('верные повторения отодвигают показ 1 → 3 → 7 дней и выпускают вопрос', () => {
    let a = applyAnswer(null, false, today);
    a = applyAnswer(a, true, '2026-05-11');
    expect(a).toMatchObject({ box: 1, dueDate: '2026-05-14' });
    a = applyAnswer(a, true, '2026-05-14');
    expect(a).toMatchObject({ box: 2, dueDate: '2026-05-21' });
    a = applyAnswer(a, true, '2026-05-21');
    expect(a.dueDate).toBeNull();
  });
});

describe('select', () => {
  const pool = questionsByTrack('heuristics');
  it('сессия из 10 уникальных вопросов трека', () => {
    const ids = pickTrackSession(pool, new Map(), '2026-05-10');
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(10);
  });
  it('новые вопросы идут раньше уже отвеченных', () => {
    const answers = new Map(
      pool.slice(0, 25).map((q) => [q.id, { attempts: 1, correctTotal: 1, lastCorrect: true, box: 0, dueDate: null }]),
    );
    const ids = pickTrackSession(pool, answers, '2026-05-10');
    expect(ids.slice(0, 5).every((id) => !answers.has(id))).toBe(true);
  });
  it('вопрос дня никогда не содержит картинку', () => {
    for (let i = 0; i < 50; i++) {
      const id = pickDailyQuestion(pool, new Map(), '2026-05-10');
      expect(pool.find((q) => q.id === id)!.image).toBeUndefined();
    }
  });
});

describe('auth', () => {
  const token = '123456:TEST';
  function sign(fields: Record<string, string>) {
    const dcs = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join('\n');
    const secret = createHmac('sha256', 'WebAppData').update(token).digest();
    const hash = createHmac('sha256', secret).update(dcs).digest('hex');
    return new URLSearchParams({ ...fields, hash }).toString();
  }
  const now = Date.UTC(2026, 4, 10);
  const fields = { auth_date: String(now / 1000 - 60), user: JSON.stringify({ id: 42, first_name: 'Аня' }) };

  it('принимает корректную подпись', async () => {
    expect(await validateInitData(sign(fields), token, 86400, now)).toMatchObject({ id: 42 });
  });
  it('отклоняет подделку', async () => {
    const tampered = sign(fields).replace('42', '43');
    expect(await validateInitData(tampered, token, 86400, now)).toBeNull();
  });
  it('отклоняет устаревшие данные', async () => {
    expect(await validateInitData(sign(fields), token, 30, now)).toBeNull();
  });
});

describe('plural', () => {
  it('склоняет «день»', () => {
    expect([1, 2, 5, 11, 21, 22, 25].map((n) => plural(n, 'день', 'дня', 'дней'))).toEqual([
      'день', 'дня', 'дней', 'дней', 'день', 'дня', 'дней',
    ]);
  });
});

describe('тексты бота', () => {
  it('укладываются в лимиты Telegram', async () => {
    const { botDescription, botShortDescription, welcomeText } = await import('../src/texts');
    expect(botDescription().length).toBeLessThanOrEqual(512);
    expect(botShortDescription().length).toBeLessThanOrEqual(120);
    expect(welcomeText('Аня').length).toBeLessThanOrEqual(4096);
  });
});
