import { describe, expect, it } from 'vitest';
import { correctOption, optionCount, questions, trackById } from '../content';
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
