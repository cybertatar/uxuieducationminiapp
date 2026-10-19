const DAY_MS = 86_400_000;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(tz: string) {
  let f = formatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    formatters.set(tz, f);
  }
  return f;
}

function parts(tz: string, ms: number) {
  const p: Record<string, number> = {};
  for (const { type, value } of formatter(tz).formatToParts(ms)) {
    if (type !== 'literal') p[type] = Number(value);
  }
  return p as { year: number; month: number; day: number; hour: number; minute: number; second: number };
}

export function isValidTimeZone(tz: string): boolean {
  try {
    formatter(tz);
    return true;
  } catch {
    return false;
  }
}

/** Локальная дата пользователя в формате YYYY-MM-DD. */
export function localDate(tz: string, ms: number): string {
  const { year, month, day } = parts(tz, ms);
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Смещение часового пояса относительно UTC в момент ms. */
function offsetMs(tz: string, ms: number): number {
  const p = parts(tz, ms);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(ms / 1000) * 1000;
}

/** UTC-момент, соответствующий локальным date + time (HH:MM) в поясе tz. */
export function zonedToUtc(date: string, time: string, tz: string): number {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  const first = wall - offsetMs(tz, wall);
  // Повторная поправка на случай перехода на летнее/зимнее время
  return wall - offsetMs(tz, first);
}

/** Ближайший момент строго после now, когда у пользователя наступит time. */
export function nextOccurrence(tz: string, time: string, now: number): number {
  const today = localDate(tz, now);
  const candidate = zonedToUtc(today, time, tz);
  return candidate > now ? candidate : zonedToUtc(addDays(today, 1), time, tz);
}

export function isValidTime(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}
