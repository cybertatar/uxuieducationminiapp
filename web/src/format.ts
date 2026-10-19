export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export const days = (n: number) => plural(n, 'день', 'дня', 'дней');
export const questionsWord = (n: number) => plural(n, 'вопрос', 'вопроса', 'вопросов');

export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** 2026-10-25 → 25.10 */
export const shortDate = (date: string) => date.slice(5).split('-').reverse().join('.');
