import { addDays } from './time';

/** Интервалы повторения ошибок в днях (упрощённая система Лейтнера). */
export const REVIEW_INTERVALS = [1, 3, 7];

export interface AnswerState {
  attempts: number;
  correctTotal: number;
  lastCorrect: boolean;
  box: number;
  dueDate: string | null;
}

/**
 * Ошибка отправляет вопрос на повторение завтра. Каждый верный ответ на вопрос из очереди
 * повторения отодвигает следующий показ (1 → 3 → 7 дней), после чего вопрос считается выученным.
 */
export function applyAnswer(prev: AnswerState | null, correct: boolean, today: string): AnswerState {
  const base = prev ?? { attempts: 0, correctTotal: 0, lastCorrect: false, box: 0, dueDate: null };
  const next: AnswerState = {
    ...base,
    attempts: base.attempts + 1,
    correctTotal: base.correctTotal + (correct ? 1 : 0),
    lastCorrect: correct,
  };
  if (!correct) {
    next.box = 0;
    next.dueDate = addDays(today, REVIEW_INTERVALS[0]);
  } else if (base.dueDate !== null) {
    next.box = base.box + 1;
    next.dueDate = next.box < REVIEW_INTERVALS.length ? addDays(today, REVIEW_INTERVALS[next.box]) : null;
  }
  return next;
}

export function isDue(a: AnswerState | undefined, today: string): boolean {
  return !!a?.dueDate && a.dueDate <= today;
}
