import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { correctOption, questionById, trackById, type Question } from '../../../content';
import type { ReportAnswer, SessionRequest } from '../../../src/api-types';
import { api } from '../api';
import { BackButton, MainButton } from '../buttons';
import { ChoiceAnswers, HotspotAnswer, ImageAnswers, MultiAnswers, OrderAnswers, SpotAnswer, type Answer } from '../quiz/answers';
import { Feedback } from '../quiz/Feedback';
import { ReportProblem } from '../quiz/ReportProblem';
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
  session: SessionRequest;
  questionIds: string[];
  /** День уже засчитан в стрик — тогда выход посреди сессии ничего не стоит и спрашивать не нужно */
  streakCounted: boolean;
  onExit: () => void;
  onFinish: (r: QuizResult) => void;
}

export function Quiz({ session, questionIds, streakCounted, onExit, onFinish }: Props) {
  const questions = useMemo(() => questionIds.map((id) => questionById.get(id)!).filter(Boolean), [questionIds]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  // «Сообщить о проблеме» открывается поверх вопроса: вопрос остаётся смонтированным, чтобы не потерять отмеченные ответы
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState<Set<string>>(new Set());
  const scrollY = useRef(0);

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

  const openReport = () => {
    scrollY.current = window.scrollY;
    setReporting(true);
  };

  // Вернувшись с экрана жалобы, человек видит вопрос там же, где его оставил
  useLayoutEffect(() => {
    if (!reporting) window.scrollTo({ top: scrollY.current });
  }, [reporting]);

  const reportAnswer: ReportAnswer | null = answer && {
    option: answer.option,
    checked,
    picks: answer.picks,
    points: answer.marks ?? (answer.point && [answer.point]),
  };

  const answerProps = { answer, checked, onAnswer: setAnswer };

  return (
    <>
      {reporting && (
        <ReportProblem
          q={q}
          answer={reportAnswer}
          context={{ session, position: index, total: questions.length }}
          onClose={() => setReporting(false)}
          onSent={() => setReported((s) => new Set(s).add(q.id))}
        />
      )}
      <main className={`screen quiz ${reporting ? 'is-covered' : ''}`} aria-hidden={reporting || undefined}>
        {!reporting && <BackButton onClick={exit} />}

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
            {/* Тема часто совпадает с ответом («Узнавание вместо припоминания»), поэтому до проверки показываем только трек */}
            <span className="chip">{checked ? q.topic : trackById.get(q.track)!.title}</span>
            <span className="quiz__meta-end">
              <span className="hint">
                {index + 1} / {questions.length}
              </span>
              <button
                className={`quiz__report ${reported.has(q.id) ? 'is-sent' : ''}`}
                onClick={openReport}
                aria-label={reported.has(q.id) ? 'Сообщение о проблеме отправлено' : 'Сообщить о проблеме с вопросом'}
              >
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M5 21V4" />
                  <path d="M5 4h11l-2 4 2 4H5" />
                </svg>
              </button>
            </span>
          </div>
        </div>

        {/* В «тапни» и «найди все» картинка — сам ответ, она рисуется внутри механики */}
        {q.kind !== 'hotspot' && q.kind !== 'spot' && q.image && (
          <div className="quiz__image">
            <Wireframe name={q.image} />
          </div>
        )}
        <h1 className="quiz__question">{q.text}</h1>

        <div key={q.id} className={`answers ${checked && !isCorrect ? 'is-wrong' : ''}`}>
          {q.kind === 'hotspot' ? (
            <HotspotAnswer q={q} {...answerProps} />
          ) : q.kind === 'spot' ? (
            <SpotAnswer q={q} {...answerProps} />
          ) : q.kind === 'image-choice' ? (
            <ImageAnswers q={q} {...answerProps} />
          ) : q.kind === 'order' ? (
            <OrderAnswers q={q} {...answerProps} />
          ) : q.kind === 'multi' ? (
            <MultiAnswers q={q} {...answerProps} />
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
    </>
  );
}
