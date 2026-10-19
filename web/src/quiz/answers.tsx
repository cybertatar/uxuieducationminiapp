import { useMemo } from 'react';
import type { ChoiceQuestion, HotspotQuestion, ImageChoiceQuestion } from '../../../content';
import { illustrations } from '../illustrations';
import { haptic } from '../tg';
import { Wireframe } from '../Wireframe';

/** Ответ пользователя: индекс варианта, для «тапни на проблему» ещё и точка тапа. */
export interface Answer {
  option: number;
  point?: [number, number];
}

interface Props<Q> {
  q: Q;
  answer: Answer | null;
  checked: boolean;
  onAnswer: (a: Answer) => void;
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Перемешиваем варианты, чтобы правильный не был всегда первым. Возвращаем исходные индексы. */
const useOrder = (length: number, key: string) => useMemo(() => shuffle(Array.from({ length }, (_, i) => i)), [length, key]);

function optionState(orig: number, correct: number, answer: Answer | null, checked: boolean) {
  const chosen = answer?.option === orig;
  if (!checked) return chosen ? 'is-selected' : '';
  if (orig === correct) return 'is-correct';
  return chosen ? 'is-wrong' : 'is-dimmed';
}

const Mark = ({ state }: { state: string }) => (
  <span className="option__mark" aria-hidden>
    {state === 'is-correct' ? '✓' : state === 'is-wrong' ? '✕' : ''}
  </span>
);

export function ChoiceAnswers({ q, answer, checked, onAnswer }: Props<ChoiceQuestion>) {
  const order = useOrder(q.options.length, q.id);
  return (
    <div className="options" role="radiogroup">
      {order.map((orig) => {
        const state = optionState(orig, q.correct, answer, checked);
        return (
          <button
            key={orig}
            role="radio"
            aria-checked={answer?.option === orig}
            className={`option ${state}`}
            disabled={checked}
            onClick={() => {
              haptic.tap();
              onAnswer({ option: orig });
            }}
          >
            <Mark state={state} />
            <span>{q.options[orig]}</span>
          </button>
        );
      })}
    </div>
  );
}

const LETTERS = ['A', 'B', 'C', 'D'];

export function ImageAnswers({ q, answer, checked, onAnswer }: Props<ImageChoiceQuestion>) {
  const order = useOrder(q.options.length, q.id);
  const ab = q.options.length === 2;
  return (
    <div className={`image-options ${ab ? 'image-options--ab' : ''}`} role="radiogroup">
      {order.map((orig, i) => {
        const state = optionState(orig, q.correct, answer, checked);
        const name = q.options[orig];
        return (
          <button
            key={orig}
            role="radio"
            aria-checked={answer?.option === orig}
            aria-label={`Вариант ${LETTERS[i]}: ${illustrations[name]?.alt ?? ''}`}
            className={`image-option ${state}`}
            disabled={checked}
            onClick={() => {
              haptic.tap();
              onAnswer({ option: orig });
            }}
          >
            <span className="image-option__label">
              {state === 'is-correct' ? '✓' : state === 'is-wrong' ? '✕' : LETTERS[i]}
            </span>
            <Wireframe name={name} />
          </button>
        );
      })}
    </div>
  );
}

/** Запас в единицах viewBox вокруг зоны, чтобы не требовать снайперской точности */
const HIT_PADDING = 10;

export function HotspotAnswer({ q, answer, checked, onAnswer }: Props<HotspotQuestion>) {
  const ill = illustrations[q.image];
  const [zx, zy, zw, zh] = ill.zones![q.zone];
  const pct = (v: number, total: number) => `${(v / total) * 100}%`;

  const tap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (checked) return;
    const r = e.currentTarget.querySelector('.wf')!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * ill.w;
    const y = ((e.clientY - r.top) / r.height) * ill.h;
    const hit = x >= zx - HIT_PADDING && x <= zx + zw + HIT_PADDING && y >= zy - HIT_PADDING && y <= zy + zh + HIT_PADDING;
    haptic.tap();
    onAnswer({ option: hit ? 0 : 1, point: [x, y] });
  };

  const markerState = checked ? (answer?.option === 0 ? 'is-correct' : 'is-wrong') : '';

  return (
    <div className="hotspot-wrap">
      <div className={`hotspot ${checked ? 'is-checked' : ''}`} onClick={tap}>
        <Wireframe name={q.image} />
        <div className="hotspot__layer">
        {checked && (
          <div
            className="hotspot__zone"
            style={{ left: pct(zx, ill.w), top: pct(zy, ill.h), width: pct(zw, ill.w), height: pct(zh, ill.h) }}
          />
        )}
        {answer?.point && (
          <span
            className={`hotspot__marker ${markerState}`}
            style={{ left: pct(answer.point[0], ill.w), top: pct(answer.point[1], ill.h) }}
          />
        )}
        </div>
      </div>
      <p className="hint hotspot__hint">
        {checked ? 'Проблемная зона обведена' : answer ? 'Можно тапнуть в другое место' : '👆 Тапни прямо на картинку'}
      </p>
    </div>
  );
}
