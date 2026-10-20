/** Тонкая обёртка над Telegram WebApp, чтобы приложение работало и в обычном браузере при разработке. */
export const tg: WebApp | undefined = window.Telegram?.WebApp;

type WebApp = typeof window.Telegram.WebApp;

/** true, если открыто внутри Telegram (а не просто в браузере). */
export const inTelegram = !!tg && !!tg.initData;

export function initTelegram() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  if (tg.isVersionAtLeast('7.7')) tg.disableVerticalSwipes();
  // Новый вид шапки: полноэкранный режим с плавающими кнопками Telegram вместо полосы «Закрыть».
  // Только на телефонах — на десктопе fullscreen развернул бы окно на весь монитор.
  // Отступы под системные кнопки и вырез экрана берём из --tg-(content-)safe-area-inset-* (см. styles.css).
  if (tg.isVersionAtLeast('8.0') && ['ios', 'android'].includes(tg.platform) && !tg.isFullscreen) {
    tg.requestFullscreen();
  }
}

export const haptic = {
  tap: () => tg?.HapticFeedback.selectionChanged(),
  success: () => tg?.HapticFeedback.notificationOccurred('success'),
  error: () => tg?.HapticFeedback.notificationOccurred('error'),
};

export function openLink(url: string) {
  if (inTelegram) tg!.openLink(url);
  else window.open(url, '_blank', 'noopener');
}

/** Telegram автора: подпись на главной и экран ошибки */
export const AUTHOR_URL = 'https://t.me/everlastinghate';

/** Ссылки t.me открываем внутри Telegram, а не во внешнем браузере */
export function openTelegramLink(url: string) {
  if (inTelegram) tg!.openTelegramLink(url);
  else window.open(url, '_blank', 'noopener');
}

let writeAccessRequest: Promise<boolean> | null = null;

/**
 * Просит разрешение, чтобы бот мог писать пользователю. Вне Telegram считаем, что разрешено.
 * Повторный вызов, пока ждём ответа, получает тот же запрос: второй запрос Telegram отклоняет исключением.
 */
export function requestWriteAccess(): Promise<boolean> {
  if (!inTelegram || !tg!.isVersionAtLeast('6.9')) return Promise.resolve(true);
  writeAccessRequest ??= new Promise<boolean>((resolve) => {
    try {
      tg!.requestWriteAccess((ok) => resolve(ok));
    } catch {
      resolve(false);
    }
  }).finally(() => {
    writeAccessRequest = null;
  });
  return writeAccessRequest;
}

/** Нативное окно «ОК / Отмена» Telegram; в браузере — window.confirm. */
export function confirmDialog(message: string): Promise<boolean> {
  if (inTelegram && tg!.isVersionAtLeast('6.2')) return new Promise((resolve) => tg!.showConfirm(message, resolve));
  return Promise.resolve(window.confirm(message));
}

export function setClosingConfirmation(enabled: boolean) {
  if (!inTelegram) return;
  if (enabled) tg!.enableClosingConfirmation();
  else tg!.disableClosingConfirmation();
}
