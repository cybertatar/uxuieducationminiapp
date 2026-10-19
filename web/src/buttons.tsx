import { useEffect, useRef } from 'react';
import { inTelegram, tg } from './tg';

interface MainButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Второстепенное действие рядом с главным, например «На главную». */
  secondary?: { text: string; onClick: () => void };
}

/**
 * Главная кнопка экрана — своя, а не нативная MainButton Telegram:
 * так мы сами задаём отступы от краёв и от скруглённых углов экрана.
 */
export function MainButton({ text, onClick, disabled = false, loading = false, secondary }: MainButtonProps) {
  return (
    <div className="main-button-dock">
      <div className="main-button-dock__row">
        {secondary && (
          <button className="button button--secondary" onClick={secondary.onClick}>
            {secondary.text}
          </button>
        )}
        <button className="button button--primary" disabled={disabled || loading} onClick={onClick}>
          {loading ? <span className="button__spinner" aria-label="Загрузка" /> : text}
        </button>
      </div>
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
