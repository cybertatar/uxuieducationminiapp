import { useMemo, useState } from 'react';
import type { ChoiceQuestion, HotspotQuestion, ImageChoiceQuestion, MultiQuestion, OrderQuestion, SpotQuestion } from '../../../content';
import { illustrations } from '../illustrations';
import { haptic } from '../tg';
import { Wireframe } from '../Wireframe';

/**
 * Ответ пользователя: индекс варианта, для «тапни на проблему» ещё и точка тапа.
 * picks и marks не влияют на проверку: их видит автор, если человек сообщит о проблеме с вопросом.
 */
export interface Answer {
  option: number;
  point?: [number, number];
  /** «По порядку» — исходные индексы в порядке человека, «выбери все» — отмеченные */
  picks?: number[];
  /** «Найди все проблемы» — поставленные метки */
  marks?: [number, number][];
}

interface Props<Q> {
  q: Q;
  answer: Answer | null;
  checked: boolean;
  /** null — ответ ещё не собран целиком (не все шаги расставлены, не все проблемы отмечены) */
  onAnswer: (a: Answer | null) => void;
}

/** Ответ механик, где верность считает приложение: 0 — верно, 1 — нет */
const verdict = (ok: boolean, details: Omit<Answer, 'option'> = {}): Answer => ({ option: ok ? 0 : 1, ...details });

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

type Point = [number, number];
type Zone = [number, number, number, number];

const inZone = ([x, y]: Point, [zx, zy, zw, zh]: Zone) =>
  x >= zx - HIT_PADDING && x <= zx + zw + HIT_PADDING && y >= zy - HIT_PADDING && y <= zy + zh + HIT_PADDING;

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

/** Точка тапа в координатах viewBox картинки */
function tapPoint(e: React.MouseEvent<HTMLDivElement>, w: number, h: number): Point {
  const r = e.currentTarget.querySelector('.wf')!.getBoundingClientRect();
  return [((e.clientX - r.left) / r.width) * w, ((e.clientY - r.top) / r.height) * h];
}

const zoneStyle = ([zx, zy, zw, zh]: Zone, w: number, h: number) => ({ left: pct(zx, w), top: pct(zy, h), width: pct(zw, w), height: pct(zh, h) });

export function HotspotAnswer({ q, answer, checked, onAnswer }: Props<HotspotQuestion>) {
  const ill = illustrations[q.image];
  const zone = ill.zones![q.zone];

  const tap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (checked) return;
    const point = tapPoint(e, ill.w, ill.h);
    haptic.tap();
    onAnswer({ option: inZone(point, zone) ? 0 : 1, point });
  };

  const markerState = checked ? (answer?.option === 0 ? 'is-correct' : 'is-wrong') : '';

  return (
    <div className="hotspot-wrap">
      <div className={`hotspot ${checked ? 'is-checked' : ''}`} onClick={tap}>
        <Wireframe name={q.image} />
        <div className="hotspot__layer">
        {checked && (
          <div className="hotspot__zone" style={zoneStyle(zone, ill.w, ill.h)} />
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

/**
 * «Расставь по порядку»: варианты стоят на месте, а тапы раздают им номера 1, 2, 3…
 * Тап по пронумерованному снимает номер, следующие сдвигаются. Так не нужен drag-and-drop, который в Telegram конфликтует со свайпом.
 */
export function OrderAnswers({ q, checked, onAnswer }: Props<OrderQuestion>) {
  const order = useOrder(q.items.length, q.id);
  const [picks, setPicks] = useState<number[]>([]);

  const toggle = (orig: number) => {
    haptic.tap();
    const next = picks.includes(orig) ? picks.filter((p) => p !== orig) : [...picks, orig];
    setPicks(next);
    onAnswer(next.length === q.items.length ? verdict(next.every((p, i) => p === i), { picks: next }) : null);
  };

  return (
    <div className="options">
      <p className="hint answers__hint">
        {checked ? 'Справа — правильное место, если ты поставил иначе' : 'Нажимай по порядку: первый, второй, третий… Повторный тап снимает номер'}
      </p>
      {order.map((orig) => {
        const n = picks.indexOf(orig);
        const state = checked ? (n === orig ? 'is-correct' : 'is-wrong') : n >= 0 ? 'is-selected' : '';
        return (
          <button key={orig} className={`option option--order ${state}`} disabled={checked} onClick={() => toggle(orig)}>
            <span className="option__mark option__mark--num" aria-hidden>
              {n >= 0 ? n + 1 : ''}
            </span>
            <span>{q.items[orig]}</span>
            {checked && n !== orig && <span className="option__place">{orig + 1}-й</span>}
          </button>
        );
      })}
    </div>
  );
}

/** «Выбери все верные»: после проверки пропущенные верные варианты подсвечиваются отдельно. */
export function MultiAnswers({ q, checked, onAnswer }: Props<MultiQuestion>) {
  const order = useOrder(q.options.length, q.id);
  const [chosen, setChosen] = useState<number[]>([]);

  const toggle = (orig: number) => {
    haptic.tap();
    const next = chosen.includes(orig) ? chosen.filter((c) => c !== orig) : [...chosen, orig];
    setChosen(next);
    const exact = next.length === q.correct.length && next.every((c) => q.correct.includes(c));
    onAnswer(next.length ? verdict(exact, { picks: next }) : null);
  };

  const stateOf = (orig: number) => {
    const on = chosen.includes(orig);
    if (!checked) return on ? 'is-selected' : '';
    if (q.correct.includes(orig)) return on ? 'is-correct' : 'is-missed';
    return on ? 'is-wrong' : 'is-dimmed';
  };

  return (
    <>
      <p className="hint answers__hint">{checked ? 'Пунктиром — верные варианты, которые ты не отметил' : 'Отметь все подходящие варианты'}</p>
      <div className={q.images ? 'image-options' : 'options'} role="group">
        {order.map((orig, i) => {
          const state = stateOf(orig);
          const on = chosen.includes(orig);
          const mark = state === 'is-correct' ? '✓' : state === 'is-wrong' ? '✕' : '';
          return q.images ? (
            <button
              key={orig}
              role="checkbox"
              aria-checked={on}
              aria-label={`Вариант ${LETTERS[i]}: ${illustrations[q.options[orig]]?.alt ?? ''}`}
              className={`image-option image-option--multi ${state}`}
              disabled={checked}
              onClick={() => toggle(orig)}
            >
              <span className="image-option__label">{mark || (on ? '✓' : LETTERS[i])}</span>
              <Wireframe name={q.options[orig]} />
            </button>
          ) : (
            <button key={orig} role="checkbox" aria-checked={on} className={`option option--multi ${state}`} disabled={checked} onClick={() => toggle(orig)}>
              <span className="option__mark option__mark--box" aria-hidden>
                {mark || (on ? '✓' : '')}
              </span>
              <span>{q.options[orig]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

/** Метка ближе этого расстояния к уже поставленной — тап снимает её, а не ставит новую */
const MARKER_RADIUS = 14;

/** «Найди все проблемы»: ставишь столько меток, сколько проблем, затем проверка. */
export function SpotAnswer({ q, checked, onAnswer }: Props<SpotQuestion>) {
  const ill = illustrations[q.image];
  const zones = q.zones.map((z) => ill.zones![z]);
  const [marks, setMarks] = useState<Point[]>([]);

  const tap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (checked) return;
    const p = tapPoint(e, ill.w, ill.h);
    const near = marks.findIndex(([x, y]) => Math.hypot(x - p[0], y - p[1]) < MARKER_RADIUS);
    if (near < 0 && marks.length === zones.length) {
      haptic.error();
      return;
    }
    haptic.tap();
    const next = near >= 0 ? marks.filter((_, i) => i !== near) : [...marks, p];
    setMarks(next);
    onAnswer(next.length === zones.length ? verdict(zones.every((z) => next.some((m) => inZone(m, z))), { marks: next }) : null);
  };

  const missed = zones.filter((z) => !marks.some((m) => inZone(m, z))).length;
  const hint = checked
    ? missed
      ? 'Верные места обведены, пунктиром — пропущенные'
      : 'Всё отмечено верно'
    : marks.length === zones.length
      ? 'Все метки стоят. Тап по метке снимает её'
      : `👆 Тапни на каждое место: отмечено ${marks.length} из ${zones.length}`;

  return (
    <div className="hotspot-wrap">
      <div className={`hotspot ${checked ? 'is-checked' : ''}`} onClick={tap}>
        <Wireframe name={q.image} />
        <div className="hotspot__layer">
          {checked &&
            zones.map((z, i) => (
              <div key={i} className={`hotspot__zone hotspot__zone--multi ${marks.some((m) => inZone(m, z)) ? '' : 'is-missed'}`} style={zoneStyle(z, ill.w, ill.h)} />
            ))}
          {marks.map((m, i) => (
            <span
              key={i}
              className={`hotspot__marker ${checked ? (zones.some((z) => inZone(m, z)) ? 'is-correct' : 'is-wrong') : ''}`}
              style={{ left: pct(m[0], ill.w), top: pct(m[1], ill.h) }}
            />
          ))}
        </div>
      </div>
      <p className="hint hotspot__hint">{hint}</p>
    </div>
  );
}
