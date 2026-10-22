import { describe, expect, it } from 'vitest';
import { correctOption, optionCount, questionById, questions, sections, trackById, tracks, WARMUP_SHARE, warmupPool } from '../content';
import { illustrations } from '../web/src/illustrations';

describe('контент', () => {
  it('id вопросов уникальны', () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
  });

  it.each(questions.map((q) => [q.id, q] as const))('%s заполнен корректно', (_, q) => {
    expect(trackById.has(q.track)).toBe(true);
    expect(q.text.length).toBeGreaterThan(10);
    expect(q.summary.length).toBeGreaterThan(10);
    expect(q.summary.length).toBeLessThanOrEqual(100);
    expect(q.explanation.length).toBeGreaterThan(20);
    expect(q.links.length).toBeGreaterThan(0);
    for (const l of q.links) expect(l.url).toMatch(/^https:\/\//);

    const images = [q.fix, 'image' in q ? q.image : undefined].filter(Boolean) as string[];
    if (q.kind === 'image-choice') images.push(...q.options);
    for (const name of images) expect(illustrations[name], `иллюстрация ${name}`).toBeDefined();

    if (q.kind === 'hotspot') {
      expect(illustrations[q.image].zones?.[q.zone], `зона ${q.zone}`).toBeDefined();
    } else {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.options.length).toBeLessThanOrEqual(6);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
    expect(correctOption(q)).toBeGreaterThanOrEqual(0);
    expect(correctOption(q)).toBeLessThan(optionCount(q));
  });

  it('у треков есть обложки', () => {
    for (const t of trackById.values()) expect(illustrations[t.art]).toBeDefined();
  });
});

describe('суть и разбор', () => {
  const words = (s: string) => new Set(s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter((w) => w.length > 3));

  // Суть и полный разбор показываются рядом, поэтому разбор не должен начинаться с того же, что уже сказано в сути
  it.each(questions.map((q) => [q.id, q] as const))('%s: разбор не повторяет суть', (_, q) => {
    const first = q.explanation.split(/(?<=[.!?])\s/)[0];
    const summary = words(q.summary);
    const overlap = [...summary].filter((w) => words(first).has(w)).length / Math.max(1, summary.size);
    expect(q.explanation).not.toContain(q.summary.replace(/\.$/, ''));
    expect(overlap).toBeLessThan(0.75);
  });
});

describe('разделы', () => {
  it('каждый трек ровно в одном разделе, в порядке tracks', () => {
    expect(sections.flatMap((s) => s.tracks)).toEqual(tracks.map((t) => t.id));
  });
});

describe('разминка', () => {
  it('вопросы существуют, лежат в своём разделе и только визуальные', () => {
    for (const s of sections) {
      for (const id of warmupPool[s.id]) {
        const q = questionById.get(id);
        expect(q, id).toBeDefined();
        expect(s.tracks, id).toContain(q!.track);
        expect(q!.kind === 'hotspot' || q!.kind === 'image-choice' || !!(q as { image?: string }).image, id).toBe(true);
      }
    }
  });

  it('в каждом разделе вопросов больше, чем берём в одну разминку, и в сумме ровно 10', () => {
    for (const s of sections) expect(warmupPool[s.id].length).toBeGreaterThan(WARMUP_SHARE[s.id]);
    expect(Object.values(WARMUP_SHARE).reduce((a, b) => a + b, 0)).toBe(10);
  });
});

describe('гайд в приветствии', () => {
  it('версия в ссылке совпадает с файлом, иначе Telegram покажет закешированное старое видео', async () => {
    const { createHash } = await import('node:crypto');
    const { readFileSync } = await import('node:fs');
    const { ONBOARDING_VERSION } = await import('../src/onboarding-version');
    const hash = createHash('sha256').update(readFileSync('web/public/onboarding.mp4')).digest('hex');
    expect(hash.startsWith(ONBOARDING_VERSION)).toBe(true);
  });
});
