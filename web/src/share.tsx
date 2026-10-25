import { useState } from 'react';
import type { ShareRequest } from '../../src/api-types';
import { api } from './api';
import { renderShareCard, type ShareCardData } from './share-card';
import { haptic, inTelegram, openTelegramLink, tg } from './tg';

/**
 * Поделиться: в Telegram 8.0+ — карточка с картинкой и кнопкой через нативный выбор чата (WebApp.shareMessage),
 * в старых клиентах — t.me/share со ссылкой, в браузере — системное меню или копирование.
 */
export async function share(req: ShareRequest, card?: ShareCardData): Promise<void> {
  let image: string | undefined;
  try {
    image = card && renderShareCard(card);
  } catch {
    // Не нарисовалось — уйдёт общая картинка
  }
  const { id, text, url } = await api.share({ ...req, image });
  if (id && inTelegram && tg!.isVersionAtLeast('8.0')) {
    await new Promise<void>((resolve) => tg!.shareMessage(id, (sent) => {
      if (sent) haptic.success();
      resolve();
    }));
    return;
  }
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  if (inTelegram) return openTelegramLink(shareUrl);
  if (navigator.share) {
    // Отмена в системном меню — тоже исключение, его не показываем
    await navigator.share({ text, url }).catch(() => {});
    return;
  }
  window.open(shareUrl, '_blank', 'noopener');
}

/** Стрелка из квадрата — как системный значок «Поделиться» */
export function ShareIcon() {
  return (
    <svg className="share-icon" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3.5v11M7.5 8 12 3.5 16.5 8" />
      <path d="M8 11H6.5a2 2 0 0 0-2 2v5.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V13a2 2 0 0 0-2-2H16" />
    </svg>
  );
}

interface ShareButtonProps {
  request: ShareRequest;
  /** Что нарисовать на картинке: цифры человека, а не общий макет */
  card?: ShareCardData;
  label?: string;
  className?: string;
}

/** Кнопка «Поделиться»: пока готовим сообщение, повторные нажатия игнорируются */
export function ShareButton({ request, card, label = 'Поделиться', className = '' }: ShareButtonProps) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const onClick = async () => {
    if (busy) return;
    haptic.tap();
    setBusy(true);
    setFailed(false);
    try {
      await share(request, card);
    } catch {
      haptic.error();
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <button className={`share-button ${className}`} onClick={onClick} disabled={busy} aria-busy={busy}>
      <ShareIcon />
      <span>{failed ? 'Не получилось — ещё раз' : label}</span>
    </button>
  );
}
