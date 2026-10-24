import { describe, expect, it } from 'vitest';
import { correctOption, isTextOnly, optionCount, questionById, questions, sections, trackById, tracks, WARMUP_SHARE, warmupPool } from '../content';
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
    if (q.kind === 'image-choice' || (q.kind === 'multi' && q.images)) images.push(...q.options);
    for (const name of images) expect(illustrations[name], `иллюстрация ${name}`).toBeDefined();

    if (q.kind === 'hotspot') {
      expect(illustrations[q.image].zones?.[q.zone], `зона ${q.zone}`).toBeDefined();
    } else if (q.kind === 'spot') {
      expect(q.zones.length).toBeGreaterThanOrEqual(2);
      expect(new Set(q.zones).size).toBe(q.zones.length);
      for (const z of q.zones) expect(illustrations[q.image].zones?.[z], `зона ${z}`).toBeDefined();
    } else if (q.kind === 'order') {
      expect(q.items.length).toBeGreaterThanOrEqual(3);
      expect(q.items.length).toBeLessThanOrEqual(6);
      expect(new Set(q.items).size).toBe(q.items.length);
    } else {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.options.length).toBeLessThanOrEqual(6);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
    if (q.kind === 'multi') {
      // Хотя бы один верный и хотя бы один лишний, иначе «выбери все» превращается в «отметь всё»
      expect(q.correct.length).toBeGreaterThanOrEqual(1);
      expect(q.correct.length).toBeLessThan(q.options.length);
      expect(new Set(q.correct).size).toBe(q.correct.length);
      for (const i of q.correct) expect(i >= 0 && i < q.options.length, `индекс ${i}`).toBe(true);
    }
    expect(correctOption(q)).toBeGreaterThanOrEqual(0);
    expect(correctOption(q)).toBeLessThan(optionCount(q));
  });

  it('зоны в «найди все проблемы» не перекрываются, иначе одна метка засчитается за две', () => {
    const PAD = 10;
    for (const q of questions) {
      if (q.kind !== 'spot') continue;
      const zs = q.zones.map((z) => illustrations[q.image].zones![z]);
      for (let i = 0; i < zs.length; i++)
        for (let j = i + 1; j < zs.length; j++) {
          const [ax, ay, aw, ah] = zs[i];
          const [bx, by, bw, bh] = zs[j];
          const apart = ax + aw + 2 * PAD < bx || bx + bw + 2 * PAD < ax || ay + ah + 2 * PAD < by || by + bh + 2 * PAD < ay;
          expect(apart, `${q.id}: ${q.zones[i]} и ${q.zones[j]}`).toBe(true);
        }
    }
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
        expect(!isTextOnly(q!), id).toBe(true);
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
