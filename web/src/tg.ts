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

/** Ссылки t.me открываем внутри Telegram, а не во внешнем браузере */
export function openTelegramLink(url: string) {
  if (inTelegram) tg!.openTelegramLink(url);
  else window.open(url, '_blank', 'noopener');
}

/** Просит разрешение, чтобы бот мог писать пользователю. Вне Telegram считаем, что разрешено. */
export function requestWriteAccess(): Promise<boolean> {
  if (!inTelegram || !tg!.isVersionAtLeast('6.9')) return Promise.resolve(true);
  return new Promise((resolve) => tg!.requestWriteAccess((ok) => resolve(ok)));
}

export function setClosingConfirmation(enabled: boolean) {
  if (!inTelegram) return;
  if (enabled) tg!.enableClosingConfirmation();
  else tg!.disableClosingConfirmation();
}
