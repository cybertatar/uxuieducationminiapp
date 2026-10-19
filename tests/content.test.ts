import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { questions, trackById } from '../content';

describe('контент', () => {
  it('id вопросов уникальны', () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
  });

  it.each(questions.map((q) => [q.id, q] as const))('%s заполнен корректно', (_, q) => {
    expect(trackById.has(q.track)).toBe(true);
    expect(q.text.length).toBeGreaterThan(10);
    expect(q.options.length).toBeGreaterThanOrEqual(2);
    expect(q.options.length).toBeLessThanOrEqual(6);
    expect(new Set(q.options).size).toBe(q.options.length);
    expect(q.correct).toBeGreaterThanOrEqual(0);
    expect(q.correct).toBeLessThan(q.options.length);
    expect(q.explanation.length).toBeGreaterThan(20);
    expect(q.links.length).toBeGreaterThan(0);
    for (const l of q.links) expect(l.url).toMatch(/^https:\/\//);
    if (q.image) expect(existsSync(`web/public${q.image}`)).toBe(true);
  });
});
