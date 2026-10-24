import type { Lesson, LessonBlock } from '../types';
import { heuristicsLessons } from './heuristics';
import { uxLawsLessons } from './ux-laws';

/** Уроки «Учебника». Внутри трека — в порядке изучения: от общего к частному. */
export const lessons: Lesson[] = [...heuristicsLessons, ...uxLawsLessons];

export const lessonById = new Map(lessons.map((l) => [l.id, l]));

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
