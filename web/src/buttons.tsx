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

/** SecondaryButton появилась в Bot API 7.10. В старых клиентах второстепенную кнопку рисуем сами. */
export const hasNativeSecondary = inTelegram && tg!.isVersionAtLeast('7.10');

/**
 * Главная кнопка экрана. В Telegram управляет нативной MainButton,
 * в браузере рисует такую же кнопку внизу страницы.
 */
export function MainButton({ text, onClick, disabled = false, loading = false, secondary }: MainButtonProps) {
  const handler = useRef(onClick);
  handler.current = onClick;
  const secondaryHandler = useRef(secondary?.onClick);
  secondaryHandler.current = secondary?.onClick;

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

  const secondaryText = secondary?.text;
  useEffect(() => {
    if (!hasNativeSecondary || !secondaryText) return;
    const sb = tg!.SecondaryButton;
    const listener = () => secondaryHandler.current?.();
    // Слева от главной: основное действие остаётся справа, под большим пальцем
    sb.setParams({ text: secondaryText, position: 'left', is_visible: true, is_active: true });
    sb.onClick(listener);
    return () => {
      sb.offClick(listener);
      sb.hide();
    };
  }, [secondaryText]);

  if (inTelegram) {
    // Старый клиент без SecondaryButton: второстепенное действие остаётся кнопкой на странице
    return secondary && !hasNativeSecondary ? (
      <button className="button button--secondary" onClick={secondary.onClick}>
        {secondary.text}
      </button>
    ) : null;
  }
  return (
    <div className="main-button-dock">
      <div className="main-button-dock__row">
        {secondary && (
          <button className="button button--secondary" onClick={secondary.onClick}>
            {secondary.text}
          </button>
        )}
        <button className="button button--primary" disabled={disabled || loading} onClick={onClick}>
          {loading ? '…' : text}
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
