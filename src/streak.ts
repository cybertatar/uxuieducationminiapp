import { addDays } from './time';

export interface StreakState {
  current: number;
  best: number;
  lastActiveDate: string | null;
}

/** Засчитывает активность за today. extended — стрик вырос именно сейчас. */
export function applyActivity(s: StreakState, today: string): StreakState & { extended: boolean } {
  if (s.lastActiveDate === today) return { ...s, extended: false };
  const current = s.lastActiveDate === addDays(today, -1) ? s.current + 1 : 1;
  return { current, best: Math.max(s.best, current), lastActiveDate: today, extended: true };
}

/** Стрик, который видит пользователь: если пропущен вчерашний день, он уже сгорел. */
export function visibleStreak(s: StreakState, today: string): number {
  if (s.lastActiveDate === today || s.lastActiveDate === addDays(today, -1)) return s.current;
  return 0;
}

/** Стрик под угрозой: вчера был активен, сегодня ещё нет. */
export function streakAtRisk(s: StreakState, today: string): boolean {
  return s.current > 0 && s.lastActiveDate === addDays(today, -1);
}
