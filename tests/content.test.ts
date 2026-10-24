import { describe, expect, it } from 'vitest';
import { correctOption, isTextOnly, lessons, nextLesson, optionCount, questionById, questions, readingMinutes, sections, trackById, tracks, WARMUP_SHARE, warmupPool } from '../content';
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

describe('уроки', () => {
  it('id уроков уникальны', () => {
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
  });

  it('уроки одного трека идут подряд, иначе «Следующий урок» перепрыгнет в другую тему', () => {
    const seen = new Set<string>();
    lessons.forEach((l, i) => {
      if (i > 0 && lessons[i - 1].track !== l.track) expect(seen.has(l.track), l.id).toBe(false);
      seen.add(l.track);
    });
  });

  it.each(lessons.map((l) => [l.id, l] as const))('%s заполнен корректно', (_, l) => {
    expect(trackById.has(l.track)).toBe(true);
    expect(l.title.length).toBeGreaterThan(3);
    expect(l.description.length).toBeLessThanOrEqual(90);
    expect(l.blocks.length).toBeGreaterThanOrEqual(3);
    expect(l.takeaways.length).toBeGreaterThanOrEqual(2);
    expect(l.takeaways.length).toBeLessThanOrEqual(4);
    expect(l.sources.length).toBeGreaterThan(0);
    for (const s of l.sources) expect(s.url).toMatch(/^https:\/\//);

    // Закрепление — вопросы из того же трека, без повторов
    expect(l.practice.length).toBe(3);
    expect(new Set(l.practice).size).toBe(3);
    for (const id of l.practice) expect(questionById.get(id)?.track, `вопрос ${id}`).toBe(l.track);

    const images = l.blocks.flatMap((b) => (b.type === 'image' ? [b.image] : b.type === 'compare' ? [b.bad, b.good] : []));
    for (const name of images) expect(illustrations[name], `иллюстрация ${name}`).toBeDefined();

    // Ответ не должен быть подсказан картинкой из урока: вопрос с той же иллюстрацией решался бы узнаванием
    for (const id of l.practice) {
      const q = questionById.get(id)!;
      const shown = [q.fix, 'image' in q ? q.image : undefined].filter(Boolean);
      for (const name of shown) expect(images, `${id} показывает ${name} из урока`).not.toContain(name);
    }

    // Незакрытый ** показался бы звёздочками в тексте
    const texts = l.blocks.flatMap((b) => (b.type === 'list' ? b.items : b.type === 'p' || b.type === 'life' || b.type === 'term' ? [b.text] : []));
    for (const t of texts) expect(t.split('**').length % 2, t).toBe(1);

    expect(readingMinutes(l)).toBeGreaterThanOrEqual(1);
  });

  // Уроки читают с телефона: длинный абзац превращается в простыню, которую хочется пролистать
  it.each(lessons.map((l) => [l.id, l] as const))('%s: абзацы короткие', (_, l) => {
    for (const b of l.blocks) {
      if (b.type === 'p' || b.type === 'life') expect(b.text.length, b.text).toBeLessThanOrEqual(200);
      if (b.type === 'term') expect(b.text.length, b.text).toBeLessThanOrEqual(180);
      if (b.type === 'list') for (const item of b.items) expect(item.length, item).toBeLessThanOrEqual(140);
    }
  });

  it('темы урока есть среди вопросов трека, и у каждой темы один урок', () => {
    const owner = new Map<string, string>();
    for (const l of lessons) {
      expect(l.topics.length, l.id).toBeGreaterThan(0);
      const known = new Set(questions.filter((q) => q.track === l.track).map((q) => q.topic));
      for (const topic of l.topics) {
        expect(known.has(topic), `${l.id}: тема «${topic}»`).toBe(true);
        const key = `${l.track}|${topic}`;
        expect(owner.get(key), `тема «${topic}» уже в ${owner.get(key)}`).toBeUndefined();
        owner.set(key, l.id);
      }
    }
  });

  it('вопросы на закрепление — из тем самого урока', () => {
    for (const l of lessons) for (const id of l.practice) expect(l.topics, `${l.id}: ${id}`).toContain(questionById.get(id)!.topic);
  });

  it('урок дальше ведёт на следующий урок своей темы', () => {
    for (const l of lessons) {
      const next = nextLesson(l.id);
      if (next) expect(next.track).toBe(l.track);
    }
    expect(nextLesson(lessons[lessons.length - 1].id)).toBeNull();
  });
});
