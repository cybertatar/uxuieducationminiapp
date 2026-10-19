import { useEffect, useState } from 'react';
import type { CompleteResponse } from '../../../src/api-types';
import { api } from '../api';
import { BackButton, MainButton } from '../buttons';
import { days } from '../format';
import { ExternalLink } from '../ExternalLink';
import { haptic } from '../tg';
import type { QuizResult } from './Quiz';

interface Props {
  result: QuizResult;
  canRepeat: boolean;
  starting: boolean;
  onHome: () => void;
  onAgain: () => void;
}

function headline(ratio: number) {
  if (ratio === 1) return { emoji: '🏆', text: 'Без единой ошибки!' };
  if (ratio >= 0.8) return { emoji: '🎉', text: 'Отличный результат' };
  if (ratio >= 0.5) return { emoji: '💪', text: 'Хороший результат' };
  return { emoji: '🌱', text: 'Есть над чем поработать' };
}

export function Result({ result, canRepeat, starting, onHome, onAgain }: Props) {
  const [streak, setStreak] = useState<CompleteResponse | null>(null);
  const { emoji, text } = headline(result.correct / result.total);

  useEffect(() => {
    api
      .complete()
      .then((s) => {
        setStreak(s);
        if (s.extended) haptic.success();
      })
      .catch(() => {});
  }, []);

  return (
    <div className="screen result">
      <BackButton onClick={onHome} />

      <div className="result__hero">
        <div className="result__emoji" aria-hidden>
          {emoji}
        </div>
        <h1 className="result__title">{text}</h1>
        <p className="result__score">
          {result.correct} из {result.total} правильно
        </p>
      </div>

      {streak && (
        <div className={`card result__streak ${streak.extended ? 'is-new' : ''}`}>
          <span className="result__streak-flame" aria-hidden>
            🔥
          </span>
          <span>
            {streak.extended ? (
              <>
                <b>
                  {streak.current} {days(streak.current)} подряд!
                </b>
                <br />
                <span className="hint">Сегодняшний день засчитан</span>
              </>
            ) : (
              <>
                <b>Стрик: {streak.current} {days(streak.current)}</b>
                <br />
                <span className="hint">Сегодня уже засчитано — возвращайся завтра</span>
              </>
            )}
          </span>
        </div>
      )}

      {result.mistakes.length > 0 && (
        <>
          <h2 className="section-title">Что подтянуть</h2>
          <p className="hint section-hint">Эти вопросы вернутся на повторение завтра.</p>
          <div className="mistakes">
            {result.mistakes.map((q) => (
              <div key={q.id} className="card mistake">
                <span className="chip">{q.topic}</span>
                <p className="mistake__question">{q.text}</p>
                <p className="mistake__answer">
                  <span className="hint">Правильный ответ:</span> {q.options[q.correct]}
                </p>
                <ExternalLink link={q.links[0]} />
              </div>
            ))}
          </div>
        </>
      )}

      {canRepeat ? (
        <>
          <button className="button button--secondary result__home" onClick={onHome}>
            На главную
          </button>
          <MainButton text="Ещё 10 вопросов" onClick={onAgain} loading={starting} />
        </>
      ) : (
        <MainButton text="На главную" onClick={onHome} />
      )}
    </div>
  );
}
