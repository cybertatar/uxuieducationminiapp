import { useEffect, useMemo, useState } from 'react';
import { questionById, type Question } from '../../../content';
import { api } from '../api';
import { BackButton, MainButton } from '../buttons';
import { haptic, openLink, setClosingConfirmation } from '../tg';

export interface QuizResult {
  total: number;
  correct: number;
  mistakes: Question[];
}

interface Props {
  questionIds: string[];
  onExit: () => void;
  onFinish: (r: QuizResult) => void;
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Quiz({ questionIds, onExit, onFinish }: Props) {
  const questions = useMemo(() => questionIds.map((id) => questionById.get(id)!).filter(Boolean), [questionIds]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const q = questions[index];
  // Перемешиваем варианты, чтобы правильный ответ не был всегда первым. Храним исходные индексы.
  const order = useMemo(() => shuffle(q.options.map((_, i) => i)), [q]);
  const isLast = index === questions.length - 1;
  const isCorrect = selected === q.correct;

  useEffect(() => {
    setClosingConfirmation(true);
    return () => setClosingConfirmation(false);
  }, []);

  useEffect(() => window.scrollTo({ top: 0 }), [index]);

  const check = () => {
    if (selected === null) return;
    setChecked(true);
    setResults((r) => [...r, isCorrect]);
    if (isCorrect) haptic.success();
    else haptic.error();
    api.answer(q.id, selected).catch(() => {
      // Прогресс по одному вопросу не критичен — не прерываем сессию из-за сети
    });
  };

  const next = () => {
    if (isLast) {
      onFinish({
        total: questions.length,
        correct: results.filter(Boolean).length,
        mistakes: questions.filter((_, i) => !results[i]),
      });
      return;
    }
    setIndex(index + 1);
    setSelected(null);
    setChecked(false);
  };

  return (
    <div className="screen quiz">
      <BackButton onClick={onExit} />

      <div className="quiz__top">
        <ol className="segments" aria-label={`Вопрос ${index + 1} из ${questions.length}`}>
          {questions.map((item, i) => (
            <li
              key={item.id}
              className={
                'segments__item ' +
                (i < results.length ? (results[i] ? 'is-correct' : 'is-wrong') : i === index ? 'is-current' : '')
              }
            />
          ))}
        </ol>
        <div className="quiz__meta">
          <span className="chip">{q.topic}</span>
          <span className="hint">
            {index + 1} / {questions.length}
          </span>
        </div>
      </div>

      {q.image && <img className="quiz__image" src={q.image} alt="Иллюстрация к вопросу" />}
      <h1 className="quiz__question">{q.text}</h1>

      <div className="options" role="radiogroup">
        {order.map((orig) => {
          let state = '';
          if (checked) {
            if (orig === q.correct) state = 'is-correct';
            else if (orig === selected) state = 'is-wrong';
            else state = 'is-dimmed';
          } else if (orig === selected) state = 'is-selected';
          return (
            <button
              key={orig}
              role="radio"
              aria-checked={orig === selected}
              className={`option ${state}`}
              disabled={checked}
              onClick={() => {
                haptic.tap();
                setSelected(orig);
              }}
            >
              <span className="option__mark" aria-hidden>
                {checked && orig === q.correct ? '✓' : checked && orig === selected ? '✕' : ''}
              </span>
              <span>{q.options[orig]}</span>
            </button>
          );
        })}
      </div>

      {checked && (
        <section className={`feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`} aria-live="polite">
          <h2 className="feedback__title">{isCorrect ? 'Верно!' : 'Не совсем'}</h2>
          <p className="feedback__text">{q.explanation}</p>
          <div className="feedback__links">
            <span className="hint">{isCorrect ? 'Подробнее' : 'Изучить тему'}</span>
            {q.links.map((l) => (
              <button key={l.url} className="link" onClick={() => openLink(l.url)}>
                {l.title}{"\u00A0↗"}
              </button>
            ))}
          </div>
        </section>
      )}

      {checked ? (
        <MainButton text={isLast ? 'Завершить' : 'Дальше'} onClick={next} />
      ) : (
        <MainButton text="Проверить" onClick={check} disabled={selected === null} />
      )}
    </div>
  );
}
