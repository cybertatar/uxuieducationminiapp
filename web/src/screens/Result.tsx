import { useEffect, useState } from 'react';
import type { CompleteResponse } from '../../../src/api-types';
import { api } from '../api';
import { BackButton, MainButton } from '../buttons';
import { Cat, type CatMood } from '../Cat';
import { days } from '../format';
import { ExternalLink } from '../ExternalLink';
import { Confetti } from '../quiz/Confetti';
import { haptic } from '../tg';
import type { QuizResult } from './Quiz';

interface Props {
  result: QuizResult;
  canRepeat: boolean;
  starting: boolean;
  onHome: () => void;
  onAgain: () => void;
}

function headline(ratio: number): { mood: CatMood; text: string } {
  if (ratio === 1) return { mood: 'celebrate', text: 'Без единой ошибки!' };
  if (ratio >= 0.8) return { mood: 'celebrate', text: 'Отличный результат' };
  if (ratio >= 0.5) return { mood: 'happy', text: 'Хороший результат' };
  return { mood: 'sad', text: 'Есть над чем поработать' };
}

/** Число, которое «докручивается» от from до to */
function useCountUp(to: number, from: number, enabled: boolean) {
  const [value, setValue] = useState(enabled ? from : to);
  useEffect(() => {
    if (!enabled) {
      setValue(to);
      return;
    }
    const t = setTimeout(() => setValue(to), 450);
    return () => clearTimeout(t);
  }, [to, enabled]);
  return value;
}

export function Result({ result, canRepeat, starting, onHome, onAgain }: Props) {
  const [streak, setStreak] = useState<CompleteResponse | null>(null);
  const ratio = result.correct / result.total;
  const { mood, text } = headline(ratio);
  const shownStreak = useCountUp(streak?.current ?? 0, Math.max(0, (streak?.current ?? 1) - 1), !!streak?.extended);

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
    <main className="screen result">
      <BackButton onClick={onHome} />

      <div className="result__hero">
        {ratio >= 0.8 && <Confetti count={24} />}
        <Cat mood={mood} size={112} />
        <h1 className="result__title">{text}</h1>
        <ol className="result__dots" aria-label={`${result.correct} из ${result.total} правильно`}>
          {result.answers.map((ok, i) => (
            <li key={i} className={ok ? 'is-correct' : 'is-wrong'} style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </ol>
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
            <b className="result__streak-count">
              {shownStreak} {days(shownStreak)} подряд{streak.extended ? '!' : ''}
            </b>
            <br />
            <span className="hint">{streak.extended ? 'Сегодняшний день засчитан' : 'Сегодня уже засчитано — возвращайся завтра'}</span>
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
                <p className="mistake__summary">{q.summary}</p>
                <ExternalLink link={q.links[0]} />
              </div>
            ))}
          </div>
        </>
      )}

      {canRepeat ? (
        <MainButton
          text="Ещё 10 вопросов"
          onClick={onAgain}
          loading={starting}
          secondary={{ text: 'На главную', onClick: onHome }}
        />
      ) : (
        <MainButton text="На главную" onClick={onHome} />
      )}
    </main>
  );
}
