import { useEffect, useState } from 'react';
import { trackById, type Question } from '../../../content';
import { REPORT_COMMENT_MAX, REPORT_REASONS, type ReportAnswer, type ReportContext, type ReportReason } from '../../../src/api-types';
import { api, ApiError } from '../api';
import { BackButton, MainButton } from '../buttons';
import { Cat } from '../Cat';
import { haptic, inTelegram, tg } from '../tg';
import { APP_VERSION } from '../version';

const REASONS = Object.entries(REPORT_REASONS) as [ReportReason, string][];

interface Props {
  q: Question;
  /** Что человек успел ответить; null — ещё ничего не выбрал */
  answer: ReportAnswer | null;
  context: Omit<ReportContext, 'app' | 'platform' | 'tgVersion' | 'scheme' | 'viewport'>;
  onClose: () => void;
  onSent: () => void;
}

/** Устройство и версия: автор сразу видит, где воспроизводить проблему с картинкой или вёрсткой */
const device = (): Pick<ReportContext, 'app' | 'platform' | 'tgVersion' | 'scheme' | 'viewport'> => ({
  app: APP_VERSION,
  platform: inTelegram ? tg!.platform : 'browser',
  tgVersion: inTelegram ? tg!.version : undefined,
  scheme: inTelegram ? tg!.colorScheme : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  viewport: `${window.innerWidth}×${window.innerHeight}`,
});

/**
 * «Сообщить о проблеме» — отдельный экран поверх вопроса, как в играх: обучение не перекрывается.
 * Человек выбирает причину и пишет, если хочет, а номер вопроса, его ответ, сессию и устройство приложение прикладывает само.
 */
export function ReportProblem({ q, answer, context, onClose, onSent }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [sent]);

  const needsComment = reason === 'other';
  const canSend = reason !== null && (!needsComment || comment.trim() !== '');

  const send = async () => {
    if (!reason || !canSend) return;
    setSending(true);
    setError(null);
    try {
      await api.report({ questionId: q.id, reason, comment: comment.trim() || undefined, answer: answer ?? undefined, context: { ...context, ...device() } });
      haptic.success();
      setSent(true);
      onSent();
    } catch (err) {
      haptic.error();
      setError(
        err instanceof ApiError && err.status === 429
          ? 'Сегодня уже отправлено много сообщений. Попробуй завтра.'
          : 'Не получилось отправить. Проверь интернет и попробуй ещё раз.',
      );
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <main className="screen screen--center report-done">
        <BackButton onClick={onClose} />
        <Cat mood="happy" size={96} />
        <h1 className="report-done__title">Спасибо!</h1>
        <p className="hint report-done__text">Автор получит сообщение вместе с данными о вопросе и разберётся.</p>
        <MainButton text="Вернуться к вопросу" onClick={onClose} />
      </main>
    );
  }

  return (
    <main className="screen report">
      <BackButton onClick={onClose} />
      <h1 className="page-title">Сообщить о проблеме</h1>

      <div className="card report__question">
        <span className="chip">{trackById.get(q.track)!.title}</span>
        <p>{q.text}</p>
      </div>

      <h2 className="section-title" id="report-reason">
        Что не так?
      </h2>
      <div className="group" role="radiogroup" aria-labelledby="report-reason">
        {REASONS.map(([key, label]) => (
          <button
            key={key}
            role="radio"
            aria-checked={reason === key}
            className="cell report__reason"
            onClick={() => {
              haptic.tap();
              setReason(key);
            }}
          >
            <span>{label}</span>
            {reason === key && (
              <span className="report__check" aria-hidden>
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      <h2 className="section-title">{needsComment ? 'Опиши проблему' : 'Комментарий'}</h2>
      <textarea
        className="report__comment"
        aria-label={needsComment ? 'Опиши проблему' : 'Комментарий'}
        placeholder={needsComment ? 'Что именно не так' : 'Необязательно'}
        maxLength={REPORT_COMMENT_MAX}
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error ? (
        <p className="report__error section-hint" role="alert">
          {error}
        </p>
      ) : (
        <p className="hint section-hint">Номер вопроса, твой ответ и версия приложения прикрепятся сами — объяснять, где это было, не нужно.</p>
      )}

      <MainButton text="Отправить" onClick={send} disabled={!canSend} loading={sending} />
    </main>
  );
}
