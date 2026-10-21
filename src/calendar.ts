/** Чистая логика календаря занятий: сетка месяца, уровни насыщенности и годовая карта. */
import type { HistoryDay } from './api-types';
import { addDays } from './time';

/** Год и месяц в формате YYYY-MM */
export type YearMonth = string;

export const monthOf = (date: string): YearMonth => date.slice(0, 7);

export function addMonths(ym: YearMonth, n: number): YearMonth {
  const [y, m] = ym.split('-').map(Number);
  const total = y * 12 + (m - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

/** Понедельник = 0 … воскресенье = 6 */
export const weekday = (date: string) => (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;

export function daysInMonth(ym: YearMonth): string[] {
  const out: string[] = [];
  for (let d = `${ym}-01`; monthOf(d) === ym; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Недели месяца с понедельника; дни соседних месяцев — null */
export function monthGrid(ym: YearMonth): (string | null)[][] {
  const days = daysInMonth(ym);
  const cells: (string | null)[] = [...Array(weekday(days[0])).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}

/**
 * Насыщенность дня от 0 до 4:
 * 0 — не занимался, 1 — отвечал, но день не засчитан, 2–4 — день засчитан, больше ответов — ярче.
 * Дни до появления календаря засчитаны без числа ответов — им достаётся 2.
 */
export function dayLevel(d: HistoryDay | undefined): 0 | 1 | 2 | 3 | 4 {
  if (!d) return 0;
  if (!d.active) return d.answers > 0 ? 1 : 0;
  if (d.answers >= 20) return 4;
  if (d.answers >= 10) return 3;
  return 2;
}

/** Итоги за набор дней: сколько засчитано, сколько ответов и какая точность */
export function summarize(days: HistoryDay[]) {
  const answers = days.reduce((n, d) => n + d.answers, 0);
  const correct = days.reduce((n, d) => n + d.correct, 0);
  return { activeDays: days.filter((d) => d.active).length, answers, accuracy: answers > 0 ? correct / answers : null };
}

/** Столбцы-недели (с понедельника) для годовой карты; последний столбец — текущая неделя, будущие дни — null */
export function yearWeeks(today: string, weeks = 53): (string | null)[][] {
  const lastMonday = addDays(today, -weekday(today));
  return Array.from({ length: weeks }, (_, w) => {
    const monday = addDays(lastMonday, -7 * (weeks - 1 - w));
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(monday, i);
      return d > today ? null : d;
    });
  });
}
