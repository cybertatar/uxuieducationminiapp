import type { Lesson, LessonBlock, TrackId } from '../types';
import { designSystemsLessons } from './design-systems';
import { figmaAutoLayoutLessons } from './figma-auto-layout';
import { figmaComponentsLessons } from './figma-components';
import { figmaPropsLessons } from './figma-props';
import { figmaPrototypingLessons } from './figma-prototyping';
import { figmaVariablesLessons } from './figma-variables';
import { heuristicsLessons } from './heuristics';
import { higLessons } from './hig';
import { materialLessons } from './material';
import { uxLawsLessons } from './ux-laws';
import { usabilityTestingLessons } from './usability-testing';
import { uxWritingLessons } from './ux-writing';
import { visualDesignLessons } from './visual-design';
import { wcagLessons } from './wcag';

/** Уроки «Учебника». Внутри трека — в порядке изучения: от общего к частному. */
export const lessons: Lesson[] = [...heuristicsLessons, ...uxLawsLessons, ...uxWritingLessons, ...usabilityTestingLessons, ...visualDesignLessons, ...higLessons, ...materialLessons, ...wcagLessons, ...figmaComponentsLessons, ...figmaPropsLessons, ...figmaAutoLayoutLessons, ...figmaVariablesLessons, ...figmaPrototypingLessons, ...designSystemsLessons];

export const lessonById = new Map(lessons.map((l) => [l.id, l]));

const lessonByTopic = new Map(lessons.flatMap((l) => l.topics.map((topic) => [`${l.track}|${topic}`, l] as const)));

/** Урок, который объясняет тему вопроса, — чтобы из результатов вести не только в статью, но и в учебник */
export const lessonForTopic = (track: TrackId, topic: string): Lesson | undefined => lessonByTopic.get(`${track}|${topic}`);

/** Следующий урок того же трека или null, если этот последний */
export function nextLesson(id: string): Lesson | null {
  const i = lessons.findIndex((l) => l.id === id);
  const next = lessons[i + 1];
  return next && next.track === lessons[i].track ? next : null;
}

const blockText = (b: LessonBlock): string[] => {
  switch (b.type) {
    case 'list':
      return b.items;
    case 'term':
      return [b.term, b.text];
    case 'image':
    case 'compare':
      return [b.caption];
    default:
      return [b.text];
  }
};

/** Новичок читает медленнее, чем позволяет обычная оценка в 200 слов в минуту, — считаем по 150 */
const WORDS_PER_MINUTE = 150;

/** Иллюстрацию тоже разглядывают: считаем её как 25 слов, то есть около 10 секунд */
const WORDS_PER_IMAGE = 25;

export function readingMinutes(lesson: Lesson): number {
  const text = [...lesson.blocks.flatMap(blockText), ...lesson.takeaways].join(' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const images = lesson.blocks.reduce((n, b) => n + (b.type === 'compare' ? 2 : b.type === 'image' ? 1 : 0), 0);
  return Math.max(1, Math.round((words + images * WORDS_PER_IMAGE) / WORDS_PER_MINUTE));
}
