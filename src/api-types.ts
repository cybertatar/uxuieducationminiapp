/** Типы ответов API — общие для воркера и фронтенда. */
import type { TrackId } from '../content';

export interface Settings {
  dailyEnabled: boolean;
  dailyTime: string;
  reminderEnabled: boolean;
  reminderTime: string;
  tz: string;
  pausedUntil: string | null;
  /** Может ли бот писать пользователю (запущен и не заблокирован). */
  canMessage: boolean;
}

export interface WeekDay {
  date: string;
  active: boolean;
  isToday: boolean;
}

export interface Profile {
  firstName: string | null;
  /** activeDays — сколько всего дней пользователь занимался */
  streak: { current: number; best: number; todayDone: boolean; week: WeekDay[]; activeDays: number };
  /** attempts и correct — все ответы в теме, включая повторные: по ним считается точность. */
  tracks: { id: TrackId; total: number; answered: number; mastered: number; attempts: number; correct: number }[];
  reviewDue: number;
  settings: Settings;
}

/** День календаря занятий. active — день засчитан в стрик; answers и correct считаются с момента появления календаря. */
export interface HistoryDay {
  date: string;
  active: boolean;
  answers: number;
  correct: number;
}

export interface HistoryResponse {
  today: string;
  days: HistoryDay[];
}

export type SessionRequest = { mode: 'track'; track: TrackId } | { mode: 'review' };

export interface SessionResponse {
  questionIds: string[];
}

export interface AnswerResponse {
  correct: boolean;
}

export interface CompleteResponse {
  current: number;
  best: number;
  extended: boolean;
}

export type SettingsPatch = Partial<Pick<Settings, 'dailyEnabled' | 'dailyTime' | 'reminderEnabled' | 'reminderTime'>> & {
  pause?: boolean;
  /** Пользователь разрешил боту писать ему (WebApp.requestWriteAccess). */
  allowMessages?: boolean;
};
