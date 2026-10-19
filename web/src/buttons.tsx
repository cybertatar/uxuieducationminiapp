import { useEffect, useRef } from 'react';
import { inTelegram, tg } from './tg';

interface MainButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Главная кнопка экрана. В Telegram управляет нативной MainButton,
 * в браузере рисует такую же кнопку внизу страницы.
 */
export function MainButton({ text, onClick, disabled = false, loading = false }: MainButtonProps) {
  const handler = useRef(onClick);
  handler.current = onClick;

  useEffect(() => {
    if (!inTelegram) return;
    const mb = tg!.MainButton;
    const listener = () => handler.current();
    mb.onClick(listener);
    return () => {
      mb.offClick(listener);
      mb.hide();
    };
  }, []);

  useEffect(() => {
    if (!inTelegram) return;
    const mb = tg!.MainButton;
    const theme = tg!.themeParams;
    // Telegram не меняет цвет неактивной кнопки сам — делаем это явно, чтобы состояние было видно
    mb.setParams({
      text,
      is_active: !disabled,
      is_visible: true,
      color: disabled ? theme.secondary_bg_color : theme.button_color,
      text_color: disabled ? theme.hint_color : theme.button_text_color,
    });
    if (loading) mb.showProgress(false);
    else mb.hideProgress();
  }, [text, disabled, loading]);

  if (inTelegram) return null;
  return (
    <div className="main-button-dock">
      <button className="button button--primary" disabled={disabled || loading} onClick={onClick}>
        {loading ? '…' : text}
      </button>
    </div>
  );
}

/** Нативная кнопка «Назад» в шапке Telegram. В браузере — текстовая ссылка. */
export function BackButton({ onClick }: { onClick: () => void }) {
  const handler = useRef(onClick);
  handler.current = onClick;

  useEffect(() => {
    if (!inTelegram) return;
    const bb = tg!.BackButton;
    const listener = () => handler.current();
    bb.onClick(listener);
    bb.show();
    return () => {
      bb.offClick(listener);
      bb.hide();
    };
  }, []);

  if (inTelegram) return null;
  return (
    <button className="dev-back" onClick={onClick}>
      ‹ Назад
    </button>
  );
}
