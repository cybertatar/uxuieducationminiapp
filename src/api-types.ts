/** Типы ответов API — общие для воркера и фронтенда. */
import type { TrackId } from '../content';
import type { WeakTopic } from './stats';

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
  /** Темы, где больше всего ошибок, со статьёй по каждой — для списка «Что почитать» */
  weakTopics: WeakTopic[];
  /** id прочитанных уроков «Учебника» */
  lessonsRead: string[];
  /** Тема, по которой человек последний раз начинал тест, — для «Продолжить» на главной */
  lastTrack: TrackId | null;
  /** Человек уже поддерживал проект звёздами: вместо просьбы — спасибо */
  supporter: boolean;
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

/** lesson — вопросы на закрепление после урока */
export type SessionRequest = { mode: 'track'; track: TrackId } | { mode: 'review' } | { mode: 'warmup' } | { mode: 'lesson'; lesson: string };

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
  /** Пора один раз предложить поддержать проект: это третий пройденный тест, а человек ещё не поддерживал */
  offerSupport: boolean;
}

export type SettingsPatch = Partial<Pick<Settings, 'dailyEnabled' | 'dailyTime' | 'reminderEnabled' | 'reminderTime'>> & {
  pause?: boolean;
  /** Пользователь разрешил боту писать ему (WebApp.requestWriteAccess). */
  allowMessages?: boolean;
};

/** Чем поделиться. Счёт результата приходит с клиента: человек делится своим же итогом, подделывать его незачем. */
export type ShareRequest = (
  | { kind: 'result'; session: SessionRequest; correct: number; total: number }
  | { kind: 'streak' }
  | { kind: 'lesson'; lessonId: string }
) & {
  /** Карточка, нарисованная в Mini App, — JPEG в base64. Без неё уйдёт общая картинка. */
  image?: string;
};

/** id — подготовленное сообщение для WebApp.shareMessage; null, если Telegram его не сохранил. text и url — для запасного t.me/share. */
export interface ShareResponse {
  id: string | null;
  text: string;
  url: string;
}

/** Что не так с вопросом: ключ хранится в reports.reason, подпись видна в приложении и в сообщении автору. */
export const REPORT_REASONS = {
  answer: 'Неверный правильный ответ',
  unclear: 'Непонятный вопрос или варианты',
  image: 'Ошибка в картинке',
  outdated: 'Устарело',
  typo: 'Опечатка',
  other: 'Другое',
} as const;

export const REPORT_COMMENT_MAX = 500;

export type ReportReason = keyof typeof REPORT_REASONS;

/**
 * Что человек успел ответить на момент жалобы — бот покажет это автору, чтобы не переспрашивать.
 * option — как в POST /answer; picks — исходные индексы: в «по порядку» в порядке человека, в «выбери все» отмеченные;
 * points — тапы в «тапни» и метки в «найди все» в координатах иллюстрации.
 */
export interface ReportAnswer {
  option: number;
  checked: boolean;
  picks?: number[];
  points?: [number, number][];
}

/** Где человек был, когда нажал «Сообщить о проблеме»: сессия, место в ней, устройство и версия приложения */
export interface ReportContext {
  session?: SessionRequest;
  position?: number;
  total?: number;
  app?: string;
  platform?: string;
  tgVersion?: string;
  scheme?: string;
  viewport?: string;
}

/** Для «Другое» комментарий обязателен. */
export interface ReportRequest {
  questionId: string;
  reason: ReportReason;
  comment?: string;
  answer?: ReportAnswer;
  context?: ReportContext;
}

/** Сколько звёзд Telegram можно отправить автору: выбор на экране «Поддержать проект» */
export const DONATE_AMOUNTS = [50, 100, 250, 500] as const;

/** После скольких пройденных тестов один раз предлагаем поддержать проект */
export const SUPPORT_OFFER_AFTER = 3;

/**
 * Другие способы поддержать — картой или переводом: ссылки на страницы сервисов донатов.
 * Видны на экране «Поддержать проект» и в /donate у бота. Пустой список — только звёзды.
 */
export const DONATE_LINKS: { title: string; hint: string; url: string }[] = [];

export interface DonateResponse {
  /** Ссылка на счёт для WebApp.openInvoice */
  url: string;
}

/** Ограничения формы «Предложить вопрос»: одни и те же в приложении и на сервере */
export const SUGGEST_LIMITS = {
  text: [10, 400],
  option: [1, 200],
  explanation: [10, 1000],
  source: 300,
  screen: 500,
  wrong: 3,
} as const;

/** wrong — от 1 до 3 неправильных вариантов. source и screen необязательны. */
export interface SuggestRequest {
  track: TrackId;
  text: string;
  correct: string;
  wrong: string[];
  explanation: string;
  source?: string;
  screen?: string;
}
