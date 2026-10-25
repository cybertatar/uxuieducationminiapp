import { describe, expect, it } from 'vitest';
import { lessons, tracks } from '../content';
import { parseSource } from '../src/db';
import { decodeShareImage, shareCaption, shareContent, sharePlainText } from '../src/share';

const noStreak = { current: 0, best: 0 };

describe('поделиться', () => {
  it('результат темы: счёт, тема и стрик', () => {
    const c = shareContent({ kind: 'result', session: { mode: 'track', track: tracks[0].id }, correct: 8, total: 10 }, { current: 5, best: 5 })!;
    const text = sharePlainText(c);
    expect(text).toContain('8 из 10');
    expect(text).toContain(tracks[0].title);
    expect(text).toContain('5 дней подряд');
    expect(c.image).toBe('result');
  });

  it('стрик в один день в результат не попадает', () => {
    const c = shareContent({ kind: 'result', session: { mode: 'warmup' }, correct: 10, total: 10 }, { current: 1, best: 1 })!;
    expect(sharePlainText(c)).not.toContain('Стрик');
    expect(sharePlainText(c)).toContain('Без единой ошибки');
  });

  it('отклоняет невозможный счёт и неизвестную тему', () => {
    const session = { mode: 'track' as const, track: tracks[0].id };
    expect(shareContent({ kind: 'result', session, correct: 11, total: 10 }, noStreak)).toBeNull();
    expect(shareContent({ kind: 'result', session, correct: -1, total: 10 }, noStreak)).toBeNull();
    expect(shareContent({ kind: 'result', session, correct: 1.5, total: 10 }, noStreak)).toBeNull();
    expect(shareContent({ kind: 'result', session: { mode: 'track', track: 'nope' as never }, correct: 1, total: 10 }, noStreak)).toBeNull();
  });

  it('стрик: без занятий делиться нечем, рекорд упоминается', () => {
    expect(shareContent({ kind: 'streak' }, noStreak)).toBeNull();
    expect(sharePlainText(shareContent({ kind: 'streak' }, { current: 3, best: 10 })!)).toContain('Рекорд — 10 дней');
    expect(sharePlainText(shareContent({ kind: 'streak' }, { current: 7, best: 7 })!)).toContain('мой рекорд');
  });

  it('урок открывается по ссылке: id урока — допустимая метка startapp', () => {
    for (const l of lessons) {
      const c = shareContent({ kind: 'lesson', lessonId: l.id }, noStreak)!;
      expect(parseSource(c.startParam)).toBe(c.startParam);
      expect(sharePlainText(c)).toContain(l.title);
    }
    expect(shareContent({ kind: 'lesson', lessonId: 'nope' }, noStreak)).toBeNull();
  });

  it('подпись: жирный в <b>, спецсимволы экранированы, лимит подписи Telegram', () => {
    const c = { image: 'result' as const, lines: ['**5 < 6** & ок'], button: '', startParam: 'x' };
    expect(shareCaption(c)).toBe('<b>5 &lt; 6</b> &amp; ок');
    expect(sharePlainText(c)).toBe('5 < 6 & ок');
    for (const l of lessons) expect(shareCaption(shareContent({ kind: 'lesson', lessonId: l.id }, noStreak)!).length).toBeLessThan(1024);
  });

  it('карточка от клиента принимается, только если это JPEG разумного размера', () => {
    const jpeg = btoa(String.fromCharCode(0xff, 0xd8, 0xff, 0xe0, 1, 2, 3));
    expect(decodeShareImage(jpeg)?.length).toBe(7);
    expect(decodeShareImage(btoa('<svg/>'))).toBeNull();
    expect(decodeShareImage('не base64!')).toBeNull();
    expect(decodeShareImage(undefined)).toBeNull();
    expect(decodeShareImage('A'.repeat(1_000_000))).toBeNull();
  });
});

describe('Range для картинки карточки', async () => {
  const { byteRange } = await import('../src/range');
  it('разбирает куски, как их просит Telegram', () => {
    expect(byteRange(undefined, 1000)).toBeNull();
    expect(byteRange('bytes=0-499', 1000)).toEqual([0, 499]);
    expect(byteRange('bytes=500-', 1000)).toEqual([500, 999]);
    expect(byteRange('bytes=-200', 1000)).toEqual([800, 999]);
    expect(byteRange('bytes=900-5000', 1000)).toEqual([900, 999]);
    expect(byteRange('bytes=1000-', 1000)).toBe('invalid');
    expect(byteRange('bytes=0-1,5-9', 1000)).toBeNull();
  });
});
