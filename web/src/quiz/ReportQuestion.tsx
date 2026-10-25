import { useEffect, useRef, useState } from 'react';
import type { Question } from '../../../content';
import { REPORT_COMMENT_MAX, REPORT_REASONS, type ReportReason } from '../../../src/api-types';
import { api, ApiError } from '../api';
import { haptic } from '../tg';

type State = 'closed' | 'open' | 'sending' | 'sent';

const REASONS = Object.entries(REPORT_REASONS) as [ReportReason, string][];

/**
 * «Что-то не так с вопросом?» под разбором: причина и комментарий уходят автору в бота.
 * Номер вопроса и ответ человека прикладываются сами — объяснять, о каком вопросе речь, не нужно.
 */
export function ReportQuestion({ q, option }: { q: Question; option: number }) {
  const [state, setState] = useState<State>('closed');
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Форма раскрывается у нижнего края экрана — подтягиваем её, чтобы она не пряталась под главной кнопкой
  useEffect(() => {
    if (state === 'open') ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [state]);

  if (state === 'closed') {
    return (
      <button className="report__toggle" onClick={() => setState('open')}>
        Что-то не так с вопросом?
      </button>
    );
  }

  if (state === 'sent') {
    return (
      <p className="report__done" role="status">
        Спасибо! Автор посмотрит вопрос 🐈
      </p>
    );
  }

  const needsComment = reason === 'other';
  const canSend = reason !== null && (!needsComment || comment.trim() !== '') && state !== 'sending';

  const send = async () => {
    if (!canSend || !reason) return;
    setState('sending');
    setError(null);
    try {
      await api.report({ questionId: q.id, reason, comment: comment.trim() || undefined, option });
      haptic.success();
      setState('sent');
    } catch (err) {
      haptic.error();
      setError(
        err instanceof ApiError && err.status === 429
          ? 'Сегодня уже отправлено много сообщений. Попробуйте завтра.'
          : 'Не получилось отправить. Проверьте интернет и попробуйте ещё раз.',
      );
      setState('open');
    }
  };

  return (
    <div className="report" ref={ref}>
      <p className="report__title" id={`report-${q.id}`}>
        Что не так?
      </p>
      <div className="report__reasons" role="radiogroup" aria-labelledby={`report-${q.id}`}>
        {REASONS.map(([key, label]) => (
          <button
            key={key}
            role="radio"
            aria-checked={reason === key}
            className={`report__reason ${reason === key ? 'is-selected' : ''}`}
            onClick={() => {
              haptic.tap();
              setReason(key);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <textarea
        className="report__comment"
        aria-label="Комментарий"
        placeholder={needsComment ? 'Опишите, что не так' : 'Комментарий, если хотите'}
        maxLength={REPORT_COMMENT_MAX}
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && (
        <p className="report__error" role="alert">
          {error}
        </p>
      )}
      <div className="report__actions">
        <button className="button button--secondary" onClick={() => setState('closed')}>
          Отмена
        </button>
        <button className="button button--primary" disabled={!canSend} onClick={send}>
          {state === 'sending' ? <span className="button__spinner" aria-label="Отправка" /> : 'Отправить'}
        </button>
      </div>
    </div>
  );
}
