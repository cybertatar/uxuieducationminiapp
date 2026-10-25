/** Когда предлагать поддержать проект: шторка на главной после пройденного теста. */

const DAY = 86_400_000;

/** Первый раз — после стольких пройденных тестов */
export const SUPPORT_OFFER_AFTER = 3;
/** Дальше — не чаще, чем раз в столько дней */
export const SUPPORT_OFFER_EVERY_DAYS = 21;
/** После доната не просим столько дней */
export const SUPPORT_PAUSE_AFTER_DONATION_DAYS = 90;

export interface SupportOfferState {
  /** Сколько тестов пройдено, включая только что законченный */
  sessionsDone: number;
  /** Когда шторку показывали последний раз, unix ms; null — ещё не показывали */
  offeredAt: number | null;
  /** Когда человек последний раз поддерживал проект, unix ms; null — не поддерживал */
  donatedAt: number | null;
}

/**
 * 'first' — ровно третий тест и раньше не просили: шторка скажет «Уже 3 теста позади!».
 * 'again' — любой другой показ, с общим заголовком. null — не показываем.
 */
export function shouldOfferSupport(s: SupportOfferState, now: number): 'first' | 'again' | null {
  if (s.sessionsDone < SUPPORT_OFFER_AFTER) return null;
  if (s.donatedAt !== null && now - s.donatedAt < SUPPORT_PAUSE_AFTER_DONATION_DAYS * DAY) return null;
  if (s.offeredAt !== null && now - s.offeredAt < SUPPORT_OFFER_EVERY_DAYS * DAY) return null;
  return s.offeredAt === null && s.donatedAt === null && s.sessionsDone === SUPPORT_OFFER_AFTER ? 'first' : 'again';
}
