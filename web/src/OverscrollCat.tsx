import { useEffect, useRef } from 'react';
import { Cat } from './Cat';
import { haptic } from './tg';

/** С какой высоты «пружинки» кот выглянул целиком */
const PEEK = 96;

/** Клубок 9×9: светлые и тёмные витки нитки, снизу хвостик нитки тянется к лапе кота */
const YARN = ['..YYYYY..', '.YyYYYyY.', 'YYYyYYYyY', 'YyYYyYYYY', 'YYyYYyYyY', 'YYYyYYyYY', 'YyYYYyYYY', '.YYyYYYy.', '..YYYYY..'];

function Yarn() {
  return (
    <svg className="yarn" viewBox="0 0 9 9" shapeRendering="crispEdges">
      {YARN.flatMap((row, y) => [...row].map((ch, x) => (ch === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} className={ch === 'Y' ? 'yarn__wool' : 'yarn__thread'} />)))}
    </svg>
  );
}

/**
 * Пасхалка на iPhone. Если протянуть страницу дальше конца, снизу выглядывает Кегль и играет с клубком,
 * а если дальше начала — сверху свисает, уцепившись лапами за край экрана, чтобы не упасть.
 * Во время «пружинки» scrollY уходит за границы страницы — на столько кот и показывается.
 * На Android пружинки нет, поэтому там он не появляется. Стили обновляем напрямую, без ререндеров.
 */
export function OverscrollCat() {
  const bottom = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const peeking = { top: false, bottom: false };

    const show = (el: HTMLElement | null, side: keyof typeof peeking, over: number) => {
      if (!el) return;
      const shown = Math.max(0, Math.min(over, PEEK * 1.5));
      el.style.setProperty('--over', `${shown}px`);
      // Клубок катится на 4° за каждый пиксель перетягивания
      el.style.setProperty('--spin', `${shown * 4}deg`);
      const full = shown >= PEEK;
      // Пока страницу не тянут, кот спрятан целиком: верхний иначе торчал бы под статус-баром
      el.classList.toggle('is-out', shown > 0);
      el.classList.toggle('is-peeking', full);
      // Один тап отдачи на каждое появление, а не на каждый кадр
      if (full && !peeking[side]) haptic.tap();
      peeking[side] = full;
    };

    const update = () => {
      frame = 0;
      show(bottom.current, 'bottom', window.scrollY + window.innerHeight - document.documentElement.scrollHeight);
      show(top.current, 'top', -window.scrollY);
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div ref={bottom} className="overscroll-cat overscroll-cat--bottom" aria-hidden>
        <Cat mood="happy" size={72} />
        <Yarn />
      </div>
      <div ref={top} className="overscroll-cat overscroll-cat--top" aria-hidden>
        <Cat mood="scared" size={64} hanging />
      </div>
    </>
  );
}
