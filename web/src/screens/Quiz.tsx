import { useEffect, useMemo, useState } from 'react';
import { correctOption, questionById, type Question } from '../../../content';
import { api } from '../api';
import { BackButton, MainButton } from '../buttons';
import { ChoiceAnswers, HotspotAnswer, ImageAnswers, type Answer } from '../quiz/answers';
import { Feedback } from '../quiz/Feedback';
import { confirmDialog, haptic, setClosingConfirmation } from '../tg';
import { Wireframe } from '../Wireframe';

export interface QuizResult {
  total: number;
  correct: number;
  /** Верно или нет — по порядку вопросов */
  answers: boolean[];
  mistakes: Question[];
}

interface Props {
  questionIds: string[];
  /** День уже засчитан в стрик — тогда выход посреди сессии ничего не стоит и спрашивать не нужно */
  streakCounted: boolean;
  onExit: () => void;
  onFinish: (r: QuizResult) => void;
}

export function Quiz({ questionIds, streakCounted, onExit, onFinish }: Props) {
  const questions = useMemo(() => questionIds.map((id) => questionById.get(id)!).filter(Boolean), [questionIds]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const q = questions[index];
  const isLast = index === questions.length - 1;
  const isCorrect = answer?.option === correctOption(q);

  useEffect(() => {
    setClosingConfirmation(true);
    return () => setClosingConfirmation(false);
  }, []);

  // Фигурные скобки нужны: в новых Chromium scrollTo возвращает Promise, а React принял бы его за функцию очистки
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [index]);

  // После проверки прокручиваем к разбору, чтобы он не оказался под кнопкой
  useEffect(() => {
    if (checked) document.querySelector('.feedback')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [checked]);

  const check = () => {
    if (!answer) return;
    setChecked(true);
    setResults((r) => [...r, isCorrect]);
    if (isCorrect) haptic.success();
    else haptic.error();
    api.answer(q.id, answer.option).catch(() => {
      // Прогресс по одному вопросу не критичен — не прерываем сессию из-за сети
    });
  };

  const next = () => {
    if (isLast) {
      onFinish({
        total: questions.length,
        correct: results.filter(Boolean).length,
        answers: results,
        mistakes: questions.filter((_, i) => !results[i]),
      });
      return;
    }
    setIndex(index + 1);
    setAnswer(null);
    setChecked(false);
  };

  // Ответы сохраняются сразу, а день в стрик засчитывается только в конце сессии — предупреждаем об этом
  const exit = async () => {
    const started = results.length > 0 || answer !== null;
    if (started && !streakCounted) {
      const ok = await confirmDialog('Выйти из сессии? Ответы сохранятся, но день засчитается в стрик, только если дойти до конца.');
      if (!ok) return;
    }
    onExit();
  };

  const answerProps = { answer, checked, onAnswer: setAnswer };

  return (
    <main className="screen quiz">
      <BackButton onClick={exit} />

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

      {q.kind !== 'hotspot' && q.image && (
        <div className="quiz__image">
          <Wireframe name={q.image} />
        </div>
      )}
      <h1 className="quiz__question">{q.text}</h1>

      <div key={q.id} className={`answers ${checked && !isCorrect ? 'is-wrong' : ''}`}>
        {q.kind === 'hotspot' ? (
          <HotspotAnswer q={q} {...answerProps} />
        ) : q.kind === 'image-choice' ? (
          <ImageAnswers q={q} {...answerProps} />
        ) : (
          <ChoiceAnswers q={q} {...answerProps} />
        )}
      </div>

      {checked && <Feedback key={`feedback-${q.id}`} q={q} correct={isCorrect} />}

      {checked ? (
        <MainButton text={isLast ? 'Завершить' : 'Дальше'} onClick={next} />
      ) : (
        <MainButton text="Проверить" onClick={check} disabled={!answer} />
      )}
    </main>
  );
}
