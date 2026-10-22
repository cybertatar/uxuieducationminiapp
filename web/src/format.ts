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

/**
 * Часовой пояс по-человечески: America/Buenos_Aires → «Аргентина, UTC−3».
 * Если браузер не знает русских названий, берём город из идентификатора: «Buenos Aires, UTC−3».
 */
export function timeZoneLabel(tz: string) {
  const part = (timeZoneName: 'longGeneric' | 'shortOffset') => {
    try {
      return new Intl.DateTimeFormat('ru', { timeZone: tz, timeZoneName }).formatToParts().find((p) => p.type === 'timeZoneName')?.value;
    } catch {
      return undefined;
    }
  };
  const name = part('longGeneric')?.replace(/, стандартное время$/, '') ?? tz.split('/').at(-1)!.replaceAll('_', ' ');
  const offset = part('shortOffset')?.replace('GMT', 'UTC').replace('-', '−');
  if (offset === 'UTC') return offset;
  if (!offset) return name;
  return `${name}, ${offset}`;
}
