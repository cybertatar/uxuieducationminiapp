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
  streak: { current: number; best: number; todayDone: boolean; week: WeekDay[] };
  /** attempts и correct — все ответы в теме, включая повторные: по ним считается точность. */
  tracks: { id: TrackId; total: number; answered: number; mastered: number; attempts: number; correct: number }[];
  reviewDue: number;
  settings: Settings;
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
